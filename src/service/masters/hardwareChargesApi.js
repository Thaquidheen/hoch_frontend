// src/service/masters/hardwareChargesApi.js
import api from '../api';

const hardwareChargesApi = {
  // GET /api/pricing/cabinet-type-brand-charges/
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/pricing/cabinet-type-brand-charges/', { params });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch hardware charges';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/cabinet-type-brand-charges/{id}/ - Get single hardware charge
  getById: async (id) => {
    try {
      const response = await api.get(`/api/pricing/cabinet-type-brand-charges/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch hardware charge';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/cabinet-type-brand-charges/ - Create new hardware charge
  create: async (chargeData) => {
    try {
      const response = await api.post('/api/pricing/cabinet-type-brand-charges/', chargeData);
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - create error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to create hardware charge';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create hardware charge');
    }
  },

  // PUT /api/pricing/cabinet-type-brand-charges/{id}/ - Update hardware charge
  update: async (id, chargeData) => {
    try {
      const response = await api.put(`/api/pricing/cabinet-type-brand-charges/${id}/`, chargeData);
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - update error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to update hardware charge';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update hardware charge');
    }
  },

  // DELETE /api/pricing/cabinet-type-brand-charges/{id}/ - Delete hardware charge
  delete: async (id) => {
    try {
      await api.delete(`/api/pricing/cabinet-type-brand-charges/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Hardware Charges API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Hardware charge not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this hardware charge');
      }

      if (error.response?.status === 409) {
        throw new Error('Hardware charge is in use and cannot be deleted');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete hardware charge';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/cabinet-type-brand-charges/ - Get charges in matrix format
  getMatrix: async (params = {}) => {
    try {
      console.log('📤 API: Fetching matrix data');
      const response = await api.get('/api/pricing/cabinet-type-brand-charges/', { params });
      console.log('📥 API: Matrix response:', { 
        isArray: Array.isArray(response.data), 
        length: response.data?.length 
      });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getMatrix error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch hardware charges matrix';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/cabinet-type-brand-charges/bulk-update/ - Bulk update charges
  bulkUpdate: async (updateData) => {
    try {
      const response = await api.post('/api/pricing/cabinet-type-brand-charges/bulk-update/', updateData);
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - bulkUpdate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to perform bulk update';
      throw new Error(errorMessage);
    }
  },

  // GET /api/catalog/brands/ - Get available brands
  getBrands: async () => {
    try {
      const response = await api.get('/api/catalog/brands/');
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getBrands error:', error);
      // Return default brands if API fails
      return [
        { 
          id: 'blum', 
          name: 'Blum', 
          description: 'Premium Austrian hardware',
          logo: '/images/brands/blum.png',
          category: 'premium'
        },
        { 
          id: 'hettich', 
          name: 'Hettich', 
          description: 'German engineering excellence',
          logo: '/images/brands/hettich.png',
          category: 'premium'
        },
        { 
          id: 'hafele', 
          name: 'Häfele', 
          description: 'Innovative hardware solutions',
          logo: '/images/brands/hafele.png',
          category: 'premium'
        },
        { 
          id: 'grass', 
          name: 'Grass', 
          description: 'Motion technologies',
          logo: '/images/brands/grass.png',
          category: 'premium'
        },
        { 
          id: 'salice', 
          name: 'Salice', 
          description: 'Italian design and quality',
          logo: '/images/brands/salice.png',
          category: 'standard'
        },
        { 
          id: 'generic', 
          name: 'Generic', 
          description: 'Standard hardware options',
          logo: '/images/brands/generic.png',
          category: 'economy'
        }
      ];
    }
  },

  // GET /api/pricing/cabinet-types/ - Get cabinet types for matrix
  getCabinetTypes: async () => {
    try {
      const response = await api.get('/api/pricing/cabinet-types/');
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getCabinetTypes error:', error);
      throw new Error('Failed to fetch cabinet types');
    }
  },

  // POST /api/pricing/cabinet-type-brand-charges/ - Update single matrix cell
  // FIXED: Send cabinet_type and brand_name instead of IDs
  updateMatrixCell: async (cabinetTypeId, brandId, chargeData) => {
    try {
      // We need to resolve the IDs to names/values that the API expects
      // You may need to adjust these based on your actual data structure
      const payload = {
        cabinet_type: cabinetTypeId, // If API expects the ID as string
        brand_name: brandId,         // If API expects the brand ID as brand_name
        ...chargeData
      };

      // Alternative approach if you have the actual names:
      // const cabinet = await getCabinetTypeById(cabinetTypeId);
      // const brand = await getBrandById(brandId);
      // const payload = {
      //   cabinet_type: cabinet?.name || cabinetTypeId,
      //   brand_name: brand?.name || brandId,
      //   ...chargeData
      // };

      const response = await api.post('/api/pricing/cabinet-type-brand-charges/', payload);
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - updateMatrixCell error:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Handle validation errors with more detail
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        const errorMessage = errors.detail || errors.message || 'Failed to update matrix cell';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update matrix cell');
    }
  },

  // GET /api/pricing/cabinet-type-brand-charges/comparison/ - Compare brand charges
  getBrandComparison: async (cabinetTypeIds = []) => {
    try {
      const response = await api.get('/api/pricing/cabinet-type-brand-charges/', {
        params: { cabinet_types: cabinetTypeIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getBrandComparison error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch brand comparison';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/cabinet-type-brand-charges/copy-charges/ - Copy charges between cabinet types
  copyCharges: async (sourceCabinetTypeId, targetCabinetTypeIds, brandIds = []) => {
    try {
      const response = await api.post('/api/pricing/cabinet-type-brand-charges/', {
        source_cabinet_type: sourceCabinetTypeId,
        target_cabinet_types: targetCabinetTypeIds,
        brands: brandIds
      });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - copyCharges error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to copy charges';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/cabinet-type-brand-charges/effective/ - Get effective charges for date range
  getEffectiveCharges: async (dateFrom, dateTo, cabinetTypes = [], brands = []) => {
    try {
      const response = await api.get('/api/pricing/cabinet-type-brand-charges/', {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          cabinet_types: cabinetTypes.join(','),
          brands: brands.join(',')
        }
      });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getEffectiveCharges error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch effective charges';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/cabinet-type-brand-charges/import/ - Import charges from CSV/Excel
  importCharges: async (fileData, importOptions = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      
      Object.keys(importOptions).forEach(key => {
        formData.append(key, importOptions[key]);
      });

      const response = await api.post('/api/pricing/cabinet-type-brand-charges/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - importCharges error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to import charges';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/cabinet-type-brand-charges/export/ - Export charges to CSV/Excel
  exportCharges: async (format = 'csv', filters = {}) => {
    try {
      const response = await api.get('/api/pricing/cabinet-type-brand-charges/', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - exportCharges error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to export charges';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/cabinet-type-brand-charges/statistics/ - Get hardware charges statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/pricing/cabinet-type-brand-charges/');
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - getStatistics error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch hardware charges statistics';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/cabinet-type-brand-charges/validate-matrix/ - Validate matrix data
  validateMatrix: async (matrixData) => {
    try {
      const response = await api.post('/api/pricing/cabinet-type-brand-charges/', matrixData);
      return response.data;
    } catch (error) {
      console.error('Hardware Charges API - validateMatrix error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to validate matrix data';
      throw new Error(errorMessage);
    }
  }
};

export default hardwareChargesApi;
export { hardwareChargesApi };