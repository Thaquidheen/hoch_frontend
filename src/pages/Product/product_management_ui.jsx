import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Filter, Eye, Edit, Trash2, Package, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  BarChart3, Grid, List, RefreshCw, Download,
  ShoppingCart, Tag, Layers, Palette, Save, X,
  Ruler, DollarSign, Image, Upload,Calculator,
} from 'lucide-react';
import './ProductManagement.css';
import axiosInstance from '../../service/api';
import  ProductVariantService  from '../../service/product_api_service';

// API Services
export const ProductAPI = {
  // Product CRUD operations
  getProducts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/products/', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/products/${id}/`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  searchProducts: async (searchParams) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/search/', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Product Variant operations with simplified structure
  getVariants: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-variants/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching variants:', error);
      throw error;
    }
  },

  createVariant: async (variantData) => {
    try {
      // Structure for your simplified backend
      const payload = {
        product: variantData.product,
        
        // Simplified size inputs
        size_width: parseFloat(variantData.size_width) || null,
        size_height: parseFloat(variantData.size_height) || null,
        size_depth: parseFloat(variantData.size_depth) || null,
        
        // Simplified color input
        color_name: variantData.color_name || '',
        
        // Material code
        material_code: variantData.material_code,
        
        // Pricing (backend will auto-calculate tax_amount, discount_amount, company_price)
        mrp: parseFloat(variantData.mrp),
        tax_rate: parseFloat(variantData.tax_rate || 18),
        discount_rate: parseFloat(variantData.discount_rate || 0),
        
        // Other fields
        stock_quantity: parseInt(variantData.stock_quantity || 0),
        sku_code: variantData.sku_code || '',
        is_active: variantData.is_active !== false
      };
      
      const response = await axiosInstance.post('/api/catalog/product-variants/', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating variant:', error);
      throw error;
    }
  },

  updateVariant: async (id, variantData) => {
    try {
      const payload = {
        // Only include fields that can be updated
        size_width: parseFloat(variantData.size_width) || null,
        size_height: parseFloat(variantData.size_height) || null,
        size_depth: parseFloat(variantData.size_depth) || null,
        color_name: variantData.color_name || '',
        material_code: variantData.material_code,
        mrp: parseFloat(variantData.mrp),
        tax_rate: parseFloat(variantData.tax_rate || 18),
        discount_rate: parseFloat(variantData.discount_rate || 0),
        stock_quantity: parseInt(variantData.stock_quantity || 0),
        sku_code: variantData.sku_code || '',
        is_active: variantData.is_active !== false
      };

      const response = await axiosInstance.put(`/api/catalog/product-variants/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating variant:', error);
      throw error;
    }
  },

  deleteVariant: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/product-variants/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting variant:', error);
      throw error;
    }
  },

  // NEW: Price calculation endpoints
  calculatePrice: async (priceData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/calculate-price/', {
        mrp: parseFloat(priceData.mrp),
        tax_rate: parseFloat(priceData.tax_rate || 18),
        discount_rate: parseFloat(priceData.discount_rate || 0)
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  },

  // NEW: Update variant pricing with auto-recalculation
  updateVariantPricing: async (id, pricingData) => {
    try {
      const response = await axiosInstance.post(`/api/catalog/product-variants/${id}/update-pricing/`, {
        mrp: parseFloat(pricingData.mrp),
        tax_rate: parseFloat(pricingData.tax_rate),
        discount_rate: parseFloat(pricingData.discount_rate)
      });
      return response.data;
    } catch (error) {
      console.error('Error updating variant pricing:', error);
      throw error;
    }
  },

  // NEW: Get detailed price breakdown for a variant
  getVariantPriceBreakdown: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/product-variants/${id}/price-breakdown/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price breakdown:', error);
      throw error;
    }
  },

  // NEW: Search variants by color
  getVariantsByColor: async (color) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-variants/by-color/', {
        params: { color }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching variants by color:', error);
      throw error;
    }
  },

  // NEW: Search variants by size range
  getVariantsBySizeRange: async (sizeParams) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-variants/by-size-range/', {
        params: sizeParams
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching variants by size range:', error);
      throw error;
    }
  },

  // Stock management
  updateVariantStock: async (id, stockQuantity) => {
    try {
      const response = await axiosInstance.post(`/api/catalog/product-variants/${id}/update-stock/`, {
        stock_quantity: parseInt(stockQuantity)
      });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Image upload for variants
  uploadVariantImages: async (variantId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
        formData.append(`alt_text_${index}`, file.name);
      });
      
      const response = await axiosInstance.post(
        `/api/catalog/product-variants/${variantId}/upload-images/`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },

  // Reference data
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getBrands: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/brands/');
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // NEW: Get catalog utilities (colors, size ranges, etc.)
  getCatalogUtilities: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/utilities/');
      return response.data;
    } catch (error) {
      console.error('Error fetching catalog utilities:', error);
      throw error;
    }
  },

  // Dashboard and analytics
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  getSearchSuggestions: async (query) => {
    try {
      const response = await axiosInstance.get('/api/catalog/search-suggestions/', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  },

  getPriceAnalysis: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/price-analysis/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching price analysis:', error);
      throw error;
    }
  },

  getInventoryReport: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/inventory-report/');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  }
};

// Utility functions for price calculations
export const PriceUtils = {
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
    }).format(amount);
  },

  formatDimensions: (width, height, depth) => {
    const parts = [];
    if (width) parts.push(`W:${width}`);
    if (height) parts.push(`H:${height}`);
    if (depth) parts.push(`D:${depth}`);
    return parts.length ? parts.join(' × ') + 'mm' : 'Custom';
  }
};

// Hook for real-time price calculation
export const usePriceCalculation = (mrp, taxRate = 18, discountRate = 0) => {
  const [calculations, setCalculations] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (mrp && mrp > 0) {
      setLoading(true);
      
      // Calculate immediately for instant feedback
      const taxAmount = PriceUtils.calculateTax(mrp, taxRate);
      const discountAmount = PriceUtils.calculateDiscount(mrp, discountRate);
      const companyPrice = PriceUtils.calculateCompanyPrice(mrp, taxRate, discountRate);
      
      setCalculations({
        mrp: parseFloat(mrp),
        tax_rate: parseFloat(taxRate),
        tax_amount: taxAmount,
        discount_rate: parseFloat(discountRate),
        discount_amount: discountAmount,
        company_price: companyPrice
      });
      
      setLoading(false);
    } else {
      setCalculations(null);
    }
  }, [mrp, taxRate, discountRate]);

  return { calculations, loading };
};





// Product Form Modal Component

const ProductFormModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    description: '',
    meta_title: '',
    meta_description: '',
    is_active: true
  });

  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  
  // Ref for the single file input
  const fileInputRef = useRef(null);
  // State to track which variant is currently being assigned an image
  const [activeImageUploadIndex, setActiveImageUploadIndex] = useState(null);


  // --- Effects ---

  // Effect to initialize or reset the form state when the modal opens or the product changes
  useEffect(() => {
    if (isOpen) {
      loadReferenceData();
      if (product) {
        setFormData({
          name: product.name || '',
          category: product.category || '',
          brand: product.brand || '',
          description: product.description || '',
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
          is_active: product.is_active !== undefined ? product.is_active : true
        });
        // Initialize variants with image preview URLs
        setVariants(product.variants?.map(v => ({...v, imagePreview: v.image_url, imageFile: null})) || []);
      } else {
        // Reset for a new product
        setFormData({
          name: '', category: '', brand: '', description: '',
          meta_title: '', meta_description: '', is_active: true
        });
        setVariants([]);
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, product]);

  // --- Data Loading ---

  const loadReferenceData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        axiosInstance.get('/api/catalog/categories/'),
        axiosInstance.get('/api/catalog/brands/')
      ]);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
      setBrands(brandsRes.data.results || brandsRes.data || []);
    } catch (error) {
      console.error('Error loading reference data:', error);
      alert('Failed to load categories and brands.');
    }
  };

  // --- Variant Management ---

  const addVariant = () => {
    const newVariant = {
      id: `temp_${Date.now()}`,
      size_width: '', size_height: '', size_depth: '',
      color_name: '', material_code: '', mrp: '',
      tax_rate: 18.00, discount_rate: 0.00,
      stock_quantity: 0, sku_code: '', is_active: true,
      imageFile: null, // To hold the selected File object
      imagePreview: null // To hold the data URL for preview
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((variant, i) => {
      if (i === index) {
        const updated = { ...variant, [field]: value };
        // Auto-calculate price preview
        if (['mrp', 'tax_rate', 'discount_rate'].includes(field)) {
          const mrp = updated.mrp;
          const taxRate = updated.tax_rate;
          const discountRate = updated.discount_rate;
          if (mrp && mrp > 0) {
            const taxAmount = (parseFloat(mrp) * parseFloat(taxRate)) / 100;
            const discountAmount = (parseFloat(mrp) * parseFloat(discountRate)) / 100;
            updated._calculated = {
              tax_amount: taxAmount.toFixed(2),
              discount_amount: discountAmount.toFixed(2),
              company_price: (parseFloat(mrp) + taxAmount - discountAmount).toFixed(2)
            };
          } else {
            delete updated._calculated;
          }
        }
        return updated;
      }
      return variant;
    }));
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // --- Image Handling ---

  const handleImageUploadClick = (index) => {
    setActiveImageUploadIndex(index); // Set which variant is getting the image
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event) => {
    const file = event.target.files[0];
    if (file && activeImageUploadIndex !== null) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update the specific variant with the new image file and preview
        setVariants(prev => prev.map((variant, i) => 
          i === activeImageUploadIndex 
            ? { ...variant, imageFile: file, imagePreview: e.target.result } 
            : variant
        ));
      };
      reader.readAsDataURL(file);
    }
    // Reset the file input value so the same file can be re-selected
    event.target.value = ''; 
  };
  
  const removeVariantImage = (index) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index 
        ? { ...variant, imageFile: null, imagePreview: null } 
        : variant
    ));
  };

  // --- Form Submission ---

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';

    variants.forEach((variant, index) => {
      if (!variant.material_code?.trim()) newErrors[`variant_${index}_material_code`] = 'Material code is required';
      if (!variant.mrp || Number(variant.mrp) <= 0) newErrors[`variant_${index}_mrp`] = 'Valid MRP is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Save the main product data (which is JSON)
      const productPayload = { 
        ...formData,
        category: parseInt(formData.category),
        brand: parseInt(formData.brand)
      };
      
      const productResponse = product 
        ? await axiosInstance.put(`/api/catalog/products/${product.id}/`, productPayload)
        : await axiosInstance.post('/api/catalog/products/', productPayload);
      
      const savedProduct = productResponse.data;

      // 2. Save each variant, handling images with FormData
      for (const variant of variants) {
        const variantFormData = new FormData();
        variantFormData.append('product', savedProduct.id);
        variantFormData.append('material_code', variant.material_code);
        variantFormData.append('mrp', parseFloat(variant.mrp));
        
        // Append optional fields only if they have a value
        if (variant.size_width) variantFormData.append('size_width', parseFloat(variant.size_width));
        if (variant.size_height) variantFormData.append('size_height', parseFloat(variant.size_height));
        if (variant.size_depth) variantFormData.append('size_depth', parseFloat(variant.size_depth));
        if (variant.color_name) variantFormData.append('color_name', variant.color_name);
        if (variant.sku_code) variantFormData.append('sku_code', variant.sku_code);

        variantFormData.append('tax_rate', parseFloat(variant.tax_rate || 18));
        variantFormData.append('discount_rate', parseFloat(variant.discount_rate || 0));
        variantFormData.append('stock_quantity', parseInt(variant.stock_quantity || 0));
        variantFormData.append('is_active', variant.is_active !== false);

        // Append the new image file if it exists
        if (variant.imageFile) {
          variantFormData.append('image', variant.imageFile);
        }

        const isNewVariant = !variant.id || variant.id.toString().startsWith('temp_');
        
        if (isNewVariant) {
          await axiosInstance.post('/api/catalog/product-variants/', variantFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await axiosInstance.put(`/api/catalog/product-variants/${variant.id}/`, variantFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product and variants:', error.response?.data || error.message);
      alert('An error occurred while saving. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- Render ---
  return (
    <div className="pm-modal-backdrop">
      <div className="pm-modal pm-modal-lg">
        <div className="pm-modal-header">
          <div>
            <h2 className="pm-modal-title">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="pm-modal-subtitle">{product ? 'Update product information and variants' : 'Create a new product with variants'}</p>
          </div>
          <button onClick={onClose} className="pm-modal-close" disabled={loading}><X className="pm-icon" /></button>
        </div>

        <div className="pm-tabs">
          {[{ key: 'basic', label: 'Basic Info', icon: Package }, { key: 'variants', label: 'Variants', icon: Layers }, { key: 'seo', label: 'SEO', icon: Tag }].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`pm-tab ${activeTab === key ? 'active' : ''}`} disabled={loading}>
              <Icon className="pm-icon-sm" /> {label}
            </button>
          ))}
        </div>

        <div className="pm-modal-body">
          {activeTab === 'basic' && (
            <div className="pm-form-grid pm-grid-2">
              {/* Basic Info Fields: Name, Category, Brand, etc. */}
              <div className="pm-form-group">
                <label className="pm-label pm-required">Product Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className={`pm-input ${errors.name ? 'pm-error' : ''}`} placeholder="Enter product name" disabled={loading} />
                {errors.name && <p className="pm-error-text">{errors.name}</p>}
              </div>
              <div className="pm-form-group">
                <label className="pm-label pm-required">Category</label>
                <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className={`pm-select ${errors.category ? 'pm-error' : ''}`} disabled={loading}>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                {errors.category && <p className="pm-error-text">{errors.category}</p>}
              </div>
              <div className="pm-form-group">
                <label className="pm-label pm-required">Brand</label>
                <select value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))} className={`pm-select ${errors.brand ? 'pm-error' : ''}`} disabled={loading}>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.brand && <p className="pm-error-text">{errors.brand}</p>}
              </div>
              <div className="pm-checkbox-group">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} className="pm-checkbox" disabled={loading} />
                <span className="pm-label">Active</span>
              </div>
              <div className="pm-form-group pm-full-width">
                <label className="pm-label">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} className="pm-textarea" placeholder="Enter product description" disabled={loading} />
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div>
              <div className="pm-section-header">
                <h3 className="pm-section-title">Product Variants</h3>
                <button onClick={addVariant} className="pm-btn pm-btn-primary" disabled={loading}><Plus className="pm-icon-sm" /> Add Variant</button>
              </div>
              {variants.length === 0 ? (
                <div className="pm-empty">
                  <Layers className="pm-empty-icon" />
                  <h4 className="pm-empty-title">No variants added</h4>
                  <p className="pm-empty-text">Add variants with specific sizes, colors, images, and prices.</p>
                  <button onClick={addVariant} className="pm-btn pm-btn-primary" disabled={loading}><Plus className="pm-icon-sm" /> Add First Variant</button>
                </div>
              ) : (
                <div>
                  {/* Hidden file input, controlled by ref */}
                  <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept="image/*" style={{ display: 'none' }} />
                  {variants.map((variant, index) => (
                    <div key={variant.id || index} className="pm-variant-card">
                      <div className="pm-variant-header">
                        <h4 className="pm-variant-title">Variant {index + 1}</h4>
                        <button onClick={() => removeVariant(index)} className="pm-btn-icon-text pm-btn-danger" disabled={loading}><Trash2 className="pm-icon-sm" /> Remove</button>
                      </div>
                      <div className="pm-variant-content-grid">
                        {/* Image Section */}
                        <div className="pm-form-group pm-variant-image-section">
                          <label className="pm-label">Image</label>
                          {variant.imagePreview ? (
                            <div className="pm-image-preview-wrapper">
                              <img src={variant.imagePreview} alt="Variant" className="pm-image-preview" />
                              <button onClick={() => removeVariantImage(index)} className="pm-btn-icon pm-btn-danger" title="Remove Image"><Trash2 className="pm-icon-sm" /></button>
                            </div>
                          ) : (
                            <div className="pm-image-placeholder" onClick={() => handleImageUploadClick(index)}>
                              <Image className="pm-icon" />
                              <span>Click to upload</span>
                            </div>
                          )}
                          {/* <button onClick={() => handleImageUploadClick(index)} className="pm-btn pm-btn-secondary pm-btn-full pm-mt-2"><Upload className="pm-icon-sm"/> {variant.imagePreview ? 'Change' : 'Upload'}</button> */}
                        </div>
                        {/* Details Section */}
                        <div className="pm-variant-details-section">
                          <div className="pm-form-grid pm-grid-3">
                            {/* Material Code, Size, Color, Pricing */}
                            <div className="pm-form-group">
                                <label className="pm-label pm-required">Material Code</label>
                                <input type="text" value={variant.material_code || ''} onChange={(e) => updateVariant(index, 'material_code', e.target.value)} className={`pm-input ${errors[`variant_${index}_material_code`] ? 'pm-error' : ''}`} placeholder="e.g., SS304-600" disabled={loading} />
                            </div>
                            <div className="pm-form-group">
                                <label className="pm-label">Width (mm)</label>
                                <input type="number" value={variant.size_width || ''} onChange={(e) => updateVariant(index, 'size_width', e.target.value)} className="pm-input" placeholder="Optional" min="0" step="0.01" disabled={loading} />
                            </div>
                            <div className="pm-form-group">
                                <label className="pm-label">Height (mm)</label>
                                <input type="number" value={variant.size_height || ''} onChange={(e) => updateVariant(index, 'size_height', e.target.value)} className="pm-input" placeholder="Optional" min="0" step="0.01" disabled={loading} />
                            </div>
                            <div className="pm-form-group">
                                <label className="pm-label">Depth (mm)</label>
                                <input type="number" value={variant.size_depth || ''} onChange={(e) => updateVariant(index, 'size_depth', e.target.value)} className="pm-input" placeholder="Optional" min="0" step="0.01" disabled={loading} />
                            </div>
                            <div className="pm-form-group">
                                <label className="pm-label">Color</label>
                                <input type="text" value={variant.color_name || ''} onChange={(e) => updateVariant(index, 'color_name', e.target.value)} className="pm-input" placeholder="e.g., Silver" disabled={loading} />
                            </div>
                             <div className="pm-form-group">
                                <label className="pm-label pm-required">MRP (₹)</label>
                                <input type="number" value={variant.mrp || ''} onChange={(e) => updateVariant(index, 'mrp', e.target.value)} className={`pm-input ${errors[`variant_${index}_mrp`] ? 'pm-error' : ''}`} placeholder="0.00" min="0" step="0.01" disabled={loading} />
                            </div>
                             <div className="pm-form-group">
                                <label className="pm-label">Tax (%)</label>
                                <input type="number" value={variant.tax_rate || 18} onChange={(e) => updateVariant(index, 'tax_rate', e.target.value)} className="pm-input" placeholder="18" min="0" max="100" step="0.01" disabled={loading} />
                            </div>
                             <div className="pm-form-group">
                                <label className="pm-label">Discount (%)</label>
                                <input type="number" value={variant.discount_rate || 0} onChange={(e) => updateVariant(index, 'discount_rate', e.target.value)} className="pm-input" placeholder="0" min="0" max="100" step="0.01" disabled={loading} />
                            </div>
                             <div className="pm-form-group">
                                <label className="pm-label">Stock</label>
                                <input type="number" value={variant.stock_quantity || 0} onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)} className="pm-input" placeholder="0" min="0" disabled={loading} />
                            </div>
                          </div>
                          {variant.mrp && variant._calculated && (
                            <div className="pm-card pm-mt-4 pm-price-preview">
                              <h5 className="pm-heading-bold pm-mb-2"><Calculator className="pm-icon-sm" /> Price Preview</h5>
                              <div className="pm-price-breakdown">
                                <span>MRP: {PriceUtils.formatCurrency(variant.mrp)}</span>
                                <span className="pm-text-success">+ Tax: {PriceUtils.formatCurrency(variant._calculated.tax_amount)}</span>
                                <span className="pm-text-danger">- Disc: {PriceUtils.formatCurrency(variant._calculated.discount_amount)}</span>
                                <span className="pm-text-accent pm-text-bold">= {PriceUtils.formatCurrency(variant._calculated.company_price)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div>
              {/* SEO Fields: Meta Title, Meta Description */}
               <div className="pm-form-group">
                  <label className="pm-label">Meta Title</label>
                  <input type="text" value={formData.meta_title} onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))} className="pm-input" placeholder="Enter meta title for SEO" maxLength={60} disabled={loading} />
                  <p className="pm-text-sm pm-text-secondary pm-mt-1">{formData.meta_title.length}/60 characters</p>
                </div>
                <div className="pm-form-group">
                  <label className="pm-label">Meta Description</label>
                  <textarea value={formData.meta_description} onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))} rows={4} className="pm-textarea" placeholder="Enter meta description for SEO" maxLength={160} disabled={loading} />
                  <p className="pm-text-sm pm-text-secondary pm-mt-1">{formData.meta_description.length}/160 characters</p>
                </div>
            </div>
          )}
        </div>

        <div className="pm-modal-footer">
          <button onClick={onClose} className="pm-btn pm-btn-secondary" disabled={loading}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={loading} className="pm-btn pm-btn-primary">
            {loading ? (<><div className="pm-spinner"></div>Saving...</>) : (<><Save className="pm-icon-sm" /> Save Product</>)}
          </button>
        </div>
      </div>
    </div>
  );
};



// Product Detail Modal Component
const ProductDetailModal = ({ isOpen, onClose, product }) => {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      loadProductDetails();
    }
  }, [isOpen, product]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const details = await ProductAPI.getProductById(product.id);
      setProductDetails(details);
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllImages = () => {
    if (!productDetails?.variants) return [];
    const allImages = [];
    productDetails.variants.forEach((variant, variantIndex) => {
      const variantImages =
        variant.all_images ||
        variant.images ||
        (variant.primary_image
          ? [{ image_url: variant.primary_image, alt_text: variant.material_code, is_primary: true }]
          : (variant.image
              ? [{ image_url: variant.image, alt_text: variant.material_code, is_primary: true }]
              : [])
        );

      variantImages.forEach((image, imageIndex) => {
        allImages.push({
          ...image,
          image_url: image.image_url || image.url || variant.primary_image || variant.image,
          variantIndex,
          variantName: variant.material_code,
          imageIndex
        });
      });
    });
    return allImages;
  };

  if (!isOpen) return null;

  const allImages = getAllImages();

  return (
    <div className="pm-modal-backdrop">
      <div className="pm-modal pm-modal-lg">
        <div className="pm-modal-header">
          <div>
            <h2 className="pm-modal-title">Product Details</h2>
            <p className="pm-modal-subtitle">{product?.name}</p>
          </div>
          <button onClick={onClose} className="pm-modal-close">
            <X className="pm-icon" />
          </button>
        </div>

        <div className="pm-modal-body">
          {loading ? (
            <div className="pm-loading">
              <RefreshCw className="pm-spinner" />
              <span className="pm-loading-text">Loading product details...</span>
            </div>
          ) : productDetails ? (
            <div>
              {allImages.length > 0 && (
                <div className="pm-image-section">
                  <h3 className="pm-section-title pm-mb-4">Product Images ({allImages.length})</h3>
                  <div className="pm-image-gallery">
                    {allImages.map((image, index) => (
                      <div 
                        key={`${image.variantIndex}-${image.imageIndex}`} 
                        className="pm-gallery-item"
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setShowImageModal(true);
                        }}
                      >
                        <img 
                          src={image.image_url || image.url} 
                          alt={image.alt_text || `${image.variantName} image`}
                          className="pm-gallery-img"
                          loading="lazy"
                        />
                        <div className="pm-image-info">
                          <p className="pm-image-label">{image.variantName}</p>
                          {image.is_primary && <span className="pm-badge-sm pm-badge-primary">Primary</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pm-card">
                <h3 className="pm-heading-bold pm-mb-4">Basic Information</h3>
                <div className="pm-form-grid pm-grid-2 pm-text-sm">
                  <div>
                    <span className="pm-text-secondary">Category:</span>
                    <span className="pm-text-bold pm-ml-2">{productDetails.category_name}</span>
                  </div>
                  <div>
                    <span className="pm-text-secondary">Brand:</span>
                    <span className="pm-text-bold pm-ml-2">{productDetails.brand_name}</span>
                  </div>
                  <div>
                    <span className="pm-text-secondary">Status:</span>
                    <span className={`pm-badge ${productDetails.is_active ? 'pm-badge-success' : 'pm-badge-inactive'}`}>
                      {productDetails.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="pm-text-secondary">Variants:</span>
                    <span className="pm-text-bold pm-ml-2">{productDetails.variants_count || 0}</span>
                  </div>
                  <div>
                    <span className="pm-text-secondary">Total Images:</span>
                    <span className="pm-text-bold pm-ml-2">{allImages.length}</span>
                  </div>
                </div>
                {productDetails.description && (
                  <div className="pm-mt-4">
                    <span className="pm-text-secondary">Description:</span>
                    <p className="pm-text-white pm-mt-1">{productDetails.description}</p>
                  </div>
                )}
              </div>

              {productDetails.variants && productDetails.variants.length > 0 && (
                <div className="pm-mt-6">
                  <h3 className="pm-heading-bold pm-mb-4">Product Variants</h3>
                  <div>
                    {productDetails.variants.map((variant, index) => {
                      const images = variant.all_images 
                        || variant.images 
                        || (variant.image ? [{ image_url: variant.image, alt_text: variant.material_code, is_primary: true }] : []);
                      return (
                        <div key={variant.id} className="pm-variant-card">
                          <div className="pm-variant-header pm-mb-2">
                            <h4 className="pm-variant-title">{variant.material_code}</h4>
                            <div className="pm-badge-group">
                              <span className={`pm-badge ${variant.is_active ? 'pm-badge-success' : 'pm-badge-inactive'}`}>
                                {variant.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {images.length > 0 && (
                                <span className="pm-badge pm-badge-info">
                                  {images.length} image(s)
                                </span>
                              )}
                            </div>
                          </div>

                          {images.length > 0 && (
                            <div className="pm-thumbnail-row">
                              {images.slice(0, 4).map((image, imgIndex) => (
                                <div key={imgIndex} className="pm-thumbnail">
                                  <img 
                                    src={image.image_url || image.url}
                                    alt={image.alt_text || `${variant.material_code} ${imgIndex + 1}`}
                                    className="pm-thumbnail-img"
                                  />
                                  {image.is_primary && (
                                    <div className="pm-thumbnail-badge">P</div>
                                  )}
                                </div>
                              ))}
                              {images.length > 4 && (
                                <div className="pm-thumbnail-more">
                                  +{images.length - 4}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pm-form-grid pm-grid-3 pm-text-sm">
                            <div>
                              <span className="pm-text-secondary">Size:</span>
                              <span className="pm-ml-1">{variant.size_display || 'Custom'}</span>
                            </div>
                            <div>
                              <span className="pm-text-secondary">Color:</span>
                              <span className="pm-ml-1">{variant.color_display || 'Default'}</span>
                            </div>
                        
                            <div>
                              <span className="pm-text-secondary">Price:</span>
                              <span className="pm-ml-1 pm-text-bold pm-text-accent">₹{variant.value}</span>
                            </div>
                            <div>
                              <span className="pm-text-secondary">Stock:</span>
                              <span className={`pm-ml-1 ${variant.stock_quantity === 0 ? 'pm-text-danger' : variant.stock_quantity <= 10 ? 'pm-text-warning' : 'pm-text-success'}`}>
                                {variant.stock_quantity} units
                              </span>
                            </div>
                            <div>
                              <span className="pm-text-secondary">Discount:</span>
                              <span className="pm-ml-1">{variant.discount_percentage}%</span>
                            </div>
                            <div>
                              <span className="pm-text-secondary">Tax:</span>
                              <span className="pm-ml-1">{variant.tax_percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(productDetails.meta_title || productDetails.meta_description) && (
                <div className="pm-card pm-mt-6">
                  <h3 className="pm-heading-bold pm-mb-4">SEO Information</h3>
                  {productDetails.meta_title && (
                    <div className="pm-mb-2">
                      <span className="pm-text-secondary">Meta Title:</span>
                      <p className="pm-text-white pm-mt-1">{productDetails.meta_title}</p>
                    </div>
                  )}
                  {productDetails.meta_description && (
                    <div>
                      <span className="pm-text-secondary">Meta Description:</span>
                      <p className="pm-text-white pm-mt-1">{productDetails.meta_description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="pm-empty">
              <Package className="pm-empty-icon" />
              <p className="pm-empty-text">Failed to load product details</p>
            </div>
          )}
        </div>
      </div>

      {showImageModal && allImages.length > 0 && (
        <div className="pm-image-modal-backdrop" onClick={() => setShowImageModal(false)}>
          <div className="pm-image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm-image-modal-header">
              <h3>Image {selectedImageIndex + 1} of {allImages.length}</h3>
              <button onClick={() => setShowImageModal(false)} className="pm-modal-close">
                <X className="pm-icon" />
              </button>
            </div>
            <div className="pm-image-modal-body">
              <img 
                src={allImages[selectedImageIndex]?.image_url || allImages[selectedImageIndex]?.url}
                alt={allImages[selectedImageIndex]?.alt_text}
                className="pm-image-modal-img"
              />
              <div className="pm-image-modal-info">
                <p>Variant: {allImages[selectedImageIndex]?.variantName}</p>
                {allImages[selectedImageIndex]?.is_primary && <span className="pm-badge pm-badge-primary">Primary Image</span>}
              </div>
            </div>
            <div className="pm-image-modal-footer">
              <button 
                onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                disabled={selectedImageIndex === 0}
                className="pm-btn pm-btn-secondary"
              >
                Previous
              </button>
              <span className="pm-image-counter">{selectedImageIndex + 1} / {allImages.length}</span>
              <button 
                onClick={() => setSelectedImageIndex(Math.min(allImages.length - 1, selectedImageIndex + 1))}
                disabled={selectedImageIndex === allImages.length - 1}
                className="pm-btn pm-btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// Product Management Component
const ProductManagement = () => {
  // State Management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Make media URLs absolute (handles relative /media/... too)
  const toAbsoluteUrl = (u) => {
    if (!u) return null;
    if (/^(https?:)?\/\//i.test(u) || u.startsWith('data:')) return u;
    const base = axiosInstance?.defaults?.baseURL || window.location.origin;
    return `${base.replace(/\/+$/, '')}/${String(u).replace(/^\/+/, '')}`;
  };

  const attachMrpRange = async (list) => {
    return Promise.all(
      (list || []).map(async (p) => {
        try {
          const resp = await ProductVariantService.getAll({ product: p.id, page_size: 100 });
          const variants = Array.isArray(resp?.results) ? resp.results : (Array.isArray(resp) ? resp : []);
          const mrps = variants.map(v => Number(v?.mrp)).filter(Number.isFinite);

          // pick image from primary_image, image, images[0], or all_images[0]
          const withAnyImage = variants.find(v =>
            v?.primary_image || v?.image ||
            (Array.isArray(v?.images) && v.images.length) ||
            (Array.isArray(v?.all_images) && v.all_images.length)
          );

          let thumbnail_url = null;
          if (withAnyImage) {
            thumbnail_url =
              withAnyImage.primary_image ||
              withAnyImage.image ||
              withAnyImage.images?.[0]?.image_url || withAnyImage.images?.[0]?.url ||
              withAnyImage.all_images?.[0]?.image_url || withAnyImage.all_images?.[0]?.url ||
              null;
          }

          // normalize to absolute URL and cache-bust
          if (thumbnail_url) {
            thumbnail_url = toAbsoluteUrl(thumbnail_url);
            thumbnail_url = `${thumbnail_url}${thumbnail_url.includes('?') ? '&' : '?'}t=${Date.now()}`;
          }

          const price_range = mrps.length
            ? (Math.min(...mrps) === Math.max(...mrps)
                ? `₹${Math.min(...mrps).toFixed(2)}`
                : `₹${Math.min(...mrps).toFixed(2)} - ₹${Math.max(...mrps).toFixed(2)}`)
            : (p.price_range ?? null);

          return { ...p, price_range, thumbnail_url };
        } catch (e) {
          console.warn('MRP/image fetch failed for product', p.id, e);
          return { ...p, price_range: p.price_range ?? null, thumbnail_url: p.thumbnail_url ?? null };
        }
      })
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, brandsData, statsData] = await Promise.all([
        ProductAPI.getProducts(),
        ProductAPI.getCategories(),
        ProductAPI.getBrands(),
        ProductAPI.getDashboard()
      ]);
      const rawProducts = productsData.results || productsData || [];
      const productsWithMrp = await attachMrpRange(rawProducts);
      setProducts(productsWithMrp);
      setCategories(categoriesData.results || categoriesData || []);
      setBrands(brandsData.results || brandsData || []);
      setDashboardStats(statsData || {});
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays to prevent errors
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setDashboardStats({});
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await ProductAPI.deleteProduct(productId);
        await loadData(); // Refresh the list
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleProductSaved = () => {
    loadData(); // Refresh the list after saving
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const searchResults = await ProductAPI.searchProducts({ query: searchTerm });
        const raw = searchResults.results || searchResults || [];
        const withMrpAndThumb = await attachMrpRange(raw);
        setProducts(withMrpAndThumb);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadData();
    }
  };

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.category_name === selectedCategory;
      const matchesBrand = !selectedBrand || product.brand_name === selectedBrand;
      
      const matchesActive = activeFilter === 'all' || 
                           (activeFilter === 'active' && product.is_active) ||
                           (activeFilter === 'inactive' && !product.is_active);
      
      return matchesSearch && matchesCategory && matchesBrand && matchesActive;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, activeFilter]);

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, trend }) => (
    <div className="pm-stats-card">
      <div className="pm-stats-content">
        <div>
          <p className="pm-stats-label">{title}</p>
          <p className="pm-stats-value">{value || 0}</p>
          {trend && (
            <p className={`pm-stats-trend ${trend > 0 ? 'pm-trend-up' : 'pm-trend-down'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className="pm-stats-icon">
          <Icon className="pm-icon" />
        </div>
      </div>
    </div>
  );

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="pm-product-card">
      {/* image */}
      <div className="pm-product-thumb">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="pm-product-img"
            loading="lazy"
          />
        ) : (
          <Image className="pm-icon-lg pm-icon-muted" />
        )}
      </div>

      {/* header */}
      <div className="pm-product-header">
        <div>
          <h3 className="pm-product-title">{product.name}</h3>
          <div className="pm-product-meta">
            <span className="pm-meta-item">
              <Layers className="pm-icon-sm" />
              {product.category_name}
            </span>
            <span className="pm-meta-item">
              <Tag className="pm-icon-sm" />
              {product.brand_name}
            </span>
          </div>
        </div>
        <div className={`pm-badge ${product.is_active ? 'pm-badge-success' : 'pm-badge-inactive'}`}>
          {product.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* details */}
      <div className="pm-product-details">
        <div className="pm-detail-row">
          <span className="pm-detail-label">Price Range</span>
          <span className="pm-detail-value pm-text-accent">{product.price_range || 'N/A'}</span>
        </div>
        <div className="pm-detail-row">
          <span className="pm-detail-label">Variants</span>
          <span className="pm-detail-value">{product.variants_count || 0}</span>
        </div>
      </div>
      
      {/* actions */}
      <div className="pm-product-footer">
        <span className="pm-product-date">
          {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
        </span>
        <div className="pm-action-group">
          <button 
            onClick={() => handleViewProduct(product)}
            className="pm-btn-icon"
            title="View Details"
            aria-label="View details"
          >
            <Eye className="pm-icon-sm" />
          </button>
          <button 
            onClick={() => handleEditProduct(product)}
            className="pm-btn-icon"
            title="Edit Product"
            aria-label="Edit product"
          >
            <Edit className="pm-icon-sm" />
          </button>
          <button 
            onClick={() => handleDeleteProduct(product.id)}
            className="pm-btn-icon pm-btn-danger"
            title="Delete Product"
            aria-label="Delete product"
          >
            <Trash2 className="pm-icon-sm" />
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="pm-container">
        <div className="pm-loading">
          <RefreshCw className="pm-spinner" />
          <p className="pm-loading-text">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-container">
      {/* Header */}
      <div className="pm-header">
        <div className="pm-wrapper">
          <div>
            <h1 className="pm-title">Product Management</h1>
            <p className="pm-subtitle">Manage your product catalog and inventory</p>
          </div>
          <div className="pm-btn-group">
            <button 
              onClick={loadData}
              className="pm-btn pm-btn-secondary"
            >
              <RefreshCw className="pm-icon-sm" />
              Refresh
            </button>
        
            <button 
              onClick={handleAddProduct}
              className="pm-btn pm-btn-primary"
            >
              <Plus className="pm-icon-sm" />
              Add Product
            </button>
          </div>
        </div>
      </div>
      <div className="pm-wrapper">
        {/* Stats Cards */}
        <div className="pm-stats-grid">
          <StatsCard
            icon={Package}
            title="Total Products"
            value={dashboardStats.total_products}
          />
          <StatsCard
            icon={Layers}
            title="Product Variants"
            value={dashboardStats.total_variants}
          />
         
        </div>

        {/* Search and Filters */}
        <div className="pm-search-bar">
          <div className="pm-search-rows">
            <div className="pm-search-input-wrapper">
              <Search className="pm-search-icon" />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pm-search-input"
              />
            </div>
            
            <div className="pm-filter-controls">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pm-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="pm-select"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`pm-btn pm-btn-secondary ${showFilters ? 'active' : ''}`}
              >
                <Filter className="pm-icon-sm" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="pm-filter-pills">
              <span className="pm-filter-label">Status:</span>
              {['all', 'active', 'inactive'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`pm-filter-pill ${activeFilter === filter ? 'pm-pill-active' : 'pm-pill-inactive'}`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* View Toggle and Results */}
        <div className="pm-view-controls">
          <div>
            <span className="pm-results-count">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
          
          <div className="pm-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`pm-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid className="pm-icon-sm" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`pm-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List className="pm-icon-sm" />
            </button>
          </div>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div className="pm-product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="pm-product-table-wrapper">
            <table className="pm-table">
              <thead className="pm-table-header">
                <tr>
                  <th className="pm-table-cell">Product</th>
                  <th className="pm-table-cell">Price</th>
                  <th className="pm-table-cell">Variants</th>
                  <th className="pm-table-cell">Status</th>
                  <th className="pm-table-cell">Created</th>
                  <th className="pm-table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="pm-table-row">
                    <td className="pm-table-cell">
                      <div>
                        <div className="pm-text-bold">{product.name}</div>
                        <div className="pm-text-sm pm-text-secondary">{product.category_name} • {product.brand_name}</div>
                      </div>
                    </td>
                    <td className="pm-table-cell">{product.price_range || 'N/A'}</td>
                    <td className="pm-table-cell">{product.variants_count || 0}</td>
                    <td className="pm-table-cell">
                      <span className={`pm-badge ${product.is_active ? 'pm-badge-success' : 'pm-badge-inactive'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="pm-table-cell pm-text-secondary">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="pm-table-cell">
                      <div className="pm-action-group">
                        <button onClick={() => handleViewProduct(product)} className="pm-btn-icon" title="View Details">
                          <Eye className="pm-icon-sm" />
                        </button>
                        <button onClick={() => handleEditProduct(product)} className="pm-btn-icon" title="Edit Product">
                          <Edit className="pm-icon-sm" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="pm-btn-icon pm-btn-danger" title="Delete Product">
                          <Trash2 className="pm-icon-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="pm-empty">
            <Package className="pm-empty-icon" />
            <h3 className="pm-empty-title">No products found</h3>
            <p className="pm-empty-text">
              {searchTerm || selectedCategory || selectedBrand
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first product'
              }
            </p>
            <button 
              onClick={handleAddProduct}
              className="pm-btn pm-btn-primary"
            >
              <Plus className="pm-icon-sm" />
              Add Product
            </button>
          </div>
        )}

        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={showProductForm}
          onClose={() => setShowProductForm(false)}
          product={selectedProduct}
          onSave={handleProductSaved}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={showProductDetail}
          onClose={() => setShowProductDetail(false)}
          product={selectedProduct}
        />
      </div>
    </div>
  );
};

export default ProductManagement;