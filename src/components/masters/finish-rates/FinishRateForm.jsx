import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import './FinishRateForm.css';

const FinishRateForm = ({ 
  finishRate = null, 
  materials = [],
  isOpen = false, 
  onSave, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    material: '',
    budget_tier: 'LUXURY',
    unit_rate: '',
    currency: 'INR',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when finish rate changes
  useEffect(() => {
    if (finishRate) {
      setFormData({
        material: finishRate.material || '',
        budget_tier: finishRate.budget_tier || 'LUXURY',
        unit_rate: finishRate.unit_rate || '',
        currency: finishRate.currency || 'INR',
        effective_from: finishRate.effective_from || new Date().toISOString().split('T')[0],
        effective_to: finishRate.effective_to || '',
        is_active: finishRate.is_active !== undefined ? finishRate.is_active : true
      });
    } else {
      setFormData({
        material: '',
        budget_tier: 'LUXURY',
        unit_rate: '',
        currency: 'INR',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        is_active: true
      });
    }
    setErrors({});
  }, [finishRate]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Material validation
    if (!formData.material) {
      newErrors.material = 'Material is required';
    }

    // Budget tier validation
    if (!formData.budget_tier) {
      newErrors.budget_tier = 'Budget tier is required';
    }

    // Unit rate validation
    if (!formData.unit_rate) {
      newErrors.unit_rate = 'Unit rate is required';
    } else if (isNaN(parseFloat(formData.unit_rate))) {
      newErrors.unit_rate = 'Unit rate must be a valid number';
    } else if (parseFloat(formData.unit_rate) <= 0) {
      newErrors.unit_rate = 'Unit rate must be greater than 0';
    } else if (parseFloat(formData.unit_rate) > 999999) {
      newErrors.unit_rate = 'Unit rate must be less than 999,999';
    }

    // Date validation
    if (!formData.effective_from) {
      newErrors.effective_from = 'Effective from date is required';
    } else {
      const effectiveFromDate = new Date(formData.effective_from);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Allow dates from yesterday onwards (to handle timezone issues)
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      if (effectiveFromDate < yesterday) {
        newErrors.effective_from = 'Effective from date cannot be in the past';
      }
    }

    // Effective to date validation
    if (formData.effective_to) {
      const effectiveFromDate = new Date(formData.effective_from);
      const effectiveToDate = new Date(formData.effective_to);
      
      if (effectiveToDate <= effectiveFromDate) {
        newErrors.effective_to = 'Effective to date must be after effective from date';
      }
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
        unit_rate: parseFloat(formData.unit_rate),
        effective_to: formData.effective_to || null
      };

      const result = await onSave(submitData);
      
      if (result?.success !== false) {
        // Success - form will be closed by parent
        setFormData({
          material: '',
          budget_tier: 'LUXURY',
          unit_rate: '',
          currency: 'INR',
          effective_from: new Date().toISOString().split('T')[0],
          effective_to: '',
          is_active: true
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save finish rate' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      material: '',
      budget_tier: 'LUXURY',
      unit_rate: '',
      currency: 'INR',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      is_active: true
    });
    setErrors({});
    onCancel();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Get material name for display
  const getSelectedMaterialName = () => {
    const selected = materials.find(m => m.id.toString() === formData.material.toString());
    return selected ? selected.name : '';
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-info">
            <DollarSign className="form-icon" />
            <h2 className="form-title">
              {finishRate ? 'Edit Finish Rate' : 'Add New Finish Rate'}
            </h2>
          </div>
          <button onClick={handleCancel} className="form-close-button">
            <X className="close-icon" />
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-body">
            {/* Material Selection */}
            <div className="form-group">
              <label className="form-label">
                Material *
              </label>
              <select
                className={`form-select ${errors.material ? 'error' : ''}`}
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                disabled={!!finishRate} // Disable when editing existing rate
              >
                <option value="">Select a material</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} ({material.role})
                  </option>
                ))}
              </select>
              {errors.material && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.material}
                </div>
              )}
              {finishRate && (
                <div className="form-note">
                  Material cannot be changed when editing an existing rate
                </div>
              )}
            </div>

            {/* Budget Tier Selection */}
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
              
              {/* Budget Tier Description */}
              <div className="tier-description">
                {formData.budget_tier === 'LUXURY' 
                  ? 'Premium quality materials and finishes for high-end projects'
                  : 'Cost-effective options for standard projects with good quality'
                }
              </div>
            </div>

            {/* Unit Rate */}
            <div className="form-group">
              <label className="form-label">
                Unit Rate (₹ per sq.ft) *
              </label>
              <div className="rate-input-container">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999"
                  className={`form-input rate-input ${errors.unit_rate ? 'error' : ''}`}
                  placeholder="Enter rate per square foot"
                  value={formData.unit_rate}
                  onChange={(e) => handleInputChange('unit_rate', e.target.value)}
                />
                <span className="rate-currency">₹/sq.ft</span>
              </div>
              {errors.unit_rate && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.unit_rate}
                </div>
              )}
              {formData.unit_rate && !errors.unit_rate && (
                <div className="rate-preview">
                  Preview: {formatCurrency(formData.unit_rate)} per square foot
                </div>
              )}
            </div>

            {/* Effective From Date */}
            <div className="form-group">
              <label className="form-label">
                Effective From *
              </label>
              <div className="date-input-container">
                <Calendar className="date-icon" />
                <input
                  type="date"
                  className={`form-input date-input ${errors.effective_from ? 'error' : ''}`}
                  value={formData.effective_from}
                  onChange={(e) => handleInputChange('effective_from', e.target.value)}
                  min={new Date(Date.now() - 86400000).toISOString().split('T')[0]} // Yesterday
                />
              </div>
              {errors.effective_from && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.effective_from}
                </div>
              )}
              <div className="form-note">
                Date when this rate becomes effective
              </div>
            </div>

            {/* Effective To Date */}
            <div className="form-group">
              <label className="form-label">
                Effective To
                <span className="label-optional">(Optional)</span>
              </label>
              <div className="date-input-container">
                <Calendar className="date-icon" />
                <input
                  type="date"
                  className={`form-input date-input ${errors.effective_to ? 'error' : ''}`}
                  value={formData.effective_to}
                  onChange={(e) => handleInputChange('effective_to', e.target.value)}
                  min={formData.effective_from}
                />
              </div>
              {errors.effective_to && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.effective_to}
                </div>
              )}
              <div className="form-note">
                Leave empty for open-ended rate (no expiration)
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

            {/* Active Status */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
                <div className="checkbox-content">
                  <span className="checkbox-text">Active Rate</span>
                  <p className="checkbox-description">
                    Inactive rates won't be used for quotation calculations
                  </p>
                </div>
              </label>
            </div>

            {/* Rate Preview Summary */}
            {getSelectedMaterialName() && formData.unit_rate && !errors.unit_rate && (
              <div className="rate-summary">
                <div className="summary-header">
                  <TrendingUp className="summary-icon" />
                  <span>Rate Summary</span>
                </div>
                <div className="summary-content">
                  <div className="summary-row">
                    <span className="summary-label">Material:</span>
                    <span className="summary-value">{getSelectedMaterialName()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Tier:</span>
                    <span className={`summary-value tier-${formData.budget_tier.toLowerCase()}`}>
                      {formData.budget_tier}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Rate:</span>
                    <span className="summary-value rate-highlight">
                      {formatCurrency(formData.unit_rate)}/sq.ft
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Valid:</span>
                    <span className="summary-value">
                      {new Date(formData.effective_from).toLocaleDateString('en-IN')} - 
                      {formData.effective_to 
                        ? new Date(formData.effective_to).toLocaleDateString('en-IN')
                        : 'Ongoing'
                      }
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
                  {finishRate ? 'Update Rate' : 'Create Rate'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishRateForm;