import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import '../stylesheets/Login.css';

const Login = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminIdError, setAdminIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Validate admin ID (you can customize this)
  const validateAdminId = (id) => {
    const adminIdRegex = /^[a-zA-Z0-9]{3,}$/;
    return adminIdRegex.test(id);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let isValid = true;
    setAdminIdError('');
    setPasswordError('');
    setSuccessMessage('');

    // Validate admin ID
    if (!adminId.trim()) {
      setAdminIdError('Admin ID is required');
      isValid = false;
    } else if (!validateAdminId(adminId)) {
      setAdminIdError('Admin ID must be at least 3 alphanumeric characters');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      
      // try {
      //   // Simulate API call - Replace with your actual API
      //   const response = await simulateLogin(adminId, password);
        
      //   if (response.success) {
      //     setSuccessMessage('Login successful! Redirecting to dashboard...');
          
      //     // Store authentication data (customize as needed)
      //     localStorage.setItem('gramAdminToken', response.token);
      //     localStorage.setItem('gramAdminData', JSON.stringify(response.admin));
          
      //     // Redirect after delay
      //     setTimeout(() => {
      //       navigate('/dashboard');
      //     }, 1500);
      //   } else {
      //     setAdminIdError(response.message || 'Invalid credentials');
      //   }
      // } catch (error) {
      //   setAdminIdError('Login failed. Please try again.');
      // } finally {
      //   setIsLoading(false);
      // }

      try {
        const res = await fetch ("http://localhost:5000/adminLogin", {
          method: "POST",
          headers: {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify({
            admin_id: adminId,
            admin_pass : password
          })
        });
      }
      catch {
        alert("Request Not send to Backend");
      }
    }
  };

  // Simulated login function - Replace with actual API call
  const simulateLogin = async (adminId, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Demo credentials - Replace with your actual authentication
        const validLogins = {
          'admin': 'admin123',
          'gramadmin': 'gram@2024',
          'supervisor': 'super@123'
        };
        
        if (validLogins[adminId] === password) {
          resolve({
            success: true,
            token: 'demo-jwt-token-for-' + adminId,
            admin: {
              id: adminId,
              name: 'Gram Administrator',
              role: 'admin',
              permissions: ['all']
            },
            message: 'Login successful'
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid Admin ID or Password'
          });
        }
      }, 800);
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Please contact system administrator for password reset.');
  };

  return (
    <div className="login-page">
      <div className="container">
        
        <div className="content">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon"></span>
              <span className="logo-text">GramSetu</span>
            </div>
            <p className="tagline">Digitalizing Gram Services Management System</p>
          </div>

          {/* Welcome Text */}
          <div className="welcome-text">
            <h2>Admin Login</h2>
            <p className="subtitle">Enter your credentials to access the administration panel</p>
          </div>

          {/* Login Form */}
          <form id="loginForm" onSubmit={handleSubmit}>

            {/* Admin ID Field */}
            <div className="form-group">
              <label className="label">Admin ID</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  className="form-control" 
                  id="adminId" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter your admin ID"
                  required
                  disabled={isLoading}
                />
                {adminIdError && <span className="error-message show">{adminIdError}</span>}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  title="Toggle password visibility"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
                {passwordError && <span className="error-message show">{passwordError}</span>}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password">
              <Link to="#" onClick={handleForgotPassword}>Forgot Password?</Link>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="sign-in-btn" 
              id="signInBtn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>

            {/* Success Message */}
            {successMessage && (
              <span className="success-message show">{successMessage}</span>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;