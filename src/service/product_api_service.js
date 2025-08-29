import axiosInstance from './api';

// Product API Service aligned with your updated backend
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

export default ProductAPI;