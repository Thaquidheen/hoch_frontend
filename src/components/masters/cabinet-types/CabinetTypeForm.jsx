// Updated CabinetTypeForm.jsx - Remove depth field and fix category mapping

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Package,
  Calendar,
  Ruler,
  Tag,
  FileText,
  Copy
} from 'lucide-react';
import './CabinetTypeForm.css';

const CabinetTypeForm = ({ 
  cabinetType = null, 
  categories = [],
  isOpen = false, 
  onSave, 
  onCancel,
  loading = false,
  getCategoryIcon,
  getCategoryColor
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '', // Will store category ID
    description: '',
    is_active: true,
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when cabinet type changes
  useEffect(() => {
    if (cabinetType) {
      setFormData({
        name: cabinetType.name || '',
        category: cabinetType.category || '', // This should be the category ID
        description: cabinetType.description || '',
        is_active: cabinetType.is_active !== undefined ? cabinetType.is_active : true,
        notes: cabinetType.notes || ''
      });
    } else {
      // Set first category as default if available
      const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
      setFormData({
        name: '',
        category: defaultCategoryId,
        description: '',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [cabinetType, categories]);

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Cabinet type name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 150) {
      newErrors.name = 'Name must be less than 150 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Description validation (optional, but limit length)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Notes validation (optional, but limit length)
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
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
        name: formData.name.trim(),
        category: parseInt(formData.category), // Ensure it's an integer
        description: formData.description.trim() || '',
        is_active: formData.is_active
      };

      const result = await onSave(submitData);
      
      if (result?.success !== false) {
        // Success - form will be closed by parent
        const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
        setFormData({
          name: '',
          category: defaultCategoryId,
          description: '',
          is_active: true,
          notes: ''
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save cabinet type' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
    setFormData({
      name: '',
      category: defaultCategoryId,
      description: '',
      is_active: true,
      notes: ''
    });
    setErrors({});
    onCancel();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Get selected category info
  const getSelectedCategory = () => {
    return categories.find(c => c.id.toString() === formData.category.toString()) || 
           categories[0] || { id: '', name: '', description: '' };
  };

  const selectedCategory = getSelectedCategory();

  return (
    <div className="form-overlay">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-info">
            <Package className="form-icon" />
            <h2 className="form-title">
              {cabinetType ? 'Edit Cabinet Type' : 'Add New Cabinet Type'}
            </h2>
          </div>
          <button onClick={handleCancel} className="form-close-button">
            <X className="close-icon" />
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-body">
            {/* Cabinet Type Name */}
            <div className="form-group">
              <label className="form-label">
                Cabinet Type Name *
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter cabinet type name (e.g., Base 24, Wall 36)"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength="150"
              />
              {errors.name && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.name}
                </div>
              )}
              <div className="form-note">
                Choose a descriptive name that identifies this cabinet type clearly
              </div>
            </div>

            {/* Category Selection */}
            <div className="form-group">
              <label className="form-label">
                Category *
              </label>
              <select
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.category}
                </div>
              )}
              
              {/* Category Description */}
              {selectedCategory && selectedCategory.description && (
                <div className="category-info">
                  <div className="category-preview">
                    <div className="category-details">
                      <span className="category-name">{selectedCategory.name}</span>
                      <span className="category-desc">{selectedCategory.description}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description
                <span className="label-optional">(Optional)</span>
              </label>
              <textarea
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe this cabinet type's purpose and characteristics..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
                maxLength="500"
              />
              {errors.description && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.description}
                </div>
              )}
              <div className="form-note">
                {formData.description.length}/500 characters
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
                  <span className="checkbox-text">Active Cabinet Type</span>
                  <p className="checkbox-description">
                    Inactive cabinet types won't be available for selection in quotations
                  </p>
                </div>
              </label>
            </div>

            {/* Cabinet Type Preview */}
            {formData.name && selectedCategory && (
              <div className="cabinet-preview">
                <div className="preview-header">
                  <Package className="preview-icon" />
                  <span>Cabinet Type Preview</span>
                </div>
                <div className="preview-content">
                  <div className="preview-card">
                    <div className="preview-category">
                      <span className="preview-category-name">{selectedCategory.name}</span>
                    </div>
                    <div className="preview-name">{formData.name}</div>
                    {formData.description && (
                      <div className="preview-description">{formData.description}</div>
                    )}
                    <div className="preview-specs">
                      <div className="preview-spec">
                        <Tag className="preview-spec-icon" />
                        <span>Status: {formData.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
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
                  {cabinetType ? 'Update Cabinet Type' : 'Create Cabinet Type'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinetTypeForm;