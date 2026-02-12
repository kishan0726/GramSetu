import React, { useState, useEffect } from 'react';
import '../stylesheets/AdminProfile.css';
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Key, 
  User, 
  Building, 
  Globe,
  Bell,
  Save,
  Edit2,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminProfilePage = () => {
  // Admin Profile Data
  const [adminData, setAdminData] = useState({
    personalInfo: {
      fullName: 'Admin Name',
      username: 'kishan_admin',
      email: 'kishan@villagemap.gov.in',
      phone: '+91 9876543210',
      alternatePhone: '+91 1234567890',
      dateOfBirth: '2005-08-03',
      gender: 'Male',
      address: {
        street: '',
        city: 'Visavada',
        state: 'Gujarat',
        postalCode: '360579',
        country: 'India'
      }
    },
    professionalInfo: {
      designation: 'Chief Administrator',
      department: 'Village Administration',
      employeeId: 'VA-2022-001',
      joinDate: '2022-01-15',
      yearsOfService: '2 years',
      officeAddress: 'Gram Panchayat Office, Visavada',
      officePhone: '+91 1234567890',
      officeEmail: 'admin-office@visavada.gov.in'
    },
    accountSecurity: {
      twoFactorAuth: true,
      lastLogin: '2024-01-15 14:30:45',
      loginIp: '192.168.1.100',
      deviceType: 'Windows Chrome',
      activeSessions: 2,
      passwordLastChanged: '2023-12-01'
    },
    permissions: {
      dashboardAccess: true,
      userManagement: true,
      contentManagement: true,
      analyticsAccess: true,
      systemSettings: true,
      financialAccess: true,
      reportGeneration: true,
      apiAccess: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      securityAlerts: true,
      systemUpdates: true,
      weeklyReports: true
    },
    avatar: 'https://ui-avatars.com/api/?name=Admin+Name&background=3b82f6&color=fff&size=256',     // add avatar text here ...
    coverPhoto: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({ ...adminData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      action: 'Login',
      description: 'Logged in from new device',
      timestamp: '10 minutes ago',
      icon: '🔐',
      type: 'security'
    },
    {
      id: 2,
      action: 'User Added',
      description: 'Added new field inspector - Ravi Kumar',
      timestamp: '2 hours ago',
      icon: '👤',
      type: 'user'
    },
    {
      id: 3,
      action: 'Report Generated',
      description: 'Monthly village report for December 2023',
      timestamp: '1 day ago',
      icon: '📊',
      type: 'report'
    },
    {
      id: 4,
      action: 'Settings Updated',
      description: 'Changed map display settings',
      timestamp: '2 days ago',
      icon: '⚙️',
      type: 'settings'
    },
    {
      id: 5,
      action: 'Data Export',
      description: 'Exported vehicle tracking data',
      timestamp: '3 days ago',
      icon: '📤',
      type: 'data'
    }
  ]);

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 1245,
    activeUsers: 856,
    pendingApprovals: 23,
    systemAlerts: 5,
    storageUsed: '2.4 GB',
    storageTotal: '10 GB'
  });

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle nested input changes
  const handleNestedInputChange = (section, subSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value
        }
      }
    }));
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (notification) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: !prev.notifications[notification]
      }
    }));
  };

  // Save profile changes
  const handleSaveProfile = () => {
    setAdminData(formData);
    setIsEditing(false);
    // In real app, you would make API call here
    console.log('Profile saved:', formData);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // In real app, make API call
    console.log('Password change requested');
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
              avatar: 'https://ui-avatars.com/api/?name=Rajesh+Sharma&background=10b981&color=fff&size=256'
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              coverPhoto: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
            }));
          }
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate storage percentage
  const storagePercentage = (parseFloat(stats.storageUsed) / parseFloat(stats.storageTotal)) * 100;

  return (
    <div className="admin-profile-page">
      {/* Header */}
      <div className="profile-header">
        <h1>
          <User size={28} />
          Admin Profile
        </h1>
        <p className="subtitle">Manage your profile, security, and system preferences</p>
        
        <div className="header-actions">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                <X size={18} />
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveProfile}>
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Left Column - Profile Overview */}
        <div className="left-column">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="cover-photo-container">
              <img 
                src={isEditing ? formData.coverPhoto : adminData.coverPhoto} 
                alt="Cover" 
                className="cover-photo" 
              />
              <div className="cover-overlay">
                <button 
                  className="btn-change-cover"
                  onClick={() => document.getElementById('coverUpload').click()}
                  disabled={!isEditing}
                >
                  <Camera size={16} />
                  Change Cover
                </button>
                <input 
                  type="file" 
                  id="coverUpload" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={() => handleFileUpload('cover')}
                />
              </div>
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>

            <div className="profile-avatar-section">
              <div className="avatar-container">
                <img 
                  src={isEditing ? formData.avatar : adminData.avatar} 
                  alt="Admin Avatar" 
                  className="profile-avatar" 
                />
                {isEditing && (
                  <button 
                    className="btn-change-avatar"
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
                  onChange={() => handleFileUpload('avatar')}
                />
              </div>
              
              <div className="profile-info">
                <h2>{isEditing ? formData.personalInfo.fullName : adminData.personalInfo.fullName}</h2>
                <p className="designation">
                  <Building size={14} />
                  {isEditing ? formData.professionalInfo.designation : adminData.professionalInfo.designation}
                </p>
                <p className="department">
                  {isEditing ? formData.professionalInfo.department : adminData.professionalInfo.department}
                </p>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-value">{stats.totalUsers}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.activeUsers}</span>
                    <span className="stat-label">Active Users</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.pendingApprovals}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="stats-card">
            <h3>
              <CheckCircle size={20} />
              System Statistics
            </h3>
            
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon primary">
                  <User size={20} />
                </div>
                <div className="stat-content">
                  <h4>Active Users</h4>
                  <p className="stat-number">{stats.activeUsers}</p>
                  <p className="stat-trend positive">↑ 12% this month</p>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon warning">
                  <AlertCircle size={20} />
                </div>
                <div className="stat-content">
                  <h4>System Alerts</h4>
                  <p className="stat-number">{stats.systemAlerts}</p>
                  <p className="stat-trend">Needs attention</p>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon success">
                  <CheckCircle size={20} />
                </div>
                <div className="stat-content">
                  <h4>Uptime</h4>
                  <p className="stat-number">99.8%</p>
                  <p className="stat-trend">Last 30 days</p>
                </div>
              </div>
            </div>
            
            <div className="storage-section">
              <div className="storage-header">
                <h4>Storage Usage</h4>
                <span>{stats.storageUsed} / {stats.storageTotal}</span>
              </div>
              <div className="storage-bar">
                <div 
                  className="storage-progress" 
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
              <p className="storage-info">
                {storagePercentage.toFixed(1)}% of storage used
              </p>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="activities-card">
            <h3>
              <Bell size={20} />
              Recent Activities
            </h3>
            
            <div className="activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <span>{activity.icon}</span>
                  </div>
                  <div className="activity-content">
                    <h4>{activity.action}</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="btn-view-all">View All Activities →</button>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="right-column">
          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <User size={18} />
              Personal Info
            </button>
            <button 
              className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              <Building size={18} />
              Professional
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={18} />
              Security
            </button>
            <button 
              className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <Key size={18} />
              Permissions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              Notifications
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <div className="info-section">
                <div className="section-header">
                  <h3>Personal Information</h3>
                  <span className="section-badge">Required</span>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">
                      <User size={16} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={isEditing ? formData.personalInfo.fullName : adminData.personalInfo.fullName}
                      onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="username">
                      <User size={16} />
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={isEditing ? formData.personalInfo.username : adminData.personalInfo.username}
                      onChange={(e) => handleInputChange('personalInfo', 'username', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={isEditing ? formData.personalInfo.email : adminData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={isEditing ? formData.personalInfo.phone : adminData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="alternatePhone">
                      <Phone size={16} />
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      id="alternatePhone"
                      value={isEditing ? formData.personalInfo.alternatePhone : adminData.personalInfo.alternatePhone}
                      onChange={(e) => handleInputChange('personalInfo', 'alternatePhone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">
                      <Calendar size={16} />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={isEditing ? formData.personalInfo.dateOfBirth : adminData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">
                      <User size={16} />
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={isEditing ? formData.personalInfo.gender : adminData.personalInfo.gender}
                      onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Address Section */}
                <div className="address-section">
                  <h4>
                    <MapPin size={18} />
                    Address Information
                  </h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="street">Street Address</label>
                      <input
                        type="text"
                        id="street"
                        value={isEditing ? formData.personalInfo.address.street : adminData.personalInfo.address.street}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        value={isEditing ? formData.personalInfo.address.city : adminData.personalInfo.address.city}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        value={isEditing ? formData.personalInfo.address.state : adminData.personalInfo.address.state}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'state', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        value={isEditing ? formData.personalInfo.address.postalCode : adminData.personalInfo.address.postalCode}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'postalCode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        id="country"
                        value={isEditing ? formData.personalInfo.address.country : adminData.personalInfo.address.country}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'country', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Information */}
            {activeTab === 'professional' && (
              <div className="info-section">
                <div className="section-header">
                  <h3>Professional Information</h3>
                  <span className="section-badge">Organization</span>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="designation">
                      <Building size={16} />
                      Designation *
                    </label>
                    <input
                      type="text"
                      id="designation"
                      value={isEditing ? formData.professionalInfo.designation : adminData.professionalInfo.designation}
                      onChange={(e) => handleInputChange('professionalInfo', 'designation', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="department">
                      <Building size={16} />
                      Department *
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={isEditing ? formData.professionalInfo.department : adminData.professionalInfo.department}
                      onChange={(e) => handleInputChange('professionalInfo', 'department', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="employeeId">
                      <Key size={16} />
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      id="employeeId"
                      value={isEditing ? formData.professionalInfo.employeeId : adminData.professionalInfo.employeeId}
                      onChange={(e) => handleInputChange('professionalInfo', 'employeeId', e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="joinDate">
                      <Calendar size={16} />
                      Join Date
                    </label>
                    <input
                      type="date"
                      id="joinDate"
                      value={isEditing ? formData.professionalInfo.joinDate : adminData.professionalInfo.joinDate}
                      onChange={(e) => handleInputChange('professionalInfo', 'joinDate', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="yearsOfService">
                      <Calendar size={16} />
                      Years of Service
                    </label>
                    <input
                      type="text"
                      id="yearsOfService"
                      value={isEditing ? formData.professionalInfo.yearsOfService : adminData.professionalInfo.yearsOfService}
                      onChange={(e) => handleInputChange('professionalInfo', 'yearsOfService', e.target.value)}
                      disabled={!isEditing}
                      readOnly
                    />
                  </div>
                </div>

                {/* Office Information */}
                <div className="office-section">
                  <h4>
                    <Building size={18} />
                    Office Information
                  </h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="officeAddress">Office Address</label>
                      <textarea
                        id="officeAddress"
                        value={isEditing ? formData.professionalInfo.officeAddress : adminData.professionalInfo.officeAddress}
                        onChange={(e) => handleInputChange('professionalInfo', 'officeAddress', e.target.value)}
                        disabled={!isEditing}
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="officePhone">Office Phone</label>
                      <input
                        type="tel"
                        id="officePhone"
                        value={isEditing ? formData.professionalInfo.officePhone : adminData.professionalInfo.officePhone}
                        onChange={(e) => handleInputChange('professionalInfo', 'officePhone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="officeEmail">Office Email</label>
                      <input
                        type="email"
                        id="officeEmail"
                        value={isEditing ? formData.professionalInfo.officeEmail : adminData.professionalInfo.officeEmail}
                        onChange={(e) => handleInputChange('professionalInfo', 'officeEmail', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="info-section">
                <div className="section-header">
                  <h3>Security Settings</h3>
                  <span className="section-badge">Protected</span>
                </div>

                {/* Two-Factor Authentication */}
                <div className="security-section">
                  <div className="security-header">
                    <div>
                      <h4>
                        <Shield size={18} />
                        Two-Factor Authentication
                      </h4>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isEditing ? formData.accountSecurity.twoFactorAuth : adminData.accountSecurity.twoFactorAuth}
                        onChange={() => handleInputChange('accountSecurity', 'twoFactorAuth', !formData.accountSecurity.twoFactorAuth)}
                        disabled={!isEditing}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="security-status">
                    <div className="status-item">
                      <span className="status-label">Last Login:</span>
                      <span className="status-value">{adminData.accountSecurity.lastLogin}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Login IP:</span>
                      <span className="status-value">{adminData.accountSecurity.loginIp}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Device Type:</span>
                      <span className="status-value">{adminData.accountSecurity.deviceType}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Active Sessions:</span>
                      <span className="status-value">{adminData.accountSecurity.activeSessions}</span>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="password-section">
                  <h4>
                    <Key size={18} />
                    Change Password
                  </h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Enter new password"
                      />
                      <div className="password-strength">
                        <div className="strength-bar"></div>
                        <span className="strength-text">Medium</span>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div className="password-requirements">
                    <p>Password must contain:</p>
                    <ul>
                      <li>• At least 8 characters</li>
                      <li>• One uppercase letter</li>
                      <li>• One lowercase letter</li>
                      <li>• One number</li>
                      <li>• One special character</li>
                    </ul>
                  </div>
                  
                  <button className="btn-change-password" onClick={handlePasswordChange}>
                    Update Password
                  </button>
                </div>

                {/* Active Sessions */}
                <div className="sessions-section">
                  <h4>Active Sessions</h4>
                  <div className="session-list">
                    <div className="session-item active">
                      <div className="session-info">
                        <span className="session-device">Windows - Chrome</span>
                        <span className="session-ip">IP: {adminData.accountSecurity.loginIp}</span>
                        <span className="session-time">Current Session</span>
                      </div>
                      <button className="btn-end-session">End Session</button>
                    </div>
                    <div className="session-item">
                      <div className="session-info">
                        <span className="session-device">Android - Chrome Mobile</span>
                        <span className="session-ip">IP: 192.168.1.101</span>
                        <span className="session-time">2 hours ago</span>
                      </div>
                      <button className="btn-end-session">End Session</button>
                    </div>
                  </div>
                  <button className="btn-logout-all">Logout from All Devices</button>
                </div>
              </div>
            )}

            {/* Permissions */}
            {activeTab === 'permissions' && (
              <div className="info-section">
                <div className="section-header">
                  <h3>System Permissions</h3>
                  <span className="section-badge">Admin Rights</span>
                </div>
                
                <div className="permissions-grid">
                  {Object.entries(isEditing ? formData.permissions : adminData.permissions).map(([permission, value]) => (
                    <div key={permission} className="permission-item">
                      <div className="permission-info">
                        <h4>{permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                        <p>Access to {permission.replace(/([A-Z])/g, ' $1').toLowerCase()} features</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={!isEditing}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="permissions-note">
                  <AlertCircle size={18} />
                  <p>Note: Some permissions may require super admin approval for changes</p>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="info-section">
                <div className="section-header">
                  <h3>Notification Preferences</h3>
                  <span className="section-badge">Alerts</span>
                </div>
                
                <div className="notifications-grid">
                  {Object.entries(isEditing ? formData.notifications : adminData.notifications).map(([notification, value]) => (
                    <div key={notification} className="notification-item">
                      <div className="notification-info">
                        <h4>{notification.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                        <p>Receive {notification.replace(/([A-Z])/g, ' $1').toLowerCase()} on your devices</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationToggle(notification)}
                          disabled={!isEditing}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="notification-schedule">
                  <h4>Notification Schedule</h4>
                  <div className="schedule-grid">
                    <div className="form-group">
                      <label htmlFor="quietHours">Quiet Hours</label>
                      <select id="quietHours" disabled={!isEditing}>
                        <option>10:00 PM - 6:00 AM</option>
                        <option>11:00 PM - 7:00 AM</option>
                        <option>No quiet hours</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="emailDigest">Email Digest</label>
                      <select id="emailDigest" disabled={!isEditing}>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
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