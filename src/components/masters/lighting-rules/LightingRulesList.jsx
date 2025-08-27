// src/components/masters/lighting-rules/LightingRulesList.jsx
import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Calculator,
  Lightbulb,
  Zap,
  Settings,
  TrendingUp
} from 'lucide-react';
import './LightingRulesList.css';

const LightingRulesList = ({ 
  lightingRules = [], 
  materials = [],
  loading = false, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onSearch,
  onFilter,
  onTestCalculation,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState('');
  const [selectedRules, setSelectedRules] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [expandedCalculator, setExpandedCalculator] = useState(null);
  const [testDimensions, setTestDimensions] = useState({
    wall_cabinet_width_mm: 3000,
    base_cabinet_width_mm: 6000,
    work_top_length_mm: 6000,
    wall_cabinet_count: 8
  });
  const [calculationResults, setCalculationResults] = useState({});

  // Filter lighting rules based on search and filters
  const filteredRules = lightingRules.filter(rule => {
    const materialName = rule.material_detail?.name || '';
    const matchesSearch = materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.led_strip_rate_per_mm.toString().includes(searchTerm);
    const matchesMaterial = !selectedMaterial || rule.cabinet_material.toString() === selectedMaterial;
    const matchesBudgetTier = !selectedBudgetTier || rule.budget_tier === selectedBudgetTier;
    const matchesStatus = showInactive || rule.is_active;
    
    return matchesSearch && matchesMaterial && matchesBudgetTier && matchesStatus;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleMaterialFilter = (materialId) => {
    setSelectedMaterial(materialId);
    onFilter?.({ cabinet_material: materialId });
  };

  const handleBudgetTierFilter = (tier) => {
    setSelectedBudgetTier(tier);
    onFilter?.({ budget_tier: tier });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRules(filteredRules.map(r => r.id));
    } else {
      setSelectedRules([]);
    }
  };

  const handleSelectRule = (id, checked) => {
    if (checked) {
      setSelectedRules(prev => [...prev, id]);
    } else {
      setSelectedRules(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const getBudgetTierClass = (tier) => {
    return tier === 'LUXURY' ? 'budget-tier-luxury' : 'budget-tier-economy';
  };

  const getCalcMethodLabel = (method) => {
    const methods = {
      'PER_WIDTH': 'Per Width',
      'PER_LM': 'Per Linear Meter',
      'FLAT_RATE': 'Flat Rate',
      'WALL_ONLY': 'Wall Only'
    };
    return methods[method] || method;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTestCalculation = async (rule) => {
    if (expandedCalculator === rule.id) {
      setExpandedCalculator(null);
      return;
    }

    setExpandedCalculator(rule.id);
    
    if (onTestCalculation) {
      try {
        const result = await onTestCalculation(rule.id, testDimensions);
        if (result.success) {
          setCalculationResults(prev => ({
            ...prev,
            [rule.id]: result.data
          }));
        }
      } catch (error) {
        console.error('Test calculation failed:', error);
      }
    }
  };

  const updateTestDimensions = (field, value) => {
    setTestDimensions(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const recalculate = async (ruleId) => {
    const rule = lightingRules.find(r => r.id === ruleId);
    if (rule && onTestCalculation) {
      try {
        const result = await onTestCalculation(ruleId, testDimensions);
        if (result.success) {
          setCalculationResults(prev => ({
            ...prev,
            [ruleId]: result.data
          }));
        }
      } catch (error) {
        console.error('Recalculation failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="lighting-rules-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading lighting rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lighting-rules-list-container">
      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="search-filter-row">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by material, name, or rate..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Material Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedMaterial}
                onChange={(e) => handleMaterialFilter(e.target.value)}
              >
                <option value="">All Materials</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Budget Tier Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedBudgetTier}
                onChange={(e) => handleBudgetTierFilter(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="LUXURY">Luxury</option>
                <option value="ECONOMY">Economy</option>
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Show Inactive Toggle */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`toggle-inactive ${showInactive ? 'active' : ''}`}
            >
              {showInactive ? <Eye className="toggle-icon" /> : <EyeOff className="toggle-icon" />}
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={onExport} className="action-btn">
              <Download className="action-icon" />
              Export
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-text">
            Showing {filteredRules.length} of {lightingRules.length} lighting rules
          </span>
          {selectedRules.length > 0 && (
            <span className="selected-text">
              {selectedRules.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Lighting Rules Table */}
      <div className="lighting-rules-table-container">
        <div className="table-wrapper">
          <table className="lighting-rules-table">
            <thead className="table-header">
              <tr>
                <th className="table-th">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="table-th">Rule Name</th>
                <th className="table-th">Material</th>
                <th className="table-th">Budget Tier</th>
                <th className="table-th">LED Rate</th>
                <th className="table-th">Spot Light Rate</th>
                <th className="table-th">Applicability</th>
                <th className="table-th">Effective Dates</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <div className="empty-content">
                      <Lightbulb className="empty-icon" />
                      <p className="empty-title">No lighting rules found</p>
                      <p className="empty-subtitle">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <React.Fragment key={rule.id}>
                    <tr className={`table-row ${!rule.is_active ? 'inactive' : ''}`}>
                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedRules.includes(rule.id)}
                          onChange={(e) => handleSelectRule(rule.id, e.target.checked)}
                        />
                      </td>
                      <td className="table-td">
                        <div className="rule-name-info">
                          <div className="rule-name">
                            {rule.name || `${rule.material_detail?.name} ${rule.budget_tier} Rule`}
                          </div>
                          <div className="rule-method">
                            <Settings className="method-icon" />
                            {getCalcMethodLabel(rule.calc_method)}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="material-info">
                          <div className="material-name">
                            {rule.material_detail?.name || 'Unknown Material'}
                          </div>
                          <div className="material-role">
                            Role: {rule.material_detail?.role || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={`budget-tier-badge ${getBudgetTierClass(rule.budget_tier)}`}>
                          {rule.budget_tier}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="rate-info">
                          <div className="rate-amount">
                            {formatCurrency(rule.led_strip_rate_per_mm)}
                          </div>
                          <div className="rate-unit">per mm</div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="rate-info">
                          <div className="rate-amount">
                            {formatCurrency(rule.spot_light_rate_per_cabinet)}
                          </div>
                          <div className="rate-unit">per cabinet</div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="applicability-info">
                          <div className="applicability-items">
                            {rule.applies_to_wall_cabinets && (
                              <span className="applicability-badge wall">Wall Cabinets</span>
                            )}
                            {rule.includes_work_top_nosing && (
                              <span className="applicability-badge worktop">Work Top</span>
                            )}
                            {rule.includes_skirting && (
                              <span className="applicability-badge skirting">Skirting</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="dates-info">
                          <div className="date-from">
                            From: {formatDate(rule.effective_from)}
                          </div>
                          {rule.effective_to && (
                            <div className="date-to">
                              To: {formatDate(rule.effective_to)}
                            </div>
                          )}
                          {!rule.effective_to && (
                            <div className="date-ongoing">Ongoing</div>
                          )}
                        </div>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => onToggleStatus?.(rule.id, !rule.is_active)}
                          className="status-toggle"
                        >
                          <span className={`status-badge ${rule.is_active ? 'active' : 'inactive'}`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="table-td">
                        <div className="action-buttons-cell">
                          <button
                            onClick={() => handleTestCalculation(rule)}
                            className={`action-button calculator ${expandedCalculator === rule.id ? 'active' : ''}`}
                            title="Test calculation"
                          >
                            <Calculator className="action-icon" />
                          </button>
                          <button
                            onClick={() => onEdit?.(rule)}
                            className="action-button edit"
                            title="Edit lighting rule"
                          >
                            <Edit3 className="action-icon" />
                          </button>
                          <button
                            onClick={() => onDelete?.(rule.id)}
                            className="action-button delete"
                            title="Delete lighting rule"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                          <button className="action-button more">
                            <MoreVertical className="action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Calculator Row */}
                    {expandedCalculator === rule.id && (
                      <tr className="calculator-row">
                        <td colSpan="9" className="calculator-cell">
                          <div className="lighting-calculator">
                            <div className="calculator-header">
                              <Zap className="calculator-icon" />
                              <h4>Lighting Cost Calculator</h4>
                            </div>
                            
                            <div className="calculator-content">
                              <div className="calculator-inputs">
                                <div className="input-group">
                                  <label>Wall Cabinet Width (mm)</label>
                                  <input
                                    type="number"
                                    value={testDimensions.wall_cabinet_width_mm}
                                    onChange={(e) => updateTestDimensions('wall_cabinet_width_mm', e.target.value)}
                                    min="0"
                                    step="100"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Base Cabinet Width (mm)</label>
                                  <input
                                    type="number"
                                    value={testDimensions.base_cabinet_width_mm}
                                    onChange={(e) => updateTestDimensions('base_cabinet_width_mm', e.target.value)}
                                    min="0"
                                    step="100"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Work Top Length (mm)</label>
                                  <input
                                    type="number"
                                    value={testDimensions.work_top_length_mm}
                                    onChange={(e) => updateTestDimensions('work_top_length_mm', e.target.value)}
                                    min="0"
                                    step="100"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Wall Cabinet Count</label>
                                  <input
                                    type="number"
                                    value={testDimensions.wall_cabinet_count}
                                    onChange={(e) => updateTestDimensions('wall_cabinet_count', e.target.value)}
                                    min="0"
                                    step="1"
                                  />
                                </div>
                                <button 
                                  onClick={() => recalculate(rule.id)}
                                  className="calculate-btn"
                                >
                                  <TrendingUp className="btn-icon" />
                                  Calculate
                                </button>
                              </div>

                              {calculationResults[rule.id] && (
                                <div className="calculator-results">
                                  <h5>Calculated Costs:</h5>
                                  <div className="results-grid">
                                    <div className="result-item">
                                      <span className="result-label">LED Under Wall:</span>
                                      <span className="result-value">
                                        {formatCurrency(calculationResults[rule.id].calculated_costs?.led_under_wall_cost || 0)}
                                      </span>
                                    </div>
                                    <div className="result-item">
                                      <span className="result-label">LED Work Top:</span>
                                      <span className="result-value">
                                        {formatCurrency(calculationResults[rule.id].calculated_costs?.led_work_top_cost || 0)}
                                      </span>
                                    </div>
                                    <div className="result-item">
                                      <span className="result-label">LED Skirting:</span>
                                      <span className="result-value">
                                        {formatCurrency(calculationResults[rule.id].calculated_costs?.led_skirting_cost || 0)}
                                      </span>
                                    </div>
                                    <div className="result-item">
                                      <span className="result-label">Spot Lights:</span>
                                      <span className="result-value">
                                        {formatCurrency(calculationResults[rule.id].calculated_costs?.spot_lights_cost || 0)}
                                      </span>
                                    </div>
                                    <div className="result-item total">
                                      <span className="result-label">Total Cost:</span>
                                      <span className="result-value">
                                        {formatCurrency(calculationResults[rule.id].calculated_costs?.total_lighting_cost || 0)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {calculationResults[rule.id].specifications && (
                                    <div className="specifications">
                                      <h6>Specifications:</h6>
                                      {calculationResults[rule.id].specifications.led_specification && (
                                        <p className="spec-text">
                                          <strong>LED:</strong> {calculationResults[rule.id].specifications.led_specification}
                                        </p>
                                      )}
                                      {calculationResults[rule.id].specifications.spot_light_specification && (
                                        <p className="spec-text">
                                          <strong>Spot Lights:</strong> {calculationResults[rule.id].specifications.spot_light_specification}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Active Rules:</span>
          <span className="stat-value">{lightingRules.filter(r => r.is_active).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Luxury Rules:</span>
          <span className="stat-value">{lightingRules.filter(r => r.budget_tier === 'LUXURY').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Economy Rules:</span>
          <span className="stat-value">{lightingRules.filter(r => r.budget_tier === 'ECONOMY').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Materials:</span>
          <span className="stat-value">{new Set(lightingRules.map(r => r.cabinet_material)).size}</span>
        </div>
      </div>
    </div>
  );
};

export default LightingRulesList;