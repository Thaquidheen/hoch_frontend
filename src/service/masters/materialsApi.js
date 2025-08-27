// src/service/masters/materialsApi.js
import api from '../api'; // Using your existing api.js

const materialsApi = {

  getAll: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/materials/', { params });
      return response.data;
    } catch (error) {
      console.error('Materials API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to fetch materials';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/materials/{id}/ - Get single material
  getById: async (id) => {
    try {
      const response = await api.get(`api/pricing/materials/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Materials API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch material';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/materials/ - Create new material
  create: async (materialData) => {
    try {
      const response = await api.post('api/pricing/materials/', materialData);
      return response.data;
    } catch (error) {
      console.error('Materials API - create error:', error);
      
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
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to create material';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create material');
    }
  },

  // PUT /api/pricing/materials/{id}/ - Update material
  update: async (id, materialData) => {
    try {
      const response = await api.put(`api/pricing/materials/${id}/`, materialData);
      return response.data;
    } catch (error) {
      console.error('Materials API - update error:', error);
      
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
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to update material';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update material');
    }
  },

  // DELETE /api/pricing/materials/{id}/ - Delete material
  delete: async (id) => {
    try {
      await api.delete(`api/pricing/materials/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Materials API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Material not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this material');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to delete material';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/materials/?role=CABINET - Filter by role
  getByRole: async (role) => {
    try {
      const response = await api.get('api/pricing/materials/', { 
        params: { role } 
      });
      return response.data;
    } catch (error) {
      console.error('Materials API - getByRole error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch materials by role';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/materials/?search=keyword - Search materials
  search: async (searchTerm) => {
    try {
      const response = await api.get('api/pricing/materials/', { 
        params: { search: searchTerm } 
      });
      return response.data;
    } catch (error) {
      console.error('Materials API - search error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to search materials';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/materials/bulk-create/ - Bulk create materials
  bulkCreate: async (materialsArray) => {
    try {
      const response = await api.post('api/pricing/materials/bulk-create/', {
        materials: materialsArray
      });
      return response.data;
    } catch (error) {
      console.error('Materials API - bulkCreate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to bulk create materials';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/pricing/materials/{id}/ - Toggle active status
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`api/pricing/materials/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Materials API - toggleStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Material not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update material status';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/materials/?is_active=true - Filter by active status
  getByStatus: async (isActive = true) => {
    try {
      const response = await api.get('api/pricing/materials/', { 
        params: { is_active: isActive } 
      });
      return response.data;
    } catch (error) {
      console.error('Materials API - getByStatus error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch materials by status';
      throw new Error(errorMessage);
    }
  }
};

// Export the API service
export default materialsApi;

// Named export for convenience
export { materialsApi };