// src/hooks/quotations/useProjects.js
import { useState, useEffect, useCallback } from 'react';
import projectsApi from '../../service/quotations/projectsApi';

import customersApi from '../../service/customersApi';
import brandsApi from '../../service/brand/BrandService';

export const useProjects = (initialFilters = {}) => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
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

  // Fetch projects with current filters
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const response = await projectsApi.getAll(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setProjects(response.results);
        setPagination(prev => ({
          ...prev,
          count: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
      } else {
        setProjects(response);
        setPagination(prev => ({ ...prev, count: response.length }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Fetch customers for dropdowns
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await customersApi.getAll({ is_active: true });
      const customersData = response.results || response;
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  }, []);

  // Fetch brands for dropdowns
  const fetchBrands = useCallback(async () => {
    try {
      const response = await brandsApi.getAll({ is_active: true });
      const brandsData = response.results || response;
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  }, []);

  // Create new project
  const createProject = async (projectData) => {
    try {
      setLoading(true);
      const newProject = await projectsApi.create(projectData);
      
      // Add to current list if it matches filters
      setProjects(prev => [newProject, ...prev]);
      
      return { success: true, data: newProject };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing project
  const updateProject = async (id, projectData) => {
    try {
      setLoading(true);
      const updatedProject = await projectsApi.update(id, projectData);
      
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      
      return { success: true, data: updatedProject };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (id) => {
    try {
      setLoading(true);
      await projectsApi.delete(id);
      
      setProjects(prev => prev.filter(project => project.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update project status
  const updateProjectStatus = async (id, status) => {
    try {
      const updatedProject = await projectsApi.updateStatus(id, status);
      
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      
      return { success: true, data: updatedProject };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Duplicate project
  const duplicateProject = async (id, newProjectData = {}) => {
    try {
      setLoading(true);
      const duplicatedProject = await projectsApi.duplicate(id, newProjectData);
      
      // Add to current list
      setProjects(prev => [duplicatedProject, ...prev]);
      
      return { success: true, data: duplicatedProject };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Recalculate project totals
  const recalculateProjectTotals = async (id) => {
    try {
      const result = await projectsApi.recalculateTotals(id);
      
      // Refresh the project in the list
      const updatedProject = await projectsApi.getById(id);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Get project by ID
  const getProjectById = async (id) => {
    try {
      console.log('useProjects - calling getProjectById with ID:', id);
      const response = await projectsApi.getById(id);
      console.log('useProjects - getProjectById response:', response);
      
      return { 
        success: true, 
        data: response.data || response // Handle different response structures
      };
    } catch (error) {
      console.error('useProjects - getProjectById error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 
               error.response?.data?.message || 
               error.message || 
               'Failed to fetch project'
      };
    }
  };


  // Get projects by customer
  const getProjectsByCustomer = async (customerId) => {
    try {
      const customerProjects = await projectsApi.getByCustomer(customerId);
      return { success: true, data: customerProjects };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Filter by customer
  const filterByCustomer = (customerId) => {
    setFilters(prev => ({ ...prev, customer: customerId }));
  };

  // Filter by status
  const filterByStatus = (status) => {
    setFilters(prev => ({ ...prev, status: status }));
  };

  // Filter by brand
  const filterByBrand = (brandId) => {
    setFilters(prev => ({ ...prev, brand: brandId }));
  };

  // Filter by budget tier
  const filterByBudgetTier = (budgetTier) => {
    setFilters(prev => ({ ...prev, budget_tier: budgetTier }));
  };

  // Search projects
  const searchProjects = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
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

  // Export projects
  const exportProjects = async (params = {}) => {
    try {
      await projectsApi.exportProjects(params);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh data
  const refresh = () => {
    fetchProjects();
  };

  // Get projects statistics
  const getProjectsStats = () => {
    const total = projects.length;
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    const byBudgetTier = projects.reduce((acc, project) => {
      acc[project.budget_tier] = (acc[project.budget_tier] || 0) + 1;
      return acc;
    }, {});

    const uniqueCustomers = new Set(projects.map(p => p.customer)).size;
    const uniqueBrands = new Set(projects.map(p => p.brand)).size;
    
    const totalValue = projects.reduce((sum, project) => {
      return sum + (parseFloat(project.totals?.grand_total || 0));
    }, 0);

    const averageProjectValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      byStatus,
      byBudgetTier,
      uniqueCustomers,
      uniqueBrands,
      totalValue: Math.round(totalValue * 100) / 100,
      averageProjectValue: Math.round(averageProjectValue * 100) / 100,
      draft: byStatus.DRAFT || 0,
      quoted: byStatus.QUOTED || 0,
      confirmed: byStatus.CONFIRMED || 0,
      inProduction: byStatus.IN_PRODUCTION || 0,
      delivered: byStatus.DELIVERED || 0,
      cancelled: byStatus.CANCELLED || 0
    };
  };

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Get brand name by ID
  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
  };

  // Effect to fetch projects when filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Effect to fetch dropdown data on mount
  useEffect(() => {
    fetchCustomers();
    fetchBrands();
  }, [fetchCustomers, fetchBrands]);

  // Return hook interface
  return {
    // Data
    projects,
    customers,
    brands,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    duplicateProject,
    recalculateProjectTotals,
    getProjectById,
    getProjectsByCustomer,
    
    // Filtering & Search
    filterByCustomer,
    filterByStatus,
    filterByBrand,
    filterByBudgetTier,
    searchProjects,
    clearFilters,
    
    // Pagination
    changePage,
    changePageSize,
    
    // Utilities
    refresh,
    refetch: fetchProjects,
    getProjectsStats,
    getCustomerName,
    getBrandName,
    exportProjects
  };
};

export default useProjects;