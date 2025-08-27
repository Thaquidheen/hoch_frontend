import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Package
} from 'lucide-react';
import './MaterialForm.css';

const MaterialForm = ({ 
  material = null, 
  isOpen = false, 
  onSave, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'BOTH',
    notes: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when material changes
  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        role: material.role || 'BOTH',
        notes: material.notes || '',
        is_active: material.is_active !== undefined ? material.is_active : true
      });
    } else {
      setFormData({
        name: '',
        role: 'BOTH',
        notes: '',
        is_active: true
      });
    }
    setErrors({});
  }, [material]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Material name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Material name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Material name must be less than 100 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Notes validation (optional but with max length)
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
      const result = await onSave(formData);
      
      if (result?.success !== false) {
        // Success - form will be closed by parent
        setFormData({ name: '', role: 'BOTH', notes: '', is_active: true });
        setErrors({});
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save material' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({ name: '', role: 'BOTH', notes: '', is_active: true });
    setErrors({});
    onCancel();
  };

  // Don't render if not open
  if (!isOpen) return null;

  const getRoleDescription = (role) => {
    const descriptions = {
      'BOTH': 'Material can be used for both cabinet construction and door finishing',
      'CABINET': 'Material is only used for cabinet body/carcass construction',
      'DOOR': 'Material is only used for door panels and shutters',
      'TOP': 'Material is only used for countertops and work surfaces'
    };
    return descriptions[role] || '';
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-info">
            <Package className="form-icon" />
            <h2 className="form-title">
              {material ? 'Edit Material' : 'Add New Material'}
            </h2>
          </div>
          <button onClick={handleCancel} className="form-close-button">
            <X className="close-icon" />
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-body">
            {/* Material Name */}
            <div className="form-group">
              <label className="form-label">
                Material Name *
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter material name (e.g., SS 304, PLY)"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={100}
              />
              {errors.name && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className={`form-select ${errors.role ? 'error' : ''}`}
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <option value="BOTH">BOTH - Can be used for cabinet and door</option>
                <option value="CABINET">CABINET - Only for cabinet construction</option>
                <option value="DOOR">DOOR - Only for door/shutter material</option>
                <option value="TOP">TOP - Only for countertop material</option>
              </select>
              {errors.role && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.role}
                </div>
              )}
              
              {/* Role Description */}
              <div className="role-description">
                {getRoleDescription(formData.role)}
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
                placeholder="Enter additional notes about this material..."
                rows="4"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                maxLength={500}
              />
              <div className="textarea-footer">
                {errors.notes ? (
                  <div className="form-error">
                    <AlertCircle className="error-icon" />
                    {errors.notes}
                  </div>
                ) : (
                  <div></div>
                )}
                <div className="character-count">
                  {formData.notes.length}/500 characters
                </div>
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
                  <span className="checkbox-text">Active Material</span>
                  <p className="checkbox-description">
                    Inactive materials won't appear in quotation forms
                  </p>
                </div>
              </label>
            </div>

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
                  {material ? 'Update Material' : 'Create Material'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialForm;