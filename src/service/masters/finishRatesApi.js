// src/service/masters/finishRatesApi.js
import api from '../api';

const finishRatesApi = {
  // GET //api/pricing/finish-rates/ - Get all finish rates
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/pricing/finish-rates/', { params });
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch finish rates';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/finish-rates/{id}/ - Get single finish rate
  getById: async (id) => {
    try {
      const response = await api.get(`/api/pricing/finish-rates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch finish rate';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/finish-rates/ - Create new finish rate
  create: async (rateData) => {
    try {
      const response = await api.post('/api/pricing/finish-rates/', rateData);
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - create error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to create finish rate';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create finish rate');
    }
  },

  // PUT //api/pricing/finish-rates/{id}/ - Update finish rate
  update: async (id, rateData) => {
    try {
      const response = await api.put(`/api/pricing/finish-rates/${id}/`, rateData);
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - update error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to update finish rate';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update finish rate');
    }
  },

  // DELETE //api/pricing/finish-rates/{id}/ - Delete finish rate
  delete: async (id) => {
    try {
      await api.delete(`/api/pricing/finish-rates/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Finish Rates API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Finish rate not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this finish rate');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete finish rate';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/finish-rates/?material={id} - Get rates for specific material
  getByMaterial: async (materialId) => {
    try {
      const response = await api.get('/api/pricing/finish-rates/', { 
        params: { material: materialId } 
      });
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - getByMaterial error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch rates for material';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/finish-rates/?budget_tier={tier} - Get rates by budget tier
  getByBudgetTier: async (budgetTier) => {
    try {
      const response = await api.get('/api/pricing/finish-rates/', { 
        params: { budget_tier: budgetTier } 
      });
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - getByBudgetTier error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch rates by budget tier';
      throw new Error(errorMessage);
    }
  },

  // PATCH //api/pricing/finish-rates/{id}/ - Toggle active status
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/api/pricing/finish-rates/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - toggleStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Finish rate not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update finish rate status';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/finish-rates/bulk-update/ - Bulk price updates
  bulkUpdatePrices: async (updateData) => {
    try {
      const response = await api.post('/api/pricing/finish-rates/bulk-update/', updateData);
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - bulkUpdatePrices error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to bulk update prices';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/finish-rates/current/ - Get current active rates
  getCurrentRates: async (params = {}) => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const response = await api.get('/api/pricing/finish-rates/', { 
        params: { 
          ...params,
          effective_from__lte: currentDate,
          is_active: true
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - getCurrentRates error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch current rates';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/finish-rates/history/ - Get rate history for material
  getRateHistory: async (materialId, params = {}) => {
    try {
      const response = await api.get('/api/pricing/finish-rates/', { 
        params: { 
          material: materialId,
          ordering: '-effective_from',
          ...params
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Finish Rates API - getRateHistory error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch rate history';
      throw new Error(errorMessage);
    }
  }
};

export default finishRatesApi;
export { finishRatesApi };