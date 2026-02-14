import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Announcement from "./pages/Announcement.jsx";
import Shopkeeper from "./pages/shopkeeper.jsx";
import Complaint from "./pages/Complaint.jsx";
import Profile from "./pages/AdminProfile.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Navbar from "./components/Navbar.jsx";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const NavbarWrapper = () => {
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/forgot-password"
  ) {
    return null;
  }

  return <Navbar />;
};

function App() {
  return (
    <Router>
      <NavbarWrapper />
      <div className="App">
        <Routes>

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcement"
            element={
              <ProtectedRoute>
                <Announcement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shopkeeper"
            element={
              <ProtectedRoute>
                <Shopkeeper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaint"
            element={
              <ProtectedRoute>
                <Complaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              sessionStorage.getItem("isLoggedIn")
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="*"
            element={
              sessionStorage.getItem("isLoggedIn")
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;