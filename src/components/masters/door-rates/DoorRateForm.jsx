import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  DollarSign,
  Calendar,
  TrendingUp,
  Layers
} from 'lucide-react';
import './DoorRateForm.css';

const DoorRateForm = ({ 
  doorRate = null, 
  materials = [],
  isOpen = false, 
  onSave, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    material: '',
    unit_rate: '',
    currency: 'INR',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    is_active: true,
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when door rate changes
  useEffect(() => {
    if (doorRate) {
      setFormData({
        material: doorRate.material || '',
        unit_rate: doorRate.unit_rate || '',
        currency: doorRate.currency || 'INR',
        effective_from: doorRate.effective_from || new Date().toISOString().split('T')[0],
        effective_to: doorRate.effective_to || '',
        is_active: doorRate.is_active !== undefined ? doorRate.is_active : true,
        notes: doorRate.notes || ''
      });
    } else {
      setFormData({
        material: '',
        unit_rate: '',
        currency: 'INR',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [doorRate]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Material validation
    if (!formData.material) {
      newErrors.material = 'Material is required';
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

    // Notes validation (optional, but limit length)
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
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
        effective_to: formData.effective_to || null,
        notes: formData.notes.trim() || null
      };

      const result = await onSave(submitData);
      
      if (result?.success !== false) {
        // Success - form will be closed by parent
        setFormData({
          material: '',
          unit_rate: '',
          currency: 'INR',
          effective_from: new Date().toISOString().split('T')[0],
          effective_to: '',
          is_active: true,
          notes: ''
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save door rate' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      material: '',
      unit_rate: '',
      currency: 'INR',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      is_active: true,
      notes: ''
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

  // Get material type icon
  const getMaterialTypeIcon = (materialName) => {
    if (materialName?.toLowerCase().includes('wood') || materialName?.toLowerCase().includes('ply')) {
      return '🪵';
    } else if (materialName?.toLowerCase().includes('glass')) {
      return '🪟';
    } else if (materialName?.toLowerCase().includes('metal') || materialName?.toLowerCase().includes('steel')) {
      return '⚙️';
    } else if (materialName?.toLowerCase().includes('mdf') || materialName?.toLowerCase().includes('particle')) {
      return '📦';
    }
    return '🚪'; // Default door icon
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

  // Calculate estimated costs for common door sizes
  const getEstimatedCosts = () => {
    if (!formData.unit_rate || isNaN(parseFloat(formData.unit_rate))) return null;

    const rate = parseFloat(formData.unit_rate);
    const commonSizes = [
      { name: 'Standard Door', sqft: 21, description: '7ft x 3ft' },
      { name: 'Wide Door', sqft: 28, description: '7ft x 4ft' },
      { name: 'Double Door', sqft: 42, description: '7ft x 6ft' },
      { name: 'Large Door', sqft: 56, description: '8ft x 7ft' }
    ];

    return commonSizes.map(size => ({
      ...size,
      cost: rate * size.sqft
    }));
  };

  const estimatedCosts = getEstimatedCosts();

  return (
    <div className="form-overlay">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-info">
            <Layers className="form-icon" />
            <h2 className="form-title">
              {doorRate ? 'Edit Door Rate' : 'Add New Door Rate'}
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
                Door Material *
              </label>
              <select
                className={`form-select ${errors.material ? 'error' : ''}`}
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                disabled={!!doorRate} // Disable when editing existing rate
              >
                <option value="">Select a door material</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {getMaterialTypeIcon(material.name)} {material.name} ({material.role})
                  </option>
                ))}
              </select>
              {errors.material && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.material}
                </div>
              )}
              {doorRate && (
                <div className="form-note">
                  Material cannot be changed when editing an existing rate
                </div>
              )}
              <div className="form-note">
                Only materials with DOOR or BOTH roles are available for door rates
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

            {/* Estimated Costs */}
            {estimatedCosts && (
              <div className="estimated-costs">
                <div className="costs-header">
                  <DollarSign className="costs-icon" />
                  <span>Estimated Door Costs</span>
                </div>
                <div className="costs-grid">
                  {estimatedCosts.map((estimate, index) => (
                    <div key={index} className="cost-item">
                      <div className="cost-name">{estimate.name}</div>
                      <div className="cost-description">{estimate.description}</div>
                      <div className="cost-amount">{formatCurrency(estimate.cost)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">
                Notes
                <span className="label-optional">(Optional)</span>
              </label>
              <textarea
                className={`form-textarea ${errors.notes ? 'error' : ''}`}
                placeholder="Add any additional notes about this door rate..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows="3"
                maxLength="500"
              />
              {errors.notes && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.notes}
                </div>
              )}
              <div className="form-note">
                {formData.notes.length}/500 characters
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
                    <span className="summary-value">
                      {getMaterialTypeIcon(getSelectedMaterialName())} {getSelectedMaterialName()}
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
                  <div className="summary-row">
                    <span className="summary-label">Status:</span>
                    <span className={`summary-value status-${formData.is_active ? 'active' : 'inactive'}`}>
                      {formData.is_active ? 'Active' : 'Inactive'}
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
                  {doorRate ? 'Update Rate' : 'Create Rate'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorRateForm;