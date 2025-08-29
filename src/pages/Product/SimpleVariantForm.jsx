import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Calculator, Upload, Image, Trash2 } from 'lucide-react';
import axiosInstance from '../../service/api';

const PriceUtils = {
  calculateTax: (mrp, taxRate = 18) => {
    return (parseFloat(mrp) * parseFloat(taxRate)) / 100;
  },
  calculateDiscount: (mrp, discountRate = 0) => {
    return (parseFloat(mrp) * parseFloat(discountRate)) / 100;
  },
  calculateCompanyPrice: (mrp, taxRate = 18, discountRate = 0) => {
    const tax = PriceUtils.calculateTax(mrp, taxRate);
    const discount = PriceUtils.calculateDiscount(mrp, discountRate);
    return parseFloat(mrp) + tax - discount;
  },
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  },
  formatDimensions: (width, height, depth) => {
    const parts = [];
    if (width) parts.push(`W:${width}`);
    if (height) parts.push(`H:${height}`);
    if (depth) parts.push(`D:${depth}`);
    return parts.length ? parts.join(' × ') + 'mm' : 'Custom';
  }
};

const SimpleVariantForm = ({ 
  isOpen, 
  onClose, 
  variant = null, 
  productId, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    size_width: '',
    size_height: '',
    size_depth: '',
    color_name: '',
    material_code: '',
    mrp: '',
    tax_rate: 18.00,
    discount_rate: 0.00,
    stock_quantity: 0,
    sku_code: '',
    is_active: true
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (variant) {
      setFormData({
        size_width: variant.size_width || '',
        size_height: variant.size_height || '',
        size_depth: variant.size_depth || '',
        color_name: variant.color_name || '',
        material_code: variant.material_code || '',
        mrp: variant.mrp || '',
        tax_rate: variant.tax_rate || 18.00,
        discount_rate: variant.discount_rate || 0.00,
        stock_quantity: variant.stock_quantity || 0,
        sku_code: variant.sku_code || '',
        is_active: variant.is_active !== false
      });
      
      if (variant.image_url) {
        setImagePreview(variant.image_url);
      }
      
      if (variant.mrp) {
        calculatePrice(variant.mrp, variant.tax_rate || 18, variant.discount_rate || 0);
      }
    } else {
      setFormData({
        size_width: '',
        size_height: '',
        size_depth: '',
        color_name: '',
        material_code: '',
        mrp: '',
        tax_rate: 18.00,
        discount_rate: 0.00,
        stock_quantity: 0,
        sku_code: '',
        is_active: true
      });
      setSelectedImage(null);
      setImagePreview(null);
      setCalculations(null);
    }
    setErrors({});
  }, [variant, isOpen]);

  const calculatePrice = async (mrp, taxRate, discountRate) => {
    if (!mrp || mrp <= 0) {
      setCalculations(null);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/catalog/calculate-price/', {
        mrp: parseFloat(mrp),
        tax_rate: parseFloat(taxRate),
        discount_rate: parseFloat(discountRate)
      });
      setCalculations(response.data.calculations);
    } catch (error) {
      console.error('Error calculating price:', error);
      const localCalc = {
        mrp: parseFloat(mrp),
        tax_rate: parseFloat(taxRate),
        tax_amount: PriceUtils.calculateTax(mrp, taxRate),
        discount_rate: parseFloat(discountRate),
        discount_amount: PriceUtils.calculateDiscount(mrp, discountRate),
        company_price: PriceUtils.calculateCompanyPrice(mrp, taxRate, discountRate)
      };
      setCalculations(localCalc);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (['mrp', 'tax_rate', 'discount_rate'].includes(field)) {
      const mrp = field === 'mrp' ? value : formData.mrp;
      const taxRate = field === 'tax_rate' ? value : formData.tax_rate;
      const discountRate = field === 'discount_rate' ? value : formData.discount_rate;
      
      if (mrp && mrp > 0) {
        calculatePrice(mrp, taxRate, discountRate);
      }
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!productId) {
      newErrors.product = 'Product ID is required';
    }
    if (!formData.material_code.trim()) {
      newErrors.material_code = 'Material code is required';
    }
    if (!formData.mrp || Number(formData.mrp) <= 0) {
      newErrors.mrp = 'Valid MRP is required';
    }
    if (formData.tax_rate < 0 || formData.tax_rate > 100) {
      newErrors.tax_rate = 'Tax rate must be between 0-100%';
    }
    if (formData.discount_rate < 0 || formData.discount_rate > 100) {
      newErrors.discount_rate = 'Discount rate must be between 0-100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('product', productId);
      formDataToSend.append('material_code', formData.material_code.trim());
      formDataToSend.append('mrp', parseFloat(formData.mrp));
      formDataToSend.append('tax_rate', parseFloat(formData.tax_rate));
      formDataToSend.append('discount_rate', parseFloat(formData.discount_rate));
      formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity || 0));
      formDataToSend.append('sku_code', formData.sku_code || '');
      formDataToSend.append('is_active', formData.is_active);
      formDataToSend.append('color_name', formData.color_name || '');
      
      if (formData.size_width) {
        formDataToSend.append('size_width', parseFloat(formData.size_width));
      }
      if (formData.size_height) {
        formDataToSend.append('size_height', parseFloat(formData.size_height));
      }
      if (formData.size_depth) {
        formDataToSend.append('size_depth', parseFloat(formData.size_depth));
      }
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      let response;
      if (variant) {
        response = await axiosInstance.put(
          `/api/catalog/product-variants/${variant.id}/`, 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axiosInstance.post(
          '/api/catalog/product-variants/', 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const errorMessages = [];
        
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${errorData[field]}`);
          }
        });
        
        alert(`Error saving variant:\n${errorMessages.join('\n')}`);
      } else {
        alert('Error saving variant. Please check your input and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pm-modal-backdrop">
      <div className="pm-modal">
        <div className="pm-modal-header">
          <div>
            <h2 className="pm-modal-title">{variant ? 'Edit Variant' : 'Add New Variant'}</h2>
            <p className="pm-modal-subtitle">{variant ? 'Update variant details with image and price calculation' : 'Create a new variant with image and simplified inputs'}</p>
          </div>
          <button onClick={onClose} className="pm-modal-close" disabled={loading}><X className="pm-icon" /></button>
        </div>

        <div className="pm-modal-body">
          {!productId && (
            <div className="pm-card pm-mb-4" style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}>
              <p style={{ color: '#c00', margin: 0 }}>Warning: Product ID is missing. Variants must be associated with a product.</p>
            </div>
          )}

          <div className="pm-form-grid pm-grid-2">
            <div className="pm-form-group pm-full-width">
              <label className="pm-label pm-required">Material Code</label>
              <input type="text" value={formData.material_code} onChange={(e) => handleInputChange('material_code', e.target.value)} className={`pm-input ${errors.material_code ? 'pm-error' : ''}`} placeholder="e.g., SS304-600x850-SIL-001" disabled={loading} />
              {errors.material_code && <p className="pm-error-text">{errors.material_code}</p>}
            </div>

            <div className="pm-form-group pm-full-width">
              <label className="pm-label">Variant Image</label>
              {imagePreview && (
                <div className="pm-image-preview-container pm-mb-4">
                  <div className="pm-image-preview-wrapper">
                    <img src={imagePreview} alt="Variant preview" className="pm-image-preview" style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--pm-border-color)' }} />
                    <button type="button" onClick={removeImage} className="pm-btn-icon pm-btn-danger" style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(244, 67, 54, 0.8)' }} disabled={loading} title="Remove image"><Trash2 className="pm-icon-sm" /></button>
                  </div>
                </div>
              )}
              <div className="pm-upload-section">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="pm-hidden" disabled={loading} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="pm-btn pm-btn-secondary" disabled={loading}><Upload className="pm-icon-sm" />{imagePreview ? 'Change Image' : 'Upload Image'}</button>
                <p className="pm-text-sm pm-text-secondary pm-mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>

            <div className="pm-form-group">
              <label className="pm-label">Width (mm)</label>
              <input type="number" value={formData.size_width} onChange={(e) => handleInputChange('size_width', e.target.value)} className="pm-input" placeholder="600 (optional)" min="0" step="0.01" disabled={loading} />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Height (mm)</label>
              <input type="number" value={formData.size_height} onChange={(e) => handleInputChange('size_height', e.target.value)} className="pm-input" placeholder="850 (optional)" min="0" step="0.01" disabled={loading} />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Depth (mm)</label>
              <input type="number" value={formData.size_depth} onChange={(e) => handleInputChange('size_depth', e.target.value)} className="pm-input" placeholder="600 (optional)" min="0" step="0.01" disabled={loading} />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Color</label>
              <input type="text" value={formData.color_name} onChange={(e) => handleInputChange('color_name', e.target.value)} className="pm-input" placeholder="e.g., Stainless Steel Silver" disabled={loading} />
            </div>
            <div className="pm-form-group">
              <label className="pm-label pm-required">MRP (₹)</label>
              <input type="number" value={formData.mrp} onChange={(e) => handleInputChange('mrp', e.target.value)} className={`pm-input ${errors.mrp ? 'pm-error' : ''}`} placeholder="0.00" min="0" step="0.01" disabled={loading} />
              {errors.mrp && <p className="pm-error-text">{errors.mrp}</p>}
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Tax Rate (%)</label>
              <input type="number" value={formData.tax_rate} onChange={(e) => handleInputChange('tax_rate', e.target.value)} className={`pm-input ${errors.tax_rate ? 'pm-error' : ''}`} placeholder="18" min="0" max="100" step="0.01" disabled={loading} />
              {errors.tax_rate && <p className="pm-error-text">{errors.tax_rate}</p>}
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Discount Rate (%)</label>
              <input type="number" value={formData.discount_rate} onChange={(e) => handleInputChange('discount_rate', e.target.value)} className={`pm-input ${errors.discount_rate ? 'pm-error' : ''}`} placeholder="0" min="0" max="100" step="0.01" disabled={loading} />
              {errors.discount_rate && <p className="pm-error-text">{errors.discount_rate}</p>}
            </div>
            <div className="pm-form-group">
              <label className="pm-label">Stock Quantity</label>
              <input type="number" value={formData.stock_quantity} onChange={(e) => handleInputChange('stock_quantity', e.target.value)} className="pm-input" placeholder="0" min="0" disabled={loading} />
            </div>
            <div className="pm-form-group">
              <label className="pm-label">SKU Code</label>
              <input type="text" value={formData.sku_code} onChange={(e) => handleInputChange('sku_code', e.target.value)} className="pm-input" placeholder="Auto-generated if empty" disabled={loading} />
            </div>
            <div className="pm-checkbox-group">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => handleInputChange('is_active', e.target.checked)} className="pm-checkbox" disabled={loading} />
              <span className="pm-label">Active</span>
            </div>
          </div>

          {calculations && (
            <div className="pm-card pm-mt-6">
              <h4 className="pm-heading-bold pm-mb-3"><Calculator className="pm-icon-sm" style={{ display: 'inline', marginRight: '0.5rem' }} />Automatic Price Calculation</h4>
              <div className="pm-form-grid pm-grid-2 pm-text-sm">
                <div><span className="pm-text-secondary">MRP:</span><span className="pm-ml-2 pm-text-bold">{PriceUtils.formatCurrency(calculations.mrp)}</span></div>
                <div><span className="pm-text-secondary">Tax ({calculations.tax_rate}%):</span><span className="pm-ml-2 pm-text-success">+{PriceUtils.formatCurrency(calculations.tax_amount)}</span></div>
                <div><span className="pm-text-secondary">Discount ({calculations.discount_rate}%):</span><span className="pm-ml-2 pm-text-danger">-{PriceUtils.formatCurrency(calculations.discount_amount)}</span></div>
                <div><span className="pm-text-secondary">Final Company Price:</span><span className="pm-ml-2 pm-text-accent pm-text-bold">{PriceUtils.formatCurrency(calculations.company_price)}</span></div>
              </div>
              <div className="pm-mt-3 pm-text-sm pm-text-secondary">Formula: MRP + Tax - Discount = Company Price</div>
            </div>
          )}

          {(formData.size_width || formData.size_height || formData.size_depth) && (
            <div className="pm-card pm-mt-4">
              <h5 className="pm-heading-bold pm-mb-2">Dimensions Preview</h5>
              <p className="pm-text-accent">{PriceUtils.formatDimensions(formData.size_width, formData.size_height, formData.size_depth)}</p>
            </div>
          )}
        </div>

        <div className="pm-modal-footer">
          <button onClick={onClose} className="pm-btn pm-btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={handleSave} disabled={loading} className="pm-btn pm-btn-primary">
            {loading ? (<><div className="pm-spinner"></div>Saving...</>) : (<><Save className="pm-icon-sm" />{variant ? 'Update Variant' : 'Create Variant'}</>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleVariantForm;
