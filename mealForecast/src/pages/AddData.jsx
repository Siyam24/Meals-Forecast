import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaRegSun, FaBox, FaTags, FaDollarSign, FaCogs, FaCashRegister } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import "../styles/AddData.css";

const AddData = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState([]);
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "admin") {
      toast.error("Unauthorized! Redirecting...");
      navigate("/unauthorized");
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/sales/get_data")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again.");
      });
  }, []);

  const handlePriceChange = (e) => {
    const priceValue = parseFloat(e.target.value);
    setPrice(priceValue);
    setTotalSales(priceValue * quantitySold);
  };

  const handleQuantityChange = (e) => {
    const quantityValue = parseFloat(e.target.value);
    setQuantitySold(quantityValue);
    setTotalSales(price * quantityValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newData = {
      date,
      day,
      item,
      category,
      price: parseFloat(price),
      quantitySold: parseFloat(quantitySold),
      totalSales: parseFloat(price) * parseFloat(quantitySold),
    };

    try {
      let response;
      const userId = localStorage.getItem("userId");

      if (editIndex !== null) {
        const id = data[editIndex].id;
        response = await fetch(`http://127.0.0.1:5000/sales/update_data/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "User-Id": userId,
          },
          body: JSON.stringify(newData),
        });
      } else {
        response = await fetch("http://127.0.0.1:5000/sales/add_data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Id": userId,
          },
          body: JSON.stringify(newData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);

        const updatedDataResponse = await fetch("http://127.0.0.1:5000/sales/get_data");
        const updatedData = await updatedDataResponse.json();
        setData(updatedData);

        setDate("");
        setDay("");
        setItem("");
        setCategory("");
        setPrice("");
        setQuantitySold("");
        setTotalSales(0);
        setEditIndex(null);
      } else {
        toast.error("Failed to process data. Please try again.");
      }
    } catch (error) {
      console.error("Error processing data:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleRowClick = (row, index) => {
    setDate(row.date);
    setDay(row.day);
    setItem(row.item);
    setCategory(row.category);
    setPrice(row.price);
    setQuantitySold(row.quantitySold);
    setTotalSales(row.totalSales);
    setEditIndex(index);
  };

  const getDayFromDate = (dateString) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setDay(getDayFromDate(selectedDate));
  };

  return isAdmin ? (
    <div className={`add-data-wrapper ${theme}`}>
      <div className="add-data-container">
        {/* Form Section */}
        <div className="form-section">
          <h2>Add Future Forecast</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <FaCalendar className="input-icon" />
              <input 
                type="date" 
                value={date} 
                onChange={handleDateChange} 
                required 
              />
            </div>
            <div className="input-container">
              <FaRegSun className="input-icon" />
              <input type="text" value={day} readOnly placeholder="Day" />
            </div>
            <div className="input-container">
              <FaBox className="input-icon" />
              <input 
                type="text" 
                placeholder="Item" 
                value={item} 
                onChange={(e) => setItem(e.target.value)} 
                required 
              />
            </div>
            <div className="input-container">
              <FaTags className="input-icon" />
              <input 
                type="text" 
                placeholder="Category" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
              />
            </div>
            <div className="input-container">
              <FaDollarSign className="input-icon" />
              <input 
                type="number" 
                placeholder="Price (LKR)" 
                value={price} 
                onChange={handlePriceChange} 
                required 
              />
            </div>
            <div className="input-container">
              <FaCogs className="input-icon" />
              <input 
                type="number" 
                placeholder="Quantity Sold" 
                value={quantitySold} 
                onChange={handleQuantityChange} 
                required 
              />
            </div>
            <div className="input-container">
              <FaCashRegister className="input-icon" />
              <input 
                type="number" 
                value={totalSales} 
                readOnly 
                placeholder="Total Sales" 
              />
            </div>
            <button type="submit">
              {editIndex !== null ? "Update Data" : "Add Data"}
            </button>
          </form>
        </div>

        <div className="table-section">
          <h3>Data Preview</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity Sold</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} onClick={() => handleRowClick(row, index)}>
                    <td>{row.date}</td>
                    <td>{row.day}</td>
                    <td>{row.item}</td>
                    <td>{row.category}</td>
                    <td>{row.price}</td>
                    <td>{row.quantitySold}</td>
                    <td>{row.totalSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover
        theme={theme}
        toastClassName={`toast-${theme}`}
        style={{ top: '80px' }}
      />
    </div>
  ) : null;
};

export default AddData;