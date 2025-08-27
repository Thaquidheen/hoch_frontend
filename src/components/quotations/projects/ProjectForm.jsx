import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  User,
  Building,
  Percent,
  IndianRupee,
  Settings,
  FileText
} from 'lucide-react';
import './ProjectForm.css';

const ProjectForm = ({ 
  project = null, 
  customers = [],
  brands = [],
  isOpen = false, 
  onSave, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    customer: '',
    brand: '',
    budget_tier: 'LUXURY',
    margin_pct: '25.00',
    gst_pct: '18.00',
    currency: 'INR',
    status: 'DRAFT',
    scopes: {
      open: true,
      working: false
    },
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        customer: project.customer || '',
        brand: project.brand || '',
        budget_tier: project.budget_tier || 'LUXURY',
        margin_pct: project.margin_pct || '25.00',
        gst_pct: project.gst_pct || '18.00',
        currency: project.currency || 'INR',
        status: project.status || 'DRAFT',
        scopes: project.scopes || { open: true, working: false },
        notes: project.notes || ''
      });
    } else {
      setFormData({
        customer: '',
        brand: '',
        budget_tier: 'LUXURY',
        margin_pct: '25.00',
        gst_pct: '18.00',
        currency: 'INR',
        status: 'DRAFT',
        scopes: {
          open: true,
          working: false
        },
        notes: ''
      });
    }
    setErrors({});
  }, [project]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Customer validation
    if (!formData?.customer) {
      newErrors.customer = 'Customer is required';
    }

    // Brand validation
    if (!formData?.brand) {
      newErrors.brand = 'Brand is required';
    }

    // Budget tier validation
    if (!formData.budget_tier) {
      newErrors.budget_tier = 'Budget tier is required';
    }

    // Margin validation
    if (!formData.margin_pct) {
      newErrors.margin_pct = 'Margin percentage is required';
    } else if (isNaN(parseFloat(formData.margin_pct))) {
      newErrors.margin_pct = 'Margin must be a valid number';
    } else if (parseFloat(formData.margin_pct) < 0) {
      newErrors.margin_pct = 'Margin cannot be negative';
    } else if (parseFloat(formData.margin_pct) > 100) {
      newErrors.margin_pct = 'Margin cannot exceed 100%';
    }

    // GST validation
    if (!formData.gst_pct) {
      newErrors.gst_pct = 'GST percentage is required';
    } else if (isNaN(parseFloat(formData.gst_pct))) {
      newErrors.gst_pct = 'GST must be a valid number';
    } else if (parseFloat(formData.gst_pct) < 0) {
      newErrors.gst_pct = 'GST cannot be negative';
    } else if (parseFloat(formData.gst_pct) > 50) {
      newErrors.gst_pct = 'GST cannot exceed 50%';
    }

    // Scopes validation
    if (!formData.scopes.open && !formData.scopes.working) {
      newErrors.scopes = 'At least one scope (Open Kitchen or Working Kitchen) must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle scope changes
  const handleScopeChange = (scopeName, checked) => {
    setFormData(prev => ({
      ...prev,
      scopes: {
        ...prev.scopes,
        [scopeName]: checked
      }
    }));

    // Clear scope error
    if (errors.scopes) {
      setErrors(prev => ({
        ...prev,
        scopes: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format data for API
      const submitData = {
        ...formData,
        margin_pct: parseFloat(formData.margin_pct),
        gst_pct: parseFloat(formData.gst_pct)
      };

      const result = await onSave(submitData);
      
      if (result?.success !== false) {
        // Success - form will be closed by parent
        setFormData({
          customer: '',
          brand: '',
          budget_tier: 'LUXURY',
          margin_pct: '25.00',
          gst_pct: '18.00',
          currency: 'INR',
          status: 'DRAFT',
          scopes: {
            open: true,
            working: false
          },
          notes: ''
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      customer: '',
      brand: '',
      budget_tier: 'LUXURY',
      margin_pct: '25.00',
      gst_pct: '18.00',
      currency: 'INR',
      status: 'DRAFT',
      scopes: {
        open: true,
        working: false
      },
      notes: ''
    });
    setErrors({});
    onCancel();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Get customer name for display
  const getSelectedCustomerName = () => {
    const selected = customers.find(c => c.id?.toString() === formData.customer?.toString());
    return selected ? selected.name : '';
  };

  // Get brand name for display
  const getSelectedBrandName = () => {
    const selected = brands.find(b => b.id.toString() === formData.brand.toString());
    return selected ? selected.name : '';
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-info">
            <FileText className="form-icon" />
            <h2 className="form-title">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
          </div>
          <button onClick={handleCancel} className="form-close-button">
            <X className="close-icon" />
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-body">
            {/* Customer Selection */}
            <div className="form-section">
              <h3 className="section-title">
                <User className="section-icon" />
                Customer Information
              </h3>
              
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className={`form-select ${errors.customer ? 'error' : ''}`}
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.name} - {customer.contact_number || 'No phone'}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <div className="form-error">
                    <AlertCircle className="error-icon" />
                    {errors.customer}
                  </div>
                )}
                <div className="form-note">
                  Select the customer for this project. You can manage customers separately.
                </div>
              </div>
            </div>

            {/* Brand & Budget Selection */}
            <div className="form-section">
              <h3 className="section-title">
                <Building className="section-icon" />
                Brand & Budget Configuration
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <select
                    className={`form-select ${errors.brand ? 'error' : ''}`}
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                  >
                    <option value="">Select a brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.brand}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Budget Tier *</label>
                  <select
                    className={`form-select ${errors.budget_tier ? 'error' : ''}`}
                    value={formData.budget_tier}
                    onChange={(e) => handleInputChange('budget_tier', e.target.value)}
                  >
                    <option value="LUXURY">LUXURY - Premium pricing tier</option>
                    <option value="ECONOMY">ECONOMY - Standard pricing tier</option>
                  </select>
                  {errors.budget_tier && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.budget_tier}
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Tier Description */}
              <div className="tier-description">
                {formData.budget_tier === 'LUXURY' 
                  ? 'Premium quality materials and finishes for high-end projects with luxury pricing'
                  : 'Cost-effective options for standard projects with good quality and economy pricing'
                }
              </div>
            </div>

            {/* Pricing Configuration */}
            <div className="form-section">
              <h3 className="section-title">
                <Percent className="section-icon" />
                Pricing & Tax Configuration
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Margin Percentage *</label>
                  <div className="percentage-input-container">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className={`form-input percentage-input ${errors.margin_pct ? 'error' : ''}`}
                      placeholder="25.00"
                      value={formData.margin_pct}
                      onChange={(e) => handleInputChange('margin_pct', e.target.value)}
                    />
                    <span className="percentage-symbol">%</span>
                  </div>
                  {errors.margin_pct && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.margin_pct}
                    </div>
                  )}
                  <div className="form-note">
                    Profit margin to be added to material and labor costs
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">GST Percentage *</label>
                  <div className="percentage-input-container">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                      className={`form-input percentage-input ${errors.gst_pct ? 'error' : ''}`}
                      placeholder="18.00"
                      value={formData.gst_pct}
                      onChange={(e) => handleInputChange('gst_pct', e.target.value)}
                    />
                    <span className="percentage-symbol">%</span>
                  </div>
                  {errors.gst_pct && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.gst_pct}
                    </div>
                  )}
                  <div className="form-note">
                    GST rate to be applied on the taxable amount
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  disabled
                >
                  <option value="INR">INR - Indian Rupee (₹)</option>
                </select>
                <div className="form-note">
                  Currently only Indian Rupee is supported
                </div>
              </div>
            </div>

            {/* Project Scopes */}
            <div className="form-section">
              <h3 className="section-title">
                <Settings className="section-icon" />
                Project Scopes
              </h3>

              <div className="scopes-container">
                <label className="scope-checkbox-label">
                  <input
                    type="checkbox"
                    className="scope-checkbox"
                    checked={formData.scopes.open}
                    onChange={(e) => handleScopeChange('open', e.target.checked)}
                  />
                  <div className="scope-content">
                    <span className="scope-title">Open Kitchen</span>
                    <p className="scope-description">
                      Customer-facing quotation for open kitchen design with visible finishes
                    </p>
                  </div>
                </label>

                <label className="scope-checkbox-label">
                  <input
                    type="checkbox"
                    className="scope-checkbox"
                    checked={formData.scopes.working}
                    onChange={(e) => handleScopeChange('working', e.target.checked)}
                  />
                  <div className="scope-content">
                    <span className="scope-title">Working Kitchen</span>
                    <p className="scope-description">
                      Detailed technical specifications for working kitchen components
                    </p>
                  </div>
                </label>
              </div>

              {errors.scopes && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.scopes}
                </div>
              )}
            </div>

            {/* Project Status */}
            {project && (
              <div className="form-section">
                <h3 className="section-title">
                  <CheckCircle className="section-icon" />
                  Project Status
                </h3>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="DRAFT">DRAFT - Work in progress</option>
                    <option value="QUOTED">QUOTED - Sent to customer</option>
                    <option value="CONFIRMED">CONFIRMED - Customer approved</option>
                    <option value="IN_PRODUCTION">IN_PRODUCTION - Being manufactured</option>
                    <option value="DELIVERED">DELIVERED - Completed</option>
                    <option value="CANCELLED">CANCELLED - Project cancelled</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Project Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add any special requirements, customer preferences, or project notes..."
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
                <div className="form-note">
                  Optional notes about the project, customer requirements, or special instructions
                </div>
              </div>
            </div>

            {/* Project Preview Summary */}
            {getSelectedCustomerName() && getSelectedBrandName() && (
              <div className="project-summary">
                <div className="summary-header">
                  <FileText className="summary-icon" />
                  <span>Project Summary</span>
                </div>
                <div className="summary-content">
                  <div className="summary-row">
                    <span className="summary-label">Customer:</span>
                    <span className="summary-value">{getSelectedCustomerName()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Brand:</span>
                    <span className="summary-value">{getSelectedBrandName()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Budget Tier:</span>
                    <span className={`summary-value tier-${formData.budget_tier.toLowerCase()}`}>
                      {formData.budget_tier}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Pricing:</span>
                    <span className="summary-value">
                      {formData.margin_pct}% margin + {formData.gst_pct}% GST
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Scopes:</span>
                    <span className="summary-value">
                      {formData.scopes.open && 'Open Kitchen'}
                      {formData.scopes.open && formData.scopes.working && ' + '}
                      {formData.scopes.working && 'Working Kitchen'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error">
                <div className="error-content">
                  <AlertCircle className="error-icon" />
                  <span>{errors.submit}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || loading}
              className="btn-submit"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="btn-icon spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="btn-icon" />
                  {project ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;