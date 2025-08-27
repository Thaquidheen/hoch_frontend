// src/service/masters/cabinetTypesApi.js
import api from '../api';
const cabinetTypesApi = {
 
    // GET /api/pricing/cabinet-types/ - Get all cabinet types
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/pricing/cabinet-types/', { params });
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch cabinet types';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/cabinet-types/{id}/ - Get single cabinet type
  getById: async (id) => {
    try {
      const response = await api.get(`/api/pricing/cabinet-types/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch cabinet type';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/cabinet-types/ - Create new cabinet type
  create: async (cabinetTypeData) => {
    try {
      const response = await api.post('/api/pricing/cabinet-types/', cabinetTypeData);
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - create error:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Handle validation errors
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        const errorMessage = errors.detail || errors.message || 'Failed to create cabinet type';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create cabinet type');
    }
  },

  // PUT //api/pricing/cabinet-types/{id}/ - Update cabinet type
  update: async (id, cabinetTypeData) => {
    try {
      const response = await api.put(`/api/pricing/cabinet-types/${id}/`, cabinetTypeData);
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - update error:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Handle validation errors
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        const errorMessage = errors.detail || errors.message || 'Failed to update cabinet type';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update cabinet type');
    }
  },

  // DELETE //api/pricing/cabinet-types/{id}/ - Delete cabinet type
  delete: async (id) => {
    try {
      await api.delete(`/api/pricing/cabinet-types/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Cabinet Types API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Cabinet type not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this cabinet type');
      }

      if (error.response?.status === 409) {
        throw new Error('Cabinet type is in use and cannot be deleted');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete cabinet type';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/cabinet-types/?category={category} - Get cabinet types by category
  getByCategory: async (category) => {
    try {
      const response = await api.get('/api/pricing/cabinet-types/', { 
        params: { category: category.toUpperCase() } 
      });
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - getByCategory error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch cabinet types by category';
      throw new Error(errorMessage);
    }
  },

  // PATCH //api/pricing/cabinet-types/{id}/ - Toggle active status
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/api/pricing/cabinet-types/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - toggleStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Cabinet type not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update cabinet type status';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/cabinet-types/bulk-update/ - Bulk operations
  bulkUpdate: async (updateData) => {
    try {
      const response = await api.post('/api/pricing/cabinet-types/bulk-update/', updateData);
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - bulkUpdate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to perform bulk update';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/cabinet-types/categories/ - Get available categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/catalog/categories/');
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - getCategories error:', error);
      // Return default categories if API fails
      return [
        { value: 'BASE', label: 'Base Cabinets', description: 'Floor-mounted storage cabinets' },
        { value: 'WALL', label: 'Wall Cabinets', description: 'Wall-mounted upper cabinets' },
        { value: 'TALL', label: 'Tall Cabinets', description: 'Full-height storage units' },
        { value: 'SPECIAL', label: 'Special Cabinets', description: 'Custom and specialty cabinets' }
      ];
    }
  },

  // GET //api/pricing/cabinet-types/dimensions/ - Get standard dimensions by category
  getStandardDimensions: async (category) => {
    try {
      const response = await api.get(`/api/pricing/cabinet-types/`, {
        params: { category: category.toUpperCase() }
      });
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - getStandardDimensions error:', error);
      // Return default dimensions if API fails
      const defaultDimensions = {
        'BASE': { width: [12, 15, 18, 21, 24, 30, 36], height: [34.5], depth: [24] },
        'WALL': { width: [12, 15, 18, 21, 24, 30, 36], height: [12, 15, 18, 24, 30, 36, 42], depth: [12] },
        'TALL': { width: [18, 24, 30, 36], height: [84, 90, 96], depth: [24] },
        'SPECIAL': { width: [12, 18, 24, 30, 36], height: [12, 24, 36, 84], depth: [12, 24] }
      };
      return defaultDimensions[category.toUpperCase()] || {};
    }
  },

  // POST //api/pricing/cabinet-types/duplicate/ - Duplicate cabinet type
  duplicate: async (id, newData) => {
    try {
      const response = await api.post(`/api/pricing/cabinet-types/duplicate/`, {
        source_id: id,
        ...newData
      });
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - duplicate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to duplicate cabinet type';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/cabinet-types/search/ - Search cabinet types
  search: async (query, filters = {}) => {
    try {
      const response = await api.get('/api/pricing/cabinet-types/search/', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - search error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to search cabinet types';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/cabinet-types/statistics/ - Get cabinet types statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/pricing/cabinet-types/statistics/');
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - getStatistics error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch cabinet types statistics';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/cabinet-types/validate/ - Validate cabinet type data
  validate: async (cabinetTypeData) => {
    try {
      const response = await api.post('/api/pricing/cabinet-types/validate/', cabinetTypeData);
      return response.data;
    } catch (error) {
      console.error('Cabinet Types API - validate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to validate cabinet type data';
      throw new Error(errorMessage);
    }
  }
};

export default cabinetTypesApi;
export { cabinetTypesApi };