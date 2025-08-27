// Updated useCabinetTypes.js - Fix category handling and remove depth references

// src/hooks/masters/useCabinetTypes.js
import { useState, useEffect, useCallback } from 'react';
import cabinetTypesApi from '../../service/masters/cabinetTypesApi';

export const useCabinetTypes = (initialFilters = {}) => {
  const [cabinetTypes, setCabinetTypes] = useState([]);
  const [categories, setCategories] = useState([]);
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

  // Fetch cabinet types with current filters
  const fetchCabinetTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const response = await cabinetTypesApi.getAll(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setCabinetTypes(response.results);
        setPagination(prev => ({
          ...prev,
          count: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
      } else {
        setCabinetTypes(response);
        setPagination(prev => ({ ...prev, count: response.length }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cabinet types:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await cabinetTypesApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set default categories on error
      setCategories([
        { id: 1, name: 'Base Cabinets', description: 'Floor-mounted storage cabinets' },
        { id: 2, name: 'Wall Cabinets', description: 'Wall-mounted upper cabinets' },
        { id: 3, name: 'Tall Cabinets', description: 'Full-height storage units' },
        { id: 4, name: 'Special Cabinets', description: 'Custom and specialty cabinets' }
      ]);
    }
  }, []);

  // Create new cabinet type
  const createCabinetType = async (cabinetTypeData) => {
    try {
      setLoading(true);
      const newCabinetType = await cabinetTypesApi.create(cabinetTypeData);
      
      // Add to current list if it matches filters
      setCabinetTypes(prev => [newCabinetType, ...prev]);
      
      return { success: true, data: newCabinetType };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing cabinet type
  const updateCabinetType = async (id, cabinetTypeData) => {
    try {
      setLoading(true);
      const updatedCabinetType = await cabinetTypesApi.update(id, cabinetTypeData);
      
      setCabinetTypes(prev => 
        prev.map(type => 
          type.id === id ? updatedCabinetType : type
        )
      );
      
      return { success: true, data: updatedCabinetType };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete cabinet type
  const deleteCabinetType = async (id) => {
    try {
      setLoading(true);
      await cabinetTypesApi.delete(id);
      
      setCabinetTypes(prev => prev.filter(type => type.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle cabinet type active status
  const toggleCabinetTypeStatus = async (id, isActive) => {
    try {
      const updatedCabinetType = await cabinetTypesApi.toggleStatus(id, isActive);
      
      setCabinetTypes(prev => 
        prev.map(type => 
          type.id === id ? updatedCabinetType : type
        )
      );
      
      return { success: true, data: updatedCabinetType };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Duplicate cabinet type
  const duplicateCabinetType = async (id, newData) => {
    try {
      setLoading(true);
      const duplicatedType = await cabinetTypesApi.duplicate(id, newData);
      
      setCabinetTypes(prev => [duplicatedType, ...prev]);
      
      return { success: true, data: duplicatedType };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const filterByCategory = (categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
  };

  // Search cabinet types (local)
  const searchLocal = (searchTerm) => {
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

  // Refresh data
  const refresh = () => {
    fetchCabinetTypes();
    fetchCategories();
  };

  // Group cabinet types by category
  const getGroupedCabinetTypes = () => {
    const grouped = cabinetTypes.reduce((acc, type) => {
      // Use category_detail if available, otherwise fallback to category ID
      const categoryId = type.category_detail?.id || type.category;
      const categoryKey = `category_${categoryId}`;
      
      if (!acc[categoryKey]) {
        const categoryInfo = type.category_detail || 
                           categories.find(c => c.id === categoryId) || 
                           { id: categoryId, name: `Category ${categoryId}`, description: '' };
        acc[categoryKey] = {
          category: categoryInfo,
          types: []
        };
      }
      
      acc[categoryKey].types.push(type);
      
      return acc;
    }, {});

    // Sort types within each category by name
    Object.keys(grouped).forEach(categoryKey => {
      grouped[categoryKey].types.sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  // Get statistics
  const getCabinetTypesStats = () => {
    const total = cabinetTypes.length;
    const active = cabinetTypes.filter(t => t.is_active).length;
    const inactive = total - active;
    
    const byCategory = cabinetTypes.reduce((acc, type) => {
      const categoryId = type.category_detail?.id || type.category || 'UNCATEGORIZED';
      const categoryName = type.category_detail?.name || 
                          categories.find(c => c.id === categoryId)?.name || 
                          'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byCategory,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      categoriesCount: Object.keys(byCategory).length
    };
  };

  // Get category info by ID
  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId);
  };

  // Get category icon (simplified without hardcoded categories)
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'base': '🏠',
      'wall': '🧱', 
      'tall': '🏢',
      'special': '⭐'
    };
    
    const key = categoryName?.toLowerCase();
    return iconMap[key] || '📦';
  };

  // Get category color (simplified)
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'base': '#059669',
      'wall': '#dc2626',
      'tall': '#2563eb', 
      'special': '#7c3aed'
    };
    
    const key = categoryName?.toLowerCase();
    return colorMap[key] || '#6b7280';
  };

  // Effect to fetch cabinet types when filters change
  useEffect(() => {
    fetchCabinetTypes();
  }, [fetchCabinetTypes]);

  // Effect to fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Return hook interface
  return {
    // Data
    cabinetTypes,
    categories,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    createCabinetType,
    updateCabinetType,
    deleteCabinetType,
    duplicateCabinetType,
    toggleCabinetTypeStatus,
    
    // Filtering & Search
    filterByCategory,
    searchLocal,
    clearFilters,
    
    // Pagination
    changePage,
    changePageSize,
    
    // Utilities
    refresh,
    refetch: fetchCabinetTypes,
    getGroupedCabinetTypes,
    getCabinetTypesStats,
    getCategoryById,
    getCategoryIcon,
    getCategoryColor
  };
};

export default useCabinetTypes;