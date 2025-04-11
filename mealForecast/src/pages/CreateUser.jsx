import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import "../styles/CreateUser.css";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "employee",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "admin") {
      toast.error("Access Denied! Only admins can create users.");
      navigate("/dashboard");
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/auth/create_user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          role: formData.role,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || "User created successfully!");
        setFormData({
          username: "",
          email: "",
          role: "employee",
          password: "",
          confirmPassword: ""
        });
        setErrors({});
      } else {
        toast.error(result.error || result.message || "Failed to create user");
        if (result.error === "Username already exists!") {
          setErrors(prev => ({ ...prev, username: result.error }));
        } else if (result.error === "Email already registered!") {
          setErrors(prev => ({ ...prev, email: result.error }));
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("An error occurred while creating the user.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={`create-user-wrapper ${theme}`}>
      <div className="create-user-container">
        <h2>Create a New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="create-user-input-container">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "create-user-input-error" : ""}
              required
            />
            <FaUser className="create-user-input-icon" />
            {errors.username && <span className="create-user-error-message">{errors.username}</span>}
          </div>
          
          <div className="create-user-input-container">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "create-user-input-error" : ""}
              required
            />
            <FaEnvelope className="create-user-input-icon" />
            {errors.email && <span className="create-user-error-message">{errors.email}</span>}
          </div>
          
          <div className="create-user-input-container">
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <FaLock className="create-user-input-icon" />
          </div>
          
          <div className="create-user-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "create-user-input-error" : ""}
              minLength="8"
              required
            />
            <FaKey className="create-user-input-icon" />
            <span
              className="create-user-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <span className="create-user-error-message">{errors.password}</span>}
          </div>
          
          <div className="create-user-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "create-user-input-error" : ""}
              minLength="8"
              required
            />
            <FaKey className="create-user-input-icon" />
            <span
              className="create-user-password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.confirmPassword && <span className="create-user-error-message">{errors.confirmPassword}</span>}
          </div>
          
          <button type="submit" className="create-user-submit-btn" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
      
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
      />
    </div>
  );
};

export default CreateUser;