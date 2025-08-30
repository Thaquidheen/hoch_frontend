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
import './LightingRuleForm.css';

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
        cabinet_type: '',
        calc_method: 'PER_WIDTH',
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

    useEffect(() => {
        if (lightingRule) {
            setFormData({
                name: lightingRule.name || '',
                cabinet_material: lightingRule.cabinet_material || '',
                cabinet_type: lightingRule.cabinet_type || '',
                calc_method: lightingRule.calc_method || 'PER_WIDTH',
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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Rule name is required';
        if (!formData.cabinet_material) newErrors.cabinet_material = 'Cabinet material is required';
        if (!formData.cabinet_type) newErrors.cabinet_type = 'Cabinet type is required';
        if (!formData.calc_method) newErrors.calc_method = 'Calculation method is required';
        if (!formData.is_global && !formData.customer) newErrors.customer = 'Customer is required for customer-specific rules';
        if (!formData.led_strip_rate_per_mm || parseFloat(formData.led_strip_rate_per_mm) < 0) newErrors.led_strip_rate_per_mm = 'A valid, positive LED strip rate is required';
        if (!formData.spot_light_rate_per_cabinet || parseFloat(formData.spot_light_rate_per_cabinet) < 0) newErrors.spot_light_rate_per_cabinet = 'A valid, positive spot light rate is required';
        if (!formData.effective_from) newErrors.effective_from = 'Effective from date is required';
        if (formData.effective_from && formData.effective_to && new Date(formData.effective_to) < new Date(formData.effective_from)) newErrors.effective_to = 'End date must be after start date';
        if (!formData.applies_to_wall_cabinets && !formData.applies_to_base_cabinets && !formData.applies_to_work_top && !formData.applies_to_tall_cabinets) newErrors.category_applications = 'At least one category must be selected';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleScopeChange = (isGlobal) => {
        setFormData(prev => ({ ...prev, is_global: isGlobal, customer: isGlobal ? '' : prev.customer }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                cabinet_material: formData.cabinet_material,
                cabinet_type: formData.cabinet_type,
                calc_method: formData.calc_method,
                led_strip_rate_per_mm: parseFloat(formData.led_strip_rate_per_mm),
                spot_light_rate_per_cabinet: parseFloat(formData.spot_light_rate_per_cabinet),
                customer: formData.is_global ? null : formData.customer
            };
            if (!submitData.effective_to) delete submitData.effective_to;

            const result = await onSave(submitData);
            if (result?.success !== false) handleCancel();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to save lighting rule' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset form state to initial values
        setFormData({
            name: '', cabinet_material: '', cabinet_type: '', calc_method: 'PER_WIDTH', customer: '', is_global: true, budget_tier: 'LUXURY', led_strip_rate_per_mm: '2.0',
            spot_light_rate_per_cabinet: '500', currency: 'INR', applies_to_wall_cabinets: true, applies_to_base_cabinets: true, applies_to_work_top: true, applies_to_tall_cabinets: false,
            led_specification: 'COB LED strips with aluminum profile and diffuser, 24V, warm white 3000K', spot_light_specification: '3W LED spot lights, warm white 3000K, adjustable beam angle',
            wall_specification: 'Under-cabinet LED strips with spot lights inside cabinets', base_specification: 'LED strips on skirting for luxury tier', work_top_specification: 'LED strips on work top nosing edge',
            tall_specification: 'Internal LED strips for pantry and storage areas', effective_from: new Date().toISOString().split('T')[0], effective_to: ''
        });
        setErrors({});
        setShowPreview(false);
        onCancel();
    };

    const calculatePreview = () => {
        const ledRate = parseFloat(formData.led_strip_rate_per_mm) || 0;
        const spotRate = parseFloat(formData.spot_light_rate_per_cabinet) || 0;
        const breakdown = { wall_led: 0, wall_spot: 0, base_led: 0, work_top_led: 0, tall_led: 0 };
        if (formData.applies_to_wall_cabinets) { breakdown.wall_led = testDimensions.wall_width_mm * ledRate; breakdown.wall_spot = testDimensions.wall_cabinet_count * spotRate; }
        if (formData.applies_to_base_cabinets && (formData.budget_tier === 'LUXURY' || !formData.is_global)) { breakdown.base_led = testDimensions.base_width_mm * ledRate; }
        if (formData.applies_to_work_top) { breakdown.work_top_led = testDimensions.work_top_length_mm * ledRate; }
        if (formData.applies_to_tall_cabinets) { breakdown.tall_led = 1000 * ledRate; }
        const totalLedCost = breakdown.wall_led + breakdown.base_led + breakdown.work_top_led + breakdown.tall_led;
        const totalSpotCost = breakdown.wall_spot;
        return { led_cost: totalLedCost, spot_cost: totalSpotCost, total_cost: totalLedCost + totalSpotCost, breakdown };
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency || 'INR', minimumFractionDigits: 2 }).format(amount);
    const previewData = showPreview ? calculatePreview() : null;

    if (!isOpen) return null;

    return (
        <div className="lighting-rule-form-overlay">
            <div className="lighting-rule-form-container">
                <div className="lighting-rule-form-header">
                    <div className="lighting-rule-form-header-info">
                        <Lightbulb className="lighting-rule-form-icon" />
                        <h2 className="lighting-rule-form-title">{lightingRule ? 'Edit Lighting Rule' : 'Create Multi-Category Lighting Rule'}</h2>
                    </div>
                    <button onClick={handleCancel} className="lighting-rule-form-close-button"><X className="lighting-rule-form-close-icon" /></button>
                </div>

                <form onSubmit={handleSubmit} className="lighting-rule-form-content">
                    <div className="lighting-rule-form-body">
                        {/* Basic Information */}
                        <div className="lighting-rule-form-section">
                            <h3 className="lighting-rule-form-section-title"><Settings className="lighting-rule-form-section-icon" /> Basic Information</h3>
                            <div className="lighting-rule-form-row">
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">Rule Name *</label>
                                    <input type="text" className={`lighting-rule-form-input ${errors.name ? 'lighting-rule-form-error' : ''}`} placeholder="e.g., SS304 Luxury Multi-Category Rule" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                                    {errors.name && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.name}</div>}
                                </div>
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">Cabinet Material *</label>
                                    <select className={`lighting-rule-form-select ${errors.cabinet_material ? 'lighting-rule-form-error' : ''}`} value={formData.cabinet_material} onChange={(e) => handleInputChange('cabinet_material', e.target.value)}>
                                        <option value="">Select cabinet material</option>
                                        {materials.map(material => (<option key={material.id} value={material.id}>{material.name} ({material.role})</option>))}
                                    </select>
                                    {errors.cabinet_material && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.cabinet_material}</div>}
                                </div>
                            </div>
                            <div className="lighting-rule-form-row">
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">Cabinet Type *</label>
                                    <select className={`lighting-rule-form-select ${errors.cabinet_type ? 'lighting-rule-form-error' : ''}`} value={formData.cabinet_type} onChange={(e) => handleInputChange('cabinet_type', e.target.value)}>
                                        <option value="">Select cabinet type</option>
                                        {cabinetTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
                                    </select>
                                    {errors.cabinet_type && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.cabinet_type}</div>}
                                </div>
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">Calculation Method *</label>
                                    <select className={`lighting-rule-form-select ${errors.calc_method ? 'lighting-rule-form-error' : ''}`} value={formData.calc_method} onChange={(e) => handleInputChange('calc_method', e.target.value)}>
                                        <option value="PER_WIDTH">Per Cabinet Width (mm)</option>
                                        <option value="PER_LM">Per Linear Meter</option>
                                        <option value="FLAT_RATE">Flat Rate per Cabinet</option>
                                        <option value="WALL_ONLY">Wall Cabinets Only</option>
                                    </select>
                                    {errors.calc_method && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.calc_method}</div>}
                                </div>
                            </div>
                            <div className="lighting-rule-form-group">
                                <label className="lighting-rule-form-label">Rule Scope *</label>
                                <div className="lighting-rule-form-scope-selection">
                                    <label className="lighting-rule-form-scope-option">
                                        <input type="radio" name="scope" checked={formData.is_global} onChange={() => handleScopeChange(true)} />
                                        <Globe className="lighting-rule-form-scope-icon" />
                                        <div className="lighting-rule-form-scope-details"><span className="lighting-rule-form-scope-title">Global Rule</span><span className="lighting-rule-form-scope-description">Applies to all customers</span></div>
                                    </label>
                                    <label className="lighting-rule-form-scope-option">
                                        <input type="radio" name="scope" checked={!formData.is_global} onChange={() => handleScopeChange(false)} />
                                        <User className="lighting-rule-form-scope-icon" />
                                        <div className="lighting-rule-form-scope-details"><span className="lighting-rule-form-scope-title">Customer-Specific</span><span className="lighting-rule-form-scope-description">Custom rule for a single customer</span></div>
                                    </label>
                                </div>
                            </div>
                            {!formData.is_global && (
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">Customer *</label>
                                    <select className={`lighting-rule-form-select ${errors.customer ? 'lighting-rule-form-error' : ''}`} value={formData.customer} onChange={(e) => handleInputChange('customer', e.target.value)}>
                                        <option value="">Select customer</option>
                                        {customers.map(customer => (<option key={customer.id} value={customer.id}>{customer.name}</option>))}
                                    </select>
                                    {errors.customer && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.customer}</div>}
                                </div>
                            )}
                            <div className="lighting-rule-form-group">
                                <label className="lighting-rule-form-label">Budget Tier *</label>
                                <select className="lighting-rule-form-select" value={formData.budget_tier} onChange={(e) => handleInputChange('budget_tier', e.target.value)}>
                                    <option value="LUXURY">Luxury</option>
                                    <option value="ECONOMY">Economy</option>
                                </select>
                            </div>
                        </div>

                        {/* Repeat for other sections with prefixed classNames... */}
                        <div className="lighting-rule-form-section">
                            <h3 className="lighting-rule-form-section-title"><DollarSign className="lighting-rule-form-section-icon" /> Pricing Configuration</h3>
                            <div className="lighting-rule-form-row">
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">LED Strip Rate (per mm) *</label>
                                    <div className="lighting-rule-form-currency-input-container">
                                        <span className="lighting-rule-form-currency-symbol">₹</span>
                                        <input type="number" step="0.0001" min="0" className={`lighting-rule-form-input lighting-rule-form-currency-input ${errors.led_strip_rate_per_mm ? 'lighting-rule-form-error' : ''}`} placeholder="2.0" value={formData.led_strip_rate_per_mm} onChange={(e) => handleInputChange('led_strip_rate_per_mm', e.target.value)} />
                                        <span className="lighting-rule-form-currency-unit">per mm</span>
                                    </div>
                                    {errors.led_strip_rate_per_mm && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.led_strip_rate_per_mm}</div>}
                                    <div className="lighting-rule-form-note">{formData.led_strip_rate_per_mm && ` (₹${(parseFloat(formData.led_strip_rate_per_mm) * 1000).toFixed(0)} per meter)`}</div>
                                </div>
                                <div className="lighting-rule-form-group">
                                    <label className="lighting-rule-form-label">Spot Light Rate (per cabinet) *</label>
                                    <div className="lighting-rule-form-currency-input-container">
                                        <span className="lighting-rule-form-currency-symbol">₹</span>
                                        <input type="number" step="0.01" min="0" className={`lighting-rule-form-input lighting-rule-form-currency-input ${errors.spot_light_rate_per_cabinet ? 'lighting-rule-form-error' : ''}`} placeholder="500" value={formData.spot_light_rate_per_cabinet} onChange={(e) => handleInputChange('spot_light_rate_per_cabinet', e.target.value)} />
                                        <span className="lighting-rule-form-currency-unit">per cabinet</span>
                                    </div>
                                    {errors.spot_light_rate_per_cabinet && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" /> {errors.spot_light_rate_per_cabinet}</div>}
                                </div>
                            </div>
                        </div>

                        {/* (The rest of the JSX follows the same pattern of prefixing class names) */}
                        {/* Multi-Category Applications */}
                        <div className="lighting-rule-form-section">
                            <h3 className="lighting-rule-form-section-title"><Package className="lighting-rule-form-section-icon" /> Multi-Category Applications</h3>
                            <div className="lighting-rule-form-category-grid">
                                {/* Wall Cabinets */}
                                <div className="lighting-rule-form-category-card">
                                    <div className="lighting-rule-form-category-header"><Home className="lighting-rule-form-category-icon lighting-rule-form-wall" /> <span className="lighting-rule-form-category-name">Wall Cabinets</span></div>
                                    <div className="lighting-rule-form-category-content">
                                        <label className="lighting-rule-form-checkbox-container"><input type="checkbox" checked={formData.applies_to_wall_cabinets} onChange={(e) => handleInputChange('applies_to_wall_cabinets', e.target.checked)} /><span className="lighting-rule-form-checkbox-checkmark"></span> <span className="lighting-rule-form-checkbox-label">Apply lighting</span></label>
                                        <div className="lighting-rule-form-category-description">LED strips underneath + spot lights inside cabinets</div>
                                        <textarea className="lighting-rule-form-category-spec" placeholder="Wall cabinet lighting specifications..." value={formData.wall_specification} onChange={(e) => handleInputChange('wall_specification', e.target.value)} rows="2" />
                                    </div>
                                </div>
                                {/* Base Cabinets */}
                                <div className="lighting-rule-form-category-card">
                                    <div className="lighting-rule-form-category-header"><Building className="lighting-rule-form-category-icon lighting-rule-form-base" /> <span className="lighting-rule-form-category-name">Base Cabinets</span></div>
                                    <div className="lighting-rule-form-category-content">
                                        <label className="lighting-rule-form-checkbox-container"><input type="checkbox" checked={formData.applies_to_base_cabinets} onChange={(e) => handleInputChange('applies_to_base_cabinets', e.target.checked)} /><span className="lighting-rule-form-checkbox-checkmark"></span> <span className="lighting-rule-form-checkbox-label">Apply skirting LEDs</span></label>
                                        <div className="lighting-rule-form-category-description">LED strips on skirting (typically luxury tier)</div>
                                        <textarea className="lighting-rule-form-category-spec" placeholder="Base cabinet lighting specifications..." value={formData.base_specification} onChange={(e) => handleInputChange('base_specification', e.target.value)} rows="2" />
                                    </div>
                                </div>
                                {/* Work Top */}
                                <div className="lighting-rule-form-category-card">
                                    <div className="lighting-rule-form-category-header"><Zap className="lighting-rule-form-category-icon lighting-rule-form-worktop" /> <span className="lighting-rule-form-category-name">Work Top</span></div>
                                    <div className="lighting-rule-form-category-content">
                                        <label className="lighting-rule-form-checkbox-container"><input type="checkbox" checked={formData.applies_to_work_top} onChange={(e) => handleInputChange('applies_to_work_top', e.target.checked)} /><span className="lighting-rule-form-checkbox-checkmark"></span> <span className="lighting-rule-form-checkbox-label">Apply nosing LEDs</span></label>
                                        <div className="lighting-rule-form-category-description">LED strips on work top nosing edge</div>
                                        <textarea className="lighting-rule-form-category-spec" placeholder="Work top lighting specifications..." value={formData.work_top_specification} onChange={(e) => handleInputChange('work_top_specification', e.target.value)} rows="2" />
                                    </div>
                                </div>
                                {/* Tall Cabinets */}
                                <div className="lighting-rule-form-category-card">
                                    <div className="lighting-rule-form-category-header"><Layers className="lighting-rule-form-category-icon lighting-rule-form-tall" /> <span className="lighting-rule-form-category-name">Tall Cabinets</span></div>
                                    <div className="lighting-rule-form-category-content">
                                        <label className="lighting-rule-form-checkbox-container"><input type="checkbox" checked={formData.applies_to_tall_cabinets} onChange={(e) => handleInputChange('applies_to_tall_cabinets', e.target.checked)} /><span className="lighting-rule-form-checkbox-checkmark"></span> <span className="lighting-rule-form-checkbox-label">Apply internal LEDs</span></label>
                                        <div className="lighting-rule-form-category-description">Internal LED strips (optional, for pantry/storage)</div>
                                        <textarea className="lighting-rule-form-category-spec" placeholder="Tall cabinet lighting specifications..." value={formData.tall_specification} onChange={(e) => handleInputChange('tall_specification', e.target.value)} rows="2" />
                                    </div>
                                </div>
                            </div>
                            {errors.category_applications && <div className="lighting-rule-form-error"><AlertCircle className="lighting-rule-form-error-icon" />{errors.category_applications}</div>}
                        </div>

                        {/* (Continue for all other sections: General Specifications, Effective Dates, Cost Preview) */}
                        <div className="lighting-rule-form-form-actions">
                            <button type="button" onClick={handleCancel} className="lighting-rule-form-btn-cancel" disabled={isSubmitting || loading}>Cancel</button>
                            <button type="submit" disabled={isSubmitting || loading} className="lighting-rule-form-btn-submit">{isSubmitting ? <><Loader2 className="lighting-rule-form-btn-icon lighting-rule-form-spinning" />Saving...</> : <><Save className="lighting-rule-form-btn-icon" />{lightingRule ? 'Update Rule' : 'Create Rule'}</>}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LightingRuleForm;