import React, { useEffect, useState } from 'react';
import '../stylesheets/Home.css';
import villageMap from '../assets/icons/hide.png'; // You'll need to add this image

const Home = ({ villageData }) => {

  return (
    <div className="home-village-home">
      {/* Village Header */}
      <div className="home-village-hero">
        <div className="home-hero-content">
          <h1>{villageData.details.name} Village</h1>
          <p className="home-village-location">{villageData.details.district}, {villageData.details.state}</p>
          <p className="home-village-slogan">"{villageData.details.slogan}"</p>
        </div>
        <div className="home-hero-stats">
          <div className="home-hero-stat">
            <div className="home-stat-info">
              <div className="home-stat-value">{villageData.details.literacyRate}</div>
              <div className="home-stat-label">Literacy Rate</div>
            </div>
          </div>
          <div className="home-hero-stat">
            <div className="home-stat-info">
              <div className="home-stat-value">{villageData.details.population}</div>
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
              About {villageData.details.name}
            </h2>
            <p className="home-village-description">{villageData.details.description}</p>

            <div className="home-features-grid">
              <div className="home-feature-item">
                <span className="home-feature-icon">🌾</span>
                <div>
                  <h4>Main Crops</h4>
                  <p>{villageData.details.mainCrops.join(', ')}</p>
                </div>
              </div>
              <div className="home-feature-item">
                <span className="home-feature-icon">🏥</span>
                <div>
                  <h4>Facilities</h4>
                  <p>{villageData.details.facilities.join(', ')}</p>
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
              Live Village Data
            </h2>

            <div className="home-live-stats">
              {villageData?.liveData?.map((stat, index) => (
                <div key={index} className="home-live-stat">
                  <div className="home-live-info">
                    <div className="home-live-value">{stat.value}</div>
                    <div className="home-live-label">{stat.label}</div>
                  </div>

                </div>
              ))}
            </div>

            {/* Recent Updates */}
            <div className="home-recent-updates">
              <h3>Recent Updates</h3>
              <div className="home-updates-list">
                {villageData?.recentUpdates?.map((update, index) => (
                  <div
                    key={index}
                    className={`home-update-item ${update.type}`}
                  >
                    <span>{update.message}</span>
                  </div>
                ))}
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