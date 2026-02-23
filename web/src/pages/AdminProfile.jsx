import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, Calendar, Shield, Key, User, Building, Bell, Save, Edit2, X } from 'lucide-react';

import '../stylesheets/AdminProfile.css';

const AdminProfilePage = () => {
  const adminID = "admin1"

  const [adminData, setAdminData] = useState({
    admin_id: '',
    admin_type: '',
    personal_information: {
      name: '',
      email: '',
      phone1: '',
      phone2: '',
      DOB: '',
      gender: ''
    },
    professional_information: {
      designation: '',
      department: '',
      office_address: '',
      office_phone: '',
      office_email: ''
    },
    avatar: '',
    coverPhoto: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileURL, setProfileURL] = useState(null);
  const [isProfileChange, setIsProfileChange] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Admin Data from Backend
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/get-admin/${adminID}`);
        const data = await response.json();
        console.log("Fetched data:", data);

        // Set avatar based on name
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.personal_information.name)}&background=3b82f6&color=fff&size=256`;
        const coverPhoto = 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';

        const formattedData = {
          ...data,
          avatar: avatarUrl,
          coverPhoto: coverPhoto
        };

        setAdminData(formattedData);
        setFormData(formattedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError("Failed to load admin data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  const uploadProfileImage = async (file) => {
    setIsProfileChange(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:5000/profile/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setProfileURL(data.photoURL);
    console.log(data.photoURL);
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const updateData = {
        admin_id: formData.admin_id,
        admin_type: formData.admin_type,
        admin_profile_image: profileURL,
        personal_information: formData.personal_information,
        professional_information: formData.professional_information
      };
      await fetch(`http://localhost:5000/update-admin/${adminID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })
      setAdminData(formData);
      setIsEditing(false);
      console.log('Profile saved:', formData);
      window.location.reload();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    console.log('Password change requested');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const response = await fetch("http://localhost:5000/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: adminID,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
    });
    const data = await response.json();
    data.success ? alert("Password Change Successfully") : alert("Invalid Credentials");

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

  };

  // Handle file upload simulation
  const handleFileUpload = (fileType) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          if (fileType === 'avatar') {
            setFormData(prev => ({
              ...prev,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(prev.personal_information.name)}&background=10b981&color=fff&size=256`
            }));
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Loading 
  if (loading) {
    return (
      <div className="admin-profile-page admin-profile-loading-container">
        <div className="admin-profile-loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      {/* Header */}
      <div className="admin-profile-header">
        <h1>
          <User size={28} />
          Admin Profile
        </h1>
        <p className="admin-profile-subtitle">Manage your profile, security, and system preferences</p>

        <div className="admin-profile-header-actions">
          {!isEditing ? (
            <button className="admin-profile-btn-edit" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="admin-profile-edit-actions">
              <button className="admin-profile-btn-cancel" onClick={() => setIsEditing(false)}>
                <X size={18} />
                Cancel
              </button>
              {isProfileChange ?
                <button className="admin-profile-btn-save" onClick={handleSaveProfile} disabled={profileURL === null ? true : false}>
                  <Save size={18} />
                  {profileURL === null ? "Loading..." : "Save Changes"} 
                </button> :
                <button className="admin-profile-btn-save" onClick={handleSaveProfile}>
                  <Save size={18} />
                  Save Changes
                </button>
              }

            </div>
          )}
        </div>
      </div>

      <div className="admin-profile-content">
        {/* Left Column - Profile Overview */}
        <div className="admin-profile-left-column">
          {/* Profile Card */}
          <div className="admin-profile-card">
            <div className="admin-profile-cover-photo-container">
              <img
                src={isEditing ? formData.coverPhoto : adminData.coverPhoto}
                alt="Cover"
                className="admin-profile-cover-photo"
              />
              {isUploading && (
                <div className="admin-profile-upload-progress">
                  <div className="admin-profile-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>

            <div className="admin-profile-avatar-section">
              <div className="admin-profile-avatar-container">
                <img
                  src={adminData.admin_profile_image}
                  alt="Admin Avatar"
                  className="admin-profile-avatar"
                />
                {isEditing && (
                  <button
                    className="admin-profile-btn-change-avatar"
                    onClick={() => document.getElementById('avatarUpload').click()}
                  >
                    <Camera size={16} />
                  </button>
                )}
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => uploadProfileImage(e.target.files[0])}
                />
              </div>

              <div className="admin-profile-info">
                <h2>{isEditing ? formData.personal_information?.name : adminData.personal_information?.name}</h2>
                <p className="admin-profile-designation">
                  <Building size={14} />
                  {isEditing ? formData.admin_type : adminData.admin_type}
                </p>
                <p className="admin-profile-department">
                  {isEditing ? formData.professional_information?.department || 'Department not set' : adminData.professional_information?.department || 'Department not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="admin-profile-activities-card">
            <h3>
              <Bell size={20} />
              Recent Activities
            </h3>

            <div className="admin-profile-activities-list">
              {adminData.recentActivity.map(activity => (
                <div key={activity.id} className="admin-profile-activity-item">
                  <div className="admin-profile-activity-content">
                    <h4>{activity.action}</h4>
                    <p>{activity.description}</p>
                    <span className="admin-profile-activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="admin-profile-btn-view-all">View All Activities →</button>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="admin-profile-right-column">
          {/* Navigation Tabs */}
          <div className="admin-profile-tabs">
            <button
              className={`admin-profile-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <User size={18} />
              Personal Info
            </button>
            <button
              className={`admin-profile-tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              <Building size={18} />
              Professional
            </button>
            <button
              className={`admin-profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={18} />
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="admin-profile-tab-content">
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <div className="admin-profile-info-section">
                <div className="admin-profile-section-header">
                  <h3>Personal Information</h3>
                  <span className="admin-profile-section-badge">Required</span>
                </div>

                <div className="admin-profile-form-grid">
                  <div className="admin-profile-form-group">
                    <label htmlFor="name">
                      <User size={16} />
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={isEditing ? formData.personal_information?.name || '' : adminData.personal_information?.name || ''}
                      onChange={(e) => handleInputChange('personal_information', 'name', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={isEditing ? formData.personal_information?.email || '' : adminData.personal_information?.email || ''}
                      onChange={(e) => handleInputChange('personal_information', 'email', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={isEditing ? formData.personal_information?.phone1 || '' : adminData.personal_information?.phone1 || ''}
                      onChange={(e) => handleInputChange('personal_information', 'phone1', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="alternatePhone">
                      <Phone size={16} />
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      id="alternatePhone"
                      value={isEditing ? formData.personal_information?.phone2 || '' : adminData.personal_information?.phone2 || ''}
                      onChange={(e) => handleInputChange('personal_information', 'phone2', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="dateOfBirth">
                      <Calendar size={16} />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={isEditing ? formData.personal_information?.DOB || '' : adminData.personal_information?.DOB || ''}
                      onChange={(e) => handleInputChange('personal_information', 'DOB', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="gender">
                      <User size={16} />
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={isEditing ? formData.personal_information?.gender || '' : adminData.personal_information?.gender || ''}
                      onChange={(e) => handleInputChange('personal_information', 'gender', e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Information */}
            {activeTab === 'professional' && (
              <div className="admin-profile-info-section">
                <div className="admin-profile-section-header">
                  <h3>Professional Information</h3>
                  <span className="admin-profile-section-badge">Organization</span>
                </div>

                <div className="admin-profile-form-grid">
                  <div className="admin-profile-form-group">
                    <label htmlFor="designation">
                      <Building size={16} />
                      Designation *
                    </label>
                    <input
                      type="text"
                      id="designation"
                      value={isEditing ? formData.professional_information?.designation || '' : adminData.professional_information?.designation || ''}
                      onChange={(e) => handleInputChange('professional_information', 'designation', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="department">
                      <Building size={16} />
                      Department *
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={isEditing ? formData.professional_information?.department || '' : adminData.professional_information?.department || ''}
                      onChange={(e) => handleInputChange('professional_information', 'department', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="officeAddress">Office Address</label>
                    <textarea
                      id="officeAddress"
                      value={isEditing ? formData.professional_information?.office_address || '' : adminData.professional_information?.office_address || ''}
                      onChange={(e) => handleInputChange('professional_information', 'office_address', e.target.value)}
                      disabled={!isEditing}
                      rows="3"
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="officePhone">Office Phone</label>
                    <input
                      type="tel"
                      id="officePhone"
                      value={isEditing ? formData.professional_information?.office_phone || '' : adminData.professional_information?.office_phone || ''}
                      onChange={(e) => handleInputChange('professional_information', 'office_phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="admin-profile-form-group">
                    <label htmlFor="officeEmail">Office Email</label>
                    <input
                      type="email"
                      id="officeEmail"
                      value={isEditing ? formData.professional_information?.office_email || '' : adminData.professional_information?.office_email || ''}
                      onChange={(e) => handleInputChange('professional_information', 'office_email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="admin-profile-info-section">
                <div className="admin-profile-section-header">
                  <h3>Security Settings</h3>
                  <span className="admin-profile-section-badge">Protected</span>
                </div>

                {/* Change Password */}
                <div className="admin-profile-password-section">
                  <h4>
                    <Key size={18} />
                    Change Password
                  </h4>

                  <div className="admin-profile-form-grid">
                    <div className="admin-profile-form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="admin-profile-form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="admin-profile-form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="admin-profile-password-requirements">
                    <p>Password must contain:</p>
                    <ul>
                      <li>• At least 8 characters</li>
                      <li>• One uppercase letter</li>
                      <li>• One lowercase letter</li>
                      <li>• One number</li>
                      <li>• One special character</li>
                    </ul>
                  </div>

                  <button className="admin-profile-btn-change-password" onClick={handlePasswordChange}>
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;