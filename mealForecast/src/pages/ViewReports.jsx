import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaSearch, FaDownload, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import "../styles/ViewReports.css";

const ViewReportsPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://127.0.0.1:5000/sales/get_data", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSalesData(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        toast.error("Failed to load sales data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateMonthlyReports = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return monthNames.map((month, index) => {
      const monthNumber = index + 1;
      const date = `${currentYear}-${monthNumber.toString().padStart(2, '0')}-01`;
      
      let status;
      if (monthNumber < currentMonth) {
        status = "Completed";
      } else if (monthNumber === currentMonth) {
        status = "Pending";
      } else {
        status = "Upcoming";
      }

      const monthData = salesData.filter(item => {
        try {
          const itemDate = new Date(item.date);
          return itemDate.getMonth() + 1 === monthNumber && 
                 itemDate.getFullYear() === currentYear;
        } catch (e) {
          console.error("Invalid date format:", item.date);
          return false;
        }
      });

      const totalSales = monthData.reduce((sum, item) => sum + (item.totalSales || 0), 0);
      const totalItemsSold = monthData.reduce((sum, item) => sum + (item.quantitySold || 0), 0);

      return {
        id: monthNumber,
        title: `${month} Sales Report`,
        date: date,
        status: status,
        monthNumber: monthNumber,
        totalSales: totalSales,
        totalItemsSold: totalItemsSold,
        data: monthData
      };
    });
  };

  const reports = useMemo(generateMonthlyReports, [salesData, currentYear, currentMonth]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (monthNumber) => {
    setDownloading(monthNumber);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://127.0.0.1:5000/reports/generate/${monthNumber}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(response.status === 401 
          ? "Unauthorized - Please login again" 
          : "Failed to generate report");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${monthNumber}_${currentYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleViewReport = (monthNumber) => {
    navigate('/detail-report', { 
      state: { 
        report: reports.find(r => r.monthNumber === monthNumber) 
      } 
    });
  };

  if (loading) {
    return (
      <div className={`loading-wrapper ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className={`view-reports-wrapper ${theme}`}>
      <div className="reports-container">
        <h2 className="reports-title">View Reports - {currentYear}</h2>

        <div className="search-section">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Reports"
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="reports-list">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-info">
                  <FaFileAlt className="report-icon" />
                  <div>
                    <h3 className="report-title">{report.title}</h3>
                    <p className="report-date">Date: {report.date}</p>
                    <p className="report-stats">
                      Total Sales: LKR {report.totalSales.toFixed(2)} | 
                      Items Sold: {report.totalItemsSold}
                    </p>
                    <p className={`report-status ${report.status.toLowerCase()}`}>
                      Status: {report.status}
                    </p>
                  </div>
                </div>
                <div className="report-actions">
                  <button 
                    className="view-report-button"
                    onClick={() => handleViewReport(report.monthNumber)}
                  >
                    View Details
                  </button>
                  {report.status !== "Upcoming" && (
                    <button 
                      className="download-report-button"
                      onClick={() => handleDownload(report.monthNumber)}
                      disabled={downloading === report.monthNumber}
                    >
                      {downloading === report.monthNumber ? (
                        <FaSpinner className="spin" />
                      ) : (
                        <FaDownload />
                      )} Download
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-reports">No reports found</p>
          )}
        </div>
      </div>
      <ToastContainer 
        className="toast-container"
        position="top-right" 
        autoClose={3000} 
        theme={theme}
        toastClassName={`toast-${theme}`}
      />
    </div>
  );
};

export default ViewReportsPage;