// src/service/quotations/lineItemsApi.js
import api from '../api';

const lineItemsApi = {
  // GET api/pricing/project-line-items/ - Get all line items for a project
  getAll: async (projectId, params = {}) => {
    try {
      const response = await api.get('api/pricing/project-line-items/', { 
        params: { 
          project: projectId,
          ...params 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Line Items API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch line items';
      throw new Error(errorMessage);
    }
  },

  // GET api/pricing/project-line-items/{id}/ - Get single line item
  getById: async (id) => {
    try {
      const response = await api.get(`api/pricing/project-line-items/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Line Items API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch line item';
      throw new Error(errorMessage);
    }
  },

  // POST api/pricing/project-line-items/ - Create new line item
  create: async (lineItemData) => {
    try {
      const response = await api.post('api/pricing/project-line-items/', lineItemData);
      return response.data;
    } catch (error) {
      console.error('Line Items API - create error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to create line item';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create line item');
    }
  },

  // PUT api/pricing/project-line-items/{id}/ - Update line item
  update: async (id, lineItemData) => {
    try {
      const response = await api.put(`api/pricing/project-line-items/${id}/`, lineItemData);
      return response.data;
    } catch (error) {
      console.error('Line Items API - update error:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        const errorMessage = errors.detail || errors.message || 'Failed to update line item';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update line item');
    }
  },

  // DELETE api/pricing/project-line-items/{id}/ - Delete line item
  delete: async (id) => {
    try {
      await api.delete(`api/pricing/project-line-items/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Line Items API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Line item not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this line item');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete line item';
      throw new Error(errorMessage);
    }
  },

  // POST api/pricing/project-line-items/{id}/compute/ - Compute line item pricing
  computePricing: async (id) => {
    try {
      const response = await api.post(`api/pricing/project-line-items/${id}/compute/`);
      return response.data;
    } catch (error) {
      console.error('Line Items API - computePricing error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to compute line item pricing';
      throw new Error(errorMessage);
    }
  },

  // POST /api/calculate/ - Calculate pricing for dimensions (preview)
  calculatePreview: async (calculationData) => {
    try {
      const response = await api.post('api/calculate/', calculationData);
      return response.data;
    } catch (error) {
      console.error('Line Items API - calculatePreview error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to calculate pricing preview';
      throw new Error(errorMessage);
    }
  },

  // POST api/pricing/project-line-items/bulk-create/ - Create multiple line items
  bulkCreate: async (lineItemsData) => {
    try {
      const response = await api.post('api/pricing/project-line-items/bulk-create/', {
        line_items: lineItemsData
      });
      return response.data;
    } catch (error) {
      console.error('Line Items API - bulkCreate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to create line items';
      throw new Error(errorMessage);
    }
  },

  // POST api/pricing/project-line-items/{id}/duplicate/ - Duplicate line item
  duplicate: async (id, duplicateData = {}) => {
    try {
      const response = await api.post(`api/pricing/project-line-items/${id}/duplicate/`, duplicateData);
      return response.data;
    } catch (error) {
      console.error('Line Items API - duplicate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to duplicate line item';
      throw new Error(errorMessage);
    }
  },

  // GET api/pricing/project-line-items/templates/ - Get line item templates
  getTemplates: async () => {
    try {
      const response = await api.get('api/pricing/project-line-items/templates/');
      return response.data;
    } catch (error) {
      console.error('Line Items API - getTemplates error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch line item templates';
      throw new Error(errorMessage);
    }
  },

  // POST api/pricing/project-line-items/from-template/ - Create from template
  createFromTemplate: async (templateData) => {
    try {
      const response = await api.post('api/pricing/project-line-items/from-template/', templateData);
      return response.data;
    } catch (error) {
      console.error('Line Items API - createFromTemplate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to create line item from template';
      throw new Error(errorMessage);
    }
  },

  // GET api/pricing/project-line-items/summary/{projectId}/ - Get line items summary
  getSummary: async (projectId) => {
    try {
      const response = await api.get(`api/pricing/project-line-items/summary/${projectId}/`);
      return response.data;
    } catch (error) {
      console.error('Line Items API - getSummary error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch line items summary';
      throw new Error(errorMessage);
    }
  },

  // PATCH api/pricing/project-line-items/{id}/update-dimensions/ - Update dimensions only
  updateDimensions: async (id, dimensions) => {
    try {
      const response = await api.patch(`api/pricing/project-line-items/${id}/update-dimensions/`, {
        width_mm: dimensions.width_mm,
        depth_mm: dimensions.depth_mm,
        height_mm: dimensions.height_mm,
        qty: dimensions.qty
      });
      return response.data;
    } catch (error) {
      console.error('Line Items API - updateDimensions error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update dimensions';
      throw new Error(errorMessage);
    }
  },

  // PATCH api/pricing/project-line-items/{id}/update-materials/ - Update materials only
  updateMaterials: async (id, materials) => {
    try {
      const response = await api.patch(`api/pricing/project-line-items/${id}/update-materials/`, {
        cabinet_material: materials.cabinet_material,
        door_material: materials.door_material
      });
      return response.data;
    } catch (error) {
      console.error('Line Items API - updateMaterials error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update materials';
      throw new Error(errorMessage);
    }
  },

  // POST api/pricing/project-line-items/batch-compute/ - Compute multiple line items
  batchCompute: async (lineItemIds) => {
    try {
      const response = await api.post('api/pricing/project-line-items/batch-compute/', {
        line_item_ids: lineItemIds
      });
      return response.data;
    } catch (error) {
      console.error('Line Items API - batchCompute error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to compute line items';
      throw new Error(errorMessage);
    }
  },

  // GET api/pricing/project-line-items/export/{projectId}/ - Export line items
  exportLineItems: async (projectId, format = 'csv') => {
    try {
      const response = await api.get(`api/pricing/project-line-items/export/${projectId}/`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project_${projectId}_line_items.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('Line Items API - exportLineItems error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to export line items';
      throw new Error(errorMessage);
    }
  },

  // Validation helpers
  validateDimensions: (dimensions) => {
    const errors = {};
    
    if (!dimensions.width_mm || dimensions.width_mm < 50 || dimensions.width_mm > 5000) {
      errors.width_mm = 'Width must be between 50mm and 5000mm';
    }
    
    if (!dimensions.depth_mm || dimensions.depth_mm < 50 || dimensions.depth_mm > 1000) {
      errors.depth_mm = 'Depth must be between 50mm and 1000mm';
    }
    
    if (!dimensions.height_mm || dimensions.height_mm < 50 || dimensions.height_mm > 3000) {
      errors.height_mm = 'Height must be between 50mm and 3000mm';
    }
    
    if (!dimensions.qty || dimensions.qty < 1 || dimensions.qty > 100) {
      errors.qty = 'Quantity must be between 1 and 100';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Formatting helpers
  formatDimensions: (width_mm, depth_mm, height_mm) => {
    return `${width_mm}×${depth_mm}×${height_mm}mm`;
  },

  formatCurrency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  formatSquareFeet: (sqft) => {
    return `${parseFloat(sqft).toFixed(2)} sq.ft`;
  }
};

export default lineItemsApi;
export { lineItemsApi };