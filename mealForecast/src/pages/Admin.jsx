import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaChartLine, 
  FaFileAlt, 
  FaClipboardList,
  FaCog,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../context/ThemeContext';
import '../styles/Admin.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      toast.error("Unauthorized! Redirecting...");
      navigate('/unauthorized');
    } else {
      setIsAdmin(true);
      toast.success("Welcome Admin!", {
        icon: '🔐'
      });
    }
  }, [navigate]);

  const featureCards = [
    {
      path: "/create-user",
      icon: <FaUserPlus />,
      title: "User Management",
      description: "Create and manage user accounts",
      color: "#4CAF50"
    },
    {
      path: "/add-data",
      icon: <FaChartLine />,
      title: "Sales Data",
      description: "Manage sales data",
      color: "#2196F3"
    },
    {
      path: "/inventory",
      icon: <FaClipboardList />,
      title: "Inventory",
      description: "Control stock levels",
      color: "#FF9800"
    },
    {
      path: "/reports",
      icon: <FaFileAlt />,
      title: "Reports",
      description: "Generate system reports",
      color: "#9C27B0"
    }
  ];

  return isAdmin ? (
    <div className={`admin-page-wrapper ${theme}`}>
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title-wrapper">
            <h1 className="admin-title">Admin Dashboard</h1>
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </div>
          <p className="admin-subtitle">Manage all system operations</p>
        </div>
        
        <div className="admin-features">
          {featureCards.map((card, index) => (
            <Link 
              to={card.path} 
              className="feature-card"
              key={index}
              style={{ '--card-color': card.color }}
            >
              <div className="feature-icon">
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="card-hover-effect"></div>
            </Link>
          ))}
        </div>

        <ToastContainer 
          position="top-center"
          autoClose={3000}
          theme={theme}
          toastClassName={`toast-${theme}`}
        />
      </div>
    </div>
  ) : null;
};

export default AdminPage;