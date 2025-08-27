// src/hooks/masters/useDoorRates.js
import { useState, useEffect, useCallback } from 'react';
import doorRatesApi from '../../service/masters/doorRatesApi';
import materialsApi from '../../service/masters/materialsApi';

export const useDoorRates = (initialFilters = {}) => {
  const [doorRates, setDoorRates] = useState([]);
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

  // Fetch door rates with current filters
  const fetchDoorRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const response = await doorRatesApi.getAll(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setDoorRates(response.results);
        setPagination(prev => ({
          ...prev,
          count: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
      } else {
        setDoorRates(response);
        setPagination(prev => ({ ...prev, count: response.length }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching door rates:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Fetch materials for dropdowns (only door materials)
  const fetchMaterials = useCallback(async () => {
    try {
      const response = await materialsApi.getAll({
        is_active: true,
        role: 'DOOR,BOTH' // Only door materials
      });
      
      const materialsData = response.results || response;
      // Filter materials that can be used for doors
      const doorMaterials = Array.isArray(materialsData) 
        ? materialsData.filter(m => m.role === 'DOOR' || m.role === 'BOTH')
        : [];
      
      setMaterials(doorMaterials);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMaterials([]);
    }
  }, []);

  // Create new door rate
  const createDoorRate = async (rateData) => {
    try {
      setLoading(true);
      const newRate = await doorRatesApi.create(rateData);
      
      // Add to current list if it matches filters
      setDoorRates(prev => [newRate, ...prev]);
      
      return { success: true, data: newRate };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing door rate
  const updateDoorRate = async (id, rateData) => {
    try {
      setLoading(true);
      const updatedRate = await doorRatesApi.update(id, rateData);
      
      setDoorRates(prev => 
        prev.map(rate => 
          rate.id === id ? updatedRate : rate
        )
      );
      
      return { success: true, data: updatedRate };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete door rate
  const deleteDoorRate = async (id) => {
    try {
      setLoading(true);
      await doorRatesApi.delete(id);
      
      setDoorRates(prev => prev.filter(rate => rate.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle door rate active status
  const toggleDoorRateStatus = async (id, isActive) => {
    try {
      const updatedRate = await doorRatesApi.toggleStatus(id, isActive);
      
      setDoorRates(prev => 
        prev.map(rate => 
          rate.id === id ? updatedRate : rate
        )
      );
      
      return { success: true, data: updatedRate };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Get rates by material
  const getRatesByMaterial = async (materialId) => {
    try {
      const rates = await doorRatesApi.getByMaterial(materialId);
      return { success: true, data: rates };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get rate history for material
  const getRateHistory = async (materialId) => {
    try {
      const history = await doorRatesApi.getRateHistory(materialId);
      return { success: true, data: history };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Bulk update prices
  const bulkUpdatePrices = async (updateData) => {
    try {
      setLoading(true);
      const result = await doorRatesApi.bulkUpdatePrices(updateData);
      
      // Refresh the list after bulk update
      await fetchDoorRates();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get price comparison
  const getPriceComparison = async (materialIds) => {
    try {
      const comparison = await doorRatesApi.getPriceComparison(materialIds);
      return { success: true, data: comparison };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Filter by material
  const filterByMaterial = (materialId) => {
    setFilters(prev => ({ ...prev, material: materialId }));
  };

  // Search door rates
  const searchDoorRates = (searchTerm) => {
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

  // Get current active rates
  const getCurrentRates = async () => {
    try {
      const rates = await doorRatesApi.getCurrentRates();
      return { success: true, data: rates };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get door rate by ID
  const getDoorRateById = async (id) => {
    try {
      const rate = await doorRatesApi.getById(id);
      return { success: true, data: rate };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh data
  const refresh = () => {
    fetchDoorRates();
  };

  // Group rates by material for timeline view
  const getGroupedRates = () => {
    const grouped = doorRates.reduce((acc, rate) => {
      const materialName = rate.material_detail?.name || rate.material;
      
      if (!acc[materialName]) {
        acc[materialName] = {
          material: rate.material_detail || { id: rate.material, name: materialName },
          rates: []
        };
      }
      
      acc[materialName].rates.push(rate);
      
      return acc;
    }, {});

    // Sort rates within each material group by effective_from date (newest first)
    Object.keys(grouped).forEach(materialName => {
      grouped[materialName].rates.sort((a, b) => 
        new Date(b.effective_from) - new Date(a.effective_from)
      );
    });

    return grouped;
  };

  // Get statistics
  const getDoorRatesStats = () => {
    const total = doorRates.length;
    const active = doorRates.filter(r => r.is_active).length;
    const inactive = total - active;
    
    const uniqueMaterials = new Set(doorRates.map(r => r.material)).size;
    
    const averageRate = doorRates
      .filter(r => r.is_active)
      .reduce((sum, r, _, arr) => sum + (parseFloat(r.unit_rate) / (arr.length || 1)), 0);

    const highestRate = Math.max(...doorRates
      .filter(r => r.is_active)
      .map(r => parseFloat(r.unit_rate)), 0);

    const lowestRate = Math.min(...doorRates
      .filter(r => r.is_active && parseFloat(r.unit_rate) > 0)
      .map(r => parseFloat(r.unit_rate)), 0);

    // Group by material type for better insights
    const materialTypes = doorRates.reduce((acc, rate) => {
      const materialName = rate.material_detail?.name || 'Unknown';
      acc[materialName] = (acc[materialName] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      uniqueMaterials,
      averageRate: Math.round(averageRate * 100) / 100,
      highestRate,
      lowestRate: lowestRate === Infinity ? 0 : lowestRate,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      materialTypes,
      priceRange: {
        min: lowestRate === Infinity ? 0 : lowestRate,
        max: highestRate,
        spread: highestRate - (lowestRate === Infinity ? 0 : lowestRate)
      }
    };
  };

  // Effect to fetch door rates when filters change
  useEffect(() => {
    fetchDoorRates();
  }, [fetchDoorRates]);

  // Effect to fetch materials on mount
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Return hook interface
  return {
    // Data
    doorRates,
    materials,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    createDoorRate,
    updateDoorRate,
    deleteDoorRate,
    toggleDoorRateStatus,
    getRatesByMaterial,
    getRateHistory,
    bulkUpdatePrices,
    getDoorRateById,
    getCurrentRates,
    getPriceComparison,
    
    // Filtering & Search
    filterByMaterial,
    searchDoorRates,
    clearFilters,
    
    // Pagination
    changePage,
    changePageSize,
    
    // Utilities
    refresh,
    refetch: fetchDoorRates,
    getGroupedRates,
    getDoorRatesStats
  };
};

export default useDoorRates;