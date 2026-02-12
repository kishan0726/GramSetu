import React from 'react';
import {useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Navbar from './components/Navbar.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Announcement from './pages/Announcement.jsx';
import Shopkeeper from './pages/shopkeeper.jsx';
import Complaint from './pages/Complaint.jsx';
// import Map from './components/Map';
import Profile from './pages/AdminProfile.jsx';

// import AdminProfile from './components/AdminProfile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('gramAdminToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const NavbarWrapper = () => {
  const location = useLocation();

  if(location.pathname === "/login")
    return null;
  return <Navbar />
}

function App() {
  return (
    <>
      <Router>
      <NavbarWrapper />
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
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
            {/* <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Map />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;