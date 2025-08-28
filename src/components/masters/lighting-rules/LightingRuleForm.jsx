import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Lightbulb,
  Settings,
  DollarSign,
  Calendar,
  User,
  Globe,
  Package,
  Zap,
  Calculator,
  Home,
  Building,
  Layers
} from 'lucide-react';

const LightingRuleForm = ({ 
  lightingRule = null,
  materials = [],
  customers = [],
  cabinetTypes = [],
  isOpen = false, 
  onSave, 
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
  name: '',
  cabinet_material: '',
  cabinet_type: '',       // Added field
  calc_method: 'PER_WIDTH', // Added field with default value
  customer: '',
  is_global: true,
  budget_tier: 'LUXURY',
    
    // Pricing
    led_strip_rate_per_mm: '2.0',
    spot_light_rate_per_cabinet: '500',
    currency: 'INR',
    
    // Category Applications (Multi-Category System)
    applies_to_wall_cabinets: true,
    applies_to_base_cabinets: true,
    applies_to_work_top: true,
    applies_to_tall_cabinets: false,
    
    // Specifications
    led_specification: 'COB LED strips with aluminum profile and diffuser, 24V, warm white 3000K',
    spot_light_specification: '3W LED spot lights, warm white 3000K, adjustable beam angle',
    
    // Category-specific specifications
    wall_specification: 'Under-cabinet LED strips with spot lights inside cabinets',
    base_specification: 'LED strips on skirting for luxury tier',
    work_top_specification: 'LED strips on work top nosing edge',
    tall_specification: 'Internal LED strips for pantry and storage areas',
    
    // Dates
    effective_from: '',
    effective_to: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [testDimensions, setTestDimensions] = useState({
    wall_width_mm: 3000,
    base_width_mm: 6000,
    work_top_length_mm: 6000,
    wall_cabinet_count: 8
  });

  // Initialize form data
  useEffect(() => {
    if (lightingRule) {
      setFormData({
        name: lightingRule.name || '',
        cabinet_material: lightingRule.cabinet_material || '',
        customer: lightingRule.customer || '',
        is_global: lightingRule.is_global !== false,
        budget_tier: lightingRule.budget_tier || 'LUXURY',
        led_strip_rate_per_mm: lightingRule.led_strip_rate_per_mm || '2.0',
        spot_light_rate_per_cabinet: lightingRule.spot_light_rate_per_cabinet || '500',
        currency: lightingRule.currency || 'INR',
        applies_to_wall_cabinets: lightingRule.applies_to_wall_cabinets !== false,
        applies_to_base_cabinets: lightingRule.applies_to_base_cabinets !== false,
        applies_to_work_top: lightingRule.applies_to_work_top !== false,
        applies_to_tall_cabinets: lightingRule.applies_to_tall_cabinets === true,
        led_specification: lightingRule.led_specification || 'COB LED strips with aluminum profile and diffuser, 24V, warm white 3000K',
        spot_light_specification: lightingRule.spot_light_specification || '3W LED spot lights, warm white 3000K, adjustable beam angle',
        wall_specification: lightingRule.wall_specification || 'Under-cabinet LED strips with spot lights inside cabinets',
        base_specification: lightingRule.base_specification || 'LED strips on skirting for luxury tier',
        work_top_specification: lightingRule.work_top_specification || 'LED strips on work top nosing edge',
        tall_specification: lightingRule.tall_specification || 'Internal LED strips for pantry and storage areas',
        effective_from: lightingRule.effective_from || '',
        effective_to: lightingRule.effective_to || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        effective_from: today
      }));
    }
    setErrors({});
  }, [lightingRule]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (!formData.cabinet_material) {
    newErrors.cabinet_material = 'Cabinet material is required';
  }
  
  if (!formData.cabinet_type) {
    newErrors.cabinet_type = 'Cabinet type is required';
  }
  
  if (!formData.calc_method) {
    newErrors.calc_method = 'Calculation method is required';
  }

    if (!formData.is_global && !formData.customer) {
      newErrors.customer = 'Customer is required for customer-specific rules';
    }

    if (!formData.led_strip_rate_per_mm) {
      newErrors.led_strip_rate_per_mm = 'LED strip rate is required';
    } else if (parseFloat(formData.led_strip_rate_per_mm) < 0) {
      newErrors.led_strip_rate_per_mm = 'LED strip rate must be positive';
    }

    if (!formData.spot_light_rate_per_cabinet) {
      newErrors.spot_light_rate_per_cabinet = 'Spot light rate is required';
    } else if (parseFloat(formData.spot_light_rate_per_cabinet) < 0) {
      newErrors.spot_light_rate_per_cabinet = 'Spot light rate must be positive';
    }

    if (!formData.effective_from) {
      newErrors.effective_from = 'Effective from date is required';
    }

    if (formData.effective_from && formData.effective_to) {
      if (new Date(formData.effective_to) < new Date(formData.effective_from)) {
        newErrors.effective_to = 'End date must be after start date';
      }
    }

    // At least one category must be selected
    if (!formData.applies_to_wall_cabinets && !formData.applies_to_base_cabinets && 
        !formData.applies_to_work_top && !formData.applies_to_tall_cabinets) {
      newErrors.category_applications = 'At least one category must be selected';
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

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle rule scope change
  const handleScopeChange = (isGlobal) => {
    setFormData(prev => ({
      ...prev,
      is_global: isGlobal,
      customer: isGlobal ? '' : prev.customer
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        cabinet_material: formData.cabinet_material,  // Make sure this is the ID
      cabinet_type: formData.cabinet_type,          // Make sure this is the ID
      calc_method: formData.calc_method,            // Required field
        led_strip_rate_per_mm: parseFloat(formData.led_strip_rate_per_mm),
        spot_light_rate_per_cabinet: parseFloat(formData.spot_light_rate_per_cabinet),
        customer: formData.is_global ? null : formData.customer
      };

      if (!submitData.effective_to) {
        delete submitData.effective_to;
      }

      const result = await onSave(submitData);
      
      if (result?.success !== false) {
        handleCancel();
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save lighting rule' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: '',
      cabinet_material: '',
      customer: '',
      is_global: true,
      budget_tier: 'LUXURY',
      led_strip_rate_per_mm: '2.0',
      spot_light_rate_per_cabinet: '500',
      currency: 'INR',
      applies_to_wall_cabinets: true,
      applies_to_base_cabinets: true,
      applies_to_work_top: true,
      applies_to_tall_cabinets: false,
      led_specification: 'COB LED strips with aluminum profile and diffuser, 24V, warm white 3000K',
      spot_light_specification: '3W LED spot lights, warm white 3000K, adjustable beam angle',
      wall_specification: 'Under-cabinet LED strips with spot lights inside cabinets',
      base_specification: 'LED strips on skirting for luxury tier',
      work_top_specification: 'LED strips on work top nosing edge',
      tall_specification: 'Internal LED strips for pantry and storage areas',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: ''
    });
    setErrors({});
    setShowPreview(false);
    onCancel();
  };

  // Calculate preview costs
  const calculatePreview = () => {
    const ledRate = parseFloat(formData.led_strip_rate_per_mm) || 0;
    const spotRate = parseFloat(formData.spot_light_rate_per_cabinet) || 0;

    let totalLedCost = 0;
    let totalSpotCost = 0;

    const breakdown = {
      wall_led: 0,
      wall_spot: 0,
      base_led: 0,
      work_top_led: 0,
      tall_led: 0
    };

    // Wall Cabinet Calculations
    if (formData.applies_to_wall_cabinets) {
      breakdown.wall_led = testDimensions.wall_width_mm * ledRate;
      breakdown.wall_spot = testDimensions.wall_cabinet_count * spotRate;
      totalLedCost += breakdown.wall_led;
      totalSpotCost += breakdown.wall_spot;
    }

    // Base Cabinet Calculations (Luxury tier or specific customer rule)
    if (formData.applies_to_base_cabinets) {
      if (formData.budget_tier === 'LUXURY' || !formData.is_global) {
        breakdown.base_led = testDimensions.base_width_mm * ledRate;
        totalLedCost += breakdown.base_led;
      }
    }

    // Work Top Calculations
    if (formData.applies_to_work_top) {
      breakdown.work_top_led = testDimensions.work_top_length_mm * ledRate;
      totalLedCost += breakdown.work_top_led;
    }

    // Tall Cabinet Calculations (if enabled)
    if (formData.applies_to_tall_cabinets) {
      breakdown.tall_led = 1000 * ledRate; // Assuming 1 meter per tall cabinet
      totalLedCost += breakdown.tall_led;
    }

    return {
      led_cost: totalLedCost,
      spot_cost: totalSpotCost,
      total_cost: totalLedCost + totalSpotCost,
      breakdown
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: formData.currency || 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const previewData = showPreview ? calculatePreview() : null;

  if (!isOpen) return null;

  return (
    <div className="lighting-rule-form-overlay">
      <div className="lighting-rule-form-container">
        {/* Header */}
        <div className="form-header">
          <div className="header-info">
            <Lightbulb className="header-icon" />
            <h2 className="form-title">
              {lightingRule ? 'Edit Lighting Rule' : 'Create Multi-Category Lighting Rule'}
            </h2>
          </div>
          <button onClick={handleCancel} className="close-button">
            <X className="close-icon" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-body">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">
                <Settings className="section-icon" />
                Basic Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rule Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., SS304 Luxury Multi-Category Rule"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Cabinet Material *</label>
                 <select
  className={`form-select ${errors.cabinet_material ? 'error' : ''}`}
  value={formData.cabinet_material}
  onChange={(e) => handleInputChange('cabinet_material', e.target.value)}
>
  <option value="">Select cabinet material</option>
  {materials.map(material => (
    <option key={material.id} value={material.id}>  // CORRECT - using ID as value
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
                </div>
              </div>
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
        {type.name}
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
  <label className="form-label">Calculation Method *</label>
  <select
    className={`form-select ${errors.calc_method ? 'error' : ''}`}
    value={formData.calc_method}
    onChange={(e) => handleInputChange('calc_method', e.target.value)}
  >
    <option value="">Select calculation method</option>
    <option value="PER_WIDTH">Per Cabinet Width (mm)</option>
    <option value="PER_LM">Per Linear Meter</option>
    <option value="FLAT_RATE">Flat Rate per Cabinet</option>
    <option value="WALL_ONLY">Wall Cabinets Only</option>
  </select>
  {errors.calc_method && (
    <div className="form-error">
      <AlertCircle className="error-icon" />
      {errors.calc_method}
    </div>
  )}
</div>
              {/* Rule Scope */}
              <div className="form-group">
                <label className="form-label">Rule Scope *</label>
                <div className="scope-selection">
                  <label className="scope-option">
                    <input
                      type="radio"
                      name="scope"
                      checked={formData.is_global}
                      onChange={() => handleScopeChange(true)}
                    />
                    <Globe className="scope-icon" />
                    <div className="scope-details">
                      <span className="scope-title">Customer-Specific Rule</span>
                      <span className="scope-description">Custom lighting applications for specific customer</span>
                    </div>
                  </label>
                </div>

                {!formData.is_global && (
                  <div className="form-group">
                    <label className="form-label">Customer *</label>
                    <select
                      className={`form-select ${errors.customer ? 'error' : ''}`}
                      value={formData.customer}
                      onChange={(e) => handleInputChange('customer', e.target.value)}
                    >
                      <option value="">Select customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    {errors.customer && (
                      <div className="form-error">
                        <AlertCircle className="error-icon" />
                        {errors.customer}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Budget Tier *</label>
                  <select
                    className="form-select"
                    value={formData.budget_tier}
                    onChange={(e) => handleInputChange('budget_tier', e.target.value)}
                  >
                    <option value="LUXURY">Luxury</option>
                    <option value="ECONOMY">Economy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Configuration */}
            <div className="form-section">
              <h3 className="section-title">
                <DollarSign className="section-icon" />
                Pricing Configuration
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">LED Strip Rate (per mm) *</label>
                  <div className="currency-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      className={`form-input currency-input ${errors.led_strip_rate_per_mm ? 'error' : ''}`}
                      placeholder="2.0"
                      value={formData.led_strip_rate_per_mm}
                      onChange={(e) => handleInputChange('led_strip_rate_per_mm', e.target.value)}
                    />
                    <span className="currency-unit">per mm</span>
                  </div>
                  {errors.led_strip_rate_per_mm && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.led_strip_rate_per_mm}
                    </div>
                  )}
                  <div className="form-note">
                    Rate per millimeter of LED strips 
                    {formData.led_strip_rate_per_mm && 
                      ` (₹${(parseFloat(formData.led_strip_rate_per_mm) * 1000).toFixed(0)} per meter)`
                    }
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Spot Light Rate (per cabinet) *</label>
                  <div className="currency-input-container">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-input currency-input ${errors.spot_light_rate_per_cabinet ? 'error' : ''}`}
                      placeholder="500"
                      value={formData.spot_light_rate_per_cabinet}
                      onChange={(e) => handleInputChange('spot_light_rate_per_cabinet', e.target.value)}
                    />
                    <span className="currency-unit">per cabinet</span>
                  </div>
                  {errors.spot_light_rate_per_cabinet && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.spot_light_rate_per_cabinet}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multi-Category Applications */}
            <div className="form-section">
              <h3 className="section-title">
                <Package className="section-icon" />
                Multi-Category Applications
              </h3>

              <div className="category-grid">
                <div className="category-card">
                  <div className="category-header">
                    <Home className="category-icon wall" />
                    <span className="category-name">Wall Cabinets</span>
                  </div>
                  <div className="category-content">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.applies_to_wall_cabinets}
                        onChange={(e) => handleInputChange('applies_to_wall_cabinets', e.target.checked)}
                      />
                      <span className="checkbox-checkmark"></span>
                      <span className="checkbox-label">Apply lighting</span>
                    </label>
                    <div className="category-description">
                      LED strips underneath + spot lights inside cabinets
                    </div>
                    <textarea
                      className="category-spec"
                      placeholder="Wall cabinet lighting specifications..."
                      value={formData.wall_specification}
                      onChange={(e) => handleInputChange('wall_specification', e.target.value)}
                      rows="2"
                    />
                  </div>
                </div>

                <div className="category-card">
                  <div className="category-header">
                    <Building className="category-icon base" />
                    <span className="category-name">Base Cabinets</span>
                  </div>
                  <div className="category-content">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.applies_to_base_cabinets}
                        onChange={(e) => handleInputChange('applies_to_base_cabinets', e.target.checked)}
                      />
                      <span className="checkbox-checkmark"></span>
                      <span className="checkbox-label">Apply skirting LEDs</span>
                    </label>
                    <div className="category-description">
                      LED strips on skirting (typically luxury tier)
                    </div>
                    <textarea
                      className="category-spec"
                      placeholder="Base cabinet lighting specifications..."
                      value={formData.base_specification}
                      onChange={(e) => handleInputChange('base_specification', e.target.value)}
                      rows="2"
                    />
                  </div>
                </div>

                <div className="category-card">
                  <div className="category-header">
                    <Zap className="category-icon worktop" />
                    <span className="category-name">Work Top</span>
                  </div>
                  <div className="category-content">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.applies_to_work_top}
                        onChange={(e) => handleInputChange('applies_to_work_top', e.target.checked)}
                      />
                      <span className="checkbox-checkmark"></span>
                      <span className="checkbox-label">Apply nosing LEDs</span>
                    </label>
                    <div className="category-description">
                      LED strips on work top nosing edge
                    </div>
                    <textarea
                      className="category-spec"
                      placeholder="Work top lighting specifications..."
                      value={formData.work_top_specification}
                      onChange={(e) => handleInputChange('work_top_specification', e.target.value)}
                      rows="2"
                    />
                  </div>
                </div>

                <div className="category-card">
                  <div className="category-header">
                    <Layers className="category-icon tall" />
                    <span className="category-name">Tall Cabinets</span>
                  </div>
                  <div className="category-content">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.applies_to_tall_cabinets}
                        onChange={(e) => handleInputChange('applies_to_tall_cabinets', e.target.checked)}
                      />
                      <span className="checkbox-checkmark"></span>
                      <span className="checkbox-label">Apply internal LEDs</span>
                    </label>
                    <div className="category-description">
                      Internal LED strips (optional, for pantry/storage)
                    </div>
                    <textarea
                      className="category-spec"
                      placeholder="Tall cabinet lighting specifications..."
                      value={formData.tall_specification}
                      onChange={(e) => handleInputChange('tall_specification', e.target.value)}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {errors.category_applications && (
                <div className="form-error">
                  <AlertCircle className="error-icon" />
                  {errors.category_applications}
                </div>
              )}
            </div>

            {/* General Specifications */}
            <div className="form-section">
              <h3 className="section-title">
                <Settings className="section-icon" />
                General Specifications
              </h3>

              <div className="form-group">
                <label className="form-label">LED Strip Specification</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g., COB LED strips with aluminum profile and diffuser, 24V, warm white 3000K"
                  value={formData.led_specification}
                  onChange={(e) => handleInputChange('led_specification', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spot Light Specification</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g., 3W LED spot lights, warm white 3000K, adjustable beam angle"
                  value={formData.spot_light_specification}
                  onChange={(e) => handleInputChange('spot_light_specification', e.target.value)}
                />
              </div>
            </div>

            {/* Effective Dates */}
            <div className="form-section">
              <h3 className="section-title">
                <Calendar className="section-icon" />
                Effective Dates
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Effective From *</label>
                  <input
                    type="date"
                    className={`form-input ${errors.effective_from ? 'error' : ''}`}
                    value={formData.effective_from}
                    onChange={(e) => handleInputChange('effective_from', e.target.value)}
                  />
                  {errors.effective_from && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.effective_from}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Effective To</label>
                  <input
                    type="date"
                    className={`form-input ${errors.effective_to ? 'error' : ''}`}
                    value={formData.effective_to}
                    onChange={(e) => handleInputChange('effective_to', e.target.value)}
                  />
                  {errors.effective_to && (
                    <div className="form-error">
                      <AlertCircle className="error-icon" />
                      {errors.effective_to}
                    </div>
                  )}
                  <div className="form-note">
                    Leave empty for ongoing effectiveness
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Preview */}
            <div className="form-section">
              <div className="preview-header">
                <h3 className="section-title">
                  <Calculator className="section-icon" />
                  Multi-Category Cost Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="preview-toggle-btn"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {showPreview && (
                <div className="cost-preview">
                  <div className="preview-inputs">
                    <h4 className="preview-subtitle">Test Dimensions</h4>
                    <div className="preview-inputs-grid">
                      <div className="preview-input-group">
                        <label>Wall Cabinet Width (mm)</label>
                        <input
                          type="number"
                          value={testDimensions.wall_width_mm}
                          onChange={(e) => setTestDimensions(prev => ({
                            ...prev, wall_width_mm: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <div className="preview-input-group">
                        <label>Base Cabinet Width (mm)</label>
                        <input
                          type="number"
                          value={testDimensions.base_width_mm}
                          onChange={(e) => setTestDimensions(prev => ({
                            ...prev, base_width_mm: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <div className="preview-input-group">
                        <label>Work Top Length (mm)</label>
                        <input
                          type="number"
                          value={testDimensions.work_top_length_mm}
                          onChange={(e) => setTestDimensions(prev => ({
                            ...prev, work_top_length_mm: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <div className="preview-input-group">
                        <label>Wall Cabinet Count</label>
                        <input
                          type="number"
                          value={testDimensions.wall_cabinet_count}
                          onChange={(e) => setTestDimensions(prev => ({
                            ...prev, wall_cabinet_count: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {previewData && (
                    <div className="preview-results">
                      <h4 className="preview-subtitle">Category-wise Breakdown</h4>
                      <div className="category-results-grid">
                        {formData.applies_to_wall_cabinets && (
                          <div className="category-result-card wall">
                            <div className="category-result-header">
                              <Home className="category-result-icon" />
                              <span>Wall Cabinets</span>
                            </div>
                            <div className="category-result-breakdown">
                              <div className="result-item">
                                <span>LED Strips:</span>
                                <span>{formatCurrency(previewData.breakdown.wall_led)}</span>
                              </div>
                              <div className="result-item">
                                <span>Spot Lights:</span>
                                <span>{formatCurrency(previewData.breakdown.wall_spot)}</span>
                              </div>
                              <div className="result-item total">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(previewData.breakdown.wall_led + previewData.breakdown.wall_spot)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.applies_to_base_cabinets && (
                          <div className="category-result-card base">
                            <div className="category-result-header">
                              <Building className="category-result-icon" />
                              <span>Base Cabinets</span>
                            </div>
                            <div className="category-result-breakdown">
                              <div className="result-item">
                                <span>Skirting LEDs:</span>
                                <span>{formatCurrency(previewData.breakdown.base_led)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.applies_to_work_top && (
                          <div className="category-result-card worktop">
                            <div className="category-result-header">
                              <Zap className="category-result-icon" />
                              <span>Work Top</span>
                            </div>
                            <div className="category-result-breakdown">
                              <div className="result-item">
                                <span>Nosing LEDs:</span>
                                <span>{formatCurrency(previewData.breakdown.work_top_led)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.applies_to_tall_cabinets && (
                          <div className="category-result-card tall">
                            <div className="category-result-header">
                              <Layers className="category-result-icon" />
                              <span>Tall Cabinets</span>
                            </div>
                            <div className="category-result-breakdown">
                              <div className="result-item">
                                <span>Internal LEDs:</span>
                                <span>{formatCurrency(previewData.breakdown.tall_led)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grand-total-card">
                          <div className="grand-total-header">
                            <Calculator className="grand-total-icon" />
                            <span>Total Lighting Cost</span>
                          </div>
                          <div className="grand-total-amount">
                            {formatCurrency(previewData.total_cost)}
                          </div>
                          <div className="grand-total-breakdown">
                            <span>LED Strips: {formatCurrency(previewData.led_cost)}</span>
                            <span>Spot Lights: {formatCurrency(previewData.spot_cost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
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
                  {lightingRule ? 'Update Rule' : 'Create Rule'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LightingRuleForm;