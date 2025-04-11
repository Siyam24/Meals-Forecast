import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import LoginPage from "./pages/Login";
import AdminPage from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import CreateUser from "./pages/CreateUser";
import AddData from "./pages/AddData";
import ViewReports from "./pages/ViewReports";
import InventoryManagement from "./pages/Inventory";
import ReportDetailPage from "./pages/ReportDetailPage"
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import { getAuthDetails } from "./utils/auth";
import "./App.css";

const App = () => {
  const [authDetails, setAuthDetails] = useState(getAuthDetails());

  useEffect(() => {
    const updateAuth = () => setAuthDetails(getAuthDetails());
    window.addEventListener("storage", updateAuth);
    return () => window.removeEventListener("storage", updateAuth);
  }, []);

  const handleLogin = () => {
    setAuthDetails(getAuthDetails());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthDetails({ isAuthenticated: false, role: "" });
  };

  return (
    <ThemeProvider>
      <Router>
        <Main authDetails={authDetails} onLogin={handleLogin} onLogout={handleLogout} />
      </Router>
    </ThemeProvider>
  );
};

// ✅ **Fixed ProtectedRoute**
const ProtectedRoute = ({ element, isAuth, role, requiredRole }) => {
  if (isAuth === null) return <p>Loading...</p>; // Prevent flickering issue
  if (!isAuth) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/home" replace />;
  return element;
};

const Main = ({ authDetails, onLogin, onLogout }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="main-container">
      {!isLoginPage && <NavigationBar onLogout={onLogout} />}
      <div className="content">
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} isAuth={authDetails.isAuthenticated} role={authDetails.role} requiredRole="admin" />} />
          <Route path="/home" element={<ProtectedRoute element={<Dashboard />} isAuth={authDetails.isAuthenticated} />} />
          <Route path="/calendar" element={<ProtectedRoute element={<CalendarPage />} isAuth={authDetails.isAuthenticated} />} />
          <Route path="/create-user" element={<ProtectedRoute element={<CreateUser />} isAuth={authDetails.isAuthenticated} role={authDetails.role} requiredRole="admin" />} />
          <Route path="/add-data" element={<ProtectedRoute element={<AddData />} isAuth={authDetails.isAuthenticated} />} />
          <Route path="/inventory" element={<ProtectedRoute element={<InventoryManagement />} isAuth={authDetails.isAuthenticated} role={authDetails.role} requiredRole="admin" />} />
          <Route path="/reports" element={<ProtectedRoute element={<ViewReports />} isAuth={authDetails.isAuthenticated} />} />
          <Route path="/detail-report" element={<ProtectedRoute element={<ReportDetailPage />} isAuth={authDetails.isAuthenticated} />} />
          <Route path="*" element={<Navigate to={authDetails.isAuthenticated ? "/home" : "/login"} replace />} />
        </Routes>
      </div>
      {!isLoginPage && <Footer />}
    </div>
  );
};

export default App;
