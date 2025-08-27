// src/hooks/masters/useHardwareCharges.js
import { useState, useEffect, useCallback } from 'react';
import hardwareChargesApi from '../../service/masters/hardwareChargesApi';
import api from '../../service/api'; // Import api directly for the fix

export const useHardwareCharges = (initialFilters = {}) => {
  const [hardwareCharges, setHardwareCharges] = useState([]);
  const [matrixData, setMatrixData] = useState({});
  const [brands, setBrands] = useState([]);
  const [cabinetTypes, setCabinetTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [savingCells, setSavingCells] = useState(new Set());

  // FIXED: Fetch matrix data with proper array-to-matrix transformation
  const fetchMatrixData = useCallback(async () => {
    console.group('📊 Fetching Matrix Data');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Calling matrix API...');
      const response = await hardwareChargesApi.getMatrix(filters);
      
      console.log('📥 Raw API Response:', response);
      console.log('📋 Response is array:', Array.isArray(response));
      console.log('📋 Response length:', response?.length);
      
      // Transform the array response into matrix structure
      let matrixStructure = {};
      
      if (Array.isArray(response)) {
        console.log('🔄 Transforming array to matrix structure...');
        
        response.forEach((item, index) => {
          console.log(`Processing item ${index}:`, {
            id: item.id,
            cabinet_type: item.cabinet_type,
            brand_name: item.brand_name,
            charge: item.standard_accessory_charge
          });
          
          const cabinetTypeId = String(item.cabinet_type); // Convert to string for consistency
          const brandId = String(item.brand_name);         // Convert to string for consistency
          
          // Initialize cabinet type object if it doesn't exist
          if (!matrixStructure[cabinetTypeId]) {
            matrixStructure[cabinetTypeId] = {};
          }
          
          // Add the item to the matrix structure
          matrixStructure[cabinetTypeId][brandId] = {
            id: item.id, // IMPORTANT: Keep the ID for updates
            cabinet_type: item.cabinet_type,
            cabinet_type_detail: item.cabinet_type_detail,
            brand_name: item.brand_name,
            standard_accessory_charge: item.standard_accessory_charge,
            effective_from: item.effective_from,
            effective_to: item.effective_to,
            is_active: item.is_active,
            currency: item.currency,
            created_at: item.created_at,
            updated_at: item.updated_at
          };
          
          console.log(`✅ Added to matrix[${cabinetTypeId}][${brandId}]:`, 
            matrixStructure[cabinetTypeId][brandId]);
        });
        
      } else {
        console.log('⚠️ Response is not an array, using as-is');
        matrixStructure = response || {};
      }
      
      console.log('📋 Final Matrix Structure:', matrixStructure);
      console.log('📋 Matrix Keys:', Object.keys(matrixStructure));
      
      // Log detailed structure for verification
      Object.keys(matrixStructure).forEach(cabinetTypeId => {
        const brandKeys = Object.keys(matrixStructure[cabinetTypeId]);
        console.log(`📋 Cabinet Type ${cabinetTypeId}: ${brandKeys.length} brands [${brandKeys.join(', ')}]`);
        
        brandKeys.forEach(brandId => {
          const charge = matrixStructure[cabinetTypeId][brandId]?.standard_accessory_charge;
          const recordId = matrixStructure[cabinetTypeId][brandId]?.id;
          console.log(`  └─ Brand ${brandId}: ₹${charge} (ID: ${recordId})`);
        });
      });
      
      setMatrixData(matrixStructure);
      console.log('✅ Matrix data transformation completed!');
      
    } catch (err) {
      console.error('❌ Matrix fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [filters]);

  // FIXED: Update matrix cell with proper CREATE/UPDATE logic
  const updateMatrixCell = async (cabinetTypeId, brandId, chargeData) => {
    const cellKey = `${cabinetTypeId}-${brandId}`;
    
    console.group('🔧 Matrix Cell Update (Fixed)');
    console.log('📋 Input:', { cabinetTypeId, brandId, chargeData });
    
    try {
      setSavingCells(prev => new Set([...prev, cellKey]));
      
      // Convert IDs to strings for consistency
      const cabinetTypeStr = String(cabinetTypeId);
      const brandStr = String(brandId);
      
      // Get existing cell data
      const existingCell = matrixData[cabinetTypeStr]?.[brandStr];
      console.log('📋 Existing cell:', existingCell);
      
      if (existingCell && existingCell.id) {
        // UPDATE existing record using PUT
        console.log('🔄 Updating existing record ID:', existingCell.id);
        
        const updatePayload = {
          ...existingCell, // Keep all existing fields
          standard_accessory_charge: parseFloat(chargeData.standard_accessory_charge),
          effective_from: chargeData.effective_from,
          is_active: chargeData.is_active !== undefined ? chargeData.is_active : true
        };
        
        console.log('📤 PUT payload:', updatePayload);
        
        const response = await api.put(
          `/api/pricing/cabinet-type-brand-charges/${existingCell.id}/`, 
          updatePayload
        );
        
        const updatedCell = response.data;
        console.log('📥 PUT response:', updatedCell);
        
        // Update local state
        setMatrixData(prev => ({
          ...prev,
          [cabinetTypeStr]: {
            ...prev[cabinetTypeStr],
            [brandStr]: updatedCell
          }
        }));
        
        console.log('✅ Existing record updated successfully!');
        console.groupEnd();
        return { success: true, data: updatedCell };
        
      } else {
        // CREATE new record using POST
        console.log('➕ Creating new record');
        
        const createPayload = {
          cabinet_type: parseInt(cabinetTypeId),
          brand_name: brandId,
          standard_accessory_charge: parseFloat(chargeData.standard_accessory_charge),
          effective_from: chargeData.effective_from,
          is_active: chargeData.is_active !== undefined ? chargeData.is_active : true,
          currency: 'INR'
        };
        
        console.log('📤 POST payload:', createPayload);
        
        const response = await api.post(
          '/api/pricing/cabinet-type-brand-charges/', 
          createPayload
        );
        
        const newCell = response.data;
        console.log('📥 POST response:', newCell);
        
        // Update local state
        setMatrixData(prev => ({
          ...prev,
          [cabinetTypeStr]: {
            ...prev[cabinetTypeStr],
            [brandStr]: newCell
          }
        }));
        
        console.log('✅ New record created successfully!');
        console.groupEnd();
        return { success: true, data: newCell };
      }
      
    } catch (err) {
      console.error('❌ Update failed:', err);
      console.error('❌ Error response:', err.response?.data);
      
      // Handle unique constraint error
      if (err.response?.data?.non_field_errors?.some(error => 
          error.includes('must make a unique set'))) {
        
        console.log('🔄 Unique constraint error detected, refreshing and retrying...');
        
        try {
          // Refresh the matrix data to get the latest records with IDs
          await fetchMatrixData();
          
          // Wait a moment for state to update
          setTimeout(async () => {
            try {
              // Get the updated matrix data and try again
              const refreshedCell = matrixData[String(cabinetTypeId)]?.[String(brandId)];
              
              if (refreshedCell && refreshedCell.id) {
                console.log('🔄 Found refreshed cell, retrying update...');
                
                const retryPayload = {
                  ...refreshedCell,
                  standard_accessory_charge: parseFloat(chargeData.standard_accessory_charge),
                  effective_from: chargeData.effective_from,
                  is_active: chargeData.is_active !== undefined ? chargeData.is_active : true
                };
                
                const retryResponse = await api.put(
                  `/api/pricing/cabinet-type-brand-charges/${refreshedCell.id}/`, 
                  retryPayload
                );
                
                const retryUpdatedCell = retryResponse.data;
                
                setMatrixData(prev => ({
                  ...prev,
                  [String(cabinetTypeId)]: {
                    ...prev[String(cabinetTypeId)],
                    [String(brandId)]: retryUpdatedCell
                  }
                }));
                
                console.log('✅ Retry successful after refresh!');
                console.groupEnd();
                return { success: true, data: retryUpdatedCell };
                
              } else {
                throw new Error('Could not find record after refresh');
              }
              
            } catch (retryError) {
              console.error('❌ Retry failed:', retryError);
              console.groupEnd();
              return { success: false, error: 'Record exists but could not be updated. Please refresh the page and try again.' };
            }
          }, 500);
          
        } catch (refreshError) {
          console.error('❌ Refresh failed:', refreshError);
          console.groupEnd();
          return { success: false, error: 'Record already exists. Please refresh the page and try again.' };
        }
        
      } else {
        console.groupEnd();
        setError(err.message);
        return { success: false, error: err.message };
      }
      
    } finally {
      setSavingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }
  };

  // Fetch hardware charges
  const fetchHardwareCharges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hardwareChargesApi.getAll(filters);
      
      if (response.results) {
        setHardwareCharges(response.results);
      } else {
        setHardwareCharges(response);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching hardware charges:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const brandsData = await hardwareChargesApi.getBrands();
      setBrands(brandsData);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  }, []);

  // Fetch cabinet types
  const fetchCabinetTypes = useCallback(async () => {
    try {
      const cabinetTypesData = await hardwareChargesApi.getCabinetTypes();
      setCabinetTypes(cabinetTypesData);
    } catch (err) {
      console.error('Error fetching cabinet types:', err);
      setCabinetTypes([]);
    }
  }, []);

  // Create new hardware charge
  const createHardwareCharge = async (chargeData) => {
    try {
      setLoading(true);
      const newCharge = await hardwareChargesApi.create(chargeData);
      
      setHardwareCharges(prev => [newCharge, ...prev]);
      
      return { success: true, data: newCharge };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing hardware charge
  const updateHardwareCharge = async (id, chargeData) => {
    try {
      setLoading(true);
      const updatedCharge = await hardwareChargesApi.update(id, chargeData);
      
      setHardwareCharges(prev => 
        prev.map(charge => 
          charge.id === id ? updatedCharge : charge
        )
      );
      
      return { success: true, data: updatedCharge };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete hardware charge
  const deleteHardwareCharge = async (id) => {
    try {
      setLoading(true);
      await hardwareChargesApi.delete(id);
      
      setHardwareCharges(prev => prev.filter(charge => charge.id !== id));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Bulk update charges
  const bulkUpdateCharges = async (updateData) => {
    try {
      setLoading(true);
      const result = await hardwareChargesApi.bulkUpdate(updateData);
      
      // Refresh matrix data
      await fetchMatrixData();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Copy charges between cabinet types
  const copyCharges = async (sourceCabinetTypeId, targetCabinetTypeIds, brandIds = []) => {
    try {
      setLoading(true);
      const result = await hardwareChargesApi.copyCharges(
        sourceCabinetTypeId, 
        targetCabinetTypeIds, 
        brandIds
      );
      
      // Refresh matrix data
      await fetchMatrixData();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get brand comparison
  const getBrandComparison = async (cabinetTypeIds) => {
    try {
      const comparison = await hardwareChargesApi.getBrandComparison(cabinetTypeIds);
      return { success: true, data: comparison };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Import charges from file
  const importCharges = async (file, options = {}) => {
    try {
      setLoading(true);
      const result = await hardwareChargesApi.importCharges(file, options);
      
      // Refresh data after import
      await fetchMatrixData();
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Export charges
  const exportCharges = async (format = 'csv', exportFilters = {}) => {
    try {
      const blob = await hardwareChargesApi.exportCharges(format, exportFilters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hardware_charges.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get hardware charge by ID
  const getHardwareChargeById = async (id) => {
    try {
      const charge = await hardwareChargesApi.getById(id);
      return { success: true, data: charge };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Get effective charges for date range
  const getEffectiveCharges = async (dateFrom, dateTo, cabinetTypeIds = [], brandIds = []) => {
    try {
      const charges = await hardwareChargesApi.getEffectiveCharges(
        dateFrom, 
        dateTo, 
        cabinetTypeIds, 
        brandIds
      );
      return { success: true, data: charges };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Refresh data
  const refresh = () => {
    fetchMatrixData();
    fetchBrands();
    fetchCabinetTypes();
  };

  // Get matrix cell value
  const getMatrixCellValue = (cabinetTypeId, brandId) => {
    return matrixData[String(cabinetTypeId)]?.[String(brandId)] || null;
  };

  // Check if cell is being saved
  const isCellSaving = (cabinetTypeId, brandId) => {
    return savingCells.has(`${cabinetTypeId}-${brandId}`);
  };

  // Get statistics
  const getHardwareChargesStats = () => {
    const totalCharges = hardwareCharges.length;
    const activeCharges = hardwareCharges.filter(c => c.is_active).length;
    
    const byBrand = brands.reduce((acc, brand) => {
      acc[brand.id] = hardwareCharges.filter(c => c.brand_id === brand.id).length;
      return acc;
    }, {});

    const byCabinetType = cabinetTypes.reduce((acc, type) => {
      acc[type.id] = hardwareCharges.filter(c => c.cabinet_type_id === type.id).length;
      return acc;
    }, {});

    const averageCharge = hardwareCharges.length > 0
      ? hardwareCharges
          .filter(c => c.is_active && c.standard_accessory_charge)
          .reduce((sum, c, _, arr) => sum + (parseFloat(c.standard_accessory_charge) / (arr.length || 1)), 0)
      : 0;

    const priceRange = hardwareCharges
      .filter(c => c.is_active && c.standard_accessory_charge)
      .map(c => parseFloat(c.standard_accessory_charge))
      .filter(p => !isNaN(p));

    const minPrice = priceRange.length > 0 ? Math.min(...priceRange) : 0;
    const maxPrice = priceRange.length > 0 ? Math.max(...priceRange) : 0;

    // Matrix coverage statistics
    const totalPossibleCells = cabinetTypes.length * brands.length;
    const filledCells = Object.keys(matrixData).reduce((count, cabinetTypeId) => {
      return count + Object.keys(matrixData[cabinetTypeId] || {}).length;
    }, 0);
    
    const matrixCoverage = totalPossibleCells > 0 
      ? Math.round((filledCells / totalPossibleCells) * 100) 
      : 0;

    return {
      totalCharges,
      activeCharges,
      byBrand,
      byCabinetType,
      averageCharge: Math.round(averageCharge * 100) / 100,
      priceRange: { min: minPrice, max: maxPrice },
      matrixCoverage,
      filledCells,
      totalPossibleCells,
      activePercentage: totalCharges > 0 ? Math.round((activeCharges / totalCharges) * 100) : 0
    };
  };

  // Get brand info by ID
  const getBrandById = (brandId) => {
    return brands.find(b => b.id === brandId);
  };

  // Get cabinet type info by ID
  const getCabinetTypeById = (cabinetTypeId) => {
    return cabinetTypes.find(ct => ct.id === cabinetTypeId);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(parseFloat(amount))) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  // Effect to fetch data on mount
  useEffect(() => {
    fetchMatrixData();
    fetchBrands();
    fetchCabinetTypes();
  }, [fetchMatrixData, fetchBrands, fetchCabinetTypes]);

  // Return hook interface
  return {
    // Data
    hardwareCharges,
    matrixData,
    brands,
    cabinetTypes,
    loading,
    error,
    filters,
    savingCells,
    
    // Actions
    createHardwareCharge,
    updateHardwareCharge,
    deleteHardwareCharge,
    updateMatrixCell,
    bulkUpdateCharges,
    copyCharges,
    getBrandComparison,
    importCharges,
    exportCharges,
    getHardwareChargeById,
    getEffectiveCharges,
    
    // Utilities
    refresh,
    refetch: fetchMatrixData,
    getMatrixCellValue,
    isCellSaving,
    getHardwareChargesStats,
    getBrandById,
    getCabinetTypeById,
    formatCurrency
  };
};

export default useHardwareCharges;