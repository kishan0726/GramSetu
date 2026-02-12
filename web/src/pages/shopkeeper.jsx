import React, { useState, useEffect } from 'react';
import '../stylesheets/Shopkeeper.css';

const Shopkeeper = () => {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);

  // Mock data - Replace with API call
  useEffect(() => {
    const mockShopkeepers = [
      {
        id: 'SHOP001',
        name: 'Ram Kirana Store',
        ownerName: 'Ram Kumar',
        email: 'ram.kirana@example.com',
        phone: '+91 9876543210',
        shopType: 'Kirana/Grocery',
        address: 'Main Road, Near Post Office, Ramnagar Village',
        coordinates: { lat: 23.0225, lng: 72.5714 },
        registrationDate: '2024-01-15',
        status: 'pending',
        documents: {
          aadhaar: 'uploaded',
          pan: 'uploaded',
          license: 'pending'
        },
        businessProof: 'GST Certificate',
        category: 'grocery',
        shopArea: '250 sq ft',
        description: 'Daily grocery items, vegetables, and household essentials',
        verificationScore: 85,
        lastUpdated: '2024-12-25'
      },
      {
        id: 'SHOP002',
        name: 'Sita Medical Store',
        ownerName: 'Sita Devi',
        email: 'sita.medical@example.com',
        phone: '+91 9876543211',
        shopType: 'Medical/Pharmacy',
        address: 'Health Center Road, Ramnagar Village',
        coordinates: { lat: 23.0230, lng: 72.5720 },
        registrationDate: '2024-01-10',
        status: 'approved',
        documents: {
          aadhaar: 'verified',
          pan: 'verified',
          license: 'verified'
        },
        businessProof: 'Drug License',
        category: 'medical',
        shopArea: '150 sq ft',
        description: 'Allopathic medicines and basic medical supplies',
        verificationScore: 95,
        lastUpdated: '2024-12-20'
      },
      {
        id: 'SHOP003',
        name: 'Bharat Hardware',
        ownerName: 'Bharat Singh',
        email: 'bharat.hardware@example.com',
        phone: '+91 9876543212',
        shopType: 'Hardware Store',
        address: 'Industrial Area, Ramnagar Village',
        coordinates: { lat: 23.0215, lng: 72.5700 },
        registrationDate: '2024-01-05',
        status: 'rejected',
        documents: {
          aadhaar: 'uploaded',
          pan: 'rejected',
          license: 'pending'
        },
        businessProof: 'Shop Registration',
        category: 'hardware',
        shopArea: '500 sq ft',
        description: 'Construction materials and hardware tools',
        verificationScore: 45,
        lastUpdated: '2024-12-18'
      },
      {
        id: 'SHOP004',
        name: 'Ganga Cloth Store',
        ownerName: 'Ganga Devi',
        email: 'ganga.cloth@example.com',
        phone: '+91 9876543213',
        shopType: 'Clothing Store',
        address: 'Market Road, Ramnagar Village',
        coordinates: { lat: 23.0240, lng: 72.5730 },
        registrationDate: '2024-01-20',
        status: 'pending',
        documents: {
          aadhaar: 'uploaded',
          pan: 'uploaded',
          license: 'uploaded'
        },
        businessProof: 'Trademark Certificate',
        category: 'clothing',
        shopArea: '300 sq ft',
        description: 'Traditional and modern clothing for all ages',
        verificationScore: 75,
        lastUpdated: '2024-12-24'
      }
    ];

    setTimeout(() => {
      setShopkeepers(mockShopkeepers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredShopkeepers = shopkeepers.filter(shopkeeper => {
    // Filter by status
    if (filter !== 'all' && shopkeeper.status !== filter) return false;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        shopkeeper.name.toLowerCase().includes(term) ||
        shopkeeper.ownerName.toLowerCase().includes(term) ||
        shopkeeper.id.toLowerCase().includes(term) ||
        shopkeeper.shopType.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this shopkeeper?')) {
      setShopkeepers(prev => prev.map(shop => 
        shop.id === id ? { ...shop, status: 'approved', lastUpdated: new Date().toISOString().split('T')[0] } : shop
      ));
      alert('Shopkeeper approved successfully!');
    }
  };

  const handleReject = (id) => {
    if (window.confirm('Are you sure you want to reject this shopkeeper?')) {
      setShopkeepers(prev => prev.map(shop => 
        shop.id === id ? { ...shop, status: 'rejected', lastUpdated: new Date().toISOString().split('T')[0] } : shop
      ));
      alert('Shopkeeper rejected!');
    }
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this shopkeeper?')) {
      setShopkeepers(prev => prev.filter(shop => shop.id !== id));
      setSelectedShopkeeper(null);
      alert('Shopkeeper removed from system!');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    };
    return icons[status] || '❓';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      grocery: '🛒',
      medical: '💊',
      hardware: '🔧',
      clothing: '👕',
      electronics: '📱',
      restaurant: '🍽️',
      general: '🏪'
    };
    return icons[category] || '🏪';
  };

  const stats = {
    total: shopkeepers.length,
    pending: shopkeepers.filter(s => s.status === 'pending').length,
    approved: shopkeepers.filter(s => s.status === 'approved').length,
    rejected: shopkeepers.filter(s => s.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="shopkeeper-loading-container">
        <div className="shopkeeper-loading-spinner"></div>
        <p>Loading shopkeeper data...</p>
      </div>
    );
  }

  return (
    <div className="shopkeeper-management">
      {/* Header */}
      <div className="shopkeeper-management-header">
        <div className="shopkeeper-header-left">
          <h1>
            Shopkeeper Management
          </h1>
          <p className="shopkeeper-header-subtitle">Manage and approve shop registrations in your village</p>
        </div>
        <div className="shopkeeper-header-right">
          <button className="shopkeeper-btn btn-primary" onClick={() => alert('Export feature coming soon!')}>
            Export Report
          </button>
          <button className="shopkeeper-btn btn-outline" onClick={() => alert('Add new shopkeeper feature coming soon!')}>
            Add Shopkeeper
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="shopkeeper-stats-cards">
        <div className="shopkeeper-stat-card">
          <div className="shopkeeper-stat-icon total">🏪</div>
          <div className="shopkeeper-stat-content">
            <div className="shopkeeper-stat-value">{stats.total}</div>
            <div className="shopkeeper-stat-label">Total Shops</div>
          </div>
        </div>
        <div className="shopkeeper-stat-card">
          <div className="shopkeeper-stat-icon pending">⏳</div>
          <div className="shopkeeper-stat-content">
            <div className="shopkeeper-stat-value">{stats.pending}</div>
            <div className="shopkeeper-stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="shopkeeper-stat-card">
          <div className="shopkeeper-stat-icon approved">✅</div>
          <div className="shopkeeper-stat-content">
            <div className="shopkeeper-stat-value">{stats.approved}</div>
            <div className="shopkeeper-stat-label">Approved</div>
          </div>
        </div>
        <div className="shopkeeper-stat-card">
          <div className="shopkeeper-stat-icon rejected">❌</div>
          <div className="shopkeeper-stat-content">
            <div className="shopkeeper-stat-value">{stats.rejected}</div>
            <div className="shopkeeper-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="shopkeeper-controls-section">
        <div className="shopkeeper-search-box">
          <input
            type="text"
            placeholder="Search by shop name, owner, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shopkeeper-search-input"
          />
          <span className="shopkeeper-search-icon">🔍</span>
        </div>

        <div className="shopkeeper-filter-buttons">
          <button 
            className={`shopkeeper-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Shops
          </button>
          <button 
            className={`shopkeeper-filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button 
            className={`shopkeeper-filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved})
          </button>
          <button 
            className={`shopkeeper-filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        <div className="shopkeeper-view-toggle">
          <button 
            className={`shopkeeper-view-btn ${!mapView ? 'active' : ''}`}
            onClick={() => setMapView(false)}
          >
            <span className="shopkeeper-view-icon">📋</span>
            List View
          </button>
          <button 
            className={`shopkeeper-view-btn ${mapView ? 'active' : ''}`}
            onClick={() => setMapView(true)}
          >
            <span className="shopkeeper-view-icon">🗺️</span>
            Map View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="shopkeeper-main-content">
        {/* Left Panel - Shopkeeper List */}
        <div className={`shopkeeper-shop-list ${selectedShopkeeper ? 'with-details' : ''}`}>
          <div className="shopkeeper-list-header">
            <h3>Shopkeeper List ({filteredShopkeepers.length})</h3>
            <div className="shopkeeper-list-summary">
              Showing {filteredShopkeepers.length} of {shopkeepers.length} shops
            </div>
          </div>

          <div className="shopkeeper-shop-items">
            {filteredShopkeepers.length === 0 ? (
              <div className="shopkeeper-empty-state">
                <div className="shopkeeper-empty-icon">🏪</div>
                <h4>No shopkeepers found</h4>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredShopkeepers.map(shopkeeper => (
                <div 
                  key={shopkeeper.id}
                  className={`shopkeeper-shop-item ${selectedShopkeeper?.id === shopkeeper.id ? 'selected' : ''}`}
                  onClick={() => setSelectedShopkeeper(shopkeeper)}
                >
                  <div className="shopkeeper-shop-header">
                    <div className="shopkeeper-shop-icon">{getCategoryIcon(shopkeeper.category)}</div>
                    <div className="shopkeeper-shop-info">
                      <h4 className="shopkeeper-shop-name">{shopkeeper.name}</h4>
                      <p className="shopkeeper-shop-owner">👤 {shopkeeper.ownerName}</p>
                    </div>
                    <div 
                      className="shopkeeper-shop-status"
                      style={{ color: getStatusColor(shopkeeper.status) }}
                    >
                      <span className="shopkeeper-status-icon">{getStatusIcon(shopkeeper.status)}</span>
                      <span className="shopkeeper-status-text">{shopkeeper.status}</span>
                    </div>
                  </div>
                  
                  <div className="shopkeeper-shop-details">
                    <div className="shopkeeper-detail-item">
                      <span className="shopkeeper-detail-label">ID:</span>
                      <span className="shopkeeper-detail-value">{shopkeeper.id}</span>
                    </div>
                    <div className="shopkeeper-detail-item">
                      <span className="shopkeeper-detail-label">Type:</span>
                      <span className="shopkeeper-detail-value">{shopkeeper.shopType}</span>
                    </div>
                    <div className="shopkeeper-detail-item">
                      <span className="shopkeeper-detail-label">Area:</span>
                      <span className="shopkeeper-detail-value">{shopkeeper.shopArea}</span>
                    </div>
                  </div>
                  
                  <div className="shopkeeper-shop-actions">
                    <div className="shopkeeper-verification-score">
                      <div className="shopkeeper-score-label">Verification:</div>
                      <div className="shopkeeper-score-bar">
                        <div 
                          className="shopkeeper-score-fill" 
                          style={{ 
                            width: `${shopkeeper.verificationScore}%`,
                            background: shopkeeper.verificationScore >= 70 ? '#10b981' : 
                                      shopkeeper.verificationScore >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                      </div>
                      <div className="shopkeeper-score-value">{shopkeeper.verificationScore}%</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Shopkeeper Details */}
        {selectedShopkeeper && !mapView && (
          <div className="shopkeeper-shop-details-panel">
            <div className="shopkeeper-details-header">
              <h3>Shopkeeper Details</h3>
              <button 
                className="shopkeeper-close-btn"
                onClick={() => setSelectedShopkeeper(null)}
              >
                ✕
              </button>
            </div>

            <div className="shopkeeper-details-content">
              {/* Shop Header */}
              <div className="shopkeeper-shop-header-details">
                <div className="shopkeeper-shop-avatar">
                  {getCategoryIcon(selectedShopkeeper.category)}
                </div>
                <div className="shopkeeper-shop-title">
                  <h2>{selectedShopkeeper.name}</h2>
                  <div className="shopkeeper-shop-subtitle">
                    <span className="shopkeeper-shop-id">ID: {selectedShopkeeper.id}</span>
                    <span 
                      className="shopkeeper-shop-status-badge"
                      style={{ background: getStatusColor(selectedShopkeeper.status) }}
                    >
                      {getStatusIcon(selectedShopkeeper.status)} {selectedShopkeeper.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="shopkeeper-details-section">
                <h4 className="shopkeeper-section-title">
                  Owner Information
                </h4>
                <div className="shopkeeper-info-grid">
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Owner Name:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.ownerName}</span>
                  </div>
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Contact:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.phone}</span>
                  </div>
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Email:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.email}</span>
                  </div>
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Registration Date:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.registrationDate}</span>
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div className="shopkeeper-details-section">
                <h4 className="shopkeeper-section-title">
                  Shop Information
                </h4>
                <div className="shopkeeper-info-grid">
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Shop Type:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.shopType}</span>
                  </div>
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Category:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.category}</span>
                  </div>
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Shop Area:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.shopArea}</span>
                  </div>
                  <div className="shopkeeper-info-item">
                    <span className="shopkeeper-info-label">Business Proof:</span>
                    <span className="shopkeeper-info-value">{selectedShopkeeper.businessProof}</span>
                  </div>
                </div>
                <div className="shopkeeper-info-item-full">
                  <span className="shopkeeper-info-label">Address:</span>
                  <span className="shopkeeper-info-value">{selectedShopkeeper.address}</span>
                </div>
                <div className="shopkeeper-info-item-full">
                  <span className="shopkeeper-info-label">Description:</span>
                  <span className="shopkeeper-info-value">{selectedShopkeeper.description}</span>
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="shopkeeper-details-section">
                <h4 className="shopkeeper-section-title">
                  Location Coordinates
                </h4>
                <div className="shopkeeper-coordinates-display">
                  <div className="shopkeeper-coordinate-item">
                    <span className="shopkeeper-coord-label">Latitude:</span>
                    <span className="shopkeeper-coord-value">{selectedShopkeeper.coordinates.lat}</span>
                  </div>
                  <div className="shopkeeper-coordinate-item">
                    <span className="shopkeeper-coord-label">Longitude:</span>
                    <span className="shopkeeper-coord-value">{selectedShopkeeper.coordinates.lng}</span>
                  </div>
                  <button className="shopkeeper-btn btn-outline" onClick={() => setMapView(true)}>
                    View on Map
                  </button>
                </div>
              </div>

              {/* Document Status */}
              <div className="shopkeeper-details-section">
                <h4 className="shopkeeper-section-title">
                  Document Verification
                </h4>
                <div className="shopkeeper-documents-grid">
                  {Object.entries(selectedShopkeeper.documents).map(([doc, status]) => (
                    <div key={doc} className="shopkeeper-document-item">
                      <div className="shopkeeper-document-name">
                        <span className="shopkeeper-doc-icon">📋</span>
                        {doc.toUpperCase()}
                      </div>
                      <div className={`shopkeeper-document-status ${status}`}>
                        {status === 'verified' && '✅ Verified'}
                        {status === 'uploaded' && '📤 Uploaded'}
                        {status === 'pending' && '⏳ Pending'}
                        {status === 'rejected' && '❌ Rejected'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shopkeeper-action-buttons-panel">
                {selectedShopkeeper.status === 'pending' && (
                  <>
                    <button 
                      className="shopkeeper-btn btn-success"
                      onClick={() => handleApprove(selectedShopkeeper.id)}
                    >
                      Approve Shopkeeper
                    </button>
                    <button 
                      className="shopkeeper-btn btn-danger"
                      onClick={() => handleReject(selectedShopkeeper.id)}
                    >
                      Reject Application
                    </button>
                  </>
                )}
                
                {selectedShopkeeper.status === 'approved' && (
                  <button 
                    className="shopkeeper-btn btn-warning"
                    onClick={() => handleReject(selectedShopkeeper.id)}
                  >
                    Revoke Approval
                  </button>
                )}
                
                {selectedShopkeeper.status === 'rejected' && (
                  <button 
                    className="shopkeeper-btn btn-success"
                    onClick={() => handleApprove(selectedShopkeeper.id)}
                  >
                    Reconsider Approval
                  </button>
                )}
                
                <button 
                  className="shopkeeper-btn btn-danger"
                  onClick={() => handleRemove(selectedShopkeeper.id)}
                >
                  Remove from System
                </button>
                
                <button className="shopkeeper-btn btn-outline">
                  Contact Shopkeeper
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map View */}
        {mapView && (
          <div className="shopkeeper-map-panel">
            <div className="shopkeeper-map-header">
              <h3>Shop Locations Map</h3>
              <div className="shopkeeper-map-controls">
                <button className="shopkeeper-btn btn-outline" onClick={() => setMapView(false)}>
                  Back to List
                </button>
              </div>
            </div>
            
            <div className="shopkeeper-map-container">
              {/* This would be replaced with actual map component like Google Maps or Leaflet */}
              <div className="shopkeeper-map-placeholder">
                <div className="shopkeeper-map-grid">
                  {/* Village Center */}
                  <div className="shopkeeper-map-center" title="Village Center">
                    <div className="shopkeeper-center-icon">🏛️</div>
                    <span className="shopkeeper-center-label">Village Center</span>
                  </div>
                  
                  {/* Plot shop locations */}
                  {shopkeepers.map(shop => (
                    <div 
                      key={shop.id}
                      className="shopkeeper-shop-marker"
                      style={{
                        left: `${(shop.coordinates.lng - 72.57) * 1000}px`,
                        top: `${(shop.coordinates.lat - 23.02) * 1000}px`,
                        borderColor: getStatusColor(shop.status)
                      }}
                      title={`${shop.name} (${shop.status})`}
                      onClick={() => {
                        setSelectedShopkeeper(shop);
                        setMapView(false);
                      }}
                    >
                      <div className="shopkeeper-marker-icon">{getCategoryIcon(shop.category)}</div>
                      {shop.status === 'pending' && <div className="shopkeeper-marker-pulse"></div>}
                      <div className="shopkeeper-marker-tooltip">
                        <strong>{shop.name}</strong>
                        <div>{shop.shopType}</div>
                        <div>{shop.ownerName}</div>
                        <div className={`shopkeeper-tooltip-status ${shop.status}`}>
                          {getStatusIcon(shop.status)} {shop.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="shopkeeper-map-legend">
                  <div className="shopkeeper-legend-item">
                    <div className="shopkeeper-legend-marker pending"></div>
                    <span>Pending Approval</span>
                  </div>
                  <div className="shopkeeper-legend-item">
                    <div className="shopkeeper-legend-marker approved"></div>
                    <span>Approved</span>
                  </div>
                  <div className="shopkeeper-legend-item">
                    <div className="shopkeeper-legend-marker rejected"></div>
                    <span>Rejected</span>
                  </div>
                </div>
              </div>
              
              {selectedShopkeeper && (
                <div className="shopkeeper-selected-shop-info">
                  <h4>Selected Shop: {selectedShopkeeper.name}</h4>
                  <div className="shopkeeper-coordinate-display">
                    <div>Lat: {selectedShopkeeper.coordinates.lat}</div>
                    <div>Lng: {selectedShopkeeper.coordinates.lng}</div>
                  </div>
                  <button 
                    className="shopkeeper-btn btn-primary"
                    onClick={() => window.open(`https://maps.google.com/?q=${selectedShopkeeper.coordinates.lat},${selectedShopkeeper.coordinates.lng}`, '_blank')}
                  >
                    Open in Google Maps
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shopkeeper;