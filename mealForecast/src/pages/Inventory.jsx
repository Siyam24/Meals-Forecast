import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import { FaTrash, FaPlus, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import "../styles/Inventory.css";

const API_BASE_URL = "http://127.0.0.1:5000/inventory";

const InventoryManagement = () => {
  const { theme } = useTheme();
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ 
    name: "", 
    quantity: 0, 
    threshold: 5, 
    unit: "" 
  });
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("role");

    if (userRole === "admin") {
      setIsAdmin(true);
      fetchInventory();
    } else {
      setIsAdmin(false);
      showToast("error", "Access Denied: Admins only!");
      navigate("/dashboard");
    }
  }, [navigate]);

  const showToast = (type, message) => {
    toast[type](message, {
      position: "top-right",
      autoClose: type === "error" ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: theme,
    });
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_inventory`);
      setInventory(response.data);
      checkLowStock(response.data);
    } catch (error) {
      showToast("error", "Error fetching inventory data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name || newItem.quantity < 0) {
      showToast("error", "Please enter valid item details.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/add_item`, newItem);
      setNewItem({ name: "", quantity: 0, threshold: 5, unit: "" });
      await fetchInventory();
      showToast("success", "Item added successfully!");
    } catch (error) {
      showToast("error", "Error adding item.");
      console.error(error);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 0) {
      showToast("error", "Quantity cannot be negative.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/update_quantity/${id}`, { quantity: newQuantity });
      await fetchInventory();
      showToast("success", "Quantity updated successfully!");
    } catch (error) {
      showToast("error", "Error updating quantity.");
      console.error(error);
    }
  };

  const confirmDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/delete_item/${id}`);
        await fetchInventory();
        showToast("success", `"${name}" deleted successfully!`);
      } catch (error) {
        showToast("error", "Error deleting item.");
        console.error(error);
      }
    }
  };

  const checkLowStock = async (items) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/low_stock`);
      if (response.data.low_stock.length > 0) {
        const itemNames = response.data.low_stock.map((item) => `${item.name} (${item.unit || "N/A"})`).join(", ");
        toast.warning(`Low stock alert: ${itemNames} need restocking!`, { 
          position: "top-right",
          autoClose: false,
          closeButton: true,
          theme: theme,
        });
      }
    } catch (error) {
      console.error("Error checking low stock.", error);
    }
  };

  if (isAdmin === null || loading) {
    return (
      <div className={`loading-wrapper ${theme}`}>
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className={`inventory-wrapper ${theme}`}>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        toastClassName={`toast-${theme}`}
        style={{ top: '80px' }}
      />

      <div className="inventory-container">
        <h2>Inventory Management</h2>

        <div className="add-item-form">
          <h3>Add New Item</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>Item Name</label>
              <input 
                type="text" 
                placeholder="Enter item name" 
                value={newItem.name} 
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
              />
            </div>
            
            <div className="input-group">
              <label>Quantity</label>
              <input 
                type="number" 
                placeholder="0" 
                value={newItem.quantity} 
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} 
              />
            </div>
            
            <div className="input-group">
              <label>Unit</label>
              <select 
                value={newItem.unit} 
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              >
                <option value="">No Unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Threshold</label>
              <input 
                type="number" 
                placeholder="5" 
                value={newItem.threshold} 
                onChange={(e) => setNewItem({ ...newItem, threshold: parseInt(e.target.value) || 5 })} 
              />
            </div>
          </div>
          <button onClick={addItem} className="add-button">
            <FaPlus /> Add Item
          </button>
        </div>

        <div className="inventory-list">
          <h3>Current Inventory</h3>
          {inventory.length === 0 ? (
            <p className="empty-message">No items in inventory.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className={item.quantity <= item.threshold ? "low-stock" : ""}>
                      <td>{item.name}</td>
                      <td>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)} 
                        />
                      </td>
                      <td>{item.unit || "N/A"}</td>
                      <td>{item.threshold}</td>
                      <td>
                        {item.quantity <= item.threshold ? (
                          <span className="status-warning">
                            <FaExclamationTriangle /> Low Stock
                          </span>
                        ) : (
                          <span className="status-ok">
                            <FaCheckCircle /> In Stock
                          </span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => confirmDelete(item.id, item.name)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;