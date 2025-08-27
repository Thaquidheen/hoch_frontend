import axiosInstance from './api';

// ============================================================================
// Product Categories API
// ============================================================================
export const CategoryService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  create: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/categories/', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/categories/${id}/`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  getProducts: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/categories/${categoryId}/products/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  },

  getBrands: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/categories/${categoryId}/brands/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category brands:', error);
      throw error;
    }
  }
};

// ============================================================================
// Brands API
// ============================================================================


// ============================================================================
// Products API
// ============================================================================
export const ProductService = {
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  create: async (productData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/products/', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/products/${id}/`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  search: async (searchParams) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/search/', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  getVariants: async (productId) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/products/${productId}/variants/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  },

  getLowStock: async (threshold = 10) => {
    try {
      const response = await axiosInstance.get('/api/catalog/products/low-stock/', { params: { threshold } });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
};

// ============================================================================
// Product Variants API
// ============================================================================
export const ProductVariantService = {
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-variants/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/product-variants/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product variant:', error);
      throw error;
    }
  },

  create: async (variantData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/product-variants/', variantData);
      return response.data;
    } catch (error) {
      console.error('Error creating product variant:', error);
      throw error;
    }
  },

  update: async (id, variantData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/product-variants/${id}/`, variantData);
      return response.data;
    } catch (error) {
      console.error('Error updating product variant:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/product-variants/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product variant:', error);
      throw error;
    }
  },

  updateStock: async (id, stockQuantity) => {
    try {
      const response = await axiosInstance.post(`/api/catalog/product-variants/${id}/update-stock/`, {
        stock_quantity: stockQuantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  getPriceHistory: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/catalog/product-variants/${id}/price-history/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  },

  getLowStock: async (threshold = 10) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-variants/low-stock/', { params: { threshold } });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock variants:', error);
      throw error;
    }
  }
};

// ============================================================================
// Colors API
// ============================================================================
export const ColorService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/colors/');
      return response.data;
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  },

  create: async (colorData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/colors/', colorData);
      return response.data;
    } catch (error) {
      console.error('Error creating color:', error);
      throw error;
    }
  },

  update: async (id, colorData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/colors/${id}/`, colorData);
      return response.data;
    } catch (error) {
      console.error('Error updating color:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/colors/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting color:', error);
      throw error;
    }
  }
};

// ============================================================================
// Product Sizes API
// ============================================================================
export const ProductSizeService = {
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/catalog/product-sizes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching product sizes:', error);
      throw error;
    }
  },

  create: async (sizeData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/product-sizes/', sizeData);
      return response.data;
    } catch (error) {
      console.error('Error creating product size:', error);
      throw error;
    }
  },

  update: async (id, sizeData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/product-sizes/${id}/`, sizeData);
      return response.data;
    } catch (error) {
      console.error('Error updating product size:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/product-sizes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product size:', error);
      throw error;
    }
  }
};

// ============================================================================
// Cabinet Materials API
// ============================================================================
export const CabinetMaterialService = {
  getAll: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/cabinet-materials/');
      return response.data;
    } catch (error) {
      console.error('Error fetching cabinet materials:', error);
      throw error;
    }
  },

  getPricingList: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/cabinet-materials/pricing-list/');
      return response.data;
    } catch (error) {
      console.error('Error fetching cabinet materials pricing:', error);
      throw error;
    }
  },

  create: async (materialData) => {
    try {
      const response = await axiosInstance.post('/api/catalog/cabinet-materials/', materialData);
      return response.data;
    } catch (error) {
      console.error('Error creating cabinet material:', error);
      throw error;
    }
  },

  update: async (id, materialData) => {
    try {
      const response = await axiosInstance.put(`/api/catalog/cabinet-materials/${id}/`, materialData);
      return response.data;
    } catch (error) {
      console.error('Error updating cabinet material:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/catalog/cabinet-materials/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting cabinet material:', error);
      throw error;
    }
  }
};

// ============================================================================
// Dashboard and Analytics API
// ============================================================================
export const CatalogAnalyticsService = {
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/catalog/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching catalog dashboard:', error);
      throw error;
    }
  },

  getSearchSuggestions: async (query) => {
    try {
      const response = await axiosInstance.get('/api/catalog/search-suggestions/', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw error;
    }
  },

  getPriceAnalysis: async (categoryId = null, brandId = null) => {
    try {
      const params = {};
      if (categoryId) params.category = categoryId;
      if (brandId) params.brand = brandId;
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

// ============================================================================
// Utility Functions
// ============================================================================
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getStockStatus = (quantity) => {
  if (quantity === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: 'red' };
  if (quantity <= 10) return { status: 'low_stock', label: 'Low Stock', color: 'yellow' };
  return { status: 'in_stock', label: 'In Stock', color: 'green' };
};