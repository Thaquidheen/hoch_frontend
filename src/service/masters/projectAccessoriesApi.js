import api from '../api'; // Using your existing api.js

const projectAccessoriesApi = {
  // GET /api/pricing/project-line-item-accessories/categories/ - Get accessory categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/categories/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Project Accessories API - getCategories error:', error);
      
      // Check if it's the specific field error
      if (error.response?.data?.detail?.includes('Cannot resolve keyword')) {
        return {
          success: false,
          error: 'Backend configuration issue with categories endpoint. Using fallback data.',
          fallback: true
        };
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch categories';
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // NEW: GET /api/catalog/brands/ - Get brands (integrated from your existing code)
  getBrands: async (filters = {}) => {
    try {
      const params = {
        is_active: true,
        ...filters
      };
      
      const response = await api.get('/api/catalog/brands/', { params });
      
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Project Accessories API - getBrands error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch brands';
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // GET /api/pricing/project-line-item-accessories/available_products/ - Get available products for accessories
  getAvailableProducts: async (filters = {}) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/available_products/', {
        params: {
          category: 'ACCESSORIES',
          ...filters
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Project Accessories API - getAvailableProducts error:', error);
      
      // Handle specific field errors
      if (error.response?.data?.detail?.includes('Cannot resolve keyword')) {
        return {
          success: false,
          error: 'Backend configuration issue with products endpoint. Check field mappings.',
          fallback: true
        };
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch available products';
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // GET /api/pricing/project-line-item-accessories/ - Get all accessories with filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/', { params });
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to fetch project accessories';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/project-line-item-accessories/{id}/ - Get single accessory
  getById: async (id) => {
    try {
      const response = await api.get(`/api/pricing/project-line-item-accessories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch accessory';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/project-line-item-accessories/ - Create new accessory
  create: async (accessoryData) => {
    try {
      const response = await api.post('/api/pricing/project-line-item-accessories/', accessoryData);
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - create error:', error);
      
      // Handle validation errors from Django
      if (error.response?.data) {
        const errors = error.response.data;
        
        // If it's field validation errors
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        // If it's a general error
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to create accessory';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create accessory');
    }
  },

  // PUT /api/pricing/project-line-item-accessories/{id}/ - Update accessory
  update: async (id, accessoryData) => {
    try {
      const response = await api.put(`/api/pricing/project-line-item-accessories/${id}/`, accessoryData);
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - update error:', error);
      
      // Handle validation errors from Django
      if (error.response?.data) {
        const errors = error.response.data;
        
        // If it's field validation errors
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        // If it's a general error
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to update accessory';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update accessory');
    }
  },

  // DELETE /api/pricing/project-line-item-accessories/{id}/ - Delete accessory
  delete: async (id) => {
    try {
      await api.delete(`/api/pricing/project-line-item-accessories/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Project Accessories API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Accessory not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this accessory');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to delete accessory';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/project-line-item-accessories/?project={projectId} - Get accessories by project
  getByProject: async (projectId) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/', { 
        params: { project: projectId } 
      });
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - getByProject error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch accessories by project';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/project-line-item-accessories/?line_item={lineItemId} - Get accessories by line item
  getByLineItem: async (lineItemId) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/', { 
        params: { line_item: lineItemId } 
      });
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - getByLineItem error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch accessories by line item';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/project-line-item-accessories/?search=keyword - Search accessories
  search: async (searchTerm) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/', { 
        params: { search: searchTerm } 
      });
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - search error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to search accessories';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/project-line-item-accessories/bulk-create/ - Bulk create accessories
  bulkCreate: async (accessoriesArray) => {
    try {
      const response = await api.post('/api/pricing/project-line-item-accessories/bulk-create/', {
        accessories: accessoriesArray
      });
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - bulkCreate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to bulk create accessories';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/pricing/project-line-item-accessories/{id}/ - Update specific fields
  patch: async (id, data) => {
    try {
      const response = await api.patch(`/api/pricing/project-line-item-accessories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - patch error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Accessory not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update accessory';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/project-line-item-accessories/?product_variant={variantId} - Filter by product variant
  getByProductVariant: async (variantId) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/', { 
        params: { product_variant: variantId } 
      });
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - getByProductVariant error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch accessories by product variant';
      throw new Error(errorMessage);
    }
  },

  // Custom method to get project statistics
  getProjectStats: async (projectId) => {
    try {
      const response = await api.get('/api/pricing/project-line-item-accessories/', {
        params: { project: projectId }
      });
      
      const accessories = response.data.results || response.data;
      
      if (!Array.isArray(accessories)) {
        throw new Error('Invalid data format received');
      }

      const totalAccessories = accessories.length;
      const totalCost = accessories.reduce((sum, acc) => sum + parseFloat(acc.total_price || 0), 0);
      const lineItemsWithAccessories = [...new Set(accessories.map(acc => acc.line_item))].length;
      
      // Group by product variant for insights
      const productCounts = accessories.reduce((counts, acc) => {
        const productName = acc.product_variant_detail?.product?.name || 
                           acc.accessory_name || 
                           'Unknown';
        counts[productName] = (counts[productName] || 0) + 1;
        return counts;
      }, {});

      // Group by line item for breakdown
      const lineItemBreakdown = accessories.reduce((breakdown, acc) => {
        const lineItemId = acc.line_item;
        if (!breakdown[lineItemId]) {
          breakdown[lineItemId] = {
            count: 0,
            totalCost: 0,
            accessories: []
          };
        }
        breakdown[lineItemId].count += 1;
        breakdown[lineItemId].totalCost += parseFloat(acc.total_price || 0);
        breakdown[lineItemId].accessories.push(acc);
        return breakdown;
      }, {});

      return {
        totalAccessories,
        totalCost,
        lineItemsWithAccessories,
        productCounts,
        lineItemBreakdown,
        averageCostPerAccessory: totalAccessories > 0 ? totalCost / totalAccessories : 0,
        mostUsedProduct: Object.entries(productCounts).reduce((a, b) => 
          productCounts[a[0]] > productCounts[b[0]] ? a : b, ['', 0])[0] || null
      };
    } catch (error) {
      console.error('Project Accessories API - getProjectStats error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Failed to fetch project statistics';
      throw new Error(errorMessage);
    }
  },

  // Custom method to duplicate accessory to another line item
  duplicate: async (accessoryId, targetLineItemId) => {
    try {
      // First get the original accessory
      const originalResponse = await api.get(`/api/pricing/project-line-item-accessories/${accessoryId}/`);
      const originalAccessory = originalResponse.data;
      
      // Create new accessory data without the ID
      const { id, created_at, updated_at, ...duplicateData } = originalAccessory;
      duplicateData.line_item = targetLineItemId;
      
      // Create the duplicate
      const response = await api.post('/api/pricing/project-line-item-accessories/', duplicateData);
      return response.data;
    } catch (error) {
      console.error('Project Accessories API - duplicate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to duplicate accessory';
      throw new Error(errorMessage);
    }
  }
};

// Export the API service
export default projectAccessoriesApi;

// Named export for convenience
export { projectAccessoriesApi };