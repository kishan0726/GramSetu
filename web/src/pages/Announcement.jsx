import React, { useState, useEffect } from 'react';
import '../stylesheets/Announcement.css';

const Announcement = () => {
  // Announcement categories
  const categories = [
    { value: 'general', label: '📢 General Announcement' },
    { value: 'emergency', label: '🚨 Emergency Alert' },
    { value: 'scheme', label: '💰 Government Scheme' },
    { value: 'event', label: '📅 Upcoming Event' },
    { value: 'maintenance', label: '🔧 Maintenance Notice' },
    { value: 'holiday', label: '🎉 Holiday Notice' },
    { value: 'meeting', label: '🏛️ Gram Sabha Meeting' },
    { value: 'important', label: '⚠️ Important Notice' }
  ];

  // Announcement target options
  const targetOptions = [
    { value: 'all', label: '👥 All Villagers' },
    { value: 'farmers', label: '👨‍🌾 Farmers' },
    { value: 'shops', label: '🏪 Shops' },
    { value: 'women', label: '👩 Women' },
    { value: 'youth', label: '👦 Youth' },
    { value: 'seniors', label: '👴 Senior Citizens' },
    { value: 'students', label: '🎓 Students' },
    { value: 'specific-area', label: '📍 Specific Area' }
  ];

  const [formData, setFormData] = useState({
    id: null,
    title: '',
    titleGuj: '',
    description: '',
    descriptionGuj: '',
    category: 'general',
    priority: 'normal',
    targetAudience: ['all'],
    publishDate: '',
    expiryDate: '',
    attachment: null,
    attachmentName: '',
    status: 'draft',
    createdAt: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [publishedAnnouncements, setPublishedAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  useEffect(() => {
    fetchPublishedAnnouncement();
  }, []);

  useEffect(() => {
    console.log("Updated publishedAnnouncements:", publishedAnnouncements);
  }, [publishedAnnouncements]);

  // Fetch Published Announcement from Backend
  const fetchPublishedAnnouncement = async () => {
    try {
      const response = await fetch("http://localhost:5000/get-published-announcement");
      const result = await response.json();

      setPublishedAnnouncements(result.success ? result.data : []);
      console.log(publishedAnnouncements)
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Handle input change in form 
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          targetAudience: [...prev.targetAudience, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          targetAudience: prev.targetAudience.filter(item => item !== value)
        }));
      }
    } else if (type === 'file') {
      if (files && files[0]) {
        setFormData(prev => ({
          ...prev,
          attachment: files[0],
          attachmentName: files[0].name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'English title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.titleGuj.trim()) {
      newErrors.titleGuj = 'Gujarati title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'English description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.descriptionGuj.trim()) {
      newErrors.descriptionGuj = 'Gujarati description is required';
    }

    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }

    if (formData.expiryDate && new Date(formData.expiryDate) < new Date(formData.publishDate)) {
      newErrors.expiryDate = 'Expiry date must be after publish date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Publish Announcement and store it in backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const announcement = {
        ...formData,
        id: formData.id || String(now.getDate()).padStart(2, "0") + String(now.getMonth() + 1).padStart(2, "0") + String(now.getFullYear()).slice(-2) + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0"),
        createdAt: String(now.getDate()).padStart(2, "0") + String(now.getMonth() + 1).padStart(2, "0") + String(now.getFullYear()).slice(-2) + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0"),
        status: 'published'
      };

      const response = await fetch(`http://localhost:5000/update-published-announcement/${announcement.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(announcement)
      })
      const data = await response.json();

      data.success ? alert('Announcement published successfully!') : alert('Server Error');

      // Reset form
      handleClearForm();

      // Switch to published tab
      setActiveTab('published');

    } catch (error) {
      alert('Error publishing announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save form as Draft
  const handleSaveDraft = () => {
    if (formData.title || formData.description) {
      setFormData(prev => ({ ...prev, status: 'draft' }));
      alert('Announcement saved as draft.');
    } else {
      alert('Please add some content before saving as draft.');
    }
  };

  // Clear form
  const handleClearForm = () => {
    setFormData({
      id: null,
      title: '',
      titleGuj: '',
      description: '',
      descriptionGuj: '',
      category: 'general',
      priority: 'normal',
      targetAudience: ['all'],
      publishDate: '',
      expiryDate: '',
      attachment: null,
      attachmentName: '',
      status: 'draft',
      createdAt: null
    });
    setErrors({});
    setSelectedAnnouncement(null);
  };

  // Edit announcement
  const handleEditAnnouncement = (announcement) => {
    setFormData(announcement);
    setSelectedAnnouncement(announcement);
    setActiveTab('create');
    setPreviewMode(false);
  };

  // Delete announcement
  const handleDeleteAnnouncement = (announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/delete-published-announcement/${announcementToDelete.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (result.success) {
        await fetchPublishedAnnouncement();
        setShowDeleteModal(false);
        setAnnouncementToDelete(null);
        alert("Announcement deleted successfully!");
      }

    } catch (error) {
      alert("Delete failed");
    }
  };

  // Filter Announcement for display
  const getFilteredAnnouncements = () => {
    return publishedAnnouncements.filter((announcement) => {
      const title = announcement.title || "";
      const titleGuj = announcement.titleGuj || "";
      const description = announcement.description || "";

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleGuj.includes(searchTerm) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === 'all' || announcement.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📢',
      emergency: '🚨',
      scheme: '💰',
      event: '📅',
      maintenance: '🔧',
      holiday: '🎉',
      meeting: '🏛️',
      important: '⚠️'
    };
    return icons[category] || '📢';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      normal: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[priority] || '#3b82f6';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
  };

  return (
    <div className="announcement-form-container">
      {/* Header */}
      <div className="announcement-form-header">
        <h1>
          Village Announcement System
        </h1>
        <p className="announcement-header-subtitle">
          Create and manage announcements in both English and Gujarati
        </p>
      </div>

      {/* Main Tabs */}
      <div className="announcement-main-tabs">
        <button
          className={`announcement-main-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('create');
            setPreviewMode(false);
          }}
        >
          Create Announcement
        </button>
        <button
          className={`announcement-main-tab-btn ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          Published Announcements ({publishedAnnouncements.length})
        </button>
      </div>

      {activeTab === 'create' && (
        <>
          {/* Language Tabs for Create Mode */}
          <div className="announcement-language-tabs">
            <button
              className={`announcement-tab-btn ${!previewMode ? 'active' : ''}`}
              onClick={() => setPreviewMode(false)}
            >
              Edit Announcement
            </button>
            <button
              className={`announcement-tab-btn ${previewMode ? 'active' : ''}`}
              onClick={() => {
                if (validateForm()) {
                  setPreviewMode(true);
                } else {
                  alert('Please fix all errors before previewing.');
                }
              }}
            >
              Preview Announcement
            </button>
          </div>

          {!previewMode ? (
            /* Edit Form */
            <form className="announcement-form" onSubmit={handleSubmit}>
              {/* Your existing edit form JSX remains exactly the same */}
              <div className="announcement-form-grid">
                {/* Left Column - English Section */}
                <div className="announcement-form-section">
                  <div className="announcement-section-header">
                    <div className="announcement-language-badge english">
                      <span>English Announcement</span>
                    </div>
                    <div className="announcement-character-count">
                      Characters: {formData.title.length + formData.description.length}
                    </div>
                  </div>

                  {/* Title Field */}
                  <div className="announcement-form-group">
                    <label htmlFor="title" className="announcement-form-label">
                      Title (English) *
                      <span className="announcement-required-dot"></span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter announcement title in English"
                      className={`announcement-form-input ${errors.title ? 'error' : ''}`}
                      maxLength={200}
                    />
                    {errors.title && <span className="announcement-error-message">{errors.title}</span>}
                    <div className="announcement-input-help">Maximum 200 characters</div>
                  </div>

                  {/* Description Field */}
                  <div className="announcement-form-group">
                    <label htmlFor="description" className="announcement-form-label">
                      Description (English) *
                      <span className="announcement-required-dot"></span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter detailed announcement in English"
                      className={`announcement-form-textarea ${errors.description ? 'error' : ''}`}
                      rows={6}
                      maxLength={2000}
                    />
                    {errors.description && <span className="announcement-error-message">{errors.description}</span>}
                    <div className="announcement-input-help">Maximum 2000 characters</div>
                  </div>
                </div>

                {/* Right Column - Gujarati Section */}
                <div className="announcement-form-section">
                  <div className="announcement-section-header">
                    <div className="announcement-language-badge gujarati">
                      <span>ગુજરાતી જાહેરાત (Gujarati Announcement)</span>
                    </div>
                    <div className="announcement-character-count">
                      અક્ષરો: {formData.titleGuj.length + formData.descriptionGuj.length}
                    </div>
                  </div>

                  {/* Gujarati Title Field */}
                  <div className="announcement-form-group">
                    <label htmlFor="titleGuj" className="announcement-form-label">
                      શીર્ષક (Gujarati Title) *
                      <span className="announcement-required-dot"></span>
                    </label>
                    <input
                      type="text"
                      id="titleGuj"
                      name="titleGuj"
                      value={formData.titleGuj}
                      onChange={handleInputChange}
                      placeholder="ગુજરાતીમાં જાહેરાતનું શીર્ષક દાખલ કરો"
                      className={`announcement-form-input ${errors.titleGuj ? 'error' : ''}`}
                      maxLength={200}
                    />
                    {errors.titleGuj && <span className="announcement-error-message">{errors.titleGuj}</span>}
                    <div className="announcement-input-help">મહત્તમ 200 અક્ષરો</div>
                  </div>

                  {/* Gujarati Description Field */}
                  <div className="announcement-form-group">
                    <label htmlFor="descriptionGuj" className="announcement-form-label">
                      વર્ણન (Gujarati Description) *
                      <span className="announcement-required-dot"></span>
                    </label>
                    <textarea
                      id="descriptionGuj"
                      name="descriptionGuj"
                      value={formData.descriptionGuj}
                      onChange={handleInputChange}
                      placeholder="ગુજરાતીમાં વિગતવાર જાહેરાત દાખલ કરો"
                      className={`announcement-form-textarea ${errors.descriptionGuj ? 'error' : ''}`}
                      rows={6}
                      maxLength={2000}
                    />
                    {errors.descriptionGuj && (
                      <span className="announcement-error-message">{errors.descriptionGuj}</span>
                    )}
                    <div className="announcement-input-help">મહત્તમ 2000 અક્ષરો</div>
                  </div>
                </div>
              </div>

              {/* Announcement Settings */}
              <div className="announcement-settings-section">
                <h3 className="announcement-settings-title">
                  Announcement Settings
                </h3>

                <div className="announcement-settings-grid">
                  {/* Category Selection */}
                  <div className="announcement-form-group">
                    <label htmlFor="category" className="announcement-form-label">
                      Category
                    </label>
                    <div className="announcement-category-grid">
                      {categories.map((cat) => (
                        <div key={cat.value} className="announcement-category-option">
                          <input
                            type="radio"
                            id={`category-${cat.value}`}
                            name="category"
                            value={cat.value}
                            checked={formData.category === cat.value}
                            onChange={handleInputChange}
                            className="announcement-category-radio"
                          />
                          <label htmlFor={`category-${cat.value}`} className="announcement-category-label">
                            <span className="announcement-category-icon">{cat.label.split(' ')[0]}</span>
                            <span className="announcement-category-text">{cat.label.split(' ').slice(1).join(' ')}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="announcement-form-group">
                    <label className="announcement-form-label">Target Audience</label>
                    <div className="announcement-target-grid">
                      {targetOptions.map((option) => (
                        <div key={option.value} className="announcement-target-option">
                          <input
                            type="checkbox"
                            id={`target-${option.value}`}
                            name="targetAudience"
                            value={option.value}
                            checked={formData.targetAudience.includes(option.value)}
                            onChange={handleInputChange}
                            className="announcement-target-checkbox"
                          />
                          <label htmlFor={`target-${option.value}`} className="announcement-target-label">
                            <span className="announcement-target-icon">{option.label.split(' ')[0]}</span>
                            <span className="announcement-target-text">{option.label.split(' ').slice(1).join(' ')}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date Settings */}
                  <div className="announcement-form-group date-group">
                    <label htmlFor="publishDate" className="announcement-form-label">
                      Publish Date *
                      <span className="announcement-required-dot"></span>
                    </label>
                    <input
                      type="datetime-local"
                      id="publishDate"
                      name="publishDate"
                      value={formData.publishDate}
                      onChange={handleInputChange}
                      className={`announcement-form-input ${errors.publishDate ? 'error' : ''}`}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.publishDate && <span className="announcement-error-message">{errors.publishDate}</span>}
                  </div>

                  <div className="announcement-form-group date-group">
                    <label htmlFor="expiryDate" className="announcement-form-label">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={`announcement-form-input ${errors.expiryDate ? 'error' : ''}`}
                      min={formData.publishDate || new Date().toISOString().slice(0, 16)}
                    />
                    {errors.expiryDate && <span className="announcement-error-message">{errors.expiryDate}</span>}
                  </div>

                  {/* Priority Selection */}
                  <div className="announcement-form-group">
                    <label htmlFor="priority" className="announcement-form-label">
                      Priority Level
                    </label>
                    <div className="announcement-priority-buttons">
                      {['low', 'normal', 'high', 'urgent'].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          className={`announcement-priority-btn ${formData.priority === priority ? 'selected' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, priority }))}
                          style={{
                            '--priority-color': getPriorityColor(priority)
                          }}
                        >
                          <span className="announcement-priority-dot" style={{ background: getPriorityColor(priority) }}></span>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="announcement-form-group attachment-group">
                    <label className="announcement-form-label">Attachment (Optional)</label>
                    <div className="announcement-file-upload">
                      <input
                        type="file"
                        id="attachment"
                        name="attachment"
                        onChange={handleInputChange}
                        className="announcement-file-input"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="attachment" className="announcement-file-label">
                        <span className="announcement-file-icon">📎</span>
                        <span className="announcement-file-text">
                          {formData.attachmentName || 'Choose file (PDF, Word, Images)'}
                        </span>
                        <span className="announcement-file-button">Browse</span>
                      </label>
                    </div>
                    <div className="announcement-file-info">
                      Max file size: 5MB • Supported formats: PDF, DOC, JPG, PNG
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="announcement-action-buttons">
                <button
                  type="button"
                  className="announcement-btn btn-secondary"
                  onClick={handleClearForm}
                  disabled={isSubmitting}
                >
                  Clear Form
                </button>

                <div className="announcement-btn-group">
                  <button
                    type="button"
                    className="announcement-btn btn-outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </button>

                  <button
                    type="submit"
                    className="announcement-btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="announcement-loading-spinner"></span>
                        Publishing...
                      </>
                    ) : (
                      <>
                        {formData.id ? 'Update Announcement' : 'Publish Announcement'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <div className="announcement-preview">
              <div className="announcement-preview-header">
                <h2>Announcement Preview</h2>
                <button
                  className="announcement-btn btn-outline"
                  onClick={() => setPreviewMode(false)}
                >
                  Edit Again
                </button>
              </div>

              {/* Preview Card */}
              <div className="announcement-preview-card">
                <div className="announcement-preview-header-section">
                  <div className="announcement-preview-badge" style={{ background: getPriorityColor(formData.priority) }}>
                    <span className="announcement-badge-icon">{getCategoryIcon(formData.category)}</span>
                    <span className="announcement-badge-text">
                      {categories.find(c => c.value === formData.category)?.label.split(' ').slice(1).join(' ')}
                    </span>
                  </div>

                  <div className="announcement-preview-priority">
                    <div
                      className="announcement-priority-indicator"
                      style={{ background: getPriorityColor(formData.priority) }}
                    ></div>
                    <span>{formData.priority.toUpperCase()}</span>
                  </div>
                </div>

                <div className="announcement-preview-title-section">
                  <h3 className="announcement-preview-title">{formData.title} --- {formData.titleGuj}</h3>
                </div>

                <div className="announcement-preview-content">
                  <div className="announcement-preview-language english">
                    <div className="announcement-language-label">English</div>
                    <div className="announcement-preview-text">{formData.description}</div>
                  </div>

                  <div className="announcement-preview-language gujarati">
                    <div className="announcement-language-label">ગુજરાતી (Gujarati)</div>
                    <div className="announcement-preview-text">{formData.descriptionGuj}</div>
                  </div>
                </div>

                <div className="announcement-preview-meta">
                  <div className="announcement-meta-item">
                    <span className="announcement-meta-icon">👥</span>
                    <span className="announcement-meta-label">Target:</span>
                    <span className="announcement-meta-value">
                      {formData.targetAudience.map(aud =>
                        targetOptions.find(t => t.value === aud)?.label.split(' ').slice(1).join(' ')
                      ).join(', ')}
                    </span>
                  </div>

                  <div className="announcement-meta-item">
                    <span className="announcement-meta-icon">📅</span>
                    <span className="announcement-meta-label">Publish:</span>
                    <span className="announcement-meta-value">
                      {formatDate(formData.publishDate)}
                    </span>
                  </div>

                  {formData.expiryDate && (
                    <div className="announcement-meta-item">
                      <span className="announcement-meta-icon">⏰</span>
                      <span className="announcement-meta-label">Expires:</span>
                      <span className="announcement-meta-value">
                        {formatDate(formData.expiryDate)}
                      </span>
                    </div>
                  )}

                  {formData.attachmentName && (
                    <div className="announcement-meta-item">
                      <span className="announcement-meta-icon">📎</span>
                      <span className="announcement-meta-label">Attachment:</span>
                      <span className="announcement-meta-value">{formData.attachmentName}</span>
                    </div>
                  )}
                </div>

                <div className="announcement-preview-footer">
                  <div className="announcement-preview-status">
                    <span className="announcement-status-dot"></span>
                    Ready to Publish
                  </div>
                  <div className="announcement-preview-actions">
                    <button
                      className="announcement-btn btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Publishing...' : formData.id ? 'Update & Publish' : 'Confirm & Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'published' && (
        /* Published Announcements View */
        <div className="announcement-published-view">
          <div className="announcement-published-header">
            <h2>Published Announcements</h2>
            <button
              className="announcement-btn btn-primary"
              onClick={() => {
                handleClearForm();
                setActiveTab('create');
              }}
            >
              Create New Announcement
            </button>
          </div>

          <div className="announcement-search-filter">
            <div className="announcement-search-box">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="announcement-search-input"
              />
            </div>

            <select
              className="announcement-filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {publishedAnnouncements.length === 0 ? (
            <div className="announcement-empty-state">
              <div className="announcement-empty-icon">📭</div>
              <h3>No announcements found</h3>
              <p>Get started by creating your first announcement</p>
              <button
                className="announcement-btn btn-primary"
                onClick={() => {
                  handleClearForm();
                  setActiveTab('create');
                }}
              >
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="announcement-list">
              {getFilteredAnnouncements().map((announcement) => (
                <div key={announcement.id} className="announcement-list-item">
                  <div className="announcement-item-header">
                    <div className="announcement-item-badge" style={{ background: getPriorityColor(announcement.priority) }}>
                      <span className="announcement-badge-icon">{getCategoryIcon(announcement.category)}</span>
                      <span className="announcement-badge-text">
                        {categories.find(c => c.value === announcement.category)?.label.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                    <div className="announcement-item-priority" style={{ color: getPriorityColor(announcement.priority) }}>
                      ● {announcement.priority.toUpperCase()}
                    </div>
                  </div>

                  <div className="announcement-item-content">
                    <h3 className="announcement-item-title">{announcement.title}</h3>
                    <h4 className="announcement-item-title-guj">{announcement.titleGuj}</h4>
                    <p className="announcement-item-description">
                      {announcement.description.substring(0, 150)}...
                    </p>
                  </div>

                  <div className="announcement-item-meta">
                    <div className="announcement-item-meta-item">
                      <span>Published: {formatDate(announcement.publishDate)}</span>
                    </div>
                    <div className="announcement-item-meta-item">
                      <span>Target: {announcement.targetAudience.map(aud =>
                        targetOptions.find(t => t.value === aud)?.label.split(' ').slice(1).join(' ')
                      ).join(', ')}</span>
                    </div>
                  </div>

                  <div className="announcement-item-actions">
                    <button
                      className="announcement-item-btn view"
                      onClick={() => {
                        setFormData(announcement);
                        setPreviewMode(true);
                        setActiveTab('create');
                      }}
                    >
                      View
                    </button>
                    <button
                      className="announcement-item-btn edit"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      Edit
                    </button>
                    <button
                      className="announcement-item-btn delete"
                      onClick={() => handleDeleteAnnouncement(announcement)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="announcement-modal-overlay">
          <div className="announcement-modal">
            <div className="announcement-modal-header">
              <h3>Delete Announcement</h3>
              <button
                className="announcement-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="announcement-modal-body">
              <p>Are you sure you want to delete this announcement?</p>
              <p className="announcement-modal-warning">This action cannot be undone.</p>
            </div>
            <div className="announcement-modal-footer">
              <button
                className="announcement-btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="announcement-btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;