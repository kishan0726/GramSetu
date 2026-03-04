import React, { useState, useEffect } from 'react';
import '../stylesheets/Home.css';

const Home = ({ villageData }) => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalShops: 0,
    totalAnnouncements: 0,
    totalUsers: 0,
    todayComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    approvedShops: 0,
    pendingShops: 0,
    onlineUsers: 0,
    resolutionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUpdates, setRecentUpdates] = useState([]);

  useEffect(() => {
    fetchVillageStats();
  }, []);

  const fetchVillageStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-village-stats');
      const result = await response.json();
      
      if (result.success) {
        setStats({
          totalComplaints: result.stats.complaints.total,
          totalShops: result.stats.shops.total,
          totalAnnouncements: result.stats.announcements.total,
          totalUsers: result.stats.users.total,
          todayComplaints: result.stats.complaints.today,
          pendingComplaints: result.stats.complaints.pending,
          resolvedComplaints: result.stats.complaints.resolved,
          approvedShops: result.stats.shops.approved,
          pendingShops: result.stats.shops.pending,
          onlineUsers: result.stats.onlineUsers || 0,
          resolutionRate: result.stats.complaints.total > 0 
            ? Math.round((result.stats.complaints.resolved / result.stats.complaints.total) * 100) 
            : 0
        });

        // Create recent updates based on the data
        const updates = [];
        if (result.stats.complaints.today > 0) {
          updates.push({
            message: `${result.stats.complaints.today} new complaint${result.stats.complaints.today > 1 ? 's' : ''} registered today`,
            type: 'warning'
          });
        }
        if (result.stats.complaints.resolved > 0) {
          updates.push({
            message: `${result.stats.complaints.resolved} complaint${result.stats.complaints.resolved > 1 ? 's' : ''} resolved`,
            type: 'success'
          });
        }
        if (result.stats.shops.pending > 0) {
          updates.push({
            message: `${result.stats.shops.pending} shop${result.stats.shops.pending > 1 ? 's' : ''} pending approval`,
            type: 'info'
          });
        }
        setRecentUpdates(updates);
      }
    } catch (error) {
      console.error('Error fetching village stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="home-village-home">
      {/* Village Header */}
      <div className="home-village-hero">
        <div className="home-hero-content">
          <h1>{villageData?.details?.name || 'Village'} Village</h1>
          <p className="home-village-location">{villageData?.details?.district || 'District'}, {villageData?.details?.state || 'State'}</p>
          <p className="home-village-slogan">"{villageData?.details?.slogan || 'Digital Village, Prosperous Future'}"</p>
        </div>
        <div className="home-hero-stats">
          <div className="home-hero-stat">
            <div className="home-stat-info">
              <div className="home-stat-value">{villageData?.details?.literacyRate || '67.9%'}</div>
              <div className="home-stat-label">Literacy Rate</div>
            </div>
          </div>
          <div className="home-hero-stat">
            <div className="home-stat-info">
              <div className="home-stat-value">{formatNumber(villageData?.details?.population || 3470)}</div>
              <div className="home-stat-label">Population</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="home-village-main-content">
        {/* Left Column - Village Information */}
        <div className="home-village-info-section">
          {/* About Village */}
          <div className="home-info-card">
            <h2 className="home-card-title">
              <span className="home-title-icon">📋</span>
              About {villageData?.details?.name || 'Village'}
            </h2>
            <p className="home-village-description">{villageData?.details?.description || 'No description available'}</p>

            <div className="home-features-grid">
              <div className="home-feature-item">
                <span className="home-feature-icon">🌾</span>
                <div>
                  <h4>Main Crops</h4>
                  <p>{villageData?.details?.mainCrops?.join(', ') || 'Wheat, Rice, Sugarcane'}</p>
                </div>
              </div>
              <div className="home-feature-item">
                <span className="home-feature-icon">🏥</span>
                <div>
                  <h4>Facilities</h4>
                  <p>{villageData?.details?.facilities?.join(', ') || 'Health Center, School, Bank'}</p>
                </div>
              </div>
              <div className="home-feature-item">
                <span className="home-feature-icon">💧</span>
                <div>
                  <h4>Water Supply</h4>
                  <p>24x7 Available</p>
                </div>
              </div>
              <div className="home-feature-item">
                <span className="home-feature-icon">⚡</span>
                <div>
                  <h4>Electricity</h4>
                  <p>100% Electrified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Economic Sectors */}
          <div className="home-info-card">
            <h2 className="home-card-title">
              <span className="home-title-icon">📊</span>
              Economic Overview
            </h2>
            <div className="home-sectors-chart">
              {villageData?.sectors?.map((sector, index) => (
                <div key={index} className="home-sector-item">
                  <div className="home-sector-header">
                    <span className="home-sector-icon">{sector.icon}</span>
                    <span className="home-sector-name">{sector.name}</span>
                    <span className="home-sector-value">{sector.value}</span>
                  </div>
                  <div className="home-sector-bar">
                    <div
                      className="home-sector-fill"
                      style={{
                        width: sector.value,
                        background: sector.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Places */}
          <div className="home-info-card">
            <h2 className="home-card-title">
              <span className="home-title-icon">📍</span>
              Important Places
            </h2>
            <div className="home-places-grid">
              {villageData?.important_places?.map((place, index) => (
                <div key={index} className="home-place-card">
                  <div className="home-place-icon">{place.icon}</div>
                  <div className="home-place-info">
                    <h4>{place.name}</h4>
                    <p className="home-place-type">{place.type}</p>
                  </div>
                  <button className="home-place-navigate">
                    <span>Navigate</span>
                    <span>➔</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Village Map & Live Data */}
        <div className="home-village-map-section">
          {/* Village Map */}
          <div className="home-map-card">
            <div className="home-map-header">
              <h2 className="home-card-title">
                <span className="home-title-icon">🗺️</span>
                Village Map
              </h2>
              <div className="home-map-controls">
                <button className="home-map-btn">➕</button>
                <button className="home-map-btn">➖</button>
                <button className="home-map-btn">🗺️</button>
              </div>
            </div>

            <div className="home-map-container">
              <div className="home-map-placeholder">
                <div className="home-map-grid">
                  {/* Village Center */}
                  <div className="home-map-area center" title="Village Center">
                    <div className="home-area-icon">🏛️</div>
                    <span className="home-area-label">Center</span>
                  </div>

                  {/* Surrounding Areas */}
                  {['North', 'South', 'East', 'West'].map((direction) => (
                    <div key={direction} className={`home-map-area ${direction.toLowerCase()}`}>
                      <div className="home-area-icon">
                        {direction === 'North' && '⬆️'}
                        {direction === 'South' && '⬇️'}
                        {direction === 'East' && '➡️'}
                        {direction === 'West' && '⬅️'}
                      </div>
                      <span className="home-area-label">{direction}</span>
                    </div>
                  ))}

                  {/* Additional Points */}
                  <div className="home-map-point school" title="School">
                    <div className="home-point-icon">🏫</div>
                  </div>
                  <div className="home-map-point health" title="Health Center">
                    <div className="home-point-icon">🏥</div>
                  </div>
                  <div className="home-map-point market" title="Market">
                    <div className="home-point-icon">🛒</div>
                  </div>
                </div>

                <div className="home-map-legend">
                  <div className="home-legend-item">
                    <div className="home-legend-color residential"></div>
                    <span>Residential Area</span>
                  </div>
                  <div className="home-legend-item">
                    <div className="home-legend-color commercial"></div>
                    <span>Commercial Area</span>
                  </div>
                  <div className="home-legend-item">
                    <div className="home-legend-color agricultural"></div>
                    <span>Agricultural Land</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Village Data */}
          <div className="home-live-data-card">
            <h2 className="home-card-title">
              <span className="home-title-icon">📡</span>
              Live Village Statistics
            </h2>

            {loading ? (
              <div className="home-loading">Loading statistics...</div>
            ) : (
              <>
                <div className="home-live-stats">
                  {/* Total Complaints */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">📋</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.totalComplaints}</div>
                      <div className="home-live-label">Total Complaints</div>
                    </div>
                  </div>

                  {/* Total Shops */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">🏪</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.totalShops}</div>
                      <div className="home-live-label">Registered Shops</div>
                    </div>
                  </div>

                  {/* Total Announcements */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">📢</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.totalAnnouncements}</div>
                      <div className="home-live-label">Announcements</div>
                    </div>
                  </div>

                  {/* Total Users */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">👥</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.totalUsers}</div>
                      <div className="home-live-label">Registered Users</div>
                    </div>
                  </div>

                  {/* Today's Complaints */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">📅</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.todayComplaints}</div>
                      <div className="home-live-label">Today's Complaints</div>
                    </div>
                  </div>

                  {/* Online Users */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">🟢</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.onlineUsers}</div>
                      <div className="home-live-label">Online Now</div>
                    </div>
                  </div>

                  {/* Pending Complaints */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">⏳</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.pendingComplaints}</div>
                      <div className="home-live-label">Pending Complaints</div>
                    </div>
                  </div>

                  {/* Resolution Rate */}
                  <div className="home-live-stat">
                    <div className="home-live-icon online">📊</div>
                    <div className="home-live-info">
                      <div className="home-live-value">{stats.resolutionRate}%</div>
                      <div className="home-live-label">Resolution Rate</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="home-place-navigate"
                onClick={fetchVillageStats}
                style={{ display: 'inline-flex' }}
              >
                <span>🔄</span>
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;