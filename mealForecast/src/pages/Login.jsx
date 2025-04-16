import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiHelpCircle } from "react-icons/fi";
import "../styles/Login.css";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.access_token) {
        const { access_token, role } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("role", role);

        onLogin();
        navigate("/dashboard");
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError("Email and password are required.");
        } else if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError("Server not responding. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-page-container">
        <h1 className="login-page-app-title">Meals Forecast Application</h1>
        <h2 className="login-page-heading">Login</h2>
        
        <form onSubmit={handleSubmit} className="login-page-form">
          {error && (
            <div className="login-page-error-container">
              <div className="login-page-error-message">{error}</div>
            </div>
          )}

          <div className="login-page-input-container">
            <AiOutlineMail size={24} className="login-page-input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-page-input"
            />
          </div>

          <div className="login-page-input-container">
            <AiOutlineLock size={24} className="login-page-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-page-input"
            />
            <span
              className="login-page-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
            >
              {showPassword ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
            </span>
          </div>

          <button 
            type="submit" 
            className="login-page-submit-btn"
            disabled={!email || !password || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;