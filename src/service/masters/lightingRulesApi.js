// src/service/masters/lightingRulesApi.js

import api from '../api';

const lightingRulesApi = {
  // GET /api/pricing/lighting-rules/ - Get all lighting rules
  getAll: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/lighting-rules/', { params });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Lighting Rules API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch lighting rules';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/lighting-rules/{id}/ - Get single lighting rule
  getById: async (id) => {
    try {
      const response = await api.get(`api/pricing/lighting-rules/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Lighting Rules API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch lighting rule';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/lighting-rules/ - Create new lighting rule
  create: async (ruleData) => {
    try {
      const response = await api.post('api/pricing/lighting-rules/', ruleData);
      return response.data;
    } catch (error) {
      console.error('Lighting Rules API - create error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to create lighting rule';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create lighting rule');
    }
  },

  // PUT /api/pricing/lighting-rules/{id}/ - Update lighting rule
  update: async (id, ruleData) => {
    try {
      const response = await api.put(`api/pricing/lighting-rules/${id}/`, ruleData);
      return response.data;
    } catch (error) {
      console.error('Lighting Rules API - update error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to update lighting rule';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update lighting rule');
    }
  },

  // DELETE /api/pricing/lighting-rules/{id}/ - Delete lighting rule
  delete: async (id) => {
    try {
      await api.delete(`api/pricing/lighting-rules/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Lighting Rules API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Lighting rule not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this lighting rule');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete lighting rule';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/pricing/lighting-rules/{id}/ - Toggle active status
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`api/pricing/lighting-rules/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Lighting Rules API - toggleStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Lighting rule not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update lighting rule status';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/lighting-rules/current_rates/ - Get current active rates
  getCurrentRates: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/lighting-rules/current_rates/', { params });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Lighting Rules API - getCurrentRates error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch current lighting rates';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/lighting-rules/{id}/test_calculation/ - Test calculation with sample data
  testCalculation: async (id, testData) => {
    try {
      const response = await api.post(`api/pricing/lighting-rules/${id}/test_calculation/`, testData);
      return response.data;
    } catch (error) {
      console.error('Lighting Rules API - testCalculation error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to test lighting calculation';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/lighting-rules/?material={id} - Get rules for specific material
  getByMaterial: async (materialId) => {
    try {
      const response = await api.get('api/pricing/lighting-rules/', { 
        params: { cabinet_material: materialId } 
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Lighting Rules API - getByMaterial error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch lighting rules for material';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/lighting-rules/?budget_tier={tier} - Get rules by budget tier
  getByBudgetTier: async (budgetTier) => {
    try {
      const response = await api.get('api/pricing/lighting-rules/', { 
        params: { budget_tier: budgetTier } 
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Lighting Rules API - getByBudgetTier error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch lighting rules by budget tier';
      throw new Error(errorMessage);
    }
  }
};

const enhancedLightingApi = {
  // Lighting Configurations
  getLightingConfiguration: async (projectId) => {
    try {
      const response = await api.get(`api/pricing/lighting-configurations/${projectId}/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - getLightingConfiguration error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch lighting configuration');
    }
  },

  getLightingConfigurations: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/lighting-configurations/', { params });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Enhanced Lighting API - getLightingConfigurations error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch lighting configurations');
    }
  },

  updateLightingConfiguration: async (id, configData) => {
    try {
      const response = await api.patch(`api/pricing/lighting-configurations/${id}/`, configData);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - updateLightingConfiguration error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update lighting configuration');
    }
  },

  // Lighting Items
  getLightingItems: async (projectId) => {
    try {
      const response = await api.get('api/pricing/lighting-items/', { 
        params: { project: projectId } 
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Enhanced Lighting API - getLightingItems error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch lighting items');
    }
  },

  createLightingItem: async (itemData) => {
    try {
      const response = await api.post('api/pricing/lighting-items/', itemData);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - createLightingItem error:', error);
      
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
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to create lighting item');
    }
  },

  updateLightingItem: async (id, itemData) => {
    try {
      const response = await api.put(`api/pricing/lighting-items/${id}/`, itemData);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - updateLightingItem error:', error);
      
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
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to update lighting item');
    }
  },

  deleteLightingItem: async (id) => {
    try {
      await api.delete(`api/pricing/lighting-items/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Enhanced Lighting API - deleteLightingItem error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Lighting item not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this lighting item');
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to delete lighting item');
    }
  },

  toggleLightingItem: async (id, isActive) => {
    try {
      const response = await api.patch(`api/pricing/lighting-items/${id}/`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - toggleLightingItem error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Lighting item not found');
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to toggle lighting item');
    }
  },

  recalculateLightingItem: async (id) => {
    try {
      const response = await api.post(`api/pricing/lighting-items/${id}/recalculate/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - recalculateLightingItem error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to recalculate lighting item');
    }
  },

  // Project Lighting Management - FIXED to use correct project endpoints
  getProjectLighting: async (projectId) => {
    try {
      const response = await api.get(`api/pricing/projects/${projectId}/lighting/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - getProjectLighting error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch project lighting');
    }
  },

  createProjectLighting: async (projectId) => {
    try {
      const response = await api.post(`api/pricing/projects/${projectId}/lighting/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - createProjectLighting error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create project lighting');
    }
  },

  recalculateLightingTotals: async (projectId) => {
    try {
      const response = await api.post(`api/pricing/projects/${projectId}/recalculate_lighting/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - recalculateLightingTotals error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to recalculate lighting totals');
    }
  },

  // FIXED: Auto-create lighting items - need to get/create configuration first, then call the action
  autoCreateLightingItems: async (projectId) => {
    try {
      // Step 1: Get or create the lighting configuration for this project
      let config;
      try {
        config = await enhancedLightingApi.getLightingConfiguration(projectId);
      } catch (error) {
        // If configuration doesn't exist, create it via the project lighting endpoint
        const projectLighting = await enhancedLightingApi.createProjectLighting(projectId);
        config = projectLighting.configuration || projectLighting;
      }
      
      // Step 2: Call the auto_create_items action on the configuration
      const response = await api.post(`api/pricing/lighting-configurations/${config.id}/auto_create_items/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - autoCreateLightingItems error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to auto-create lighting items');
    }
  },

  // Get applicable rules for a project
  getApplicableRules: async (projectId) => {
    try {
      const response = await api.get(`api/pricing/lighting-rules/applicable_rules/`, {
        params: { project: projectId }
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Enhanced Lighting API - getApplicableRules error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch applicable rules');
    }
  },

  // Get lighting summary for project
  getLightingSummary: async (configId) => {
    try {
      const response = await api.get(`api/pricing/lighting-configurations/${configId}/summary/`);
      return response.data;
    } catch (error) {
      console.error('Enhanced Lighting API - getLightingSummary error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch lighting summary');
    }
  }
};

// Export the APIs separately to avoid namespace collisions
export { lightingRulesApi, enhancedLightingApi };