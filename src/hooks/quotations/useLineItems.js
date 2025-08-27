// src/hooks/quotations/useLineItems.js
import { useState, useEffect, useCallback } from 'react';
import lineItemsApi from '../../service/quotations/lineItemsApi';
import materialsApi from '../../service/masters/materialsApi';
import cabinetTypesApi from '../../service/masters/cabinetTypesApi';

export const useLineItems = (projectId) => {
  const [lineItems, setLineItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [cabinetTypes, setCabinetTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculating, setCalculating] = useState({});

  // Fetch line items for project
const fetchLineItems = useCallback(async () => {
  if (!projectId) {
    setLineItems([]); // Clear if no project
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    // Ensure API call includes project filter
    const response = await lineItemsApi.getAll(projectId);
    const lineItemsData = response.results || response;
    setLineItems(Array.isArray(lineItemsData) ? lineItemsData : []);
  } catch (err) {
    setError(err.message);
    setLineItems([]); // Clear on error
  } finally {
    setLoading(false);
  }
}, [projectId]);

// Clear line items when project changes
useEffect(() => {
  setLineItems([]); // Clear immediately when projectId changes
  if (projectId) {
    fetchLineItems();
  }
}, [projectId, fetchLineItems]);

  // Fetch materials for dropdowns
  const fetchMaterials = useCallback(async () => {
    try {
      const response = await materialsApi.getAll({ is_active: true });
      const materialsData = response.results || response;
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setMaterials([]);
    }
  }, []);

  // Fetch cabinet types for dropdowns
  const fetchCabinetTypes = useCallback(async () => {
    try {
      const response = await cabinetTypesApi.getAll({ is_active: true });
      const cabinetTypesData = response.results || response;
      setCabinetTypes(Array.isArray(cabinetTypesData) ? cabinetTypesData : []);
    } catch (err) {
      console.error('Error fetching cabinet types:', err);
      setCabinetTypes([]);
    }
  }, []);

  // Create new line item
  const createLineItem = async (lineItemData) => {
    try {
      setLoading(true);
      const newLineItem = await lineItemsApi.create({
        ...lineItemData,
        project: projectId
      });
      
      setLineItems(prev => [newLineItem, ...prev]);
      return { success: true, data: newLineItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing line item
  const updateLineItem = async (id, lineItemData) => {
    try {
      setLoading(true);
      const updatedLineItem = await lineItemsApi.update(id, lineItemData);
      
      setLineItems(prev => 
        prev.map(item => 
          item.id === id ? updatedLineItem : item
        )
      );
      
      return { success: true, data: updatedLineItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete line item
  const deleteLineItem = async (id) => {
    try {
      setLoading(true);
      await lineItemsApi.delete(id);
      
      setLineItems(prev => prev.filter(item => item.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Duplicate line item
  const duplicateLineItem = async (id, duplicateData = {}) => {
    try {
      setLoading(true);
      const duplicatedLineItem = await lineItemsApi.duplicate(id, duplicateData);
      
      setLineItems(prev => [duplicatedLineItem, ...prev]);
      
      return { success: true, data: duplicatedLineItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Compute line item pricing
  const computeLineItemPricing = async (id) => {
    try {
      setCalculating(prev => ({ ...prev, [id]: true }));
      const computedLineItem = await lineItemsApi.computePricing(id);
      
      setLineItems(prev => 
        prev.map(item => 
          item.id === id ? computedLineItem : item
        )
      );
      
      return { success: true, data: computedLineItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCalculating(prev => ({ ...prev, [id]: false }));
    }
  };

  // Calculate pricing preview (without saving)
  const calculatePricingPreview = async (calculationData) => {
    try {
      const preview = await lineItemsApi.calculatePreview(calculationData);
      return { success: true, data: preview };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Update dimensions and recalculate
  const updateDimensionsAndCalculate = async (id, dimensions) => {
    try {
      setCalculating(prev => ({ ...prev, [id]: true }));
      
      // First update dimensions
      const updatedLineItem = await lineItemsApi.updateDimensions(id, dimensions);
      
      // Then compute pricing
      const computedLineItem = await lineItemsApi.computePricing(id);
      
      setLineItems(prev => 
        prev.map(item => 
          item.id === id ? computedLineItem : item
        )
      );
      
      return { success: true, data: computedLineItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCalculating(prev => ({ ...prev, [id]: false }));
    }
  };

  // Update materials and recalculate
  const updateMaterialsAndCalculate = async (id, materials) => {
    try {
      setCalculating(prev => ({ ...prev, [id]: true }));
      
      // First update materials
      const updatedLineItem = await lineItemsApi.updateMaterials(id, materials);
      
      // Then compute pricing
      const computedLineItem = await lineItemsApi.computePricing(id);
      
      setLineItems(prev => 
        prev.map(item => 
          item.id === id ? computedLineItem : item
        )
      );
      
      return { success: true, data: computedLineItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCalculating(prev => ({ ...prev, [id]: false }));
    }
  };

  // Bulk create line items
  const bulkCreateLineItems = async (lineItemsData) => {
    try {
      setLoading(true);
      const result = await lineItemsApi.bulkCreate(lineItemsData);
      
      // Refresh line items list
      await fetchLineItems();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Batch compute multiple line items
  const batchComputePricing = async (lineItemIds) => {
    try {
      setLoading(true);
      const result = await lineItemsApi.batchCompute(lineItemIds);
      
      // Refresh line items list
      await fetchLineItems();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get line item by ID
  const getLineItemById = async (id) => {
    try {
      const lineItem = await lineItemsApi.getById(id);
      return { success: true, data: lineItem };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get line items summary
  const getLineItemsSummary = async () => {
    try {
      const summary = await lineItemsApi.getSummary(projectId);
      return { success: true, data: summary };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Export line items
  const exportLineItems = async (format = 'csv') => {
    try {
      await lineItemsApi.exportLineItems(projectId, format);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Helper functions
  const getCabinetMaterials = () => {
    return materials.filter(m => m.role === 'CABINET' || m.role === 'BOTH');
  };

  const getDoorMaterials = () => {
    return materials.filter(m => m.role === 'DOOR' || m.role === 'BOTH');
  };

  const getCabinetTypeById = (id) => {
    return cabinetTypes.find(ct => ct.id === id);
  };

  const getMaterialById = (id) => {
    return materials.find(m => m.id === id);
  };

  // Get line items statistics
  const getLineItemsStats = () => {
    const total = lineItems.length;
    const totalValue = lineItems.reduce((sum, item) => 
      sum + (parseFloat(item.line_total_before_tax) || 0), 0
    );
    
    const byScope = lineItems.reduce((acc, item) => {
      acc[item.scope] = (acc[item.scope] || 0) + 1;
      return acc;
    }, {});

    const byCabinetType = lineItems.reduce((acc, item) => {
      const typeName = item.cabinet_type_detail?.name || 'Unknown';
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    const totalCabinetSqft = lineItems.reduce((sum, item) => 
      sum + (parseFloat(item.computed_cabinet_sqft) || 0), 0
    );

    const totalDoorSqft = lineItems.reduce((sum, item) => 
      sum + (parseFloat(item.computed_door_sqft) || 0), 0
    );

    const averageLineValue = total > 0 ? totalValue / total : 0;

    return {
      total,
      totalValue: Math.round(totalValue * 100) / 100,
      averageLineValue: Math.round(averageLineValue * 100) / 100,
      byScope,
      byCabinetType,
      totalCabinetSqft: Math.round(totalCabinetSqft * 100) / 100,
      totalDoorSqft: Math.round(totalDoorSqft * 100) / 100,
      openKitchen: byScope.OPEN || 0,
      workingKitchen: byScope.WORKING || 0
    };
  };

  // Validate line item data
  const validateLineItem = (lineItemData) => {
    const errors = {};

    if (!lineItemData.cabinet_type) {
      errors.cabinet_type = 'Cabinet type is required';
    }

    if (!lineItemData.cabinet_material) {
      errors.cabinet_material = 'Cabinet material is required';
    }

    if (!lineItemData.door_material) {
      errors.door_material = 'Door material is required';
    }

    const dimensionValidation = lineItemsApi.validateDimensions({
      width_mm: lineItemData.width_mm,
      depth_mm: lineItemData.depth_mm,
      height_mm: lineItemData.height_mm,
      qty: lineItemData.qty
    });

    if (!dimensionValidation.isValid) {
      Object.assign(errors, dimensionValidation.errors);
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Refresh data
  const refresh = () => {
    fetchLineItems();
  };

  // Effect to fetch line items when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchLineItems();
    }
  }, [projectId, fetchLineItems]);

  // Effect to fetch dropdown data on mount
  useEffect(() => {
    fetchMaterials();
    fetchCabinetTypes();
  }, [fetchMaterials, fetchCabinetTypes]);

  // Return hook interface
  return {
    // Data
    lineItems,
    materials,
    cabinetTypes,
    loading,
    error,
    calculating,
    
    // Actions
    createLineItem,
    updateLineItem,
    deleteLineItem,
    duplicateLineItem,
    computeLineItemPricing,
    calculatePricingPreview,
    updateDimensionsAndCalculate,
    updateMaterialsAndCalculate,
    bulkCreateLineItems,
    batchComputePricing,
    getLineItemById,
    getLineItemsSummary,
    exportLineItems,
    
    // Helpers
    getCabinetMaterials,
    getDoorMaterials,
    getCabinetTypeById,
    getMaterialById,
    getLineItemsStats,
    validateLineItem,
    
    // Utilities
    refresh,
    refetch: fetchLineItems
  };
};

export default useLineItems;