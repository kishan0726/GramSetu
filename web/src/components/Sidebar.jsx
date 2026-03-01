import '../stylesheets/Sidebar.css';

const Sidebar = ({villageData}) => {

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
        <div className="sidebar-village-details">
          <h1>{villageData.details.name} Gram Panchayat</h1>
          <p className="sidebar-village-code">Village Code: {villageData.details.code}</p>
          <div className="sidebar-village-meta">
            <span className="sidebar-meta-item"><b>Population: </b>{villageData.details.population}</span>
            <span className="sidebar-meta-item"><b>Household: </b>{villageData.details.households}</span>
            <span className="sidebar-meta-item"><b>Village Area: </b>{villageData.details.area}</span>
          </div>
        </div>
      </div>

      {/* Village Leader */}
      <div className="sidebar-village-leader">
        <div className="sidebar-leader-info">
          <div className="sidebar-leader-avatar">KS</div>
          <div className="sidebar-leader-details">
            <h4>Admin Name</h4>
            <p className="sidebar-leader-name">{villageData.name}</p>
            <p className="sidebar-leader-contact">{villageData.phone1}</p>
          </div>
        </div>
      </div>

      {/* Village Stats */}
      <div className="sidebar-village-stats-section">
        <h3>Village Statistics</h3>
        <div className="sidebar-stats-grid">
          {villageData?.stat?.map((stat, index) => (
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
          {villageData?.quickLinks?.map((link, index) => (
            <button key={index} className="sidebar-quick-link-btn" style={{ '--link-color': link.color }}>
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-text">{link.name}</span>
            </button>
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