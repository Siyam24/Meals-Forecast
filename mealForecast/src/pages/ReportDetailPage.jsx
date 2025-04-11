import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaPrint, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import "../styles/ReportDetail.css";

const ReportDetailPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const report = state?.report;
  const [isDownloading, setIsDownloading] = React.useState(false);

  if (!report) {
    navigate("/reports");
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://127.0.0.1:5000/reports/generate/${report.monthNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${report.monthNumber}_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className={`report-detail-wrapper ${theme}`}>
      <div className="report-detail-container">
        <div id="printable-content">
          <h2 className="report-title">{report.title}</h2>
          
          <div className="report-summary">
            <div className="summary-card">
              <h3>Total Sales</h3>
              <p>LKR {report.totalSales.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Items Sold</h3>
              <p>{report.totalItemsSold}</p>
            </div>
            <div className="summary-card">
              <h3>Status</h3>
              <p className={`status ${report.status.toLowerCase()}`}>
                {report.status}
              </p>
            </div>
          </div>

          <div className="sales-table-container">
            <h3>Sales Details</h3>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price (LKR)</th>
                  <th>Quantity</th>
                  <th>Total (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {report.data.map((sale, index) => (
                  <tr key={`sale-${index}`}>
                    <td>{sale.date}</td>
                    <td>{sale.item}</td>
                    <td>{sale.category}</td>
                    <td>{sale.price.toFixed(2)}</td>
                    <td>{sale.quantitySold}</td>
                    <td>{sale.totalSales.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-actions">
          <button 
            className="action-button download-button"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <FaSpinner className="spin" />
            ) : (
              <FaDownload />
            )} Download PDF
          </button>
          <button 
            className="action-button print-button"
            onClick={handlePrint}
          >
            <FaPrint /> Print Report
          </button>
        </div>

        <ToastContainer 
          className="toast-container"
          position="top-right" 
          autoClose={3000} 
          theme={theme}
          toastClassName={`toast-${theme}`}
        />
      </div>
    </div>
  );
};

export default ReportDetailPage;