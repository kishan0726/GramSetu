import React from 'react';
import '../stylesheets/Home.css';
import villageMap from '../assets/icons/hide.png'; // You'll need to add this image

const Home = () => {
  const villageData = {
    name: 'Visavada',
    district: 'Porbandar',
    state: 'Gujarat',
    slogan: 'Digital Village, Prosperous Future',
    description: 'Visavada is leading the digital transformation of rural governance with GramSetu platform, ensuring transparency and efficiency in all village services.',
    established: '',
    literacyRate: '67.9%',
    mainCrops: ['Wheat', 'Rice', 'Sugarcane'],
    facilities: ['Health Center', 'School', 'Bank', 'Post Office', 'Market']
  };

  const sectors = [
    { name: 'Agriculture', value: '55%', icon: '🌾', color: '#10b981' },
    { name: 'Small Business', value: '20%', icon: '🏪', color: '#f59e0b' },
    { name: 'Services', value: '15%', icon: '💼', color: '#38bdf8' },
    { name: 'Others', value: '10%', icon: '📊', color: '#8b5cf6' }
  ];

  const importantPlaces = [
    { name: 'Gram Panchayat Office', type: 'Government', icon: '🏛️' },
    { name: 'Primary Health Center', type: 'Healthcare', icon: '🏥' },
    { name: 'High School', type: 'Education', icon: '🏫' },
    { name: 'Market Area', type: 'Commercial', icon: '🛒' },
    { name: 'Bus Stand', type: 'Transport', icon: '🚌' },
    { name: 'Water Tank', type: 'Utility', icon: '💧' }
  ];

  return (
    <div className="home-village-home">
      {/* Village Header */}
      <div className="home-village-hero">
        <div className="home-hero-content">
          <h1>{villageData.name} Village</h1>
          <p className="home-village-location">{villageData.district}, {villageData.state}</p>
          <p className="home-village-slogan">"{villageData.slogan}"</p>
        </div>
        <div className="home-hero-stats">
          <div className="home-hero-stat">
            <div className="home-stat-icon">📚</div>
            <div className="home-stat-info">
              <div className="home-stat-value">{villageData.literacyRate}</div>
              <div className="home-stat-label">Literacy Rate</div>
            </div>
          </div>
          <div className="home-hero-stat">
            <div className="home-stat-icon">👥</div>
            <div className="home-stat-info">
              <div className="home-stat-value">3470</div>
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
              <span className="home-title-icon">ℹ️</span>
              About {villageData.name}
            </h2>
            <p className="home-village-description">{villageData.description}</p>
            
            <div className="home-features-grid">
              <div className="home-feature-item">
                <span className="home-feature-icon">🌾</span>
                <div>
                  <h4>Main Crops</h4>
                  <p>{villageData.mainCrops.join(', ')}</p>
                </div>
              </div>
              <div className="home-feature-item">
                <span className="home-feature-icon">🏥</span>
                <div>
                  <h4>Facilities</h4>
                  <p>{villageData.facilities.join(', ')}</p>
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
              <span className="home-title-icon">💰</span>
              Economic Overview
            </h2>
            <div className="home-sectors-chart">
              {sectors.map((sector, index) => (
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
              {importantPlaces.map((place, index) => (
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
              {/* Replace this with your actual village map image */}
              <div className="home-map-placeholder">
                <div className="home-map-grid">
                  {/* Village Center */}
                  {/* <div className="home-map-area center" title="Village Center">
                    <div className="home-area-icon">🏛️</div>
                    <span className="home-area-label">Center</span>
                  </div> */}
                  
                  {/* Surrounding Areas */}
                  {/* {['North', 'South', 'East', 'West'].map((direction) => (
                    <div key={direction} className={`home-map-area ${direction.toLowerCase()}`}>
                      <div className="home-area-icon">{getAreaIcon(direction)}</div>
                      <span className="home-area-label">{direction}</span>
                    </div>
                  ))} */}
                  
                  {/* Additional Points */}
                  {/* <div className="home-map-point school" title="School">
                    <div className="home-point-icon">🏫</div>
                  </div>
                  <div className="home-map-point health" title="Health Center">
                    <div className="home-point-icon">🏥</div>
                  </div>
                  <div className="home-map-point market" title="Market">
                    <div className="home-point-icon">🛒</div>
                  </div> */}
                </div>
                
                {/* <div className="home-map-legend">
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
                </div> */}
              </div>
            </div>
          </div>

          {/* Live Village Data */}
          <div className="home-live-data-card">
            <h2 className="home-card-title">
              <span className="home-title-icon">📊</span>
              Live Village Data
            </h2>
            
            <div className="home-live-stats">
              <div className="home-live-stat">
                <div className="home-live-icon online">🟢</div>
                <div className="home-live-info">
                  <div className="home-live-value">245</div>
                  <div className="home-live-label">Online Now</div>
                </div>
              </div>
              
              <div className="home-live-stat">
                <div className="home-live-icon">📱</div>
                <div className="home-live-info">
                  <div className="home-live-value">3,245</div>
                  <div className="home-live-label">App Users</div>
                </div>
              </div>
              
              <div className="home-live-stat">
                <div className="home-live-icon">📋</div>
                <div className="home-live-info">
                  <div className="home-live-value">5</div>
                  <div className="home-live-label">Today's Complaints</div>
                </div>
              </div>
              
              <div className="home-live-stat">
                <div className="home-live-icon">✅</div>
                <div className="home-live-info">
                  <div className="home-live-value">98%</div>
                  <div className="home-live-label">Resolution Rate</div>
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="home-recent-updates">
              <h3>Recent Updates</h3>
              <div className="home-updates-list">
                <div className="home-update-item success">
                  <span className="home-update-icon">✅</span>
                  <span>Water supply restored in North Zone</span>
                </div>
                <div className="home-update-item info">
                  <span className="home-update-icon">📢</span>
                  <span>Gram Sabha meeting at 4 PM today</span>
                </div>
                <div className="home-update-item warning">
                  <span className="home-update-icon">⚠️</span>
                  <span>Road repair work in progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for area icons
const getAreaIcon = (direction) => {
  const icons = {
    'North': '🏔️',
    'South': '🌾',
    'East': '🏘️',
    'West': '🏭'
  };
  return icons[direction] || '📍';
};

export default Home;