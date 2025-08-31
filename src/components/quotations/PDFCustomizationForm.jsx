import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  FileText,
  Image,
  Calculator,
  MessageSquare,
  Percent,
  DollarSign,
  Info,
  CheckCircle,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const PDFCustomizationForm = ({
  initialData = {},
  onSave,
  onCancel,
  onPreview,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    // Template settings
    template_type: 'DETAILED',
    
    // Content sections
    include_cabinet_details: true,
    include_door_details: true,
    include_accessories: true,
    include_accessory_images: true,
    include_plan_images: true,
    include_lighting: true,
    
    // Display options
    show_item_codes: true,
    show_dimensions: true,
    include_warranty_info: true,
    include_terms_conditions: true,
    
    // Discount settings
    discount_percentage: 0,
    discount_amount: 0,
    discount_reason: '',
    
    // Customer notes
    special_instructions: '',
    installation_notes: '',
    timeline_notes: '',
    custom_requirements: '',
    
    // PDF settings
    header_logo: true,
    footer_contact: true,
    page_numbers: true,
    watermark: false,
    color_theme: 'default',
    
    ...initialData
  });

  const [expandedSections, setExpandedSections] = useState({
    content: true,
    display: false,
    discount: false,
    notes: false,
    advanced: false
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({ ...initialData });
    setHasChanges(hasChanges);
  }, [formData, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate discount values
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      newErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
    }

    if (formData.discount_amount < 0) {
      newErrors.discount_amount = 'Discount amount cannot be negative';
    }

    if (formData.discount_percentage > 0 && formData.discount_amount > 0) {
      newErrors.discount_general = 'Please specify either percentage OR amount, not both';
    }

    if ((formData.discount_percentage > 0 || formData.discount_amount > 0) && !formData.discount_reason.trim()) {
      newErrors.discount_reason = 'Please provide a reason for the discount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave && onSave(formData);
    }
  };

  const handleReset = () => {
    setFormData({ ...initialData });
    setErrors({});
  };

  const handlePreview = () => {
    if (validateForm()) {
      onPreview && onPreview(formData);
    }
  };

  const getTemplateDescription = (type) => {
    switch (type) {
      case 'DETAILED':
        return 'Complete quotation with all sections, images, and specifications';
      case 'STANDARD':
        return 'Professional quotation with essential information';
      case 'SIMPLE':
        return 'Basic price quote with line items and totals';
      default:
        return 'Standard template';
    }
  };

  const contentSections = [
    {
      key: 'include_cabinet_details',
      label: 'Cabinet Details',
      description: 'Line items, materials, dimensions, and specifications',
      icon: FileText
    },
    {
      key: 'include_door_details',
      label: 'Door Specifications',
      description: 'Door types, finishes, hardware, and measurements',
      icon: FileText
    },
    {
      key: 'include_accessories',
      label: 'Accessories & Hardware',
      description: 'Additional accessories, hardware, and add-ons',
      icon: Settings
    },
    {
      key: 'include_accessory_images',
      label: 'Accessory Images',
      description: 'Product images for accessories and hardware',
      icon: Image
    },
    {
      key: 'include_plan_images',
      label: 'Floor Plans & Layouts',
      description: 'Design plans, 3D renders, and layout drawings',
      icon: Image
    },
    {
      key: 'include_lighting',
      label: 'Lighting Details',
      description: 'LED strips, under-cabinet lighting, and electrical',
      icon: Settings
    }
  ];

  const displayOptions = [
    {
      key: 'show_item_codes',
      label: 'Show Item Codes',
      description: 'Display product codes and SKUs'
    },
    {
      key: 'show_dimensions',
      label: 'Show Dimensions',
      description: 'Include measurements and sizes'
    },
    {
      key: 'include_warranty_info',
      label: 'Include Warranty',
      description: 'Warranty terms and conditions'
    },
    {
      key: 'include_terms_conditions',
      label: 'Terms & Conditions',
      description: 'Payment terms and legal conditions'
    },
    {
      key: 'header_logo',
      label: 'Company Logo',
      description: 'Show logo in header'
    },
    {
      key: 'footer_contact',
      label: 'Contact Information',
      description: 'Company contact details in footer'
    },
    {
      key: 'page_numbers',
      label: 'Page Numbers',
      description: 'Add page numbering'
    },
    {
      key: 'watermark',
      label: 'Watermark',
      description: 'Add company watermark'
    }
  ];

  return (
    <div className={`pdfcustomizationform-container ${className}`}>
      {/* Header */}
      <div className="pdfcustomizationform-header">
        <div className="pdfcustomizationform-header-content">
          <Settings className="pdfcustomizationform-header-icon" />
          <div className="pdfcustomizationform-header-text">
            <h2 className="pdfcustomizationform-title">PDF Customization</h2>
            <p className="pdfcustomizationform-subtitle">
              Configure your quotation PDF layout and content
            </p>
          </div>
        </div>
        {hasChanges && (
          <div className="pdfcustomizationform-changes-indicator">
            <Info className="pdfcustomizationform-changes-icon" />
            <span className="pdfcustomizationform-changes-text">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="pdfcustomizationform-content">
        {/* Template Selection */}
        <div className="pdfcustomizationform-section">
          <div className="pdfcustomizationform-section-header">
            <FileText className="pdfcustomizationform-section-icon" />
            <h3 className="pdfcustomizationform-section-title">Template Type</h3>
          </div>
          
          <div className="pdfcustomizationform-template-options">
            {['DETAILED', 'STANDARD', 'SIMPLE'].map((type) => (
              <label
                key={type}
                className={`pdfcustomizationform-template-option ${
                  formData.template_type === type ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="template_type"
                  value={type}
                  checked={formData.template_type === type}
                  onChange={(e) => handleInputChange('template_type', e.target.value)}
                  className="pdfcustomizationform-radio"
                />
                <div className="pdfcustomizationform-template-content">
                  <span className="pdfcustomizationform-template-name">
                    {type.charAt(0) + type.slice(1).toLowerCase()} Template
                  </span>
                  <span className="pdfcustomizationform-template-desc">
                    {getTemplateDescription(type)}
                  </span>
                </div>
                {formData.template_type === type && (
                  <CheckCircle className="pdfcustomizationform-template-selected" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="pdfcustomizationform-section">
          <button
            className="pdfcustomizationform-section-toggle"
            onClick={() => handleSectionToggle('content')}
          >
            <div className="pdfcustomizationform-section-header">
              {expandedSections.content ? (
                <ChevronDown className="pdfcustomizationform-section-icon" />
              ) : (
                <ChevronRight className="pdfcustomizationform-section-icon" />
              )}
              <h3 className="pdfcustomizationform-section-title">Content Sections</h3>
            </div>
            <span className="pdfcustomizationform-section-summary">
              {contentSections.filter(section => formData[section.key]).length} of {contentSections.length} enabled
            </span>
          </button>

          {expandedSections.content && (
            <div className="pdfcustomizationform-section-content">
              <div className="pdfcustomizationform-options-grid">
                {contentSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <label
                      key={section.key}
                      className={`pdfcustomizationform-option-card ${
                        formData[section.key] ? 'enabled' : 'disabled'
                      }`}
                    >
                      <div className="pdfcustomizationform-option-header">
                        <IconComponent className="pdfcustomizationform-option-icon" />
                        <div className="pdfcustomizationform-option-toggle">
                          <input
                            type="checkbox"
                            checked={formData[section.key]}
                            onChange={(e) => handleInputChange(section.key, e.target.checked)}
                            className="pdfcustomizationform-checkbox"
                          />
                          <div className="pdfcustomizationform-toggle-slider"></div>
                        </div>
                      </div>
                      <div className="pdfcustomizationform-option-content">
                        <h4 className="pdfcustomizationform-option-title">{section.label}</h4>
                        <p className="pdfcustomizationform-option-desc">{section.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Display Options */}
        <div className="pdfcustomizationform-section">
          <button
            className="pdfcustomizationform-section-toggle"
            onClick={() => handleSectionToggle('display')}
          >
            <div className="pdfcustomizationform-section-header">
              {expandedSections.display ? (
                <ChevronDown className="pdfcustomizationform-section-icon" />
              ) : (
                <ChevronRight className="pdfcustomizationform-section-icon" />
              )}
              <h3 className="pdfcustomizationform-section-title">Display Options</h3>
            </div>
            <span className="pdfcustomizationform-section-summary">
              {displayOptions.filter(option => formData[option.key]).length} of {displayOptions.length} enabled
            </span>
          </button>

          {expandedSections.display && (
            <div className="pdfcustomizationform-section-content">
              <div className="pdfcustomizationform-checkbox-grid">
                {displayOptions.map((option) => (
                  <label key={option.key} className="pdfcustomizationform-checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData[option.key]}
                      onChange={(e) => handleInputChange(option.key, e.target.checked)}
                      className="pdfcustomizationform-checkbox"
                    />
                    <div className="pdfcustomizationform-checkbox-content">
                      <span className="pdfcustomizationform-checkbox-label">{option.label}</span>
                      <span className="pdfcustomizationform-checkbox-desc">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Discount Settings */}
        <div className="pdfcustomizationform-section">
          <button
            className="pdfcustomizationform-section-toggle"
            onClick={() => handleSectionToggle('discount')}
          >
            <div className="pdfcustomizationform-section-header">
              {expandedSections.discount ? (
                <ChevronDown className="pdfcustomizationform-section-icon" />
              ) : (
                <ChevronRight className="pdfcustomizationform-section-icon" />
              )}
              <h3 className="pdfcustomizationform-section-title">Discount Settings</h3>
            </div>
            <span className="pdfcustomizationform-section-summary">
              {formData.discount_percentage > 0 || formData.discount_amount > 0 ? 'Discount applied' : 'No discount'}
            </span>
          </button>

          {expandedSections.discount && (
            <div className="pdfcustomizationform-section-content">
              {errors.discount_general && (
                <div className="pdfcustomizationform-error-message">
                  {errors.discount_general}
                </div>
              )}
              
              <div className="pdfcustomizationform-input-row">
                <div className="pdfcustomizationform-input-group">
                  <label className="pdfcustomizationform-input-label">
                    <Percent className="pdfcustomizationform-label-icon" />
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount_percentage}
                    onChange={(e) => handleInputChange('discount_percentage', parseFloat(e.target.value) || 0)}
                    className={`pdfcustomizationform-input ${errors.discount_percentage ? 'error' : ''}`}
                    placeholder="0.0"
                  />
                  {errors.discount_percentage && (
                    <span className="pdfcustomizationform-field-error">{errors.discount_percentage}</span>
                  )}
                </div>
                
                <div className="pdfcustomizationform-input-group">
                  <label className="pdfcustomizationform-input-label">
                    <DollarSign className="pdfcustomizationform-label-icon" />
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                    className={`pdfcustomizationform-input ${errors.discount_amount ? 'error' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.discount_amount && (
                    <span className="pdfcustomizationform-field-error">{errors.discount_amount}</span>
                  )}
                </div>
              </div>

              <div className="pdfcustomizationform-input-group">
                <label className="pdfcustomizationform-input-label">
                  <MessageSquare className="pdfcustomizationform-label-icon" />
                  Discount Reason
                </label>
                <input
                  type="text"
                  value={formData.discount_reason}
                  onChange={(e) => handleInputChange('discount_reason', e.target.value)}
                  className={`pdfcustomizationform-input ${errors.discount_reason ? 'error' : ''}`}
                  placeholder="e.g., Bulk order discount, Seasonal offer, First-time customer"
                />
                {errors.discount_reason && (
                  <span className="pdfcustomizationform-field-error">{errors.discount_reason}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer Notes */}
        <div className="pdfcustomizationform-section">
          <button
            className="pdfcustomizationform-section-toggle"
            onClick={() => handleSectionToggle('notes')}
          >
            <div className="pdfcustomizationform-section-header">
              {expandedSections.notes ? (
                <ChevronDown className="pdfcustomizationform-section-icon" />
              ) : (
                <ChevronRight className="pdfcustomizationform-section-icon" />
              )}
              <h3 className="pdfcustomizationform-section-title">Customer Notes</h3>
            </div>
            <span className="pdfcustomizationform-section-summary">
              {[formData.special_instructions, formData.installation_notes, formData.timeline_notes, formData.custom_requirements]
                .filter(note => note.trim()).length} notes added
            </span>
          </button>

          {expandedSections.notes && (
            <div className="pdfcustomizationform-section-content">
              <div className="pdfcustomizationform-textarea-grid">
                <div className="pdfcustomizationform-input-group">
                  <label className="pdfcustomizationform-input-label">Special Instructions</label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                    className="pdfcustomizationform-textarea"
                    rows="3"
                    placeholder="Any special requirements or instructions for this project..."
                  />
                </div>

                <div className="pdfcustomizationform-input-group">
                  <label className="pdfcustomizationform-input-label">Installation Notes</label>
                  <textarea
                    value={formData.installation_notes}
                    onChange={(e) => handleInputChange('installation_notes', e.target.value)}
                    className="pdfcustomizationform-textarea"
                    rows="3"
                    placeholder="Installation-specific notes, site conditions, access requirements..."
                  />
                </div>

                <div className="pdfcustomizationform-input-group">
                  <label className="pdfcustomizationform-input-label">Timeline Notes</label>
                  <textarea
                    value={formData.timeline_notes}
                    onChange={(e) => handleInputChange('timeline_notes', e.target.value)}
                    className="pdfcustomizationform-textarea"
                    rows="3"
                    placeholder="Project timeline, delivery schedule, milestone dates..."
                  />
                </div>

                <div className="pdfcustomizationform-input-group">
                  <label className="pdfcustomizationform-input-label">Custom Requirements</label>
                  <textarea
                    value={formData.custom_requirements}
                    onChange={(e) => handleInputChange('custom_requirements', e.target.value)}
                    className="pdfcustomizationform-textarea"
                    rows="3"
                    placeholder="Custom modifications, specific customer requests, design preferences..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pdfcustomizationform-footer">
        <div className="pdfcustomizationform-footer-actions">
          <button
            onClick={onCancel}
            className="pdfcustomizationform-btn secondary"
            disabled={loading}
          >
            <X className="pdfcustomizationform-btn-icon" />
            Cancel
          </button>

          <button
            onClick={handleReset}
            className="pdfcustomizationform-btn tertiary"
            disabled={loading || !hasChanges}
            title="Reset to original settings"
          >
            <RotateCcw className="pdfcustomizationform-btn-icon" />
            Reset
          </button>

          {onPreview && (
            <button
              onClick={handlePreview}
              className="pdfcustomizationform-btn secondary"
              disabled={loading || Object.keys(errors).length > 0}
            >
              <Eye className="pdfcustomizationform-btn-icon" />
              Preview
            </button>
          )}

          <button
            onClick={handleSave}
            className="pdfcustomizationform-btn primary"
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? (
              <>
                <div className="pdfcustomizationform-spinner" />
                Saving...
              </>
            ) : (
              <>
                <Save className="pdfcustomizationform-btn-icon" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFCustomizationForm;