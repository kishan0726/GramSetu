import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import '../stylesheets/Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [adminType, setAdminType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminIdError, setAdminIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validate admin ID
  const validateAdminId = (id) => {
    const adminIdRegex = /^[a-zA-Z0-9]{3,}$/;
    return adminIdRegex.test(id);
  };

  // Validate admin Password
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Handle Login Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    setAdminIdError('');
    setPasswordError('');
    setSuccessMessage('');

    if (!adminId.trim()) {
      setAdminIdError('Admin ID is required');
      isValid = false;
    } else if (!validateAdminId(adminId)) {
      setAdminIdError('Admin ID must be at least 3 alphanumeric characters');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);

      try {
        const res = await fetch("http://localhost:5000/adminLogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            admin_id: adminId,
            admin_pass: password
          })
        });

        const data = await res.json();
        setAdminType(data);

        if (data.adminType == null) {
          setIsLoading(false);
          alert("Invalid Credentials");
        }
        else {
          await fetch("http://localhost:5000/admin-recent-activity", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "Login",
              description: "Logged in from web dashboard",
            })
          });
          navigate('/dashboard');
          setIsLoading(false);
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("adminType", data.adminType);
        }
      }
      catch {
        alert("Request Not send to Backend");
      }
    }
  };

  // Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-content">
          {/* Logo Section */}
          <div className="login-logo-section">
            <div className="login-logo">
              <span className="login-logo-icon"></span>
              <span className="login-logo-text">GramSetu</span>
            </div>
            <p className="login-tagline">Digitalizing Gram Services Management System</p>
          </div>

          {/* Welcome Text */}
          <div className="login-welcome-text">
            <h2>Admin Login</h2>
            <p className="login-subtitle">Enter your credentials to access the administration panel</p>
          </div>

          {/* Login Form */}
          <form id="loginForm" onSubmit={handleSubmit}>

            {/* Admin ID Field */}
            <div className="login-form-group">
              <label className="login-label">Admin ID</label>
              <div className="login-input-wrapper">
                <input
                  type="text"
                  className="login-form-control"
                  id="adminId"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter your admin ID"
                  disabled={isLoading}
                />
                {adminIdError && <span className="login-error-message show">{adminIdError}</span>}
              </div>
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title="Toggle password visibility"
                  disabled={isLoading}
                >
                  {showPassword ? 'hide' : 'unhide'}
                </button>
                {passwordError && <span className="login-error-message show">{passwordError}</span>}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="login-forgot-password">
              <Link to="#" onClick={handleForgotPassword}>Forgot Password?</Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-btn"
              id="signInBtn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-loading-spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>

            {/* Success Message */}
            {successMessage && (
              <span className="login-success-message show">{successMessage}</span>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;