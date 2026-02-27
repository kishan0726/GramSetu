import { useState, useEffect } from 'react';
import '../stylesheets/Shops.css';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);
  const [documentImages, setDocumentImages] = useState({});
  const [profileImages, setProfileImages] = useState({});
  const [documentViewer, setDocumentViewer] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

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
      general: '🏪',
      food: '🍲',
      dairy: '🥛',
      stationery: '✏️',
      agriculture: '🌾'
    };
    return icons[category?.toLowerCase()] || '🏪';
  };

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-shops");
        const result = await response.json();
        setShops(result.success ? result.data : []);
        setLoading(false);
      }
      catch (error) {
        console.error("Error fetching shops : ", error);
        setLoading(false);
      }
    }

    fetchShop();
  }, []);

  // Fetch document images and profile images when a shop is selected
  useEffect(() => {
    const fetchShopImages = async () => {
      if (selectedShop?.id) {
        try {
          setLoadingDocuments(true);
          console.log("Fetching images for shop:", selectedShop.id);
          const response = await fetch(`http://localhost:5000/get-shop-documents/${selectedShop.id}`);
          const result = await response.json();
          console.log("Document images response:", result);

          if (result.success) {
            setDocumentImages(result.data || {});

            if (result.data.profile) {
              setProfileImages(prev => ({
                ...prev,
                [selectedShop.id]: result.data.profile.url
              }));
            }
          } else {
            setDocumentImages({});
          }
        } catch (error) {
          console.error("Error fetching document images:", error);
          setDocumentImages({});
        } finally {
          setLoadingDocuments(false);
        }
      }
    };

    fetchShopImages();
  }, [selectedShop]);

  // Filter Data for Display
  const filteredShops = shops.filter(shop => {
    if (filter !== 'all' && shop.status !== filter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (shop.name || '').toLowerCase().includes(term) ||
        (shop.shopName || '').toLowerCase().includes(term) ||
        (shop.ownerName || '').toLowerCase().includes(term) ||
        (shop.id || '').toLowerCase().includes(term) ||
        (shop.shopType || '').toLowerCase().includes(term) ||
        (shop.category || '').toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Approve Shops
  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this shop?')) {
      try {
        const response = await fetch(`http://localhost:5000/update-shop-status/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" })
        });
        const result = await response.json();
        if (result.success) {
          alert('Shop approved successfully!');
          // Update local state
          setShops(shops.map(shop =>
            shop.id === id ? { ...shop, status: 'approved' } : shop
          ));
          if (selectedShop?.id === id) {
            setSelectedShop({ ...selectedShop, status: 'approved' });
          }
        }
      } catch (error) {
        console.error("Error approving shop:", error);
        alert('Failed to approve shop');
      }
    }
  };

  // Reject Shops
  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this shop?')) {
      try {
        const response = await fetch(`http://localhost:5000/update-shop-status/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" })
        });
        const result = await response.json();
        if (result.success) {
          alert('Shop rejected!');
          setShops(shops.map(shop =>
            shop.id === id ? { ...shop, status: 'rejected' } : shop
          ));
          if (selectedShop?.id === id) {
            setSelectedShop({ ...selectedShop, status: 'rejected' });
          }
        }
      } catch (error) {
        console.error("Error rejecting shop:", error);
        alert('Failed to reject shop');
      }
    }
  };

  // Remove shops from database
  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to permanently remove this shop?')) {
      try {
        const response = await fetch(`http://localhost:5000/delete-shop/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (result.success) {
          alert('Shop removed from system!');
          setShops(shops.filter(shop => shop.id !== id));
          if (selectedShop?.id === id) {
            setSelectedShop(null);
            setDocumentImages({});
          }
        }
      } catch (error) {
        console.error("Error removing shop:", error);
        alert('Failed to remove shop');
      }
    }
  };

  // Download document
  const handleDownloadDocument = async (shopId, docType, fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/download-document/${shopId}/${docType}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `${shopId}_${docType}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  // View document in modal
  const handleViewDocument = (imageUrl, docType) => {
    setDocumentViewer({
      url: imageUrl,
      type: docType
    });
  };

  // Form Document Type
  const formatDocumentType = (docType) => {
    const types = {
      aadhaar: 'Aadhaar Card',
      pan: 'PAN Card',
      license: 'Shop License',
      businessProof: 'Business Proof',
      profile: 'Profile Image'
    };
    return types[docType] || docType.charAt(0).toUpperCase() + docType.slice(1);
  };

  const stats = {
    total: shops.length,
    pending: shops.filter(s => s.status === 'pending').length,
    approved: shops.filter(s => s.status === 'approved').length,
    rejected: shops.filter(s => s.status === 'rejected').length
  };

  // Loading View
  if (loading) {
    return (
      <div className="shop-loading-container">
        <div className="shop-loading-spinner"></div>
        <p>Loading shop data...</p>
      </div>
    );
  }

  return (
    <div className="shop-management">
      {/* Header */}
      <div className="shop-management-header">
        <div className="shop-header-left">
          <h1>
            Shop Management
          </h1>
          <p className="shop-header-subtitle">Manage and approve shop registrations in your village</p>
        </div>
        <div className="shop-header-right">
          <button className="shop-btn btn-primary" onClick={() => alert('Export feature coming soon!')}>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="shop-stats-cards">
        <div className="shop-stat-card">
          <div className="shop-stat-content">
            <div className="shop-stat-value">{stats.total}</div>
            <div className="shop-stat-label">Total Shops</div>
          </div>
        </div>
        <div className="shop-stat-card">
          <div className="shop-stat-content">
            <div className="shop-stat-value">{stats.pending}</div>
            <div className="shop-stat-label">Pending Approval</div>
          </div>
        </div>
        <div className="shop-stat-card">
          <div className="shop-stat-content">
            <div className="shop-stat-value">{stats.approved}</div>
            <div className="shop-stat-label">Approved</div>
          </div>
        </div>
        <div className="shop-stat-card">
          <div className="shop-stat-content">
            <div className="shop-stat-value">{stats.rejected}</div>
            <div className="shop-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="shop-controls-section">
        <div className="shop-search-box">
          <input
            type="text"
            placeholder="Search by shop name, owner, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shop-search-input"
          />
        </div>

        <div className="shop-filter-buttons">
          <button
            className={`shop-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Shops
          </button>
          <button
            className={`shop-filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`shop-filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={`shop-filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        <div className="shop-view-toggle">
          <button
            className={`shop-view-btn ${!mapView ? 'active' : ''}`}
            onClick={() => setMapView(false)}
          >
            <span className="shop-view-icon">📋</span>
            List View
          </button>
          <button
            className={`shop-view-btn ${mapView ? 'active' : ''}`}
            onClick={() => setMapView(true)}
          >
            <span className="shop-view-icon">🗺️</span>
            Map View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="shop-main-content">
        {/* Left Panel - Shop List */}
        <div className={`shop-list ${selectedShop ? 'with-details' : ''}`}>
          <div className="shop-list-header">
            <h3>Shop List ({filteredShops.length})</h3>
            <div className="shop-list-summary">
              Showing {filteredShops.length} of {shops.length} shops
            </div>
          </div>

          <div className="shop-items">
            {filteredShops.length === 0 ? (
              <div className="shop-empty-state">
                <div className="shop-empty-icon">🏪</div>
                <h4>No shops found</h4>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredShops.map(shop => (
                <div
                  key={shop.id}
                  className={`shop-item ${selectedShop?.id === shop.id ? 'selected' : ''}`}
                  onClick={() => setSelectedShop(shop)}
                >
                  <div className="shop-header">
                    <div className="shop-icon">{getCategoryIcon(shop.category)}</div>
                    <div className="shop-info">
                      <h4 className="shop-name">{shop.shopName || shop.name || 'N/A'}</h4>
                      <p className="shop-owner">👤 {shop.ownerName || 'N/A'}</p>
                    </div>
                    <div
                      className="shop-status"
                      style={{ color: getStatusColor(shop.status) }}
                    >
                      <span className="shop-status-icon">{getStatusIcon(shop.status)}</span>
                      <span className="shop-status-text">{shop.status}</span>
                    </div>
                  </div>

                  <div className="shop-details">
                    <div className="shop-detail-item">
                      <span className="shop-detail-label">ID:</span>
                      <span className="shop-detail-value">{shop.id}</span>
                    </div>
                    <div className="shop-detail-item">
                      <span className="shop-detail-label">Type:</span>
                      <span className="shop-detail-value">{shop.shopType || shop.category || "none"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Shop Details */}
        {selectedShop && !mapView && (
          <div className="shop-details-panel">
            <div className="shop-details-header">
              <h3>Shop Details</h3>
              <button
                className="shop-close-btn"
                onClick={() => {
                  setSelectedShop(null);
                  setDocumentImages({});
                }}
              >
                ✕
              </button>
            </div>

            <div className="shop-details-content">
              {/* Shop Header with Profile Image */}
              <div className="shop-header-details">
                <div className="shop-avatar-with-image">
                  {profileImages[selectedShop.id] ? (
                    <img
                      src={profileImages[selectedShop.id]}
                      alt={`${selectedShop.shopName || selectedShop.name} profile`}
                      className="shop-profile-image"
                      onError={(e) => {
                        console.error("Error loading profile image");
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML += '<div className="shop-avatar-fallback">' + getCategoryIcon(selectedShop.category) + '</div>';
                      }}
                    />
                  ) : (
                    <div className="shop-avatar-fallback">
                      {getCategoryIcon(selectedShop.category)}
                    </div>
                  )}
                </div>
                <div className="shop-title">
                  <h2>{selectedShop.shopName || selectedShop.name || "N/A"}</h2>
                  <div className="shop-subtitle">
                    <span className="shop-id">ID: {selectedShop.id}</span>
                    <span
                      className="shop-status-badge"
                      style={{ background: getStatusColor(selectedShop.status) }}
                    >
                      {getStatusIcon(selectedShop.status)} {selectedShop.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="shop-details-section">
                <h4 className="shop-section-title">
                  Owner Information
                </h4>
                <div className="shop-info-grid">
                  <div className="shop-info-item">
                    <span className="shop-info-label">Owner Name:</span>
                    <span className="shop-info-value">{selectedShop.ownerName || 'N/A'}</span>
                  </div>
                  <div className="shop-info-item">
                    <span className="shop-info-label">Contact:</span>
                    <span className="shop-info-value">{selectedShop.phone || selectedShop.mobile || 'N/A'}</span>
                  </div>
                  <div className="shop-info-item">
                    <span className="shop-info-label">Email:</span>
                    <span className="shop-info-value">{selectedShop.email || 'N/A'}</span>
                  </div>
                  <div className="shop-info-item">
                    <span className="shop-info-label">Registration Date:</span>
                    <span className="shop-info-value">
                      {selectedShop.createdAt
                        ? new Date(selectedShop.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div className="shop-details-section">
                <h4 className="shop-section-title">
                  Shop Information
                </h4>
                <div className="shop-info-grid">
                  <div className="shop-info-item">
                    <span className="shop-info-label">Category:</span>
                    <span className="shop-info-value">{selectedShop.category || "N/A"}</span>
                  </div>
                  <div className="shop-info-item">
                    <span className="shop-info-label">Business Proof:</span>
                    <span className="shop-info-value">{selectedShop.businessProof || "N/A"}</span>
                  </div>
                </div>
                <div className="shop-info-item-full">
                  <span className="shop-info-label">Address:</span>
                  <span className="shop-info-value">{selectedShop.address || "N/A"}</span>
                </div>
                <div className="shop-info-item-full">
                  <span className="shop-info-label">Description:</span>
                  <span className="shop-info-value">{selectedShop.description || "N/A"}</span>
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="shop-details-section">
                <h4 className="shop-section-title">
                  Location Coordinates
                </h4>
                <div className="shop-coordinates-display">
                  <div className="shop-coordinate-item">
                    <span className="shop-coord-label">Latitude:</span>
                    <span className="shop-coord-value">{selectedShop.coordinates?.lat || "N/A"}</span>
                  </div>
                  <div className="shop-coordinate-item">
                    <span className="shop-coord-label">Longitude:</span>
                    <span className="shop-coord-value">{selectedShop.coordinates?.lng || "N/A"}</span>
                  </div>
                  <button className="shop-btn btn-outline" onClick={() => setMapView(true)}>
                    View on Map
                  </button>
                </div>
              </div>

              {/* Profile Image Display */}
              {profileImages[selectedShop.id] && (
                <div className="shop-details-section">
                  <h4 className="shop-section-title">
                    Profile Image
                  </h4>
                  <div className="shop-profile-image-container">
                    <img
                      src={profileImages[selectedShop.id]}
                      alt="Shop Profile"
                      className="shop-profile-large-image"
                      onClick={() => handleViewDocument(profileImages[selectedShop.id], 'profile')}
                    />
                    <div className="shop-profile-image-actions">
                      <button
                        className="shop-doc-btn view"
                        onClick={() => handleViewDocument(profileImages[selectedShop.id], 'profile')}
                      >
                        👁️ View Full Size
                      </button>
                      <button
                        className="shop-doc-btn download"
                        onClick={() => handleDownloadDocument(selectedShop.id, 'profile', `profile_${selectedShop.id}.jpg`)}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Images */}
              <div className="shop-details-section">
                <h4 className="shop-section-title">
                  Document Images
                </h4>
                {loadingDocuments ? (
                  <div className="shop-documents-loading">
                    <div className="shop-loading-spinner-small"></div>
                    <p>Loading documents...</p>
                  </div>
                ) : (
                  <div className="shop-document-images-grid">
                    {Object.keys(documentImages).length > 0 ? (
                      Object.entries(documentImages).map(([docType, docData]) => (
                        docType !== 'profile' && (
                          <div key={docType} className="shop-document-image-card">
                            <div className="shop-document-image-header">
                              <span className="shop-document-image-icon">📄</span>
                              <span className="shop-document-image-name">
                                {formatDocumentType(docType)}
                              </span>
                            </div>
                            {docData.url ? (
                              <>
                                <img
                                  src={docData.url}
                                  alt={docType}
                                  className="shop-document-thumbnail"
                                  onClick={() => handleViewDocument(docData.url, docType)}
                                  onError={(e) => {
                                    console.error("Error loading image:", docData.url);
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML += '<div class="shop-image-error">Failed to load image</div>';
                                  }}
                                />
                                <div className="shop-document-image-actions">
                                  <button
                                    className="shop-doc-btn view"
                                    onClick={() => handleViewDocument(docData.url, docType)}
                                    title="View Document"
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    className="shop-doc-btn download"
                                    onClick={() => handleDownloadDocument(selectedShop.id, docType, docData.fileName)}
                                    title="Download Document"
                                  >
                                    ⬇️ Download
                                  </button>
                                </div>
                                {docData.fileName && (
                                  <div className="shop-document-filename" title={docData.fileName}>
                                    {docData.fileName.length > 20
                                      ? docData.fileName.substring(0, 17) + '...'
                                      : docData.fileName}
                                  </div>
                                )}
                                {docData.uploadedAt && (
                                  <div className="shop-document-date">
                                    Uploaded: {new Date(docData.uploadedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="shop-no-image">No image available</div>
                            )}
                          </div>
                        )
                      ))
                    ) : (
                      <div className="shop-no-documents">
                        <p>No document images uploaded yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Document Status */}
              {selectedShop.documents && Object.keys(selectedShop.documents).length > 0 && (
                <div className="shop-details-section">
                  <h4 className="shop-section-title">
                    Document Verification Status
                  </h4>
                  <div className="shop-documents-grid">
                    {Object.entries(selectedShop.documents).map(([doc, status]) => (
                      <div key={doc} className="shop-document-item">
                        <div className="shop-document-name">
                          <span className="shop-doc-icon">📋</span>
                          {formatDocumentType(doc)}
                        </div>
                        <div className={`shop-document-status ${status}`}>
                          {status === 'approved' && '✅ Approved'}
                          {status === 'uploaded' && '📤 Uploaded'}
                          {status === 'pending' && '⏳ Pending'}
                          {status === 'rejected' && '❌ Rejected'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="shop-action-buttons-panel">
                {selectedShop.status === 'pending' && (
                  <>
                    <button
                      className="shop-btn btn-success"
                      onClick={() => handleApprove(selectedShop.id)}
                    >
                      Approve Shop
                    </button>
                    <button
                      className="shop-btn btn-danger"
                      onClick={() => handleReject(selectedShop.id)}
                    >
                      Reject Application
                    </button>
                  </>
                )}

                {selectedShop.status === 'approved' && (
                  <button
                    className="shop-btn btn-warning"
                    onClick={() => handleReject(selectedShop.id)}
                  >
                    Revoke Approval
                  </button>
                )}

                {selectedShop.status === 'rejected' && (
                  <button
                    className="shop-btn btn-success"
                    onClick={() => handleApprove(selectedShop.id)}
                  >
                    Reconsider Approval
                  </button>
                )}

                <button className="shop-btn btn-outline">
                  Contact Shop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map View */}
        {mapView && (
          <div className="shop-map-panel">
            <div className="shop-map-header">
              <h3>Shop Locations Map</h3>
              <div className="shop-map-controls">
                <button className="shop-btn btn-outline" onClick={() => setMapView(false)}>
                  Back to List
                </button>
              </div>
            </div>

            <div className="shop-map-container">
              {/* This would be replaced with actual map component like Google Maps or Leaflet */}
              <div className="shop-map-placeholder">
                <div className="shop-map-grid">
                  {/* Village Center */}
                  <div className="shop-map-center" title="Village Center">
                    <div className="shop-center-icon">🏛️</div>
                    <span className="shop-center-label">Village Center</span>
                  </div>

                  {/* Plot shop locations */}
                  {shops.filter(shop => shop.coordinates?.lat && shop.coordinates?.lng).map(shop => (
                    <div
                      key={shop.id}
                      className="shop-marker"
                      style={{
                        left: `${((shop.coordinates.lng || 72.57) - 72.57) * 1000 + 200}px`,
                        top: `${((shop.coordinates.lat || 23.02) - 23.02) * 1000 + 200}px`,
                        borderColor: getStatusColor(shop.status)
                      }}
                      title={`${shop.name || shop.shopName} (${shop.status})`}
                      onClick={() => {
                        setSelectedShop(shop);
                        setMapView(false);
                      }}
                    >
                      <div className="shop-marker-icon">{getCategoryIcon(shop.category)}</div>
                      {shop.status === 'pending' && <div className="shop-marker-pulse"></div>}
                      <div className="shop-marker-tooltip">
                        <strong>{shop.name || shop.shopName}</strong>
                        <div>{shop.category}</div>
                        <div>{shop.ownerName}</div>
                        <div className={`shop-tooltip-status ${shop.status}`}>
                          {getStatusIcon(shop.status)} {shop.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shop-map-legend">
                  <div className="shop-legend-item">
                    <div className="shop-legend-marker pending"></div>
                    <span>Pending Approval</span>
                  </div>
                  <div className="shop-legend-item">
                    <div className="shop-legend-marker approved"></div>
                    <span>Approved</span>
                  </div>
                  <div className="shop-legend-item">
                    <div className="shop-legend-marker rejected"></div>
                    <span>Rejected</span>
                  </div>
                </div>
              </div>

              {selectedShop && (
                <div className="shop-selected-shop-info">
                  <h4>Selected Shop: {selectedShop.name || selectedShop.shopName}</h4>
                  <div className="shop-coordinate-display">
                    <div>Lat: {selectedShop.coordinates?.lat || "N/A"}</div>
                    <div>Lng: {selectedShop.coordinates?.lng || "N/A"}</div>
                  </div>
                  <button
                    className="shop-btn btn-primary"
                    onClick={() => window.open(`https://maps.google.com/?q=${selectedShop.coordinates?.lat || 0},${selectedShop.coordinates?.lng || 0}`, '_blank')}
                  >
                    Open in Google Maps
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {documentViewer && (
        <div className="shop-document-viewer-modal" onClick={() => setDocumentViewer(null)}>
          <div className="shop-document-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="shop-document-viewer-header">
              <h3>{formatDocumentType(documentViewer.type)}</h3>
              <button className="shop-document-viewer-close" onClick={() => setDocumentViewer(null)}>✕</button>
            </div>
            <div className="shop-document-viewer-body">
              <img src={documentViewer.url} alt={documentViewer.type} className="shop-document-full-image" />
            </div>
            <div className="shop-document-viewer-footer">
              <button
                className="shop-btn btn-primary"
                onClick={() => handleDownloadDocument(selectedShop?.id, documentViewer.type)}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;