import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Lightbulb,
  Settings,
  Users,
  Package,
  Calculator,
  Eye,
  Edit3,
  Trash2,
  MoreVertical
} from 'lucide-react';
import LightingRuleForm from '../../components/masters/lighting-rules/LightingRuleForm';
// import CategoryTester from '../../components/masters/lighting-rules/CategoryTester';
import useLightingRules from '../../hooks/masters/useLightingRules';
import useMaterials from '../../hooks/masters/useMaterials';
import useCustomers from '../../hooks/masters/useCustomers';
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
    lightingRules,
    loading,
    createLightingRule,
    updateLightingRule,
    deleteLightingRule,
    toggleRuleStatus,
    exportRules,
    importRules
  } = useLightingRules();

  const { materials } = useMaterials();
  const { customers } = useCustomers();

  // Filter lighting rules
  const filteredRules = lightingRules.filter(rule => {
    const matchesSearch = rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.cabinet_material?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = !selectedCustomer || 
                           (selectedCustomer === 'global' ? rule.is_global : rule.customer?.toString() === selectedCustomer);
    const matchesMaterial = !selectedMaterial || rule.cabinet_material === selectedMaterial;
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
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Get customer name
  const getCustomerName = (rule) => {
    if (rule.is_global) return 'Global';
    const customer = customers.find(c => c.id === rule.customer);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Get rule scope badge class
  const getScopeBadgeClass = (rule) => {
    return rule.is_global ? 'scope-global' : 'scope-customer';
  };

  return (
    <div className="lighting-rules-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <Lightbulb className="header-icon" />
            <div className="header-text">
              <h1 className="page-title">Lighting Rules Management</h1>
              <p className="page-subtitle">
                Multi-category lighting rules for different materials and customer preferences
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowTester(true)}
              className="action-btn secondary"
            >
              <Calculator className="btn-icon" />
              Test Calculator
            </button>
            <button 
              onClick={() => {
                setEditingRule(null);
                setShowForm(true);
              }}
              className="action-btn primary"
            >
              <Plus className="btn-icon" />
              Add Lighting Rule
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Settings className="stat-icon" />
              <span className="stat-label">Total Rules</span>
            </div>
            <div className="stat-value">{lightingRules.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Users className="stat-icon" />
              <span className="stat-label">Customer-Specific</span>
            </div>
            <div className="stat-value">
              {lightingRules.filter(r => !r.is_global).length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Package className="stat-icon" />
              <span className="stat-label">Materials Covered</span>
            </div>
            <div className="stat-value">
              {new Set(lightingRules.map(r => r.cabinet_material)).size}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Eye className="stat-icon" />
              <span className="stat-label">Active Rules</span>
            </div>
            <div className="stat-value">
              {lightingRules.filter(r => r.is_active).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-content">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by rule name or material..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">All Customers</option>
              <option value="global">Global Rules</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
            >
              <option value="">All Materials</option>
              {cabinetMaterials.map(material => (
                <option key={material.id} value={material.name}>
                  {material.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            >
              <option value="">All Tiers</option>
              <option value="LUXURY">Luxury</option>
              <option value="ECONOMY">Economy</option>
            </select>

            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`toggle-btn ${showInactive ? 'active' : ''}`}
            >
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={exportRules} className="action-btn secondary">
            <Download className="btn-icon" />
            Export
          </button>
          <button onClick={importRules} className="action-btn secondary">
            <Upload className="btn-icon" />
            Import
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rules-table-container">
        <div className="table-header">
          <h3 className="table-title">
            Lighting Rules ({filteredRules.length})
          </h3>
        </div>

        <div className="table-wrapper">
          <table className="rules-table">
            <thead>
              <tr>
                <th>Rule Details</th>
                <th>Scope</th>
                <th>Material & Tier</th>
                <th>LED Rate</th>
                <th>Spot Rate</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    <div className="empty-state">
                      <Lightbulb className="empty-icon" />
                      <p>No lighting rules found</p>
                      <span>Create your first lighting rule to get started</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className={`table-row ${!rule.is_active ? 'inactive' : ''}`}>
                    <td>
                      <div className="rule-details">
                        <div className="rule-name">{rule.name}</div>
                        <div className="rule-dates">
                          From: {new Date(rule.effective_from).toLocaleDateString()}
                          {rule.effective_to && (
                            <span> • To: {new Date(rule.effective_to).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`scope-badge ${getScopeBadgeClass(rule)}`}>
                        {getCustomerName(rule)}
                      </span>
                    </td>
                    <td>
                      <div className="material-tier">
                        <div className="material-name">{rule.cabinet_material}</div>
                        <span className={`tier-badge tier-${rule.budget_tier.toLowerCase()}`}>
                          {rule.budget_tier}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="rate-display">
                        <span className="rate-amount">
                          {formatCurrency(rule.led_strip_rate_per_mm)}
                        </span>
                        <span className="rate-unit">per mm</span>
                      </div>
                    </td>
                    <td>
                      <div className="rate-display">
                        <span className="rate-amount">
                          {formatCurrency(rule.spot_light_rate_per_cabinet)}
                        </span>
                        <span className="rate-unit">per cabinet</span>
                      </div>
                    </td>
                    <td>
                      <div className="categories-display">
                        {rule.applies_to_wall_cabinets && (
                          <span className="category-tag wall">Wall</span>
                        )}
                        {rule.applies_to_base_cabinets && (
                          <span className="category-tag base">Base</span>
                        )}
                        {rule.applies_to_work_top && (
                          <span className="category-tag worktop">Work Top</span>
                        )}
                        {rule.applies_to_tall_cabinets && (
                          <span className="category-tag tall">Tall</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleRuleStatus(rule.id, !rule.is_active)}
                        className="status-toggle"
                      >
                        <span className={`status-badge ${rule.is_active ? 'active' : 'inactive'}`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setShowForm(true);
                          }}
                          className="action-btn-small edit"
                          title="Edit rule"
                        >
                          <Edit3 className="btn-icon-small" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="action-btn-small delete"
                          title="Delete rule"
                        >
                          <Trash2 className="btn-icon-small" />
                        </button>
                        <button className="action-btn-small more">
                          <MoreVertical className="btn-icon-small" />
                        </button>
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
        onSave={handleSaveRule}
        onCancel={() => {
          setShowForm(false);
          setEditingRule(null);
        }}
        loading={loading}
      />

      {/* <CategoryTester
        isOpen={showTester}
        lightingRules={lightingRules}
        materials={cabinetMaterials}
        onClose={() => setShowTester(false)}
      /> */}
    </div>
  );
};

export default LightingRulesPage;