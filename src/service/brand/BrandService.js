// src/service/masters/brandsApi.js
import api from '../api'; // Using your existing api.js

const brandsApi = {

  // GET /api/catalog/brands/ - Get all brands
  getAll: async (params = {}) => {
    try {
      const response = await api.get('api/catalog/brands/', { params });
      return response.data;
    } catch (error) {
      console.error('Brands API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to fetch brands';
      throw new Error(errorMessage);
    }
  },

  // GET /api/catalog/brands/{id}/ - Get single brand
  getById: async (id) => {
    try {
      const response = await api.get(`api/catalog/brands/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Brands API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch brand';
      throw new Error(errorMessage);
    }
  },

  // POST /api/catalog/brands/ - Create new brand
  create: async (brandData) => {
    try {
      const response = await api.post('api/catalog/brands/', brandData);
      return response.data;
    } catch (error) {
      console.error('Brands API - create error:', error);
      
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
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to create brand';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create brand');
    }
  },

  // PUT /api/catalog/brands/{id}/ - Update brand
  update: async (id, brandData) => {
    try {
      const response = await api.put(`api/catalog/brands/${id}/`, brandData);
      return response.data;
    } catch (error) {
      console.error('Brands API - update error:', error);
      
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
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to update brand';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update brand');
    }
  },

  // DELETE /api/catalog/brands/{id}/ - Delete brand
  delete: async (id) => {
    try {
      await api.delete(`api/catalog/brands/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Brands API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Brand not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this brand');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to delete brand';
      throw new Error(errorMessage);
    }
  },

  // GET /api/catalog/brands/{id}/products/ - Get products by brand
  getProducts: async (brandId) => {
    try {
      const response = await api.get(`api/catalog/brands/${brandId}/products/`);
      return response.data;
    } catch (error) {
      console.error('Brands API - getProducts error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Brand not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch brand products';
      throw new Error(errorMessage);
    }
  },

  // GET /api/catalog/brands/?search=keyword - Search brands
  search: async (searchTerm) => {
    try {
      const response = await api.get('api/catalog/brands/', { 
        params: { search: searchTerm } 
      });
      return response.data;
    } catch (error) {
      console.error('Brands API - search error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to search brands';
      throw new Error(errorMessage);
    }
  },

  // POST /api/catalog/brands/bulk-create/ - Bulk create brands
  bulkCreate: async (brandsArray) => {
    try {
      const response = await api.post('api/catalog/brands/bulk-create/', {
        brands: brandsArray
      });
      return response.data;
    } catch (error) {
      console.error('Brands API - bulkCreate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to bulk create brands';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/catalog/brands/{id}/ - Toggle active status
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`api/catalog/brands/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Brands API - toggleStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Brand not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update brand status';
      throw new Error(errorMessage);
    }
  },

  // GET /api/catalog/brands/?is_active=true - Filter by active status
  getByStatus: async (isActive = true) => {
    try {
      const response = await api.get('api/catalog/brands/', { 
        params: { is_active: isActive } 
      });
      return response.data;
    } catch (error) {
      console.error('Brands API - getByStatus error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch brands by status';
      throw new Error(errorMessage);
    }
  }
};

// Export the API service
export default brandsApi;

// Named export for convenience
export { brandsApi };