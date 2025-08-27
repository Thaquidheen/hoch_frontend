// src/hooks/masters/useLightingRules.js

import { useState, useEffect, useCallback } from 'react';
import lightingRulesApi from '../../service/masters/lightingRulesApi';

const useLightingRules = () => {
  const [lightingRules, setLightingRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all lighting rules
  const fetchLightingRules = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lightingRulesApi.getAll(params);
      // Handle both paginated and direct array responses
      const rules = Array.isArray(response) ? response : response.results || [];
      setLightingRules(rules);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lighting rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new lighting rule
  const createLightingRule = useCallback(async (ruleData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newRule = await lightingRulesApi.create(ruleData);
      setLightingRules(prev => [newRule, ...prev]);
      return { success: true, data: newRule };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update lighting rule
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

  // Delete lighting rule
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

  // Toggle rule status
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

  // Get rules by material
  const getRulesByMaterial = useCallback(async (materialId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lightingRulesApi.getByMaterial(materialId);
      const rules = Array.isArray(response) ? response : response.results || [];
      return { success: true, data: rules };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get rules by budget tier
  const getRulesByBudgetTier = useCallback(async (budgetTier) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lightingRulesApi.getByBudgetTier(budgetTier);
      const rules = Array.isArray(response) ? response : response.results || [];
      return { success: true, data: rules };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current active rates
  const getCurrentRates = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const rates = await lightingRulesApi.getCurrentRates(params);
      return { success: true, data: rates };
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
          `"${rule.cabinet_material || ''}"`,
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

  // Import rules (placeholder for now)
  const importRules = useCallback(async () => {
    // This would handle file upload and import
    // For now, just show a message
    alert('Import functionality coming soon!');
    return { success: true };
  }, []);

  // Get applicable rules for a project
  const getApplicableRules = useCallback((project, material = null) => {
    if (!project || !lightingRules.length) return [];

    return lightingRules.filter(rule => {
      // Material match
      const materialMatch = !material || rule.cabinet_material === material;
      
      // Budget tier match
      const tierMatch = rule.budget_tier === project.budget_tier;
      
      // Customer match (global rules or customer-specific)
      const customerMatch = rule.is_global || rule.customer === project.customer;
      
      // Active rule
      const isActive = rule.is_active;
      
      // Date range check
      const today = new Date();
      const effectiveFrom = new Date(rule.effective_from);
      const effectiveTo = rule.effective_to ? new Date(rule.effective_to) : null;
      
      const dateValid = today >= effectiveFrom && (!effectiveTo || today <= effectiveTo);
      
      return materialMatch && tierMatch && customerMatch && isActive && dateValid;
    }).sort((a, b) => {
      // Sort by specificity: customer-specific first, then by effective date
      if (!a.is_global && b.is_global) return -1;
      if (a.is_global && !b.is_global) return 1;
      return new Date(b.effective_from) - new Date(a.effective_from);
    });
  }, [lightingRules]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLightingRules();
  }, [fetchLightingRules]);

  return {
    // Data
    lightingRules,
    loading,
    error,
    
    // Actions
    fetchLightingRules,
    createLightingRule,
    updateLightingRule, 
    deleteLightingRule,
    toggleRuleStatus,
    getRulesByMaterial,
    getRulesByBudgetTier,
    getCurrentRates,
    testCalculation,
    exportRules,
    importRules,
    getApplicableRules,
    
    // Clear error
    clearError: () => setError(null)
  };
};

export default useLightingRules;