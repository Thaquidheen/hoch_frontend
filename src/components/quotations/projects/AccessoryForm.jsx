// src/components/quotations/projects/AccessoryForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Package, 
  Calculator, 
  AlertCircle, 
  Image as ImageIcon,
  Info,
  Trash2
} from 'lucide-react';
import ProductVariantBrowser from './ProductVariantBrowser';
import './AccessoryForm.css';

const AccessoryForm = ({ lineItem, accessory, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    line_item: lineItem?.id || '',
    product_variant: null,
    qty: 1,
    unit_price: '',
    installation_notes: ''
  });
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductBrowser, setShowProductBrowser] = useState(false);

  // Initialize form with accessory data
  useEffect(() => {
    if (accessory) {
      setFormData({
        line_item: accessory.line_item,
        product_variant: accessory.product_variant,
        qty: accessory.qty,
        unit_price: accessory.unit_price,
        installation_notes: accessory.installation_notes || ''
      });
      
      if (accessory.product_variant_detail) {
        setSelectedVariant(accessory.product_variant_detail);
      }
    } else {
      // Reset for new accessory
      setFormData({
        line_item: lineItem?.id || '',
        product_variant: null,
        qty: 1,
        unit_price: '',
        installation_notes: ''
      });
      setSelectedVariant(null);
    }
    setErrors({});
  }, [accessory, lineItem]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setFormData(prev => ({
      ...prev,
      product_variant: variant.id,
      unit_price: variant.company_price // Auto-populate price
    }));
    
    // Clear variant selection error
    if (errors.product_variant) {
      setErrors(prev => ({ ...prev, product_variant: '' }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const calculatePricing = () => {
    const unitPrice = parseFloat(formData.unit_price) || 0;
    const qty = parseInt(formData.qty) || 0;
    const subtotal = unitPrice * qty;
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      taxRate: (taxRate * 100).toFixed(0)
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedVariant) {
      newErrors.product_variant = 'Please select a product';
    }
    
    if (!formData.qty || formData.qty < 1) {
      newErrors.qty = 'Quantity must be at least 1';
    }
    
    if (!formData.unit_price || formData.unit_price <= 0) {
      newErrors.unit_price = 'Unit price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        line_item: lineItem.id,
        qty: parseInt(formData.qty),
        unit_price: parseFloat(formData.unit_price)
      };

      await onSave(submitData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save accessory' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await onDelete(accessory.id);
      } catch (error) {
        setErrors({ submit: error.message || 'Failed to delete accessory' });
      }
    }
  };

  const pricing = calculatePricing();

  return (
    <div className="accessoryform-overlay">
      <div className="accessoryform">
        {/* Header */}
        <div className="accessoryform-header">
          <div className="accessoryform-header-content">
            <div className="accessoryform-header-title">
              <Package className="accessoryform-icon" />
              <div>
                <h2>{accessory ? 'Edit Accessory' : 'Add Accessory'}</h2>
                <p className="accessoryform-subtitle">
                  For: {lineItem?.cabinet_type_detail?.name} - {lineItem?.scope} Kitchen
                </p>
              </div>
            </div>
            <div className="accessoryform-header-actions">
              {accessory && (
                <button 
                  onClick={handleDelete} 
                  className="accessoryform-delete-btn"
                  title="Delete accessory"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={onCancel} className="accessoryform-close-btn">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="accessoryform-content">
          {/* Product Selection */}
          <div className="accessoryform-section">
            <div className="accessoryform-section-header">
              <h3>Product Selection</h3>
              {!selectedVariant && (
                <button 
                  onClick={() => setShowProductBrowser(true)}
                  className="accessoryform-browse-btn primary"
                >
                  Browse Products
                </button>
              )}
            </div>

            {errors.product_variant && (
              <div className="accessoryform-error-message">
                <AlertCircle className="accessoryform-error-icon" />
                {errors.product_variant}
              </div>
            )}

            {selectedVariant ? (
              <div className="accessoryform-selected-product">
                <div className="accessoryform-product-preview">
                  <div className="accessoryform-product-image">
                    {selectedVariant.image_url ? (
                      <img src={selectedVariant.image_url} alt={selectedVariant.product?.name} />
                    ) : (
                      <div className="accessoryform-no-image">
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="accessoryform-product-details">
                    <h4 className="accessoryform-product-name">{selectedVariant.product?.name}</h4>
                    <div className="accessoryform-product-meta">
                      <span><strong>Brand:</strong> {selectedVariant.product?.brand?.name}</span>
                      <span><strong>Code:</strong> {selectedVariant.material_code}</span>
                      {selectedVariant.color_name && (
                        <span><strong>Color:</strong> {selectedVariant.color_name}</span>
                      )}
                      {selectedVariant.dimensions_display && (
                        <span><strong>Size:</strong> {selectedVariant.dimensions_display}</span>
                      )}
                    </div>
                    <div className="accessoryform-product-pricing-info">
                      <span className="accessoryform-base-price">Base Price: ₹{selectedVariant.company_price}</span>
                      {selectedVariant.mrp > selectedVariant.company_price && (
                        <span className="accessoryform-mrp">MRP: ₹{selectedVariant.mrp}</span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowProductBrowser(true)}
                    className="accessoryform-change-product-btn"
                  >
                    Change Product
                  </button>
                </div>
              </div>
            ) : (
              <div className="accessoryform-no-product-selected">
                <div className="accessoryform-no-product-icon">
                  <Package size={48} />
                </div>
                <p>No product selected</p>
                <button 
                  onClick={() => setShowProductBrowser(true)}
                  className="accessoryform-browse-btn secondary"
                >
                  Browse & Select Product
                </button>
              </div>
            )}
          </div>

          {/* Quantity & Pricing */}
          {selectedVariant && (
            <div className="accessoryform-section">
              <h3>Quantity & Pricing</h3>
              
              <div className="accessoryform-row">
                <div className="accessoryform-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.qty}
                    onChange={(e) => handleInputChange('qty', e.target.value)}
                    className={`accessoryform-input ${errors.qty ? 'error' : ''}`}
                  />
                  {errors.qty && <span className="accessoryform-field-error">{errors.qty}</span>}
                </div>

                <div className="accessoryform-group">
                  <label>Unit Price (₹) *</label>
                  <div className="accessoryform-price-input-container">
                    <span className="accessoryform-currency-symbol">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unit_price}
                      onChange={(e) => handleInputChange('unit_price', e.target.value)}
                      className={`accessoryform-input accessoryform-price-input ${errors.unit_price ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('unit_price', selectedVariant.company_price)}
                      className="accessoryform-reset-price-btn"
                      title="Reset to base price"
                    >
                      Reset
                    </button>
                  </div>
                  {errors.unit_price && <span className="accessoryform-field-error">{errors.unit_price}</span>}
                  <small className="accessoryform-field-note">
                    You can override the base price of ₹{selectedVariant.company_price}
                  </small>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="accessoryform-price-calculation">
                <div className="accessoryform-calc-header">
                  <Calculator className="accessoryform-calc-icon" />
                  <span>Price Breakdown</span>
                </div>
                <div className="accessoryform-calc-details">
                  <div className="accessoryform-calc-row">
                    <span>Subtotal ({formData.qty} × ₹{formData.unit_price}):</span>
                    <span>₹{pricing.subtotal}</span>
                  </div>
                  <div className="accessoryform-calc-row">
                    <span>GST ({pricing.taxRate}%):</span>
                    <span>₹{pricing.taxAmount}</span>
                  </div>
                  <div className="accessoryform-calc-row total">
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>₹{pricing.total}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Installation Notes */}
          {selectedVariant && (
            <div className="accessoryform-section">
              <h3>Installation Notes</h3>
              <div className="accessoryform-group">
                <textarea
                  value={formData.installation_notes}
                  onChange={(e) => handleInputChange('installation_notes', e.target.value)}
                  placeholder="Add any special installation requirements, mounting instructions, or notes for this accessory..."
                  className="accessoryform-textarea"
                  rows="4"
                />
                <div className="accessoryform-textarea-info">
                  <Info size={14} />
                  <span>Optional notes for installation team</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="accessoryform-error-message">
              <AlertCircle className="accessoryform-error-icon" />
              {errors.submit}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="accessoryform-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="accessoryform-btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          {selectedVariant && (
            <button 
              type="button" 
              onClick={handleSubmit} 
              className="accessoryform-btn-save"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="accessoryform-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="accessoryform-btn-icon" />
                  {accessory ? 'Update Accessory' : 'Add Accessory'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Product Browser Modal */}
      <ProductVariantBrowser
        isOpen={showProductBrowser}
        selectedVariant={selectedVariant}
        onSelect={handleVariantSelect}
        onClose={() => setShowProductBrowser(false)}
      />
    </div>
  );
};

export default AccessoryForm;