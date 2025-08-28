import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Download, Upload, Lightbulb, Settings, 
  Users, Package, Calculator, Eye, Edit3, Trash2, MoreVertical
} from 'lucide-react';
import LightingRuleForm from '../../components/masters/lighting-rules/LightingRuleForm';
import useLightingRules from '../../hooks/masters/useLightingRules';
import useMaterials from '../../hooks/masters/useMaterials';
import useCustomers from '../../hooks/masters/useCustomers';
import useCabinetTypes from '../../hooks/masters/useCabinetTypes';
import './LightingRulesPage.css';

const LightingRulesPage = () => {
  // State Management
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showTester, setShowTester] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Hooks
  const {
    lightingRules, loading, createLightingRule, updateLightingRule, 
    deleteLightingRule, toggleRuleStatus, exportRules, importRules
  } = useLightingRules();

  const { materials } = useMaterials();
  const { customers } = useCustomers();
  const { cabinetTypes } = useCabinetTypes();

  // Filter lighting rules
  const filteredRules = lightingRules.filter(rule => {
    const materialDetails = materials.find(m => m.id === rule.cabinet_material);
    const matchesSearch = rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          materialDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = !selectedCustomer || (selectedCustomer === 'global' ? rule.is_global : rule.customer?.toString() === selectedCustomer);
    const matchesMaterial = !selectedMaterial || rule.cabinet_material?.toString() === selectedMaterial;
    const matchesTier = !selectedTier || rule.budget_tier === selectedTier;
    const matchesStatus = showInactive || rule.is_active;
    return matchesSearch && matchesCustomer && matchesMaterial && matchesTier && matchesStatus;
  });

  // Get cabinet materials only
  const cabinetMaterials = materials.filter(m => m.role === 'CABINET' || m.role === 'BOTH');

  // Handle form submission
  const handleSaveRule = async (ruleData) => {
    try {
      if (editingRule) {
        await updateLightingRule(editingRule.id, ruleData);
      } else {
        await createLightingRule(ruleData);
      }
      setShowForm(false);
      setEditingRule(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Handle rule deletion
  const handleDeleteRule = async (ruleId) => {
    const rule = lightingRules.find(r => r.id === ruleId);
    if (window.confirm(`Delete lighting rule "${rule.name}"?`)) {
      await deleteLightingRule(ruleId);
    }
  };

  // Format currency
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  // Get customer or material name from ID for display
  const getCustomerName = (rule) => {
    if (rule.is_global) return 'Global';
    const customer = customers.find(c => c.id === rule.customer);
    return customer ? customer.name : 'Unknown';
  };

  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Unknown';
  };
  
  // Get rule scope badge class
  const getScopeBadgeClass = (rule) => {
    return rule.is_global ? 'lightingrulespage-scope-global' : 'lightingrulespage-scope-customer';
  };

  return (
    <div className="lightingrulespage-page">
      {/* Header */}
      <div className="lightingrulespage-page-header">
        <div className="lightingrulespage-header-content">
          <div className="lightingrulespage-header-info">
            <Lightbulb className="lightingrulespage-header-icon" />
            <div className="lightingrulespage-header-text">
              <h1 className="lightingrulespage-page-title">Lighting Rules Management</h1>
              <p className="lightingrulespage-page-subtitle">
                Multi-category lighting rules for different materials and customer preferences
              </p>
            </div>
          </div>
          <div className="lightingrulespage-header-actions">
            <button onClick={() => setShowTester(true)} className="lightingrulespage-action-btn lightingrulespage-secondary">
              <Calculator className="lightingrulespage-btn-icon" /> Test Calculator
            </button>
            <button onClick={() => { setEditingRule(null); setShowForm(true); }} className="lightingrulespage-action-btn lightingrulespage-primary">
              <Plus className="lightingrulespage-btn-icon" /> Add Lighting Rule
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="lightingrulespage-stats-section">
        <div className="lightingrulespage-stats-grid">
          <div className="lightingrulespage-stat-card">
            <div className="lightingrulespage-stat-header"><Settings className="lightingrulespage-stat-icon" /><span className="lightingrulespage-stat-label">Total Rules</span></div>
            <div className="lightingrulespage-stat-value">{lightingRules.length}</div>
          </div>
          <div className="lightingrulespage-stat-card">
            <div className="lightingrulespage-stat-header"><Users className="lightingrulespage-stat-icon" /><span className="lightingrulespage-stat-label">Customer-Specific</span></div>
            <div className="lightingrulespage-stat-value">{lightingRules.filter(r => !r.is_global).length}</div>
          </div>
          <div className="lightingrulespage-stat-card">
            <div className="lightingrulespage-stat-header"><Package className="lightingrulespage-stat-icon" /><span className="lightingrulespage-stat-label">Materials Covered</span></div>
            <div className="lightingrulespage-stat-value">{new Set(lightingRules.map(r => r.cabinet_material)).size}</div>
          </div>
          <div className="lightingrulespage-stat-card">
            <div className="lightingrulespage-stat-header"><Eye className="lightingrulespage-stat-icon" /><span className="lightingrulespage-stat-label">Active Rules</span></div>
            <div className="lightingrulespage-stat-value">{lightingRules.filter(r => r.is_active).length}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="lightingrulespage-filters-section">
        <div className="lightingrulespage-filters-content">
          <div className="lightingrulespage-search-container">
            <Search className="lightingrulespage-search-icon" />
            <input type="text" placeholder="Search by rule name or material..." className="lightingrulespage-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="lightingrulespage-filter-group">
            <select className="lightingrulespage-filter-select" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
              <option value="">All Customers</option>
              <option value="global">Global Rules</option>
              {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
            <select className="lightingrulespage-filter-select" value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
              <option value="">All Materials</option>
              {cabinetMaterials.map(material => <option key={material.id} value={material.id}>{material.name}</option>)}
            </select>
            <select className="lightingrulespage-filter-select" value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
              <option value="">All Tiers</option>
              <option value="LUXURY">Luxury</option>
              <option value="ECONOMY">Economy</option>
            </select>
            <button onClick={() => setShowInactive(!showInactive)} className={`lightingrulespage-toggle-btn ${showInactive ? 'lightingrulespage-active' : ''}`}>
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
          </div>
        </div>
        <div className="lightingrulespage-filter-actions">
          <button onClick={exportRules} className="lightingrulespage-action-btn lightingrulespage-secondary"><Download className="lightingrulespage-btn-icon" /> Export</button>
          <button onClick={() => document.getElementById('import-input')?.click()} className="lightingrulespage-action-btn lightingrulespage-secondary"><Upload className="lightingrulespage-btn-icon" /> Import</button>
          <input type="file" id="import-input" style={{ display: 'none' }} onChange={(e) => importRules(e.target.files[0])} accept=".csv" />
        </div>
      </div>

      {/* Rules Table */}
      <div className="lightingrulespage-rules-table-container">
        <div className="lightingrulespage-table-header">
          <h3 className="lightingrulespage-table-title">Lighting Rules ({filteredRules.length})</h3>
        </div>
        <div className="lightingrulespage-table-wrapper">
          <table className="lightingrulespage-rules-table">
            <thead>
              <tr>
                <th>Rule Details</th><th>Scope</th><th>Material & Tier</th><th>LED Rate</th><th>Spot Rate</th><th>Categories</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="lightingrulespage-empty-row"><div className="lightingrulespage-empty-state">Loading rules...</div></td></tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="8" className="lightingrulespage-empty-row">
                    <div className="lightingrulespage-empty-state">
                      <Lightbulb className="lightingrulespage-empty-icon" />
                      <p>No lighting rules found</p>
                      <span>Create your first lighting rule or adjust filters to get started.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className={`lightingrulespage-table-row ${!rule.is_active ? 'lightingrulespage-inactive' : ''}`}>
                    <td>
                      <div className="lightingrulespage-rule-details">
                        <div className="lightingrulespage-rule-name">{rule.name}</div>
                        <div className="lightingrulespage-rule-dates">
                          From: {new Date(rule.effective_from).toLocaleDateString()}
                          {rule.effective_to && (<span> • To: {new Date(rule.effective_to).toLocaleDateString()}</span>)}
                        </div>
                      </div>
                    </td>
                    <td><span className={`lightingrulespage-scope-badge ${getScopeBadgeClass(rule)}`}>{getCustomerName(rule)}</span></td>
                    <td>
                      <div className="lightingrulespage-material-tier">
                        <div className="lightingrulespage-material-name">{getMaterialName(rule.cabinet_material)}</div>
                        <span className={`lightingrulespage-tier-badge lightingrulespage-tier-${rule.budget_tier.toLowerCase()}`}>{rule.budget_tier}</span>
                      </div>
                    </td>
                    <td>
                      <div className="lightingrulespage-rate-display">
                        <span className="lightingrulespage-rate-amount">{formatCurrency(rule.led_strip_rate_per_mm)}</span>
                        <span className="lightingrulespage-rate-unit">per mm</span>
                      </div>
                    </td>
                    <td>
                      <div className="lightingrulespage-rate-display">
                        <span className="lightingrulespage-rate-amount">{formatCurrency(rule.spot_light_rate_per_cabinet)}</span>
                        <span className="lightingrulespage-rate-unit">per cabinet</span>
                      </div>
                    </td>
                    <td>
                      <div className="lightingrulespage-categories-display">
                        {rule.applies_to_wall_cabinets && (<span className="lightingrulespage-category-tag lightingrulespage-wall">Wall</span>)}
                        {rule.applies_to_base_cabinets && (<span className="lightingrulespage-category-tag lightingrulespage-base">Base</span>)}
                        {rule.applies_to_work_top && (<span className="lightingrulespage-category-tag lightingrulespage-worktop">Work Top</span>)}
                        {rule.applies_to_tall_cabinets && (<span className="lightingrulespage-category-tag lightingrulespage-tall">Tall</span>)}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => toggleRuleStatus(rule.id, !rule.is_active)} className="lightingrulespage-status-toggle">
                        <span className={`lightingrulespage-status-badge ${rule.is_active ? 'lightingrulespage-active' : 'lightingrulespage-inactive'}`}>{rule.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="lightingrulespage-action-buttons">
                        <button onClick={() => { setEditingRule(rule); setShowForm(true); }} className="lightingrulespage-action-btn-small lightingrulespage-edit" title="Edit rule"><Edit3 className="lightingrulespage-btn-icon-small" /></button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="lightingrulespage-action-btn-small lightingrulespage-delete" title="Delete rule"><Trash2 className="lightingrulespage-btn-icon-small" /></button>
                        <button className="lightingrulespage-action-btn-small lightingrulespage-more"><MoreVertical className="lightingrulespage-btn-icon-small" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms and Modals */}
      <LightingRuleForm
        isOpen={showForm}
        lightingRule={editingRule}
        materials={cabinetMaterials}
        customers={customers}
        cabinetTypes={cabinetTypes}
        onSave={handleSaveRule}
        onCancel={() => { setShowForm(false); setEditingRule(null); }}
        loading={loading}
      />
    </div>
  );
};

export default LightingRulesPage;