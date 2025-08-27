// src/hooks/masters/useCustomers.js
import { useState, useEffect, useCallback } from 'react';
import customersApi from '../../service/customersApi';

export const useCustomers = (initialFilters = {}) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false
  });

  // Fetch customers with current filters
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const response = await customersApi.getAll(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setCustomers(response.results);
        setPagination(prev => ({
          ...prev,
          count: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
      } else {
        setCustomers(response);
        setPagination(prev => ({ ...prev, count: response.length }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Create new customer
  const createCustomer = async (customerData) => {
    try {
      setLoading(true);
      const newCustomer = await customersApi.create(customerData);
      
      // Add to current list if it matches filters
      setCustomers(prev => [newCustomer, ...prev]);
      
      return { success: true, data: newCustomer };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing customer
  const updateCustomer = async (id, customerData) => {
    try {
      setLoading(true);
      const updatedCustomer = await customersApi.update(id, customerData);
      
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? updatedCustomer : customer
        )
      );
      
      return { success: true, data: updatedCustomer };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    try {
      setLoading(true);
      await customersApi.delete(id);
      
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update customer state
  const updateCustomerState = async (id, newState) => {
    try {
      const updatedCustomer = await customersApi.updateState(id, newState);
      
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? updatedCustomer : customer
        )
      );
      
      return { success: true, data: updatedCustomer };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Search customers
  const searchCustomers = async (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  // Filter by status
  const filterByStatus = (isActive) => {
    setFilters(prev => ({ ...prev, is_active: isActive }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };

  // Change page
  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Change page size
  const changePageSize = (newPageSize) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: newPageSize,
      page: 1 // Reset to first page
    }));
  };

  // Get customer by ID
  const getCustomerById = async (id) => {
    try {
      const customer = await customersApi.getById(id);
      return { success: true, data: customer };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get customer statistics
  const getCustomerStats = async () => {
    try {
      const stats = await customersApi.getStats();
      return { success: true, data: stats };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Customer requirements operations
  const getCustomerRequirements = async (customerId) => {
    try {
      const requirements = await customersApi.getRequirements(customerId);
      return { success: true, data: requirements };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createCustomerRequirements = async (requirementsData) => {
    try {
      const requirements = await customersApi.createRequirements(requirementsData);
      return { success: true, data: requirements };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateCustomerRequirements = async (customerId, formData) => {
    try {
      const requirements = await customersApi.updateRequirements(customerId, formData);
      return { success: true, data: requirements };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      await customersApi.deleteDocument(documentId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh data
  const refresh = () => {
    fetchCustomers();
  };

  // Effect to fetch customers when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Return hook interface
  return {
    // Data
    customers,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerState,
    getCustomerById,
    getCustomerStats,
    
    // Requirements operations
    getCustomerRequirements,
    createCustomerRequirements,
    updateCustomerRequirements,
    deleteDocument,
    
    // Filtering & Search
    searchCustomers,
    filterByStatus,
    clearFilters,
    
    // Pagination
    changePage,
    changePageSize,
    
    // Utilities
    refresh,
    refetch: fetchCustomers
  };
};

export default useCustomers;
