import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { MdBrightness7, MdBrightness4 } from "react-icons/md";
import { FaUserCircle, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { getAuthDetails } from "../utils/auth";
import axios from "axios";
import "../styles/NavigationBar.css";

const NavigationBar = () => {
  const { toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [authDetails, setAuthDetails] = useState(getAuthDetails());
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  const { isAuthenticated, role } = authDetails;

  useEffect(() => {
    setAuthDetails(getAuthDetails());

    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated]);

  const fetchUserDetails = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Redirecting to login...");
        handleLogout();
        return;
      }

      const response = await axios.get("http://127.0.0.1:5000/auth/user/details", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setUserDetails({
          name: response.data.username,
          email: response.data.email,
          role: response.data.role,
        });
      } else {
        console.error("No user details received.");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatName = (name) => {
    if (!name) return "";
    return name.split(' ').map(word => capitalizeFirstLetter(word)).join(' ');
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthDetails({ isAuthenticated: false, role: "" });
    setUserDetails({ name: "", email: "", role: "" });
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`navbar ${theme}`}>
        <div className="navbar-left">
          <Link 
            to="/home" 
            className="app-logo"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
          >
            <span className="logo-text">MealsForecast</span>
            <span className={`logo-dot ${isHoveringLogo ? 'animated' : ''}`}>.</span>
          </Link>
        </div>

        {isAuthenticated && !loading && (
          <div className="navbar-content">
            <div className="navbar-links">
              <Link 
                to="/home" 
                className={`nav-link ${isActive('/home') ? 'active' : ''}`}
              >
                <span className="nav-link-text">Home</span>
              </Link>
              {role === "admin" && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  <span className="nav-link-text">Admin</span>
                </Link>
              )}
              <Link 
                to="/reports" 
                className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
              >
                <span className="nav-link-text">Reports</span>
              </Link>
              <Link 
                to="/calendar" 
                className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
              >
                <span className="nav-link-text">Calendar</span>
              </Link>
            </div>

            <div className="navbar-actions">
              <div onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                {theme === "light" ? (
                  <MdBrightness4 size={24} title="Switch to Dark Mode" />
                ) : (
                  <MdBrightness7 size={24} title="Switch to Light Mode" />
                )}
              </div>

              <div className="profile-menu" onClick={togglePanel} aria-label="User profile">
                <div className="avatar">
                  <FaUserCircle size={32} />
                  {userDetails.role && (
                    <span className={`role-indicator ${userDetails.role.toLowerCase()}`}></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}
      </nav>

      <div className="main-content" style={{ paddingTop: '70px' }}>
        {/* Your page content will be rendered here */}
      </div>

      {isAuthenticated && !loading && (
        <div className={`profile-panel ${isPanelOpen ? "open" : ""} ${theme}`}>
          <button onClick={togglePanel} className="close-button" aria-label="Close panel">
            <FaTimes size={18} />
          </button>
          <div className="panel-content">
            <div className="user-avatar">
              <FaUserCircle size={80} />
            </div>
            <div className="user-info">
              <h3>{formatName(userDetails.name) || "User"}</h3>
              <p className="user-email">{userDetails.email || "No email available"}</p>
              <span className="user-role">{capitalizeFirstLetter(userDetails.role) || "User"}</span>
            </div>
            <div className="panel-footer">
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt className="logout-icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isPanelOpen && <div className="backdrop" onClick={togglePanel} />}
    </>
  );
};

export default NavigationBar;