import React from 'react';
import '../stylesheets/Sidebar.css';

const Sidebar = () => {
  const villageInfo = {
    name: 'Visavada Gram Panchayat',
    code: '360579',
    population: '3470',
    households: '787',
    area: '27.17 sq km',
    pradhan: 'Admin Name',
    contact: '+91 1234567890',
    since: ''
  };

  const villageStats = [
    { label: 'Registered Shops', value: '42', icon: '🏪' },
    { label: 'Active Schemes', value: '8', icon: '💰' },
    { label: 'Pending Tasks', value: '12', icon: '⏳' },
    { label: 'App Users', value: '3,245', icon: '📱' },
  ];

  const quickLinks = [
    { icon: '📊', name: 'Village Reports', color: '#38bdf8' },
    { icon: '👥', name: 'Resident List', color: '#10b981' },
    { icon: '🏪', name: 'Shop Directory', color: '#f59e0b' },
    { icon: '📋', name: 'Complaint Log', color: '#ef4444' },
    { icon: '💰', name: 'Scheme Status', color: '#8b5cf6' },
    { icon: '📢', name: 'Announcements', color: '#ec4899' }
  ];

  const recentActivities = [
    { time: '10:30 AM', action: 'New shop registered - "Ram Kirana Store"'},
    { time: '9:45 AM', action: 'Complaint resolved - Water supply issue'},
    { time: 'Yesterday', action: 'New scheme "Digital Farmer" launched'},
    { time: '2 days ago', action: 'Gram Sabha meeting conducted'}
  ];

  return (
    <aside className="sidebar-village-sidebar">
      {/* Village Header */}
      <div className="sidebar-village-header">
        <div className="sidebar-village-avatar">
          <span className="sidebar-avatar-icon">🏘️</span>
        </div>
        <div className="sidebar-village-details">
          <h3>{villageInfo.name}</h3>
          <p className="sidebar-village-code">Village Code: {villageInfo.code}</p>
          <div className="sidebar-village-meta">
            <span className="sidebar-meta-item">👥 {villageInfo.population}</span>
            <span className="sidebar-meta-item">🏠 {villageInfo.households}</span>
            <span className="sidebar-meta-item">📍 {villageInfo.area}</span>
          </div>
        </div>
      </div>

      {/* Village Leader */}
      <div className="sidebar-village-leader">
        <div className="sidebar-leader-info">
          <div className="sidebar-leader-avatar">AN</div>
          <div className="sidebar-leader-details">
            <h4>Admin Name</h4>
            <p className="sidebar-leader-name">{villageInfo.pradhan}</p>
            <p className="sidebar-leader-contact">📞 {villageInfo.contact}</p>
          </div>
        </div>
      </div>

      {/* Village Stats */}
      <div className="sidebar-village-stats-section">
        <h3>Village Statistics</h3>
        <div className="sidebar-stats-grid">
          {villageStats.map((stat, index) => (
            <div key={index} className="sidebar-stat-item">
              <div className="sidebar-stat-icon" style={{ background: getColorForIndex(index) }}>
                {stat.icon}
              </div>
              <div className="sidebar-stat-content">
                <div className="sidebar-stat-value">{stat.value}</div>
                <div className="sidebar-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="sidebar-quick-links">
        <h3>Quick Actions</h3>
        <div className="sidebar-links-grid">
          {quickLinks.map((link, index) => (
            <button key={index} className="sidebar-quick-link-btn" style={{ '--link-color': link.color }}>
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-text">{link.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="sidebar-recent-activities">
        <h3>Recent Activities</h3>
        <div className="sidebar-activities-list">
          {recentActivities.map((activity, index) => (
            <div key={index} className="sidebar-activity-item">
              <div className="sidebar-activity-content">
                <p className="sidebar-activity-text">{activity.action}</p>
                <span className="sidebar-activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

// Helper function for colors
const getColorForIndex = (index) => {
  const colors = [
    'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #ec4899, #db2777)'
  ];
  return colors[index % colors.length];
};

export default Sidebar;