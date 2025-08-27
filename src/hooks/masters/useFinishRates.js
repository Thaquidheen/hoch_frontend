// src/hooks/masters/useFinishRates.js
import { useState, useEffect, useCallback } from 'react';
import finishRatesApi from '../../service/masters/finishRatesApi';
import materialsApi from '../../service/masters/materialsApi';

export const useFinishRates = (initialFilters = {}) => {
  const [finishRates, setFinishRates] = useState([]);
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

  // Fetch finish rates with current filters
  const fetchFinishRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const response = await finishRatesApi.getAll(params);
      
      // Handle both paginated and non-paginated responses
      if (response.results) {
        setFinishRates(response.results);
        setPagination(prev => ({
          ...prev,
          count: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
      } else {
        setFinishRates(response);
        setPagination(prev => ({ ...prev, count: response.length }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching finish rates:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Fetch materials for dropdowns
  const fetchMaterials = useCallback(async () => {
    try {
      const response = await materialsApi.getAll({
        is_active: true,
        role: 'CABINET,BOTH' // Only cabinet materials
      });
      
      const materialsData = response.results || response;
      // Filter materials that can be used for cabinets
      const cabinetMaterials = Array.isArray(materialsData) 
        ? materialsData.filter(m => m.role === 'CABINET' || m.role === 'BOTH')
        : [];
      
      setMaterials(cabinetMaterials);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMaterials([]);
    }
  }, []);

  // Create new finish rate
  const createFinishRate = async (rateData) => {
    try {
      setLoading(true);
      const newRate = await finishRatesApi.create(rateData);
      
      // Add to current list if it matches filters
      setFinishRates(prev => [newRate, ...prev]);
      
      return { success: true, data: newRate };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing finish rate
  const updateFinishRate = async (id, rateData) => {
    try {
      setLoading(true);
      const updatedRate = await finishRatesApi.update(id, rateData);
      
      setFinishRates(prev => 
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

  // Delete finish rate
  const deleteFinishRate = async (id) => {
    try {
      setLoading(true);
      await finishRatesApi.delete(id);
      
      setFinishRates(prev => prev.filter(rate => rate.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Toggle finish rate active status
  const toggleFinishRateStatus = async (id, isActive) => {
    try {
      const updatedRate = await finishRatesApi.toggleStatus(id, isActive);
      
      setFinishRates(prev => 
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
      const rates = await finishRatesApi.getByMaterial(materialId);
      return { success: true, data: rates };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get rate history for material
  const getRateHistory = async (materialId) => {
    try {
      const history = await finishRatesApi.getRateHistory(materialId);
      return { success: true, data: history };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Bulk update prices
  const bulkUpdatePrices = async (updateData) => {
    try {
      setLoading(true);
      const result = await finishRatesApi.bulkUpdatePrices(updateData);
      
      // Refresh the list after bulk update
      await fetchFinishRates();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Filter by material
  const filterByMaterial = (materialId) => {
    setFilters(prev => ({ ...prev, material: materialId }));
  };

  // Filter by budget tier
  const filterByBudgetTier = (budgetTier) => {
    setFilters(prev => ({ ...prev, budget_tier: budgetTier }));
  };

  // Search finish rates
  const searchFinishRates = (searchTerm) => {
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
      const rates = await finishRatesApi.getCurrentRates();
      return { success: true, data: rates };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get finish rate by ID
  const getFinishRateById = async (id) => {
    try {
      const rate = await finishRatesApi.getById(id);
      return { success: true, data: rate };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh data
  const refresh = () => {
    fetchFinishRates();
  };

  // Group rates by material for timeline view
  const getGroupedRates = () => {
    const grouped = finishRates.reduce((acc, rate) => {
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
  const getFinishRatesStats = () => {
    const total = finishRates.length;
    const active = finishRates.filter(r => r.is_active).length;
    const inactive = total - active;
    
    const byBudgetTier = finishRates.reduce((acc, rate) => {
      acc[rate.budget_tier] = (acc[rate.budget_tier] || 0) + 1;
      return acc;
    }, {});

    const uniqueMaterials = new Set(finishRates.map(r => r.material)).size;
    
    const averageLuxuryRate = finishRates
      .filter(r => r.budget_tier === 'LUXURY' && r.is_active)
      .reduce((sum, r, _, arr) => sum + (parseFloat(r.unit_rate) / arr.length), 0);

    const averageEconomyRate = finishRates
      .filter(r => r.budget_tier === 'ECONOMY' && r.is_active)
      .reduce((sum, r, _, arr) => sum + (parseFloat(r.unit_rate) / arr.length), 0);

    return {
      total,
      active,
      inactive,
      byBudgetTier,
      uniqueMaterials,
      averageLuxuryRate: Math.round(averageLuxuryRate * 100) / 100,
      averageEconomyRate: Math.round(averageEconomyRate * 100) / 100,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  };

  // Effect to fetch finish rates when filters change
  useEffect(() => {
    fetchFinishRates();
  }, [fetchFinishRates]);

  // Effect to fetch materials on mount
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Return hook interface
  return {
    // Data
    finishRates,
    materials,
    loading,
    error,
    filters,
    pagination,
    
    // Actions
    createFinishRate,
    updateFinishRate,
    deleteFinishRate,
    toggleFinishRateStatus,
    getRatesByMaterial,
    getRateHistory,
    bulkUpdatePrices,
    getFinishRateById,
    getCurrentRates,
    
    // Filtering & Search
    filterByMaterial,
    filterByBudgetTier,
    searchFinishRates,
    clearFilters,
    
    // Pagination
    changePage,
    changePageSize,
    
    // Utilities
    refresh,
    refetch: fetchFinishRates,
    getGroupedRates,
    getFinishRatesStats
  };
};

export default useFinishRates;