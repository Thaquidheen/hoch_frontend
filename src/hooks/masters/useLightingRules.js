import { useState, useEffect, useCallback } from 'react';
import { lightingRulesApi, enhancedLightingApi } from '../../service/masters/lightingRulesApi';

const useLightingRules = () => {
  const [lightingRules, setLightingRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load lighting rules
  useEffect(() => {
    const loadLightingRules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const rules = await lightingRulesApi.getAll();
        setLightingRules(rules);
      } catch (err) {
        console.error('Failed to load lighting rules:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadLightingRules();
  }, []);

  // Get a single lighting rule
  const getLightingRule = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const rule = await lightingRulesApi.getById(id);
      return { success: true, data: rule };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new lighting rule
  const createLightingRule = useCallback(async (ruleData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newRule = await lightingRulesApi.create(ruleData);
      setLightingRules(prev => [...prev, newRule]);
      return { success: true, data: newRule };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing lighting rule
  const updateLightingRule = useCallback(async (id, ruleData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedRule = await lightingRulesApi.update(id, ruleData);
      setLightingRules(prev => 
        prev.map(rule => rule.id === id ? updatedRule : rule)
      );
      return { success: true, data: updatedRule };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a lighting rule
  const deleteLightingRule = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await lightingRulesApi.delete(id);
      setLightingRules(prev => prev.filter(rule => rule.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle rule status (active/inactive)
  const toggleRuleStatus = useCallback(async (id, isActive) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedRule = await lightingRulesApi.toggleStatus(id, isActive);
      setLightingRules(prev => 
        prev.map(rule => rule.id === id ? updatedRule : rule)
      );
      return { success: true, data: updatedRule };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Export rules
  const exportRules = useCallback(async (format = 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      // Create CSV content from current rules
      const headers = [
        'Name',
        'Material',
        'Customer',
        'Is Global', 
        'Budget Tier',
        'LED Rate (per mm)',
        'Spot Light Rate (per cabinet)',
        'Applies to Wall',
        'Applies to Base',
        'Applies to Work Top',
        'Applies to Tall',
        'Effective From',
        'Effective To',
        'Status'
      ];

      const csvContent = [
        headers.join(','),
        ...lightingRules.map(rule => [
          `"${rule.name || ''}"`,
          `"${rule.cabinet_material_detail?.name || ''}"`,
          `"${rule.customer_detail?.name || (rule.is_global ? 'Global' : '')}"`,
          rule.is_global ? 'Yes' : 'No',
          rule.budget_tier || '',
          rule.led_strip_rate_per_mm || 0,
          rule.spot_light_rate_per_cabinet || 0,
          rule.applies_to_wall_cabinets ? 'Yes' : 'No',
          rule.applies_to_base_cabinets ? 'Yes' : 'No', 
          rule.applies_to_work_top ? 'Yes' : 'No',
          rule.applies_to_tall_cabinets ? 'Yes' : 'No',
          rule.effective_from || '',
          rule.effective_to || '',
          rule.is_active ? 'Active' : 'Inactive'
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lighting-rules-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [lightingRules]);

  // Import rules (placeholder function)
  const importRules = useCallback(async () => {
    // This would handle file upload and import
    alert('Import functionality coming soon!');
    return { success: true };
  }, []);

  // Get applicable rules for a project
  const getApplicableRules = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const rules = await enhancedLightingApi.getApplicableRules(projectId);
      return { success: true, data: rules };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Test calculation with sample data
  const testCalculation = useCallback(async (ruleId, testData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await lightingRulesApi.testCalculation(ruleId, testData);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Project-specific lighting functionality
  const getProjectLighting = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await enhancedLightingApi.getProjectLighting(projectId);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const getLightingItems = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const items = await enhancedLightingApi.getLightingItems(projectId);
      return { success: true, data: items };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createLightingItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newItem = await enhancedLightingApi.createLightingItem(itemData);
      return { success: true, data: newItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLightingItem = useCallback(async (id, itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedItem = await enhancedLightingApi.updateLightingItem(id, itemData);
      return { success: true, data: updatedItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLightingItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await enhancedLightingApi.deleteLightingItem(id);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLightingItem = useCallback(async (id, isActive) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedItem = await enhancedLightingApi.toggleLightingItem(id, isActive);
      return { success: true, data: updatedItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const recalculateLightingTotals = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await enhancedLightingApi.recalculateLightingTotals(projectId);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const autoCreateLightingItems = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await enhancedLightingApi.autoCreateLightingItems(projectId);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    lightingRules,
    loading,
    error,
    
    // Basic CRUD operations
    getLightingRule,
    createLightingRule,
    updateLightingRule,
    deleteLightingRule,
    toggleRuleStatus,
    
    // Import/Export
    exportRules,
    importRules,
    
    // Advanced operations
    getApplicableRules,
    testCalculation,
    
    // Project-specific lighting functionality
    getProjectLighting,
    getLightingItems,
    createLightingItem,
    updateLightingItem,
    deleteLightingItem,
    toggleLightingItem,
    recalculateLightingTotals,
    autoCreateLightingItems
  };
};

export default useLightingRules;