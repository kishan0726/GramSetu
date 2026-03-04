import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminReportGenerator from './AdminReportGenerator';
import '../stylesheets/Sidebar.css';

const Sidebar = ({ villageData }) => {
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const quick_links = [
    { name: "Village Reports", path: "/", color: "#38bdf8", icon: "📊", action: "modal", description: "Generate detailed reports" },
    { name: "Shop Directory", path: "/shops", color: "#f59e0b", icon: "🏪", action: "navigate", description: "Browse all shops" },
    { name: "Complaint Log", path: "/complaint", color: "#ef4444", icon: "📋", action: "navigate", description: "Manage complaints" },
    { name: "Announcements", path: "/announcement", color: "#ec4899", icon: "📢", action: "navigate", description: "View announcements" }
  ];

  // Get admin initials
  const getInitials = () => {
    const name = villageData?.name || 'Admin';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleQuickLinkClick = (link) => {
    if (link.action === 'modal') {
      setShowReportModal(true);
    } else {
      navigate(link.path);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <aside className="sidebar-village-sidebar">
      {/* Decorative Header Gradient */}
      <div className="sidebar-gradient-header"></div>

      {/* Village Header with Glass Effect */}
      <div className="sidebar-village-header">
        <div className="sidebar-village-avatar">
          <span className="sidebar-avatar-icon">🏛️</span>
        </div>
        <div className="sidebar-village-details">
          <h3>{villageData?.details?.name || 'Village'} Gram Panchayat</h3>
          <span className="sidebar-village-code">Code: {villageData?.details?.code || 'N/A'}</span>
          <div className="sidebar-village-meta">
            <span className="sidebar-meta-item">
              <span className="meta-icon">👥</span>
              <span><b>{villageData?.details?.population?.toLocaleString() || 'N/A'}</b></span>
            </span>
            <span className="sidebar-meta-item">
              <span className="meta-icon">🏠</span>
              <span><b>{villageData?.details?.households?.toLocaleString() || 'N/A'}</b></span>
            </span>
            <span className="sidebar-meta-item">
              <span className="meta-icon">📍</span>
              <span><b>{villageData?.details?.area || 'N/A'}</b></span>
            </span>
          </div>
        </div>
      </div>

      {/* Village Leader Card with Gradient */}
      <div className="sidebar-village-leader">
        <div className="sidebar-leader-gradient"></div>
        <div className="sidebar-leader-info">
          <div className="sidebar-leader-avatar-wrapper">
            <div className="sidebar-leader-avatar">{getInitials()}</div>
            <div className="sidebar-leader-online"></div>
          </div>
          <div className="sidebar-leader-details">
            <span className="sidebar-greeting">{getGreeting()}</span>
            <h4>{villageData?.name || 'Admin Name'}</h4>
            <p className="sidebar-leader-role">Administrator</p>
            <div className="sidebar-leader-contact">
              <span className="contact-item">
                <span className="contact-icon">📞</span>
                <span>{villageData?.phone1 || '+91 1234567890'}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="sidebar-leader-stats">
          <div className="leader-stat">
            <span className="stat-value">{villageData?.details?.population || 0}</span>
            <span className="stat-label">Population</span>
          </div>
          <div className="leader-stat">
            <span className="stat-value">{villageData?.details?.households || 0}</span>
            <span className="stat-label">Households</span>
          </div>
          <div className="leader-stat">
            <span className="stat-value">{villageData?.details?.literacyRate || '0%'}</span>
            <span className="stat-label">Literacy</span>
          </div>
        </div>
      </div>

      {/* Quick Links with Hover Effects */}
      <div className="sidebar-quick-links">
        <div className="sidebar-section-header">
          <span className="header-icon">⚡</span>
          <h3>Quick Actions</h3>
          <span className="header-badge">{quick_links.length}</span>
        </div>
        <div className="sidebar-links-grid">
          {quick_links.map((link, index) => (
            <button
              key={index}
              className="sidebar-quick-link-btn"
              style={{ '--link-color': link.color }}
              onClick={() => handleQuickLinkClick(link)}
            >
              <div className="link-icon-wrapper" style={{ background: `${link.color}15` }}>
                <span className="sidebar-link-icon">{link.icon}</span>
              </div>
              <span className="sidebar-link-text">{link.name}</span>
              <span className="link-description">{link.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="sidebar-system-status">
        <div className="status-item">
          <span className="status-dot online"></span>
          <span className="status-text">System Online</span>
        </div>
        <div className="status-item">
          <span className="status-label">Last Sync:</span>
          <span className="status-time">{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Report Generator Modal */}
      {showReportModal && (
        <div className="sidebar-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="sidebar-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-modal-header">
              <div className="modal-title-wrapper">
                <span className="modal-icon">📊</span>
                <h2>Generate Village Report</h2>
              </div>
              <button className="sidebar-modal-close" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            <div className="sidebar-modal-body">
              <AdminReportGenerator />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;