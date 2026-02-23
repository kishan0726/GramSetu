import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../stylesheets/UserDetail.css';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'family', 'additional', 'gujarati'

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get-user-detail/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
      } else {
        alert('User not found');
        navigate('/users');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error loading user details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (status) => {
    if (status === 'expired') {
      return <span className="userdetail-badge expired">Expired</span>;
    }
    return <span className="userdetail-badge alive">Active</span>;
  };

  if (loading) {
    return (
      <div className="userdetail-loading">
        <div className="userdetail-spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="userdetail-not-found">
        <h2>User Not Found</h2>
        <p>The requested user could not be found.</p>
        <button className="userdetail-btn-primary" onClick={() => navigate('/users')}>
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="userdetail-container">
      {/* Header with Navigation */}
      <div className="userdetail-header">
        <div className="userdetail-title-section">
          <h1>
            {user.firstName} {user.lastName}
          </h1>
          <h2 className="userdetail-name-guj">{user.firstNameGuj} {user.lastNameGuj}</h2>
          <div className="userdetail-status">
            {getStatusBadge(user.status)}
            {user.expiryDate && (
              <span className="userdetail-expiry-date">
                Expired on: {formatDate(user.expiryDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="userdetail-quick-stats">
        <div className="userdetail-quick-card">
          <div>
            <span className="userdetail-quick-label">Age</span>
            <span className="userdetail-quick-value">
              {user.age || calculateAge(user.dateOfBirth)} years
            </span>
            <span className="userdetail-quick-sub">{user.ageGroup}</span>
          </div>
        </div>

        <div className="userdetail-quick-card">
          <div>
            <span className="userdetail-quick-label">Date of Birth</span>
            <span className="userdetail-quick-value">{formatDate(user.dateOfBirth)}</span>
          </div>
        </div>

        <div className="userdetail-quick-card">
          <div>
            <span className="userdetail-quick-label">Village Area</span>
            <span className="userdetail-quick-value">{user.villageArea || 'Not specified'}</span>
          </div>
        </div>

        <div className="userdetail-quick-card">
          <div>
            <span className="userdetail-quick-label">Contact</span>
            <span className="userdetail-quick-value">{user.contactNumber || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="userdetail-tabs">
        <button
          className={`userdetail-tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Information
        </button>
        <button
          className={`userdetail-tab ${activeTab === 'family' ? 'active' : ''}`}
          onClick={() => setActiveTab('family')}
        >
          Family Details
        </button>
        <button
          className={`userdetail-tab ${activeTab === 'additional' ? 'active' : ''}`}
          onClick={() => setActiveTab('additional')}
        >
          Additional Details
        </button>
        <button
          className={`userdetail-tab ${activeTab === 'gujarati' ? 'active' : ''}`}
          onClick={() => setActiveTab('gujarati')}
        >
          Details in Gujarati
        </button>
      </div>

      {/* Tab Content */}
      <div className="userdetail-content">
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="userdetail-section">
            <h3 className="userdetail-section-title">Basic Information</h3>
            <div className="userdetail-grid">
              <div className="userdetail-item">
                <span className="userdetail-label">Full Name (English):</span>
                <span className="userdetail-value">{user.firstName} {user.lastName}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Full Name (Gujarati):</span>
                <span className="userdetail-value">{user.firstNameGuj} {user.lastNameGuj}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Gender:</span>
                <span className="userdetail-value">
                  {user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other'}
                </span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Date of Birth:</span>
                <span className="userdetail-value">{formatDate(user.dateOfBirth)}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Age:</span>
                <span className="userdetail-value">{user.age || calculateAge(user.dateOfBirth)} years ({user.ageGroup})</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Place of Birth:</span>
                <span className="userdetail-value">{user.placeOfBirth || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Village Area:</span>
                <span className="userdetail-value">{user.villageArea || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Address:</span>
                <span className="userdetail-value">{user.address || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Registration Date:</span>
                <span className="userdetail-value">{formatDate(user.registeredDate)}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Status:</span>
                <span className="userdetail-value">
                  {user.status === 'alive' ? 'Alive' : 'Expired'}
                  {user.expiryDate && ` (Expired: ${formatDate(user.expiryDate)})`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Family Details Tab */}
        {activeTab === 'family' && (
          <div className="userdetail-section">
            <h3 className="userdetail-section-title">Family Details</h3>
            <div className="userdetail-grid">
              <div className="userdetail-item">
                <span className="userdetail-label">Father's Name (English):</span>
                <span className="userdetail-value">{user.fatherName || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Father's Name (Gujarati):</span>
                <span className="userdetail-value">{user.fatherNameGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Mother's Name (English):</span>
                <span className="userdetail-value">{user.motherName || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Mother's Name (Gujarati):</span>
                <span className="userdetail-value">{user.motherNameGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Marital Status:</span>
                <span className="userdetail-value">
                  {user.maritalStatus ? 
                    user.maritalStatus.charAt(0).toUpperCase() + user.maritalStatus.slice(1) 
                    : 'Not specified'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Details Tab */}
        {activeTab === 'additional' && (
          <div className="userdetail-section">
            <h3 className="userdetail-section-title">Additional Details</h3>
            <div className="userdetail-grid">
              <div className="userdetail-item">
                <span className="userdetail-label">Occupation:</span>
                <span className="userdetail-value">{user.occupation || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Education:</span>
                <span className="userdetail-value">{user.education || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Blood Group:</span>
                <span className="userdetail-value">{user.bloodGroup || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Contact Number:</span>
                <span className="userdetail-value">{user.contactNumber || 'Not provided'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Aadhar Number:</span>
                <span className="userdetail-value">
                  {user.aadharNumber ? '••••••' + user.aadharNumber.slice(-4) : 'Not provided'}
                </span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Voter:</span>
                <span className="userdetail-value">
                  {user.isVoter ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">BPL Family:</span>
                <span className="userdetail-value">
                  {user.isBPL ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">Disability:</span>
                <span className="userdetail-value">
                  {user.isDisabled ? 'Yes' : 'No'}
                </span>
              </div>
              {user.isDisabled && user.disabilityDetails && (
                <div className="userdetail-item full-width">
                  <span className="userdetail-label">Disability Details:</span>
                  <span className="userdetail-value">{user.disabilityDetails}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gujarati Details Tab */}
        {activeTab === 'gujarati' && (
          <div className="userdetail-section">
            <h3 className="userdetail-section-title">🇮🇳 Gujarati Details</h3>
            <div className="userdetail-grid">
              <div className="userdetail-item">
                <span className="userdetail-label">પ્રથમ નામ:</span>
                <span className="userdetail-value gujarati-text">{user.firstNameGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">છેલ્લું નામ:</span>
                <span className="userdetail-value gujarati-text">{user.lastNameGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">પિતાનું નામ:</span>
                <span className="userdetail-value gujarati-text">{user.fatherNameGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">માતાનું નામ:</span>
                <span className="userdetail-value gujarati-text">{user.motherNameGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">જન્મ સ્થળ:</span>
                <span className="userdetail-value gujarati-text">{user.placeOfBirthGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">સરનામું:</span>
                <span className="userdetail-value gujarati-text">{user.addressGuj || 'Not specified'}</span>
              </div>
              <div className="userdetail-item">
                <span className="userdetail-label">વ્યવસાય:</span>
                <span className="userdetail-value gujarati-text">{user.occupationGuj || 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="userdetail-footer">
        <button className="userdetail-btn-secondary" onClick={() => navigate('/users')}>
          ← Back to Users
        </button>
      </div>
    </div>
  );
};

export default UserDetail;