// src/service/masters/doorRatesApi.js
import api from '../api';

const doorRatesApi = {
  // GET //api/pricing/door-finish-rates/ - Get all door rates
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/pricing/door-finish-rates/', { params });
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch door rates';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/door-finish-rates/{id}/ - Get single door rate
  getById: async (id) => {
    try {
      const response = await api.get(`/api/pricing/door-finish-rates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch door rate';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/door-finish-rates/ - Create new door rate
  create: async (rateData) => {
    try {
      const response = await api.post('/api/pricing/door-finish-rates/', rateData);
      return response.data;
    } catch (error) {
      console.error('Door Rates API - create error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to create door rate';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create door rate');
    }
  },

  // PUT //api/pricing/door-finish-rates/{id}/ - Update door rate
  update: async (id, rateData) => {
    try {
      const response = await api.put(`/api/pricing/door-finish-rates/${id}/`, rateData);
      return response.data;
    } catch (error) {
      console.error('Door Rates API - update error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to update door rate';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update door rate');
    }
  },

  // DELETE //api/pricing/door-finish-rates/{id}/ - Delete door rate
  delete: async (id) => {
    try {
      await api.delete(`/api/pricing/door-finish-rates/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Door Rates API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Door rate not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this door rate');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete door rate';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/door-finish-rates/?material={id} - Get rates for specific material
  getByMaterial: async (materialId) => {
    try {
      const response = await api.get('/api/pricing/door-finish-rates/', { 
        params: { material: materialId } 
      });
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getByMaterial error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch rates for material';
      throw new Error(errorMessage);
    }
  },

  // PATCH //api/pricing/door-finish-rates/{id}/ - Toggle active status
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/api/pricing/door-finish-rates/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Door Rates API - toggleStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Door rate not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update door rate status';
      throw new Error(errorMessage);
    }
  },

  // POST //api/pricing/door-finish-rates/bulk-update/ - Bulk price updates
  bulkUpdatePrices: async (updateData) => {
    try {
      const response = await api.post('/api/pricing/door-finish-rates/bulk-update/', updateData);
      return response.data;
    } catch (error) {
      console.error('Door Rates API - bulkUpdatePrices error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to bulk update prices';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/door-finish-rates/current/ - Get current active rates
  getCurrentRates: async (params = {}) => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const response = await api.get('/api/pricing/door-finish-rates/', { 
        params: { 
          ...params,
          effective_from__lte: currentDate,
          is_active: true
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getCurrentRates error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch current rates';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/door-finish-rates/history/ - Get rate history for material
  getRateHistory: async (materialId, params = {}) => {
    try {
      const response = await api.get('/api/pricing/door-finish-rates/', { 
        params: { 
          material: materialId,
          ordering: '-effective_from',
          ...params
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getRateHistory error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch rate history';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/door-finish-rates/price-comparison/ - Compare door material prices
  getPriceComparison: async (materialIds = []) => {
    try {
      const response = await api.get('/api/pricing/door-finish-rates/price-comparison/', {
        params: { materials: materialIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getPriceComparison error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch price comparison';
      throw new Error(errorMessage);
    }
  },

  // GET //api/pricing/door-finish-rates/statistics/ - Get door rates statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/pricing/door-finish-rates/statistics/');
      return response.data;
    } catch (error) {
      console.error('Door Rates API - getStatistics error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch door rates statistics';
      throw new Error(errorMessage);
    }
  }
};

export default doorRatesApi;
export { doorRatesApi };