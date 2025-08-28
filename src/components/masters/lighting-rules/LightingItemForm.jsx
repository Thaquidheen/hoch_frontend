// src/components/masters/lighting-rules/LightingItemForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Lightbulb } from 'lucide-react';
import './LightingItemForm.css';

const LightingItemForm = ({
  isOpen,
  lightingItem,
  project,
  lightingRules,
  cabinetTypes,
  materials,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    project: project?.id,
    lighting_rule: '',
    cabinet_material: '',
    cabinet_type: '',
    wall_cabinet_width_mm: 0,
    base_cabinet_width_mm: 0,
    wall_cabinet_count: 0,
    work_top_length_mm: 0,
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data from existing item
  useEffect(() => {
    if (lightingItem) {
      setFormData({
        id: lightingItem.id,
        project: lightingItem.project || project?.id,
        lighting_rule: lightingItem.lighting_rule || '',
        cabinet_material: lightingItem.cabinet_material || '',
        cabinet_type: lightingItem.cabinet_type || '',
        wall_cabinet_width_mm: lightingItem.wall_cabinet_width_mm || 0,
        base_cabinet_width_mm: lightingItem.base_cabinet_width_mm || 0,
        wall_cabinet_count: lightingItem.wall_cabinet_count || 0,
        work_top_length_mm: lightingItem.work_top_length_mm || 0,
        is_active: lightingItem.is_active !== false
      });
    } else {
      setFormData({
        project: project?.id,
        lighting_rule: '',
        cabinet_material: '',
        cabinet_type: '',
        wall_cabinet_width_mm: 0,
        base_cabinet_width_mm: 0,
        wall_cabinet_count: 0,
        work_top_length_mm: 0,
        is_active: true
      });
    }
    setErrors({});
  }, [lightingItem, project]);
  
  // Filtered lighting rules based on selected material/type
  const filteredRules = formData.cabinet_material ? 
    lightingRules.filter(rule => {
      // Convert to numbers or use loose comparison for material
      const materialMatch = Number(rule.cabinet_material) === Number(formData.cabinet_material);
      
      // For cabinet type, modify the logic to:
      // 1. If no form cabinet type is selected, show all rules with matching material
      // 2. If form cabinet type is selected, only show rules with matching type or no type (general rules)
      const typeMatch = !formData.cabinet_type || // If no type selected in form
                       !rule.cabinet_type ||     // Or if rule applies to all types
                       Number(rule.cabinet_type) === Number(formData.cabinet_type); // Or if types match
                       
      const tierMatch = rule.budget_tier === project?.budget_tier;
      const customerMatch = rule.is_global || rule.customer === project?.customer;
      
      return materialMatch && typeMatch && tierMatch && customerMatch && rule.is_active;
    }) : [];
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cabinet_material) {
      newErrors.cabinet_material = 'Cabinet material is required';
    }
    
    if (!formData.lighting_rule) {
      newErrors.lighting_rule = 'Lighting rule is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        onCancel();
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save lighting item' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="lighting-item-form-overlay">
      <div className="lighting-item-form-container">
        <div className="lighting-form-header">
          <div className="lighting-header-info">
            <Lightbulb className="lighting-header-icon" />
            <h2 className="lighting-form-title">
              {lightingItem ? 'Edit Lighting Item' : 'Add Cabinet Lighting Item'}
            </h2>
          </div>
          <button onClick={onCancel} className="lighting-close-button" type="button">
            <X className="lighting-close-icon" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="lighting-form-content">
          <div className="lighting-form-body">
            {/* Material and Type Selection */}
            <div className="lighting-form-section">
              <h3 className="lighting-section-title">Cabinet Selection</h3>
              
              <div className="lighting-form-row">
                <div className="lighting-form-group">
                  <label className="lighting-form-label required">Cabinet Material</label>
                  <select
                    className={`lighting-light-form-select ${errors.cabinet_material ? 'error' : ''}`}
                    value={formData.cabinet_material}
                    onChange={(e) => handleInputChange('cabinet_material', e.target.value)}
                    disabled={loading || isSubmitting}
                  >
                    <option value="">Select cabinet material</option>
                    {materials.map(material => (
                      <option key={material.id} value={material.id}> 
                        {material.name}
                      </option>
                    ))}
                  </select>
                  {errors.cabinet_material && (
                    <div className="lighting-form-error">
                      <AlertCircle className="lighting-error-icon" />
                      {errors.cabinet_material}
                    </div>
                  )}
                </div>
                
                <div className="lighting-form-group">
                  <label className="lighting-form-label">Cabinet Type</label>
                  <select
                    className="lighting-form-select"
                    value={formData.cabinet_type}
                    onChange={(e) => handleInputChange('cabinet_type', e.target.value)}
                    disabled={loading || isSubmitting}
                  >
                    <option value="">All Cabinet Types</option>
                    {cabinetTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Lighting Rule Selection */}
            <div className="lighting-form-section">
              <h3 className="lighting-section-title">Lighting Rule</h3>
              
              <div className="lighting-form-group">
                <label className="lighting-form-label required">Lighting Rule</label>
                <select
                  className={`lighting-form-select ${errors.lighting_rule ? 'error' : ''}`}
                  value={formData.lighting_rule}
                  onChange={(e) => handleInputChange('lighting_rule', e.target.value)}
                  disabled={loading || isSubmitting}
                >
                  <option value="">Select lighting rule</option>
                  {filteredRules.map(rule => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name} {rule.is_global ? '(Global)' : '(Customer-specific)'}
                    </option>
                  ))}
                </select>
                {errors.lighting_rule && (
                  <div className="lighting-form-error">
                    <AlertCircle className="lighting-error-icon" />
                    {errors.lighting_rule}
                  </div>
                )}
                {formData.cabinet_material && filteredRules.length === 0 && (
                  <div className="lighting-form-note warning">
                    <AlertCircle className="lighting-error-icon" />
                    No applicable lighting rules found for this material and cabinet type.
                  </div>
                )}
              </div>
            </div>
            
            {/* Custom Dimensions */}
            <div className="lighting-form-section">
              <h3 className="lighting-section-title">Custom Dimensions</h3>
              <div className="lighting-form-note">
                These values default from line items, but can be overridden.
              </div>
              
              <div className="lighting-form-row">
                <div className="lighting-form-group">
                  <label className="lighting-form-label">Wall Cabinet Width (mm)</label>
                  <input
                    type="number"
                    className="lighting-form-input"
                    value={formData.wall_cabinet_width_mm}
                    onChange={(e) => handleInputChange('wall_cabinet_width_mm', parseInt(e.target.value) || 0)}
                    disabled={loading || isSubmitting}
                    min="0"
                    step="1"
                  />
                </div>
                
                <div className="lighting-form-group">
                  <label className="lighting-form-label">Base Cabinet Width (mm)</label>
                  <input
                    type="number"
                    className="lighting-form-input"
                    value={formData.base_cabinet_width_mm}
                    onChange={(e) => handleInputChange('base_cabinet_width_mm', parseInt(e.target.value) || 0)}
                    disabled={loading || isSubmitting}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              
              <div className="lighting-form-row">
                <div className="lighting-form-group">
                  <label className="lighting-form-label">Wall Cabinet Count</label>
                  <input
                    type="number"
                    className="lighting-form-input"
                    value={formData.wall_cabinet_count}
                    onChange={(e) => handleInputChange('wall_cabinet_count', parseInt(e.target.value) || 0)}
                    disabled={loading || isSubmitting}
                    min="0"
                    step="1"
                  />
                </div>
                
                <div className="lighting-form-group">
                  <label className="lighting-form-label">Work Top Length (mm)</label>
                  <input
                    type="number"
                    className="lighting-form-input"
                    value={formData.work_top_length_mm}
                    onChange={(e) => handleInputChange('work_top_length_mm', parseInt(e.target.value) || 0)}
                    disabled={loading || isSubmitting}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Error */}
            {errors.submit && (
              <div className="lighting-submit-error">
                <div className="lighting-error-content">
                  <AlertCircle className="lighting-error-icon" />
                  <span>{errors.submit}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="lighting-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="lighting-btn-cancel"
              disabled={loading || isSubmitting}
            >
              <X className="lighting-btn-icon" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="lighting-btn-submit"
            >
              {(loading || isSubmitting) ? (
                <>
                  <div className="lighting-btn-icon spinning" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%'
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="lighting-btn-icon" />
                  {lightingItem ? 'Update Item' : 'Add Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LightingItemForm;