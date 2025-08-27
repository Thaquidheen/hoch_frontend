import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Ruler,
  Package,
  DollarSign,
  Calculator,
  Layers,
  Hash,
  Eye
} from 'lucide-react';
import './LineItemForm.css';

const LineItemForm = ({ 
  lineItem = null,
  project = null,
  cabinetTypes = [],
  cabinetMaterials = [],
  doorMaterials = [],
  isOpen = false, 
  onSave, 
  onCancel,
  onPreviewCalculation,
  loading = false,
  calculating = false
}) => {
  const [formData, setFormData] = useState({
    cabinet_type: '',
    scope: 'OPEN',
    width_mm: '',
    depth_mm: '',
    height_mm: '',
    qty: '1',
    cabinet_material: '',
    door_material: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingPreview, setPricingPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Initialize form data when line item changes
  useEffect(() => {
    if (lineItem) {
      setFormData({
        cabinet_type: lineItem.cabinet_type || '',
        scope: lineItem.scope || 'OPEN',
        width_mm: lineItem.width_mm || '',
        depth_mm: lineItem.depth_mm || '',
        height_mm: lineItem.height_mm || '',
        qty: lineItem.qty || '1',
        cabinet_material: lineItem.cabinet_material || '',
        door_material: lineItem.door_material || '',
        remarks: lineItem.remarks || ''
      });
    } else {
      // Set default dimensions based on scope
      const defaultDepth = '600';
      const defaultHeight = '850';
      
      setFormData({
        cabinet_type: '',
        scope: 'OPEN',
        width_mm: '',
        depth_mm: defaultDepth,
        height_mm: defaultHeight,
        qty: '1',
        cabinet_material: '',
        door_material: '',
        remarks: ''
      });
    }
    setErrors({});
    setPricingPreview(null);
  }, [lineItem]);

  // Update default dimensions when cabinet type changes
  useEffect(() => {
    if (formData.cabinet_type && cabinetTypes.length > 0) {
      const selectedType = cabinetTypes.find(ct => ct.id.toString() === formData.cabinet_type.toString());
      if (selectedType && selectedType.default_depth && !lineItem) {
        setFormData(prev => ({
          ...prev,
          depth_mm: selectedType.default_depth.toString()
        }));
      }
    }
  }, [formData.cabinet_type, cabinetTypes, lineItem]);

  // Auto-calculate pricing when dimensions or materials change
  useEffect(() => {
    const shouldCalculate = formData.cabinet_type && 
                           formData.width_mm && 
                           formData.depth_mm && 
                           formData.height_mm && 
                           formData.cabinet_material && 
                           formData.door_material &&
                           project;

    if (shouldCalculate) {
      calculatePreview();
    } else {
      setPricingPreview(null);
    }
  }, [
    formData.cabinet_type,
    formData.width_mm,
    formData.depth_mm,
    formData.height_mm,
    formData.qty,
    formData.cabinet_material,
    formData.door_material,
    project
  ]);

  // Calculate pricing preview
  const calculatePreview = async () => {
    if (!onPreviewCalculation) return;

    try {
      setPreviewLoading(true);
      const calculationData = {
        cabinet_type_id: formData.cabinet_type,
        width_mm: parseInt(formData.width_mm),
        depth_mm: parseInt(formData.depth_mm),
        height_mm: parseInt(formData.height_mm),
        qty: parseInt(formData.qty),
        cabinet_material_id: formData.cabinet_material,
        door_material_id: formData.door_material,
        budget_tier: project.budget_tier,
        brand_name: project.brand_detail?.name || 'Default'
      };

      const result = await onPreviewCalculation(calculationData);
      if (result.success) {
        setPricingPreview(result.data);
      }
    } catch (error) {
      console.error('Preview calculation error:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Cabinet type validation
    if (!formData.cabinet_type) {
      newErrors.cabinet_type = 'Cabinet type is required';
    }

    // Dimensions validation
    if (!formData.width_mm) {
      newErrors.width_mm = 'Width is required';
    } else if (parseInt(formData.width_mm) < 50 || parseInt(formData.width_mm) > 5000) {
      newErrors.width_mm = 'Width must be between 50mm and 5000mm';
    }

    if (!formData.depth_mm) {
      newErrors.depth_mm = 'Depth is required';
    } else if (parseInt(formData.depth_mm) < 50 || parseInt(formData.depth_mm) > 1000) {
      newErrors.depth_mm = 'Depth must be between 50mm and 1000mm';
    }

    if (!formData.height_mm) {
      newErrors.height_mm = 'Height is required';
    } else if (parseInt(formData.height_mm) < 50 || parseInt(formData.height_mm) > 3000) {
      newErrors.height_mm = 'Height must be between 50mm and 3000mm';
    }

    if (!formData.qty) {
      newErrors.qty = 'Quantity is required';
    } else if (parseInt(formData.qty) < 1 || parseInt(formData.qty) > 100) {
      newErrors.qty = 'Quantity must be between 1 and 100';
    }

    // Materials validation
    if (!formData.cabinet_material) {
      newErrors.cabinet_material = 'Cabinet material is required';
    }

    if (!formData.door_material) {
      newErrors.door_material = 'Door material is required';
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
        width_mm: parseInt(formData.width_mm),
        depth_mm: parseInt(formData.depth_mm),
        height_mm: parseInt(formData.height_mm),
        qty: parseInt(formData.qty)
      };

      const result = await onSave(submitData);
      
      if (result?.success !== false) {
        // Success - form will be closed by parent
        handleCancel();
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save line item' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      cabinet_type: '',
      scope: 'OPEN',
      width_mm: '',
      depth_mm: '600',
      height_mm: '850',
      qty: '1',
      cabinet_material: '',
      door_material: '',
      remarks: ''
    });
    setErrors({});
    setPricingPreview(null);
    onCancel();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Get selected cabinet type name
  const getSelectedCabinetTypeName = () => {
    const selected = cabinetTypes.find(ct => ct.id.toString() === formData.cabinet_type.toString());
    return selected ? selected.name : '';
  };

  // Get selected material names
  const getSelectedCabinetMaterialName = () => {
    const selected = cabinetMaterials.find(m => m.id.toString() === formData.cabinet_material.toString());
    return selected ? selected.name : '';
  };

  const getSelectedDoorMaterialName = () => {
    const selected = doorMaterials.find(m => m.id.toString() === formData.door_material.toString());
    return selected ? selected.name : '';
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format dimensions
  const formatDimensions = () => {
    if (formData.width_mm && formData.depth_mm && formData.height_mm) {
      return `${formData.width_mm}×${formData.depth_mm}×${formData.height_mm}mm`;
    }
    return '';
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-header-info">
            <Package className="form-icon" />
            <h2 className="form-title">
              {lineItem ? 'Edit Cabinet Line Item' : 'Add Cabinet Line Item'}
            </h2>
          </div>
          <button onClick={handleCancel} className="form-close-button">
            <X className="close-icon" />
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-body">
            {/* Cabinet Type & Scope */}
            <div className="form-section">
              <h3 className="section-title">
                <Package className="section-icon" />
                Cabinet Specification
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cabinet Type *</label>
                  <select
                    className={`form-select ${errors.cabinet_type ? 'error' : ''}`}
                    value={formData.cabinet_type}
                    onChange={(e) => handleInputChange('cabinet_type', e.target.value)}
                  >
                    <option value="">Select cabinet type</option>
                    {cabinetTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description || 'No description'}
                      </option>
                    ))}
                  </select>
                  {errors.cabinet_type && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.cabinet_type}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Scope *</label>
                  <select
                    className="form-select"
                    value={formData.scope}
                    onChange={(e) => handleInputChange('scope', e.target.value)}
                  >
                    <option value="OPEN">Open Kitchen</option>
                    <option value="WORKING">Working Kitchen</option>
                  </select>
                  <div className="form-note">
                    {formData.scope === 'OPEN' 
                      ? 'Visible cabinet with finished surfaces'
                      : 'Functional cabinet with working specifications'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="form-section">
              <h3 className="section-title">
                <Ruler className="section-icon" />
                Dimensions & Quantity
              </h3>

              <div className="dimensions-grid">
                <div className="form-group">
                  <label className="form-label">Width (mm) *</label>
                  <div className="dimension-input-container">
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      className={`form-input dimension-input ${errors.width_mm ? 'error' : ''}`}
                      placeholder="450"
                      value={formData.width_mm}
                      onChange={(e) => handleInputChange('width_mm', e.target.value)}
                    />
                    <span className="dimension-unit">mm</span>
                  </div>
                  {errors.width_mm && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.width_mm}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Depth (mm) *</label>
                  <div className="dimension-input-container">
                    <input
                      type="number"
                      min="50"
                      max="1000"
                      className={`form-input dimension-input ${errors.depth_mm ? 'error' : ''}`}
                      placeholder="600"
                      value={formData.depth_mm}
                      onChange={(e) => handleInputChange('depth_mm', e.target.value)}
                    />
                    <span className="dimension-unit">mm</span>
                  </div>
                  {errors.depth_mm && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.depth_mm}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Height (mm) *</label>
                  <div className="dimension-input-container">
                    <input
                      type="number"
                      min="50"
                      max="3000"
                      className={`form-input dimension-input ${errors.height_mm ? 'error' : ''}`}
                      placeholder="850"
                      value={formData.height_mm}
                      onChange={(e) => handleInputChange('height_mm', e.target.value)}
                    />
                    <span className="dimension-unit">mm</span>
                  </div>
                  {errors.height_mm && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.height_mm}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <div className="quantity-input-container">
                    <Hash className="quantity-icon" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className={`form-input quantity-input ${errors.qty ? 'error' : ''}`}
                      placeholder="1"
                      value={formData.qty}
                      onChange={(e) => handleInputChange('qty', e.target.value)}
                    />
                    <span className="quantity-unit">pcs</span>
                  </div>
                  {errors.qty && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.qty}
                    </div>
                  )}
                </div>
              </div>

              {/* Dimensions Preview */}
              {formatDimensions() && (
                <div className="dimensions-preview">
                  <Ruler className="preview-icon" />
                  <span className="preview-text">
                    Dimensions: {formatDimensions()} × {formData.qty} pc{formData.qty > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Materials */}
            <div className="form-section">
              <h3 className="section-title">
                <Layers className="section-icon" />
                Material Selection
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cabinet Material *</label>
                  <select
                    className={`form-select ${errors.cabinet_material ? 'error' : ''}`}
                    value={formData.cabinet_material}
                    onChange={(e) => handleInputChange('cabinet_material', e.target.value)}
                  >
                    <option value="">Select cabinet material</option>
                    {cabinetMaterials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.role})
                      </option>
                    ))}
                  </select>
                  {errors.cabinet_material && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.cabinet_material}
                    </div>
                  )}
                  <div className="form-note">
                    Material for cabinet body and internal structure
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Door Material *</label>
                  <select
                    className={`form-select ${errors.door_material ? 'error' : ''}`}
                    value={formData.door_material}
                    onChange={(e) => handleInputChange('door_material', e.target.value)}
                  >
                    <option value="">Select door material</option>
                    {doorMaterials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.role})
                      </option>
                    ))}
                  </select>
                  {errors.door_material && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.door_material}
                    </div>
                  )}
                  <div className="form-note">
                    Material for cabinet doors and visible surfaces
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            {(pricingPreview || previewLoading) && (
              <div className="form-section">
                <h3 className="section-title">
                  <Calculator className="section-icon" />
                  Price Calculation Preview
                </h3>

                {previewLoading ? (
                  <div className="pricing-loading">
                    <Loader2 className="loading-icon spinning" />
                    <span>Calculating pricing...</span>
                  </div>
                ) : pricingPreview && (
                  <div className="pricing-preview">
                    <div className="pricing-grid">
                      <div className="pricing-item">
                        <span className="pricing-label">Cabinet Area:</span>
                        <span className="pricing-value">
                          {parseFloat(pricingPreview.cabinet_sqft || 0).toFixed(2)} sq.ft
                        </span>
                      </div>
                      <div className="pricing-item">
                        <span className="pricing-label">Door Area:</span>
                        <span className="pricing-value">
                          {parseFloat(pricingPreview.door_sqft || 0).toFixed(2)} sq.ft
                        </span>
                      </div>
                      <div className="pricing-item">
                        <span className="pricing-label">Cabinet Cost:</span>
                        <span className="pricing-value">
                          {formatCurrency(pricingPreview.cabinet_material_price || 0)}
                        </span>
                      </div>
                      <div className="pricing-item">
                        <span className="pricing-label">Door Cost:</span>
                        <span className="pricing-value">
                          {formatCurrency(pricingPreview.door_price || 0)}
                        </span>
                      </div>
                      <div className="pricing-item">
                        <span className="pricing-label">Hardware:</span>
                        <span className="pricing-value">
                          {formatCurrency(pricingPreview.standard_accessory_charge || 0)}
                        </span>
                      </div>
                      <div className="pricing-item total">
                        <span className="pricing-label">Line Total:</span>
                        <span className="pricing-value">
                          {formatCurrency(pricingPreview.line_total_before_tax || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="pricing-note">
                      Pricing calculated for {project?.budget_tier} tier with {project?.brand_detail?.name || 'selected'} brand
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remarks */}
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add any special requirements or notes for this cabinet..."
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                />
                <div className="form-note">
                  Optional notes about special requirements, modifications, or installation notes
                </div>
              </div>
            </div>

            {/* Line Item Summary */}
            {getSelectedCabinetTypeName() && getSelectedCabinetMaterialName() && getSelectedDoorMaterialName() && (
              <div className="line-item-summary">
                <div className="summary-header">
                  <Eye className="summary-icon" />
                  <span>Line Item Summary</span>
                </div>
                <div className="summary-content">
                  <div className="summary-row">
                    <span className="summary-label">Cabinet Type:</span>
                    <span className="summary-value">{getSelectedCabinetTypeName()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Scope:</span>
                    <span className="summary-value">{formData.scope} Kitchen</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Dimensions:</span>
                    <span className="summary-value">{formatDimensions()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Quantity:</span>
                    <span className="summary-value">{formData.qty} pc{formData.qty > 1 ? 's' : ''}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Cabinet Material:</span>
                    <span className="summary-value">{getSelectedCabinetMaterialName()}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Door Material:</span>
                    <span className="summary-value">{getSelectedDoorMaterialName()}</span>
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
              disabled={isSubmitting || calculating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || loading || calculating}
              className="btn-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="btn-icon spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="btn-icon" />
                  {lineItem ? 'Update Line Item' : 'Add Line Item'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItemForm;