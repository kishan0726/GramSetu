import React, { useState } from 'react';
import '../stylesheets/Announcement.css';

const Announcement = () => {
  const [formData, setFormData] = useState({
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
    status: 'draft'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

  const targetOptions = [
    { value: 'all', label: '👥 All Villagers' },
    { value: 'farmers', label: '👨‍🌾 Farmers' },
    { value: 'shopkeepers', label: '🏪 Shopkeepers' },
    { value: 'women', label: '👩 Women' },
    { value: 'youth', label: '👦 Youth' },
    { value: 'seniors', label: '👴 Senior Citizens' },
    { value: 'students', label: '🎓 Students' },
    { value: 'specific-area', label: '📍 Specific Area' }
  ];

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate English title
    if (!formData.title.trim()) {
      newErrors.title = 'English title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    // Validate Gujarati title
    if (!formData.titleGuj.trim()) {
      newErrors.titleGuj = 'Gujarati title is required';
    }
    
    // Validate English description
    if (!formData.description.trim()) {
      newErrors.description = 'English description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    // Validate Gujarati description
    if (!formData.descriptionGuj.trim()) {
      newErrors.descriptionGuj = 'Gujarati description is required';
    }
    
    // Validate dates
    if (!formData.publishDate) {
      newErrors.publishDate = 'Publish date is required';
    }
    
    if (formData.expiryDate && new Date(formData.expiryDate) < new Date(formData.publishDate)) {
      newErrors.expiryDate = 'Expiry date must be after publish date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - show message and reset form
      alert('Announcement saved successfully!');
      
      // Reset form
      setFormData({
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
        status: 'published'
      });
      
    } catch (error) {
      alert('Error saving announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (formData.title || formData.description) {
      setFormData(prev => ({ ...prev, status: 'draft' }));
      alert('Announcement saved as draft.');
    } else {
      alert('Please add some content before saving as draft.');
    }
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      setFormData({
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
        status: 'draft'
      });
      setErrors({});
    }
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

  return (
    <div className="announcement-form-container">
      {/* Header */}
      <div className="announcement-form-header">
        <h1>
          Create New Announcement
        </h1>
        <p className="announcement-header-subtitle">
          Create announcements in both English and Gujarati for all villagers
        </p>
      </div>

      {/* Language Tabs */}
      <div className="announcement-language-tabs">
        <button 
          className={`announcement-tab-btn ${!previewMode ? 'active' : ''}`}
          onClick={() => setPreviewMode(false)}
        >
          <span className="announcement-tab-icon">✏️</span>
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
          <span className="announcement-tab-icon">👁️</span>
          Preview Announcement
        </button>
      </div>

      {!previewMode ? (
        /* Edit Form */
        <form className="announcement-form" onSubmit={handleSubmit}>
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
                    Publish Announcement
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
              <span className="announcement-btn-icon">✏️</span>
              Edit Again
            </button>
          </div>

          {/* Preview Card */}
          <div className="announcement-preview-card">
            {/* Header */}
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

            {/* Title Preview */}
            <div className="announcement-preview-title-section">
              <h3 className="announcement-preview-title">{formData.title}</h3>
              <h3 className="announcement-preview-title-guj">{formData.titleGuj}</h3>
            </div>

            {/* Content Preview */}
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

            {/* Metadata */}
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
                  {new Date(formData.publishDate).toLocaleString('en-IN', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
              
              {formData.expiryDate && (
                <div className="announcement-meta-item">
                  <span className="announcement-meta-icon">⏰</span>
                  <span className="announcement-meta-label">Expires:</span>
                  <span className="announcement-meta-value">
                    {new Date(formData.expiryDate).toLocaleString('en-IN', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
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

            {/* Preview Footer */}
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
                  {isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;