// src/hooks/masters/useMaterials.js
import { useState, useEffect, useCallback } from 'react';
import materialsApi from '../../service/masters/materialsApi';

export const useMaterials = (initialFilters = {}) => {
  const [materials, setMaterials] = useState([]);
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

  // Fetch materials with current filters
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const response = await materialsApi.getAll(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setMaterials(response.results);
        setPagination(prev => ({
          ...prev,
          count: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
      } else {
        setMaterials(response);
        setPagination(prev => ({ ...prev, count: response.length }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Create new material
  const createMaterial = async (materialData) => {
    try {
      setLoading(true);
      const newMaterial = await materialsApi.create(materialData);
      
      // Add to current list if it matches filters
      setMaterials(prev => [newMaterial, ...prev]);
      
      return { success: true, data: newMaterial };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing material
  const updateMaterial = async (id, materialData) => {
    try {
      setLoading(true);
      const updatedMaterial = await materialsApi.update(id, materialData);
      
      setMaterials(prev => 
        prev.map(material => 
          material.id === id ? updatedMaterial : material
        )
      );
      
      return { success: true, data: updatedMaterial };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete material
  const deleteMaterial = async (id) => {
    try {
      setLoading(true);
      await materialsApi.delete(id);
      
      setMaterials(prev => prev.filter(material => material.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle material active status
  const toggleMaterialStatus = async (id, isActive) => {
    try {
      const updatedMaterial = await materialsApi.toggleStatus(id, isActive);
      
      setMaterials(prev => 
        prev.map(material => 
          material.id === id ? updatedMaterial : material
        )
      );
      
      return { success: true, data: updatedMaterial };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Search materials
  const searchMaterials = async (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  // Filter by role
  const filterByRole = (role) => {
    setFilters(prev => ({ ...prev, role }));
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

  // Bulk operations
  const bulkCreateMaterials = async (materialsArray) => {
    try {
      setLoading(true);
      const result = await materialsApi.bulkCreate(materialsArray);
      
      // Refresh the list
      await fetchMaterials();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get material by ID
  const getMaterialById = async (id) => {
    try {
      const material = await materialsApi.getById(id);
      return { success: true, data: material };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh data
  const refresh = () => {
    fetchMaterials();
  };

  // Effect to fetch materials when filters change
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Return hook interface
  return {
    // Data
    materials,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleMaterialStatus,
    getMaterialById,
    bulkCreateMaterials,
    
    // Filtering & Search
    searchMaterials,
    filterByRole,
    clearFilters,
    
    // Pagination
    changePage,
    changePageSize,
    
    // Utilities
    refresh,
    refetch: fetchMaterials
  };
};

export default useMaterials;