import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', name: 'Home', path: '/dashboard' },
    { id: 'announcement', name: 'Announcement', path: '/announcement' },
    { id: 'shopkeeper', name: 'Shopkeeper', path: '/shopkeeper' },
    { id: 'tracker', name: 'Tracker', path: '/tracker' },
    { id: 'complaint', name: 'Complaint', path: '/complaint' },
    { id: 'profile', name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon"></div>
          <div className="navbar-logo-text">
            <h2>GramSetu</h2>
            <p>Digital Gram Admin</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <ul className="navbar-menu">
            {navItems.map((item) => (
              <li key={item.id} className="navbar-item">
                <Link to={item.path} className="navbar-link">
                  <span className="navbar-icon">{item.name.split(' ')[0]}</span>
                  <span className="navbar-text">{item.name.split(' ').slice(1).join(' ')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section - Admin Info & Logout */}
        <div className="navbar-right">
          <div className="navbar-admin-info">
            <div className="navbar-admin-avatar">A</div>
            <div className="navbar-admin-details">
              <span className="navbar-admin-name">Administrator</span>
              <span className="navbar-admin-role">Super Admin</span>
            </div>
          </div>
          <button className="navbar-logout-btn">
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="navbar-mobile">
          <ul className="navbar-mobile-nav-menu">
            {navItems.map((item) => (
              <li key={item.id} className="navbar-mobile-nav-item">
                <a 
                  href={item.path} 
                  className="navbar-mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;