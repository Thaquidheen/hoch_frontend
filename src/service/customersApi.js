// src/service/customers/customersApi.js
import api from '../service/api';

const customersApi = {

  // GET /api/customers/ - Get all customers
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/customers/', { params });
      return response.data;
    } catch (error) {
      console.error('Customers API - getAll error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to fetch customers';
      throw new Error(errorMessage);
    }
  },

  // GET /api/customers/{id}/ - Get single customer
  getById: async (id) => {
    try {
      const response = await api.get(`/api/customers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Customers API - getById error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to fetch customer';
      throw new Error(errorMessage);
    }
  },

  // POST /api/customers/ - Create new customer
  create: async (customerData) => {
    try {
      const response = await api.post('/api/customers/', customerData);
      return response.data;
    } catch (error) {
      console.error('Customers API - create error:', error);
      
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
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to create customer';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create customer');
    }
  },

  // PUT /api/customers/{id}/ - Update customer
  update: async (id, customerData) => {
    try {
      const response = await api.put(`/api/customers/${id}/`, customerData);
      return response.data;
    } catch (error) {
      console.error('Customers API - update error:', error);
      
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
        const errorMessage = errors.detail || errors.message || errors.error || 'Failed to update customer';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update customer');
    }
  },

  // DELETE /api/customers/{id}/ - Delete customer
  delete: async (id) => {
    try {
      await api.delete(`/api/customers/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Customers API - delete error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Customer not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this customer');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to delete customer';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/customers/{id}/update-state/ - Update customer state
  updateState: async (id, newState) => {
    try {
      const response = await api.patch(`/api/customers/${id}/update-state/`, { 
        state: newState 
      });
      return response.data;
    } catch (error) {
      console.error('Customers API - updateState error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Customer not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update customer state';
      throw new Error(errorMessage);
    }
  },

  // GET /api/customers/customer-stats/ - Get customer statistics
  getStats: async () => {
    try {
      const response = await api.get('/api/customers/customer-stats/');
      return response.data;
    } catch (error) {
      console.error('Customers API - getStats error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch customer statistics';
      throw new Error(errorMessage);
    }
  },

  // GET /api/customers/{id}/requirements/ - Get customer requirements
  getRequirements: async (customerId) => {
    try {
      const response = await api.get(`/api/customers/${customerId}/requirements/`);
      return response.data;
    } catch (error) {
      console.error('Customers API - getRequirements error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Customer not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch customer requirements';
      throw new Error(errorMessage);
    }
  },

  // POST /api/customers/requirements/ - Create customer requirements
  createRequirements: async (requirementsData) => {
    try {
      const response = await api.post('/api/customers/requirements/', requirementsData);
      return response.data;
    } catch (error) {
      console.error('Customers API - createRequirements error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to create customer requirements';
      throw new Error(errorMessage);
    }
  },

  // PATCH /api/customers/{id}/requirements/detail/ - Update customer requirements
  updateRequirements: async (customerId, formData) => {
    try {
      const response = await api.patch(
        `/api/customers/${customerId}/requirements/detail/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Customers API - updateRequirements error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update customer requirements';
      throw new Error(errorMessage);
    }
  },

  // DELETE /api/customers/{id}/delete/ - Delete document
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/api/customers/${documentId}/delete/`);
      return response.data;
    } catch (error) {
      console.error('Customers API - deleteDocument error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Document not found');
      }
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to delete document';
      throw new Error(errorMessage);
    }
  },

  // GET /api/customers/?search=keyword - Search customers
  search: async (searchTerm) => {
    try {
      const response = await api.get('/api/customers/', { 
        params: { search: searchTerm } 
      });
      return response.data;
    } catch (error) {
      console.error('Customers API - search error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to search customers';
      throw new Error(errorMessage);
    }
  },

  // GET /api/customers/?is_active=true - Filter by active status
  getByStatus: async (isActive = true) => {
    try {
      const response = await api.get('/api/customers/', { 
        params: { is_active: isActive } 
      });
      return response.data;
    } catch (error) {
      console.error('Customers API - getByStatus error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch customers by status';
      throw new Error(errorMessage);
    }
  }
};

// Export the API service
export default customersApi;

// Named export for convenience
export { customersApi };

// Legacy exports for backward compatibility (can be removed after refactoring)
export const CustomerService = customersApi.getAll;
export const addCustomer = customersApi.create;
export const updateCustomer = customersApi.update;
export const updateCustomerState = customersApi.updateState;
export const Customerstate = customersApi.getStats;
export const CustomerRequirements = customersApi.getRequirements;
export const CreateCustomerRequirements = customersApi.createRequirements;
export const UpdateCustomerRequirements = customersApi.updateRequirements;
export const DeleteDocument = customersApi.deleteDocument;