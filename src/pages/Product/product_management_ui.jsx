import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Filter, Eye, Edit, Trash2, Package, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  BarChart3, Grid, List, RefreshCw, Download,
  ShoppingCart, Tag, Layers, Palette, Save, X,
  Ruler, DollarSign, Image, Upload
} from 'lucide-react';
import './ProductManagement.css';
import axiosInstance from '../../service/api';
import { ProductVariantService } from '../../service/product_api_service';

// API Services
const ProductAPI = {
  getProducts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  uploadProductImages: async (variantId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
        formData.append(`alt_text_${index}`, file.name);
      });
      
      const response = await axiosInstance.post(`/api/catalog/product-variants/${variantId}/upload-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
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
  
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
  
  getColors: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/colors/');
      return response.data;
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  },
  
  getSizes: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-sizes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sizes:', error);
      throw error;
    }
  },

  // Variant APIs
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
      const response = await axiosInstance.post('/api/catalog/product-variants/', variantData);
      return response.data;
    } catch (error) {
      console.error('Error creating variant:', error);
      throw error;
    }
  },

  updateVariant: async (id, variantData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/product-variants/${id}/`, variantData);
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

  searchProducts: async (searchParams) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/search/', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

// Image Upload Component
const ImageUploadSection = ({ variantIndex, variant, onImagesChange, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isImage && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      alert('Some files were skipped. Only image files under 5MB are allowed.');
    }

    // Add new images to existing ones
    const existingImages = variant.images || [];
    const newImages = validFiles.map(file => ({
      id: `temp_${Date.now()}_${Math.random()}`,
      file: file,
      preview: URL.createObjectURL(file),
      alt_text: file.name,
      is_primary: existingImages.length === 0, // First image is primary
      uploading: false
    }));

    onImagesChange(variantIndex, 'images', [...existingImages, ...newImages]);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (imageIndex) => {
    const updatedImages = (variant.images || []).filter((_, index) => index !== imageIndex);
    
    // If we removed the primary image, make the first remaining image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.is_primary)) {
      updatedImages[0].is_primary = true;
    }
    
    onImagesChange(variantIndex, 'images', updatedImages);
  };

  const setPrimaryImage = (imageIndex) => {
    const updatedImages = (variant.images || []).map((img, index) => ({
      ...img,
      is_primary: index === imageIndex
    }));
    onImagesChange(variantIndex, 'images', updatedImages);
  };

  const updateAltText = (imageIndex, altText) => {
    const updatedImages = (variant.images || []).map((img, index) => 
      index === imageIndex ? { ...img, alt_text: altText } : img
    );
    onImagesChange(variantIndex, 'images', updatedImages);
  };

  const images = variant.images || [];

  return (
    <div className="pm-image-upload-section">
      {/* Upload Area */}
      <div
        className={`pm-image-dropzone ${dragActive ? 'active' : ''} ${loading ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="pm-hidden"
          disabled={loading}
        />
        
        <div className="pm-upload-content">
          <Upload className="pm-upload-icon" />
          <div className="pm-upload-text">
            <p className="pm-upload-primary">Click to upload or drag and drop</p>
            <p className="pm-upload-secondary">PNG, JPG, GIF up to 5MB each</p>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="pm-image-grid">
          {images.map((image, imageIndex) => (
            <div key={image.id || imageIndex} className="pm-image-card">
              <div className="pm-image-wrapper">
                <img
                  src={image.preview || image.image_url}
                  alt={image.alt_text || `Product image ${imageIndex + 1}`}
                  className="pm-image-preview"
                />
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="pm-badge-primary">Primary</div>
                )}
                
                {/* Upload Progress */}
                {image.uploading && (
                  <div className="pm-overlay">
                    <div className="pm-spinner"></div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="pm-image-actions">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(imageIndex)}
                    className={`pm-btn-icon ${image.is_primary ? 'active' : ''}`}
                    disabled={loading || image.is_primary}
                    title="Set as primary image"
                  >
                    <CheckCircle className="pm-icon-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(imageIndex)}
                    className="pm-btn-icon pm-btn-danger"
                    disabled={loading}
                    title="Remove image"
                  >
                    <Trash2 className="pm-icon-sm" />
                  </button>
                </div>
              </div>
              
              {/* Alt Text Input */}
              <div className="pm-image-meta">
                <input
                  type="text"
                  value={image.alt_text || ''}
                  onChange={(e) => updateAltText(imageIndex, e.target.value)}
                  placeholder="Alt text for accessibility"
                  className="pm-input-alt"
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDataLoading(true);
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
        setVariants(product.variants || []);
      } else {
        // Reset for new product
        setFormData({
          name: '',
          category: '',
          brand: '',
          description: '',
          meta_title: '',
          meta_description: '',
          is_active: true
        });
        setVariants([]);
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, product]);

  const loadReferenceData = async () => {
    try {
      const [categoriesData, brandsData, colorsData, sizesData] = await Promise.all([
        ProductAPI.getCategories(),
        ProductAPI.getBrands(),
        ProductAPI.getColors(),
        ProductAPI.getSizes()
      ]);
      
      setCategories(categoriesData.results || categoriesData || []);
      setBrands(brandsData.results || brandsData || []);
      setColors(colorsData.results || colorsData || []);
      setSizes(sizesData.results || sizesData || []);
    } catch (error) {
      console.error('Error loading reference data:', error);
      // Set empty arrays to prevent errors
      setCategories([]);
      setBrands([]);
      setColors([]);
      setSizes([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Split validation so Basic and Variants can be validated independently
  const validateBasic = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateVariants = () => {
    const newErrors = {};
    variants.forEach((variant, index) => {
      if (!variant.material_code?.trim()) {
        newErrors[`variant_${index}_material_code`] = 'Material code is required';
      }
      if (!variant.mrp || Number(variant.mrp) <= 0) {
        newErrors[`variant_${index}_mrp`] = 'Valid MRP is required';
      }
      if (!variant.value || Number(variant.value) <= 0) {
        newErrors[`variant_${index}_value`] = 'Valid selling price is required';
      }
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => validateBasic() && validateVariants();

  const handleNext = () => {
    if (validateBasic()) {
      setActiveTab('variants');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = { 
        ...formData,
        category: parseInt(formData.category),
        brand: parseInt(formData.brand)
      };
      
      let savedProduct;
      if (product) {
        savedProduct = await ProductAPI.updateProduct(product.id, productData);
      } else {
        savedProduct = await ProductAPI.createProduct(productData);
      }

      if (variants.length > 0) {
        for (const variant of variants) {
          const variantData = {
            ...variant,
            product: savedProduct.id,
            size: variant.size ? parseInt(variant.size) : null,
            color: variant.color ? parseInt(variant.color) : null,
            mrp: parseFloat(variant.mrp),
            value: parseFloat(variant.value),
            tax_percentage: parseFloat(variant.tax_percentage || 18),
            discount_percentage: parseFloat(variant.discount_percentage ?? 0),
            stock_quantity: parseInt(variant.stock_quantity ?? 0)
          };

          let savedVariant;
          if (variant.id && !variant.id.toString().startsWith('temp_')) {
            savedVariant = await ProductAPI.updateVariant(variant.id, variantData);
          } else {
            savedVariant = await ProductAPI.createVariant(variantData);
          }

          // Upload any new files for this variant
          if (variant.images && variant.images.length > 0) {
            const files = variant.images.filter(img => img.file).map(img => img.file);
            if (files.length) {
              try {
                await ProductAPI.uploadProductImages(savedVariant.id, files);
              } catch (imageError) {
                console.error('Error uploading images for variant:', savedVariant.id, imageError);
              }
            }
          }
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      const msg = error?.response?.data?.non_field_errors?.[0];
      if (msg) {
        alert(msg);
      } else {
        alert('Error saving product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    const newVariant = {
      id: `temp_${Date.now()}`, // Temporary ID for new variants
      material_code: '',
      size: '',
      color: '',
      custom_width: '',
      custom_height: '',
      custom_depth: '',
      mrp: '',
      tax_percentage: 18,
      discount_percentage: 0,
      value: '',
      stock_quantity: 0,
      sku_code: '',
      is_active: true
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
    
    // Clear variant-specific errors
    const errorKey = `variant_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    
    // Clear variant-specific errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`variant_${index}_`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  if (!isOpen) return null;

  return (
    <div className="pm-modal-backdrop">
      <div className="pm-modal">
        {/* Header */}
        <div className="pm-modal-header">
          <div>
            <h2 className="pm-modal-title">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="pm-modal-subtitle">
              {product ? 'Update product information and variants' : 'Create a new product with variants'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="pm-modal-close"
            disabled={loading}
          >
            <X className="pm-icon" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="pm-tabs">
          {[
            { key: 'basic', label: 'Basic Info', icon: Package },
            { key: 'variants', label: 'Variants', icon: Layers },
            { key: 'seo', label: 'SEO', icon: Tag }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pm-tab ${activeTab === key ? 'active' : ''}`}
              disabled={loading}
            >
              <Icon className="pm-icon-sm" />
              {label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="pm-modal-body">
          {dataLoading ? (
            <div className="pm-loading">
              <RefreshCw className="pm-spinner" />
              <span className="pm-loading-text">Loading form data...</span>
            </div>
          ) : (
            <>
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="pm-form-grid pm-grid-2">
                  <div className="pm-form-group">
                    <label className="pm-label pm-required">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pm-input ${errors.name ? 'pm-error' : ''}`}
                      placeholder="Enter product name"
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="pm-error-text">{errors.name}</p>
                    )}
                  </div>
                  <div className="pm-form-group">
                    <label className="pm-label pm-required">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`pm-select ${errors.category ? 'pm-error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="pm-error-text">{errors.category}</p>
                    )}
                  </div>

                  <div className="pm-form-group">
                    <label className="pm-label pm-required">
                      Brand
                    </label>
                    <select
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`pm-select ${errors.brand ? 'pm-error' : ''}`}
                      disabled={loading}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand && (
                      <p className="pm-error-text">{errors.brand}</p>
                    )}
                  </div>

                  <div className="pm-checkbox-group">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="pm-checkbox"
                      disabled={loading}
                    />
                    <span className="pm-label">Active</span>
                  </div>
                  
                  <div className="pm-form-group">
                    <label className="pm-label">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="pm-textarea"
                      placeholder="Enter product description"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Variants Tab */}
              {activeTab === 'variants' && (
                <div>
                  <div className="pm-section-header">
                    <h3 className="pm-section-title">Product Variants</h3>
                    <button
                      onClick={addVariant}
                      className="pm-btn pm-btn-primary"
                      disabled={loading}
                    >
                      <Plus className="pm-icon-sm" />
                      Add Variant
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <div className="pm-empty">
                      <Layers className="pm-empty-icon" />
                      <h4 className="pm-empty-title">No variants added</h4>
                      <p className="pm-empty-text">Add variants to specify different sizes, colors, and pricing</p>
                      <button
                        onClick={addVariant}
                        className="pm-btn pm-btn-primary"
                        disabled={loading}
                      >
                        <Plus className="pm-icon-sm" />
                        Add First Variant
                      </button>
                    </div>
                  ) : (
                    <div>
                      {variants.map((variant, index) => (
                        <div key={variant.id || index} className="pm-variant-card">
                          <div className="pm-variant-header">
                            <h4 className="pm-variant-title">Variant {index + 1}</h4>
                            <button
                              onClick={() => removeVariant(index)}
                              className="pm-btn-icon-text pm-btn-danger"
                              disabled={loading}
                            >
                              <Trash2 className="pm-icon-sm" />
                            </button>
                          </div>

                          <div className="pm-form-grid pm-grid-3">
                            <div className="pm-form-group">
                              <label className="pm-label pm-required">
                                Material Code
                              </label>
                              <input
                                type="text"
                                value={variant.material_code || ''}
                                onChange={(e) => updateVariant(index, 'material_code', e.target.value)}
                                className={`pm-input ${errors[`variant_${index}_material_code`] ? 'pm-error' : ''}`}
                                placeholder="e.g., BLU-KC-001-300"
                                disabled={loading}
                              />
                              {errors[`variant_${index}_material_code`] && (
                                <p className="pm-error-text">{errors[`variant_${index}_material_code`]}</p>
                              )}
                            </div>

                            <div className="pm-form-group pm-full-width">
                              <label className="pm-label">
                                Product Images
                              </label>
                              
                              {/* Image Upload Section */}
                              <ImageUploadSection
                                variantIndex={index}
                                variant={variant}
                                onImagesChange={updateVariant}
                                loading={loading}
                              />
                            </div>

                            <div className="pm-form-group">
                              <label className="pm-label">
                                Size
                              </label>
                              <select
                                value={variant.size || ''}
                                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                className="pm-select"
                                disabled={loading}
                              >
                                <option value="">Select Size</option>
                                {sizes.map(size => (
                                  <option key={size.id} value={size.id}>
                                    {size.name} ({size.dimensions_display || `${size.width}×${size.height}×${size.depth}mm`})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="pm-form-group">
                              <label className="pm-label">
                                Color
                              </label>
                              <select
                                value={variant.color || ''}
                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                className="pm-select"
                                disabled={loading}
                              >
                                <option value="">Select Color</option>
                                {colors.map(color => (
                                  <option key={color.id} value={color.id}>
                                    {color.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="pm-form-group">
                              <label className="pm-label pm-required">
                                MRP (₹)
                              </label>
                              <input
                                type="number"
                                value={variant.mrp || ''}
                                onChange={(e) => updateVariant(index, 'mrp', e.target.value)}
                                className={`pm-input ${errors[`variant_${index}_mrp`] ? 'pm-error' : ''}`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={loading}
                              />
                              {errors[`variant_${index}_mrp`] && (
                                <p className="pm-error-text">{errors[`variant_${index}_mrp`]}</p>
                              )}
                            </div>

                            <div className="pm-form-group">
                              <label className="pm-label pm-required">
                                Selling Price (₹)
                              </label>
                              <input
                                type="number"
                                value={variant.value || ''}
                                onChange={(e) => updateVariant(index, 'value', e.target.value)}
                                className={`pm-input ${errors[`variant_${index}_value`] ? 'pm-error' : ''}`}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={loading}
                              />
                              {errors[`variant_${index}_value`] && (
                                <p className="pm-error-text">{errors[`variant_${index}_value`]}</p>
                              )}
                            </div>

                            <div className="pm-form-group">
                              <label className="pm-label">
                                Stock Quantity
                              </label>
                              <input
                                type="number"
                                value={variant.stock_quantity || 0}
                                onChange={(e) => updateVariant(index, 'stock_quantity', e.target.value)}
                                className="pm-input"
                                placeholder="0"
                                min="0"
                                disabled={loading}
                              />
                            </div>

                            <div className="pm-form-group">
                              <label className="pm-label">
                                Tax (%)
                              </label>
                              <input
                                type="number"
                                value={variant.tax_percentage || 18}
                                onChange={(e) => updateVariant(index, 'tax_percentage', e.target.value)}
                                className="pm-input"
                                placeholder="18"
                                min="0"
                                max="100"
                                step="0.01"
                                disabled={loading}
                              />
                            </div>

                            <div className="pm-checkbox-group">
                              <input
                                type="checkbox"
                                checked={variant.is_active !== false}
                                onChange={(e) => updateVariant(index, 'is_active', e.target.checked)}
                                className="pm-checkbox"
                                disabled={loading}
                              />
                              <span className="pm-label">Active</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div>
                  <div className="pm-form-group">
                    <label className="pm-label">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      className="pm-input"
                      placeholder="Enter meta title for SEO"
                      maxLength={60}
                      disabled={loading}
                    />
                    <p className="pm-text-sm pm-text-secondary pm-mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>

                  <div className="pm-form-group">
                    <label className="pm-label">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      rows={4}
                      className="pm-textarea"
                      placeholder="Enter meta description for SEO"
                      maxLength={160}
                      disabled={loading}
                    />
                    <p className="pm-text-sm pm-text-secondary pm-mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pm-modal-footer">
          <button
            onClick={onClose}
            className="pm-btn pm-btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>

          {activeTab === 'basic' ? (
            <button
              onClick={handleNext}
              disabled={loading || dataLoading}
              className="pm-btn pm-btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading || dataLoading || (activeTab === 'variants' && variants.length === 0)}
              className="pm-btn pm-btn-primary"
            >
              {loading ? (
                <>
                  <div className="pm-spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="pm-icon-sm" />
                  Save Product
                </>
              )}
            </button>
          )}
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