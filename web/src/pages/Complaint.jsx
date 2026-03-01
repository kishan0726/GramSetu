import { useState, useEffect } from 'react';
import '../stylesheets/Complaint.css';

const Complaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionText, setResolutionText] = useState('');

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      'in-progress': '#3b82f6',
      resolved: '#10b981'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      'in-progress': '⚙️',
      resolved: '✅'
    };
    return icons[status] || '❓';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority] || '#64748b';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      water: '💧',
      road: '🛣️',
      electricity: '💡',
      sanitation: '🧹',
      drainage: '🚰',
      health: '🏥',
      education: '🏫',
      other: '📝'
    };
    return icons[category] || '📝';
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-complaint");
        const result = await response.json();
        setComplaints(result.success ? result.data : []);
        setLoading(false);
      }
      catch (error) {
        console.error("Fetch Error: ", error);
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  // Filtered Complaints
  const filteredComplaints = complaints.filter(complaint => {
    if (filter !== 'all' && complaint.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        complaint.title.toLowerCase().includes(term) ||
        complaint.userName.toLowerCase().includes(term) ||
        complaint.id.toLowerCase().includes(term) ||
        complaint.category.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Handle status change
  const handleStatusChange = async (complaintId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    const updatedData = {
      status: newStatus,
      lastUpdated: new Date().toLocaleString('en-IN', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    };

    if (newStatus === 'in-progress') {
      updatedData.assignedTo = 'Assigned to Team';
    }

    try {
      const response = await fetch(
        `http://localhost:5000/update-complaint-status/${complaintId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData)
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetch("http://localhost:5000/admin-recent-activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "Complaint status",
            description: `${complaintId} : ${newStatus}`,
          })
        });
        setComplaints(prev =>
          prev.map(c =>
            c.id === complaintId ? { ...c, ...updatedData } : c
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle update data
  const handleAssignTo = async (complaintId) => {
    const team = prompt("Enter team/department:");

    if (!team) return;

    const updateData = {
      assignedTo: team,
      status: "in-progress",
      lastUpdated: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short"
      })
    };

    try {
      const response = await fetch(
        `http://localhost:5000/update-complaint-status/${complaintId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData)
        }
      );

      const result = await response.json();

      if (result.success) {
        setComplaints(prev =>
          prev.map(c =>
            c.id === complaintId ? { ...c, ...updateData } : c
          )
        );

        alert(`Assigned to ${team}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Submistion
  const handleSubmitResolution = async () => {
    if (!resolutionText.trim()) {
      alert("Enter resolution details");
      return;
    }

    const updateData = {
      status: "resolved",
      resolution: resolutionText,
      resolutionDate: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short"
      }),
      lastUpdated: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short"
      })
    };

    try {
      const response = await fetch(
        `http://localhost:5000/update-complaint-status/${selectedComplaint.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData)
        }
      );

      const result = await response.json();

      if (result.success) {
        setComplaints(prev =>
          prev.map(c =>
            c.id === selectedComplaint.id
              ? { ...c, ...updateData }
              : c
          )
        );

        setShowResolutionForm(false);
        setResolutionText("");
        alert("Complaint resolved successfully!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Get Days Ago
  const getDaysAgo = (dateString) => {
    const date = new Date(dateString.split(' ')[0].split('-').reverse().join('-'));
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Loading
  if (loading) {
    return (
      <div className="complaint-loading-container">
        <div className="complaint-loading-spinner"></div>
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="complaint-management">
      {/* Header */}
      <div className="complaint-management-header">
        <div className="complaint-header-left">
          <h1>
            Complaint Management
          </h1>
          <p className="complaint-header-subtitle">Manage and track user complaints in your village</p>
        </div>
        <div className="complaint-header-right">
          <button className="complaint-btn btn-primary" onClick={() => alert('Export feature coming soon!')}>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="complaint-stats-cards">
        <div className="complaint-stat-card">
          <div className="complaint-stat-content">
            <div className="complaint-stat-value">{stats.total}</div>
            <div className="complaint-stat-label">Total Complaints</div>
          </div>
        </div>
        <div className="complaint-stat-card">
          <div className="complaint-stat-content">
            <div className="complaint-stat-value">{stats.pending}</div>
            <div className="complaint-stat-label">Pending</div>
          </div>
        </div>
        <div className="complaint-stat-card">
          <div className="complaint-stat-content">
            <div className="complaint-stat-value">{stats.inProgress}</div>
            <div className="complaint-stat-label">In Progress</div>
          </div>
        </div>
        <div className="complaint-stat-card">
          <div className="complaint-stat-content">
            <div className="complaint-stat-value">{stats.resolved}</div>
            <div className="complaint-stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="complaint-controls-section">
        <div className="complaint-search-box">
          <input
            type="text"
            placeholder="Search by title, user name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="complaint-search-input"
          />
        </div>

        <div className="complaint-filter-buttons">
          <button
            className={`complaint-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Complaints
          </button>
          <button
            className={`complaint-filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`complaint-filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({stats.inProgress})
          </button>
          <button
            className={`complaint-filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({stats.resolved})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="complaint-main-content">
        {/* Left Panel - Complaint List */}
        <div className={`complaint-list ${selectedComplaint ? 'with-details' : ''}`}>
          <div className="complaint-list-header">
            <h3>Complaints ({filteredComplaints.length})</h3>
            <div className="complaint-list-summary">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </div>
          </div>

          <div className="complaint-items">
            {filteredComplaints.length === 0 ? (
              <div className="complaint-empty-state">
                <div className="complaint-empty-icon">📋</div>
                <h4>No complaints found</h4>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredComplaints.map(complaint => (
                <div
                  key={complaint.id}
                  className={`complaint-item ${selectedComplaint?.id === complaint.id ? 'selected' : ''}`}
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="complaint-header">
                    <div className="complaint-icon">{getCategoryIcon(complaint.category)}</div>
                    <div className="complaint-info">
                      <h4 className="complaint-title">{complaint.title}</h4>
                      <p className="complaint-user">👤 {complaint.userName}</p>
                    </div>
                    <div className="complaint-status">
                      <div
                        className="complaint-status-badge"
                        style={{ background: getStatusColor(complaint.status) }}
                      >
                        <span className="complaint-status-icon">{getStatusIcon(complaint.status)}</span>
                        <span className="complaint-status-text">{complaint.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="complaint-details">
                    <div className="complaint-detail-item">
                      <span className="complaint-detail-label">ID:</span>
                      <span className="complaint-detail-value">{complaint.id}</span>
                    </div>
                    <div className="complaint-detail-item">
                      <span className="complaint-detail-label">Priority:</span>
                      <span
                        className="complaint-detail-value priority-badge"
                        style={{ color: getPriorityColor(complaint.priority) }}
                      >
                        ● {complaint.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="complaint-detail-item">
                      <span className="complaint-detail-label">Submitted:</span>
                      <span className="complaint-detail-value">{getDaysAgo(complaint.submittedDate)}</span>
                    </div>
                  </div>

                  <div className="complaint-description">
                    {complaint.description.length > 100
                      ? `${complaint.description.substring(0, 100)}...`
                      : complaint.description}
                  </div>

                  <div className="complaint-actions">
                    {complaint.status === 'pending' && (
                      <button
                        className="complaint-action-btn start-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(complaint.id, 'in-progress');
                        }}
                      >
                        Start Process
                      </button>
                    )}

                    {complaint.status === 'in-progress' && (
                      <button
                        className="complaint-action-btn resolve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(complaint);
                          setShowResolutionForm(true);
                        }}
                      >
                        Mark Resolved
                      </button>
                    )}

                    <button
                      className="complaint-action-btn view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(complaint);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Complaint Details */}
        {selectedComplaint && !showResolutionForm && (
          <div className="complaint-details-panel">
            <div className="complaint-details-header">
              <h3>Complaint Details</h3>
              <button
                className="complaint-close-btn"
                onClick={() => setSelectedComplaint(null)}
              >
                ✕
              </button>
            </div>

            <div className="complaint-details-content">
              {/* Complaint Header */}
              <div className="complaint-header-details">
                <div className="complaint-avatar">
                  {getCategoryIcon(selectedComplaint.category)}
                </div>
                <div className="complaint-title-section">
                  <h2>{selectedComplaint.title}</h2>
                  <div className="complaint-subtitle">
                    <span className="complaint-id">ID: {selectedComplaint.id}</span>
                    <span
                      className="complaint-status-badge"
                      style={{ background: getStatusColor(selectedComplaint.status) }}
                    >
                      {getStatusIcon(selectedComplaint.status)} {selectedComplaint.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Toggle Buttons */}
              <div className="complaint-status-toggle-section">
                <h4 className="complaint-section-title">
                  Update Status
                </h4>
                <div className="complaint-status-buttons">
                  <button
                    className={`complaint-status-btn ${selectedComplaint.status === 'pending' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(selectedComplaint.id, 'pending')}
                    disabled={selectedComplaint.status === 'pending'}
                  >
                    <span className="complaint-status-btn-text">Pending</span>
                  </button>

                  <button
                    className={`complaint-status-btn ${selectedComplaint.status === 'in-progress' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(selectedComplaint.id, 'in-progress')}
                    disabled={selectedComplaint.status === 'in-progress'}
                  >
                    <span className="complaint-status-btn-text">In Process</span>
                  </button>

                  <button
                    className={`complaint-status-btn ${selectedComplaint.status === 'resolved' ? 'active' : ''}`}
                    onClick={() => {
                      setShowResolutionForm(true);
                    }}
                    disabled={selectedComplaint.status === 'resolved'}
                  >
                    <span className="complaint-status-btn-text">Complete</span>
                  </button>
                </div>
              </div>

              {/* Complaint Information */}
              <div className="complaint-details-section">
                <h4 className="complaint-section-title">
                  Complaint Information
                </h4>
                <div className="complaint-info-grid">
                  <div className="complaint-info-item">
                    <span className="complaint-info-label">Category:</span>
                    <span className="complaint-info-value">
                      <span className="complaint-category-badge">
                        {getCategoryIcon(selectedComplaint.category)} {selectedComplaint.category}
                      </span>
                    </span>
                  </div>
                  <div className="complaint-info-item">
                    <span className="complaint-info-label">Priority:</span>
                    <span
                      className="complaint-info-value priority-indicator"
                      style={{ color: getPriorityColor(selectedComplaint.priority) }}
                    >
                      ● {selectedComplaint.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="complaint-info-item">
                    <span className="complaint-info-label">Department:</span>
                    <span className="complaint-info-value">{selectedComplaint.department}</span>
                  </div>
                  <div className="complaint-info-item">
                    <span className="complaint-info-label">Submitted:</span>
                    <span className="complaint-info-value">{selectedComplaint.submittedDate}</span>
                  </div>
                </div>

                <div className="complaint-info-item-full">
                  <span className="complaint-info-label">Description:</span>
                  <div className="complaint-info-value description-box">
                    {selectedComplaint.description}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="complaint-details-section">
                <h4 className="complaint-section-title">
                  User Information
                </h4>
                <div className="complaint-user-card">
                  <div className="complaint-user-avatar">
                    {selectedComplaint.userName.charAt(0)}
                  </div>
                  <div className="complaint-user-details">
                    <h5>{selectedComplaint.userName}</h5>
                    <div className="complaint-user-contact">
                      <span className="complaint-contact-item">
                        {selectedComplaint.userPhone}
                      </span>
                      <span className="complaint-contact-item">
                        {selectedComplaint.userAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment & Resolution */}
              <div className="complaint-details-section">
                <h4 className="complaint-section-title">
                  Assignment & Resolution
                </h4>

                <div className="complaint-assignment-info">
                  <div className="complaint-info-item">
                    <span className="complaint-info-label">Assigned To:</span>
                    <span className="complaint-info-value">
                      {selectedComplaint.assignedTo || 'Not assigned'}
                    </span>
                  </div>

                  {!selectedComplaint.assignedTo && selectedComplaint.status !== 'resolved' && (
                    <button
                      className="complaint-btn btn-outline assign-btn"
                      onClick={() => handleAssignTo(selectedComplaint.id)}
                    >
                      Assign to Team
                    </button>
                  )}

                  {selectedComplaint.resolution && (
                    <div className="complaint-resolution-box">
                      <div className="complaint-resolution-header">
                        <span className="complaint-resolution-label">Resolution:</span>
                        {selectedComplaint.resolutionDate && (
                          <span className="complaint-resolution-date">
                            Resolved on: {selectedComplaint.resolutionDate}
                          </span>
                        )}
                      </div>
                      <div className="complaint-resolution-text">
                        {selectedComplaint.resolution}
                      </div>
                    </div>
                  )}

                  {selectedComplaint.feedback && (
                    <div className="complaint-feedback-box">
                      <div className="complaint-feedback-label">User Feedback:</div>
                      <div className="complaint-feedback-text">{selectedComplaint.feedback}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div className="complaint-details-section">
                  <h4 className="complaint-section-title">
                    Attached Images
                  </h4>
                  <div className="complaint-images-grid">
                    {selectedComplaint.images.map((image, index) => (
                      <div key={index} className="complaint-image-thumbnail">
                        <div className="complaint-image-placeholder">
                          <span className="complaint-image-icon">🖼️</span>
                          <span className="complaint-image-name">{image}</span>
                        </div>
                        <button className="complaint-view-image-btn">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="complaint-action-buttons-panel">
                <button className="complaint-btn btn-outline">
                  Call User
                </button>

                <button className="complaint-btn btn-outline">
                  View on Map
                </button>

                <button className="complaint-btn btn-outline">
                  Send Update
                </button>

                {selectedComplaint.status !== 'resolved' && (
                  <button
                    className="complaint-btn btn-primary"
                    onClick={() => setShowResolutionForm(true)}
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resolution Form */}
        {showResolutionForm && selectedComplaint && (
          <div className="complaint-resolution-form-panel">
            <div className="complaint-form-header">
              <h3>Mark Complaint as Resolved</h3>
              <button
                className="complaint-close-btn"
                onClick={() => {
                  setShowResolutionForm(false);
                  setResolutionText('');
                }}
              >
                ✕
              </button>
            </div>

            <div className="complaint-form-content">
              <div className="complaint-summary">
                <h4>Complaint: {selectedComplaint.title}</h4>
                <p>ID: {selectedComplaint.id} | User: {selectedComplaint.userName}</p>
              </div>

              <div className="complaint-form-group">
                <label className="complaint-form-label">
                  Resolution Details *
                </label>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Enter details of how the complaint was resolved, actions taken, and any follow-up required..."
                  className="complaint-resolution-textarea"
                  rows={8}
                />
                <div className="complaint-input-help">Provide clear details for user transparency</div>
              </div>

              <div className="complaint-form-group">
                <label className="complaint-form-label">
                  Assigned Team
                </label>
                <input
                  type="text"
                  value={selectedComplaint.assignedTo || ''}
                  readOnly
                  className="complaint-form-input"
                  placeholder="Not assigned"
                />
              </div>

              <div className="complaint-form-group">
                <label className="complaint-form-label">
                  <span className="complaint-label-icon">⭐</span>
                  User Feedback (Optional)
                </label>
                <div className="complaint-rating-buttons">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} className="complaint-star-btn">
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="complaint-form-actions">
                <button
                  className="complaint-btn btn-secondary"
                  onClick={() => {
                    setShowResolutionForm(false);
                    setResolutionText('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="complaint-btn btn-success"
                  onClick={handleSubmitResolution}
                  disabled={!resolutionText.trim()}
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaint;