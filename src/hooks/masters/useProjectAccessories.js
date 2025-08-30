import { useState, useEffect, useCallback, useMemo } from 'react';
import projectAccessoriesApi from '../../service/masters/projectAccessoriesApi';

export const useProjectAccessories = (projectId, initialFilters = {}) => {
  const [accessories, setAccessories] = useState([]);
  const [brands, setBrands] = useState([]); // NEW: Added brands state
  const [categories, setCategories] = useState([]); // NEW: Added categories state  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // NEW: Fetch brands using your existing pattern
  const fetchBrands = useCallback(async () => {
    try {
      const response = await projectAccessoriesApi.getBrands({ is_active: true });
      
      if (response.success) {
        const brandsData = response.data.results || response.data;
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } else {
        throw new Error(response.error || 'Failed to fetch brands');
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
      
      // Fallback to mock brands for development
      setBrands([
        { id: 1, name: 'Blum', is_active: true },
        { id: 2, name: 'Hafele', is_active: true },
        { id: 3, name: 'Hettich', is_active: true },
        { id: 4, name: 'Godrej', is_active: true },
        { id: 5, name: 'Ebco', is_active: true }
      ]);
    }
  }, []);

  // NEW: Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await projectAccessoriesApi.getCategories();
      
      if (response.success) {
        const categoriesData = response.data.results || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        if (response.fallback) {
          // Use fallback categories for backend config issues
          setCategories([
            { id: 1, name: 'Hardware' },
            { id: 2, name: 'Lighting' },
            { id: 3, name: 'Storage' },
            { id: 4, name: 'Decorative' },
            { id: 5, name: 'Handles & Knobs' },
            { id: 6, name: 'Hinges' },
            { id: 7, name: 'Slides & Rails' }
          ]);
        } else {
          throw new Error(response.error || 'Failed to fetch categories');
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  }, []);

  // Fetch accessories using the API service
  const fetchAccessories = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        project: projectId,
        ...filters
      };

      const data = await projectAccessoriesApi.getAll(params);
      
      // Handle different response structures
      const accessoriesArray = data.results || data;
      
      if (!Array.isArray(accessoriesArray)) {
        console.error('Expected array but got:', typeof accessoriesArray, accessoriesArray);
        throw new Error('Invalid data format: expected array of accessories');
      }
      
      setAccessories(accessoriesArray);
      
    } catch (err) {
      console.error('Error fetching accessories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  // NEW: Fetch all reference data (brands, categories) on mount
  const fetchReferenceData = useCallback(async () => {
    await Promise.allSettled([
      fetchBrands(),
      fetchCategories()
    ]);
  }, [fetchBrands, fetchCategories]);

  // Create new accessory
  const createAccessory = async (accessoryData) => {
    try {
      setLoading(true);
      
      const newAccessory = await projectAccessoriesApi.create(accessoryData);
      
      // Add to current list
      setAccessories(prev => [newAccessory, ...prev]);
      
      showNotification('success', 'Accessory added successfully');
      
      return { success: true, data: newAccessory };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create accessory';
      setError(errorMessage);
      showNotification('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update existing accessory
  const updateAccessory = async (id, accessoryData) => {
    try {
      setLoading(true);
      
      const updatedAccessory = await projectAccessoriesApi.update(id, accessoryData);
      
      setAccessories(prev => 
        prev.map(accessory => 
          accessory.id === id ? updatedAccessory : accessory
        )
      );
      
      showNotification('success', 'Accessory updated successfully');
      
      return { success: true, data: updatedAccessory };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update accessory';
      setError(errorMessage);
      showNotification('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete accessory
  const deleteAccessory = async (id) => {
    try {
      setLoading(true);
      
      await projectAccessoriesApi.delete(id);
      
      setAccessories(prev => prev.filter(accessory => accessory.id !== id));
      
      showNotification('success', 'Accessory deleted successfully');
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete accessory';
      setError(errorMessage);
      showNotification('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get accessory by ID
  const getAccessoryById = async (id) => {
    try {
      const accessory = await projectAccessoriesApi.getById(id);
      return { success: true, data: accessory };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Bulk create accessories
  const bulkCreateAccessories = async (accessoriesArray) => {
    try {
      setLoading(true);
      
      const result = await projectAccessoriesApi.bulkCreate(accessoriesArray);
      
      // Refresh the list
      await fetchAccessories();
      
      showNotification('success', `Successfully created ${accessoriesArray.length} accessories`);
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Failed to bulk create accessories';
      setError(errorMessage);
      showNotification('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get available products
  const getAvailableProducts = async (productFilters = {}) => {
    try {
      const response = await projectAccessoriesApi.getAvailableProducts(productFilters);
      return response; // Already returns { success, data, error } format
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get project statistics
  const getProjectStats = async () => {
    try {
      const stats = await projectAccessoriesApi.getProjectStats(projectId);
      return { success: true, data: stats };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Duplicate accessory
  const duplicateAccessory = async (accessoryId, targetLineItemId) => {
    try {
      setLoading(true);
      
      const duplicatedAccessory = await projectAccessoriesApi.duplicate(accessoryId, targetLineItemId);
      
      // Add to current list
      setAccessories(prev => [duplicatedAccessory, ...prev]);
      
      showNotification('success', 'Accessory duplicated successfully');
      
      return { success: true, data: duplicatedAccessory };
    } catch (err) {
      const errorMessage = err.message || 'Failed to duplicate accessory';
      setError(errorMessage);
      showNotification('error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Search accessories
  const searchAccessories = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  // Filter by line item
  const filterByLineItem = useCallback((lineItemId) => {
    setFilters(prev => ({ ...prev, line_item: lineItemId }));
  }, []);

  // NEW: Filter by brand
  const filterByBrand = useCallback((brandId) => {
    setFilters(prev => ({ ...prev, brand: brandId }));
  }, []);

  // NEW: Filter by category
  const filterByCategory = useCallback((categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  // NEW: Refresh reference data
  const refreshReferenceData = useCallback(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Clear notification
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const accessoriesByLineItem = useMemo(() => {
    return accessories.reduce((groups, accessory) => {
      const lineItemId = accessory.line_item;
      if (!groups[lineItemId]) groups[lineItemId] = [];
      groups[lineItemId].push(accessory);
      return groups;
    }, {});
  }, [accessories]);

  const totals = useMemo(() => {
    const projectTotal = accessories.reduce((sum, acc) => sum + parseFloat(acc.total_price || 0), 0);
    const itemCounts = Object.keys(accessoriesByLineItem).reduce((counts, lineItemId) => {
      counts[lineItemId] = accessoriesByLineItem[lineItemId].length;
      return counts;
    }, {});

    return { projectTotal, itemCounts };
  }, [accessories, accessoriesByLineItem]);

  // NEW: Get brand by ID helper
  const getBrandById = useCallback((brandId) => {
    return brands.find(brand => brand.id === brandId) || null;
  }, [brands]);

  // NEW: Get category by ID helper
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId) || null;
  }, [categories]);

  // Filter accessories for search
  const getFilteredLineItems = useCallback((lineItems, searchTerm) => {
    if (!searchTerm) return lineItems;
    
    return lineItems.filter(lineItem => {
      const lineItemAccessories = accessoriesByLineItem[lineItem.id] || [];
      const matchesLineItem = lineItem.cabinet_type_detail?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAccessory = lineItemAccessories.some(acc => 
        acc.accessory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.material_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesLineItem || matchesAccessory;
    });
  }, [accessoriesByLineItem]);

  // Effect to fetch accessories when projectId or filters change
  useEffect(() => {
    if (projectId) {
      fetchAccessories();
    }
  }, [fetchAccessories]);

  // NEW: Effect to fetch reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Return hook interface
  return {
    // Data
    accessories,
    brands, // NEW: Export brands
    categories, // NEW: Export categories
    loading,
    error,
    filters,
    notification,
    accessoriesByLineItem,
    totals,
    
    // Actions
    createAccessory,
    updateAccessory,
    deleteAccessory,
    getAccessoryById,
    bulkCreateAccessories,
    duplicateAccessory,
    getAvailableProducts,
    getProjectStats,
    
    // Reference data actions
    fetchBrands, // NEW: Export brand fetching
    fetchCategories, // NEW: Export category fetching
    refreshReferenceData, // NEW: Refresh all reference data
    
    // Filtering & Search
    searchAccessories,
    filterByLineItem,
    filterByBrand, // NEW: Brand filtering
    filterByCategory, // NEW: Category filtering
    clearFilters,
    getFilteredLineItems,
    
    // NEW: Helper functions
    getBrandById,
    getCategoryById,
    
    // Utilities
    refresh,
    refetch: fetchAccessories,
    showNotification,
    clearNotification,
    clearError,
    
    // Debug helpers
    debugInfo: () => ({
      projectId,
      filters,
      accessoriesCount: accessories.length,
      brandsCount: brands.length,
      categoriesCount: categories.length
    })
  };
};

export default useProjectAccessories;