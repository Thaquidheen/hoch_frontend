// src/service/quotations/projectsApi.js
import api from '../api';



// /api/pricing/projects/
const projectsApi = {
  // GET /api/pricing/projects/ - Get all projects
  getAll: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/projects/', { params });
      return response.data;
    } catch (error) {
      console.error('Projects API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch projects';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/{id}/ - Get single project with details
  getById: async (id) => {
    try {
      console.log('projectApi - getById called with ID:', id);
      const response = await api.get(`api/pricing/projects/${id}/`);
      console.log('projectApi - getById response:', response);
      return response.data;
    } catch (error) {
      console.error('projectApi - getById error:', error);
      throw error;
    }
  },


  // POST /api/pricing/projects/ - Create new project
  create: async (projectData) => {
    try {
      const response = await api.post('api/pricing/projects/', projectData);
      return response.data;
    } catch (error) {
      console.error('Projects API - create error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to create project';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create project');
    }
  },

  // PUT /api/pricing/projects/{id}/ - Update project
  update: async (id, projectData) => {
    try {
      const response = await api.put(`api/pricing/projects/${id}/`, projectData);
      return response.data;
    } catch (error) {
      console.error('Projects API - update error:', error);
      
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
        
        const errorMessage = errors.detail || errors.message || 'Failed to update project';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update project');
    }
  },

  // DELETE /api/pricing/projects/{id}/ - Delete project
  delete: async (id) => {
    try {
      await api.delete(`api/pricing/projects/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Projects API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Project not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this project');
      }
      
      // Check for line items constraint
      if (error.response?.status === 400) {
        throw new Error('Cannot delete project with existing line items. Remove line items first.');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete project';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/pricing/projects/{id}/ - Update project status or partial updates
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`api/pricing/projects/${id}/`, { status });
      return response.data;
    } catch (error) {
      console.error('Projects API - updateStatus error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Project not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update project status';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/projects/{id}/recalc/ - Recalculate project totals
  recalculateTotals: async (id) => {
    try {
      const response = await api.post(`api/pricing/projects/${id}/recalc/`);
      return response.data;
    } catch (error) {
      console.error('Projects API - recalculateTotals error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to recalculate project totals';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/{id}/line-items/ - Get project line items
  getLineItems: async (projectId) => {
    try {
      const response = await api.get(`api/project-line-items/`, {
        params: { project: projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Projects API - getLineItems error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch project line items';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/{id}/totals/ - Get project totals
  getTotals: async (projectId) => {
    try {
      const response = await api.get(`api/project-totals/`, {
        params: { project: projectId }
      });
      return response.data;
    } catch (error) {
      console.error('Projects API - getTotals error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch project totals';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/?customer={id} - Get projects by customer
  getByCustomer: async (customerId) => {
    try {
      const response = await api.get('api/pricing/projects/', { 
        params: { customer: customerId } 
      });
      return response.data;
    } catch (error) {
      console.error('Projects API - getByCustomer error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch customer projects';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/?status={status} - Get projects by status
  getByStatus: async (status) => {
    try {
      const response = await api.get('api/pricing/projects/', { 
        params: { status: status } 
      });
      return response.data;
    } catch (error) {
      console.error('Projects API - getByStatus error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch projects by status';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/projects/{id}/duplicate/ - Duplicate project
  duplicate: async (id, newProjectData = {}) => {
    try {
      const response = await api.post(`api/pricing/projects/${id}/duplicate/`, newProjectData);
      return response.data;
    } catch (error) {
      console.error('Projects API - duplicate error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to duplicate project';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/summary/ - Get projects summary/statistics
  getSummary: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/projects/summary/', { params });
      return response.data;
    } catch (error) {
      console.error('Projects API - getSummary error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch projects summary';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/recent/ - Get recent projects
  getRecent: async (limit = 10) => {
    try {
      const response = await api.get('api/pricing/projects/', { 
        params: { 
          ordering: '-updated_at',
          limit: limit
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Projects API - getRecent error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch recent projects';
      throw new Error(errorMessage);
    }
  },

  // POST /api/pricing/projects/{id}/convert-to-order/ - Convert quote to order
  convertToOrder: async (id) => {
    try {
      const response = await api.post(`api/pricing/projects/${id}/convert-to-order/`);
      return response.data;
    } catch (error) {
      console.error('Projects API - convertToOrder error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to convert project to order';
      throw new Error(errorMessage);
    }
  },

  // GET /api/pricing/projects/export/ - Export projects
  exportProjects: async (params = {}) => {
    try {
      const response = await api.get('api/pricing/projects/export/', {
        params: { ...params, format: 'csv' },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projects_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('Projects API - exportProjects error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to export projects';
      throw new Error(errorMessage);
    }
  },

  // Search projects
  search: async (query, filters = {}) => {
    try {
      const response = await api.get('api/pricing/projects/', { 
        params: { 
          search: query,
          ...filters
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Projects API - search error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to search projects';
      throw new Error(errorMessage);
    }
  }
};

export default projectsApi;
export { projectsApi };