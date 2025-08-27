import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calculator, 
  Lightbulb, 
  Zap,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Package,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const LightingCalculator = ({ 
  project,
  lightingConfiguration = null,
  lightingItems = [],
  availableRules = [],
  onSaveLightingItem,
  onDeleteLightingItem,
  onToggleLightingItem,
  onUpdateConfiguration,
  onChange,
  className = ''
}) => {
  const [activeItems, setActiveItems] = useState(lightingItems || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    cabinet_material: '',
    cabinet_type: '',
    lighting_rule: '',
    wall_cabinet_width_mm: 0,
    base_cabinet_width_mm: 0,
    wall_cabinet_count: 0,
    work_top_length_mm: 0,
    is_active: true
  });

  // Sync props with local state
  useEffect(() => {
    setActiveItems(lightingItems || []);
  }, [lightingItems]);

  // Get unique material/type combinations from project
  const availableCombinations = useMemo(() => {
    if (!project?.lines) return [];
    
    const combinations = project.lines.reduce((acc, line) => {
      const key = `${line.cabinet_material}_${line.cabinet_type || 'null'}`;
      if (!acc.find(item => item.key === key)) {
        acc.push({
          key,
          material_id: line.cabinet_material,
          material_name: line.cabinet_material_detail?.name || 'Unknown',
          cabinet_type_id: line.cabinet_type,
          cabinet_type_name: line.cabinet_type_detail?.name || 'All Types',
          // Calculate dimensions for this combination
          wall_width: project.lines
            .filter(l => l.cabinet_material === line.cabinet_material && 
                        l.cabinet_type === line.cabinet_type &&
                        l.cabinet_type_detail?.category?.name === 'WALL')
            .reduce((sum, l) => sum + (l.width_mm * l.qty), 0),
          base_width: project.lines
            .filter(l => l.cabinet_material === line.cabinet_material && 
                        l.cabinet_type === line.cabinet_type &&
                        l.cabinet_type_detail?.category?.name === 'BASE')
            .reduce((sum, l) => sum + (l.width_mm * l.qty), 0),
          wall_count: project.lines
            .filter(l => l.cabinet_material === line.cabinet_material && 
                        l.cabinet_type === line.cabinet_type &&
                        l.cabinet_type_detail?.category?.name === 'WALL')
            .reduce((sum, l) => sum + l.qty, 0)
        });
      }
      return acc;
    }, []);
    
    return combinations;
  }, [project]);

  // Filter available rules for selected material/type
  const getApplicableRules = useCallback((materialId, cabinetTypeId) => {
    return availableRules.filter(rule => {
      const materialMatch = rule.cabinet_material === materialId;
      const typeMatch = !rule.cabinet_type || rule.cabinet_type === cabinetTypeId;
      const budgetMatch = rule.budget_tier === project?.budget_tier;
      const customerMatch = rule.is_global || rule.customer === project?.customer;
      
      return materialMatch && typeMatch && budgetMatch && customerMatch;
    }).sort((a, b) => {
      // Sort by specificity: customer-specific first, then type-specific
      const aSpecific = !a.is_global ? 0 : 1;
      const bSpecific = !b.is_global ? 0 : 1;
      if (aSpecific !== bSpecific) return aSpecific - bSpecific;
      
      const aType = a.cabinet_type ? 0 : 1;
      const bType = b.cabinet_type ? 0 : 1;
      return aType - bType;
    });
  }, [availableRules, project]);

  // Calculate total costs
  const totals = useMemo(() => {
    const activeItemsList = activeItems.filter(item => item.is_active);
    
    return {
      total_led_cost: activeItemsList.reduce((sum, item) => 
        sum + (item.led_under_wall_cost + item.led_work_top_cost + item.led_skirting_cost), 0),
      total_spot_cost: activeItemsList.reduce((sum, item) => sum + item.spot_lights_cost, 0),
      grand_total: activeItemsList.reduce((sum, item) => sum + item.total_cost, 0),
      active_count: activeItemsList.length,
      total_count: activeItems.length
    };
  }, [activeItems]);

  // Handle adding new lighting item
  const handleAddLightingItem = useCallback(() => {
    const combination = availableCombinations.find(combo => 
      combo.material_id == newItem.cabinet_material && 
      combo.cabinet_type_id == newItem.cabinet_type
    );
    
    if (!combination) return;
    
    const itemData = {
      project: project.id,
      lighting_rule: newItem.lighting_rule,
      cabinet_material: newItem.cabinet_material,
      cabinet_type: newItem.cabinet_type || null,
      wall_cabinet_width_mm: newItem.wall_cabinet_width_mm || combination.wall_width,
      base_cabinet_width_mm: newItem.base_cabinet_width_mm || combination.base_width,
      wall_cabinet_count: newItem.wall_cabinet_count || combination.wall_count,
      work_top_length_mm: newItem.work_top_length_mm || combination.wall_width,
      is_active: true
    };
    
    onSaveLightingItem?.(itemData);
    
    // Reset form
    setNewItem({
      cabinet_material: '',
      cabinet_type: '',
      lighting_rule: '',
      wall_cabinet_width_mm: 0,
      base_cabinet_width_mm: 0,
      wall_cabinet_count: 0,
      work_top_length_mm: 0,
      is_active: true
    });
    setShowAddForm(false);
  }, [newItem, availableCombinations, project, onSaveLightingItem]);

  // Handle editing existing item
  const handleEditItem = useCallback((item) => {
    setEditingItem(item);
    setNewItem({
      cabinet_material: item.cabinet_material,
      cabinet_type: item.cabinet_type || '',
      lighting_rule: item.lighting_rule,
      wall_cabinet_width_mm: item.wall_cabinet_width_mm,
      base_cabinet_width_mm: item.base_cabinet_width_mm,
      wall_cabinet_count: item.wall_cabinet_count,
      work_top_length_mm: item.work_top_length_mm,
      is_active: item.is_active
    });
    setShowAddForm(true);
  }, []);

  // Handle saving edited item
  const handleSaveEdit = useCallback(() => {
    if (!editingItem) return;
    
    const itemData = {
      ...editingItem,
      lighting_rule: newItem.lighting_rule,
      wall_cabinet_width_mm: newItem.wall_cabinet_width_mm,
      base_cabinet_width_mm: newItem.base_cabinet_width_mm,
      wall_cabinet_count: newItem.wall_cabinet_count,
      work_top_length_mm: newItem.work_top_length_mm
    };
    
    onSaveLightingItem?.(itemData);
    
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({
      cabinet_material: '',
      cabinet_type: '',
      lighting_rule: '',
      wall_cabinet_width_mm: 0,
      base_cabinet_width_mm: 0,
      wall_cabinet_count: 0,
      work_top_length_mm: 0,
      is_active: true
    });
  }, [editingItem, newItem, onSaveLightingItem]);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  // Get unavailable combinations (already have lighting items)
  const unavailableCombinations = useMemo(() => {
    return activeItems.map(item => 
      `${item.cabinet_material}_${item.cabinet_type || 'null'}`
    );
  }, [activeItems]);

  return (
    <div className={`enhanced-lighting-calculator ${className}`}>
      {/* Header */}
      <div className="calculator-header">
        <div className="header-info">
          <Calculator className="header-icon" />
          <div className="header-text">
            <h3 className="header-title">Multi-Selection Lighting Calculator</h3>
            <p className="header-subtitle">
              Configure lighting for different materials and cabinet types
            </p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{totals.active_count}</span>
            <span className="stat-label">Active Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatCurrency(totals.grand_total)}</span>
            <span className="stat-label">Total Cost</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-cards">
          <div className="summary-card led-card">
            <div className="card-header">
              <Zap className="card-icon" />
              <span className="card-title">LED Strips</span>
            </div>
            <div className="card-value">{formatCurrency(totals.total_led_cost)}</div>
          </div>
          
          <div className="summary-card spot-card">
            <div className="card-header">
              <Lightbulb className="card-icon" />
              <span className="card-title">Spot Lights</span>
            </div>
            <div className="card-value">{formatCurrency(totals.total_spot_cost)}</div>
          </div>
          
          <div className="summary-card total-card">
            <div className="card-header">
              <DollarSign className="card-icon" />
              <span className="card-title">Grand Total</span>
            </div>
            <div className="card-value">{formatCurrency(totals.grand_total)}</div>
          </div>
        </div>
      </div>

      {/* Add New Lighting Item Button */}
      <div className="add-section">
        <button 
          className="add-item-btn"
          onClick={() => setShowAddForm(true)}
          disabled={availableCombinations.length === unavailableCombinations.length}
        >
          <Plus className="btn-icon" />
          Add Lighting Configuration
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="add-form-section">
          <div className="form-header">
            <Settings className="form-icon" />
            <h4 className="form-title">
              {editingItem ? 'Edit Lighting Configuration' : 'Add New Lighting Configuration'}
            </h4>
          </div>
          
          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Material & Type Combination</label>
                <select
                  className="form-select"
                  value={`${newItem.cabinet_material}_${newItem.cabinet_type || 'null'}`}
                  onChange={(e) => {
                    const [materialId, typeId] = e.target.value.split('_');
                    const combo = availableCombinations.find(c => c.key === e.target.value);
                    setNewItem(prev => ({
                      ...prev,
                      cabinet_material: materialId,
                      cabinet_type: typeId === 'null' ? '' : typeId,
                      wall_cabinet_width_mm: combo?.wall_width || 0,
                      base_cabinet_width_mm: combo?.base_width || 0,
                      wall_cabinet_count: combo?.wall_count || 0,
                      work_top_length_mm: combo?.wall_width || 0
                    }));
                  }}
                  disabled={editingItem}
                >
                  <option value="">Select material and type</option>
                  {availableCombinations
                    .filter(combo => editingItem || !unavailableCombinations.includes(combo.key))
                    .map(combo => (
                    <option key={combo.key} value={combo.key}>
                      {combo.material_name} - {combo.cabinet_type_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Lighting Rule</label>
                <select
                  className="form-select"
                  value={newItem.lighting_rule}
                  onChange={(e) => setNewItem(prev => ({ ...prev, lighting_rule: e.target.value }))}
                >
                  <option value="">Select lighting rule</option>
                  {getApplicableRules(newItem.cabinet_material, newItem.cabinet_type).map(rule => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name} - ₹{rule.led_strip_rate_per_mm}/mm, ₹{rule.spot_light_rate_per_cabinet}/cabinet
                      {!rule.is_global && ' (Customer-Specific)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Wall Cabinet Width (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.wall_cabinet_width_mm}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    wall_cabinet_width_mm: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Base Cabinet Width (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.base_cabinet_width_mm}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    base_cabinet_width_mm: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Wall Cabinet Count</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.wall_cabinet_count}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    wall_cabinet_count: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Work Top Length (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.work_top_length_mm}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    work_top_length_mm: parseInt(e.target.value) || 0 
                  }))}
                  min="0"
                  step="100"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setNewItem({
                    cabinet_material: '',
                    cabinet_type: '',
                    lighting_rule: '',
                    wall_cabinet_width_mm: 0,
                    base_cabinet_width_mm: 0,
                    wall_cabinet_count: 0,
                    work_top_length_mm: 0,
                    is_active: true
                  });
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-save"
                onClick={editingItem ? handleSaveEdit : handleAddLightingItem}
                disabled={!newItem.cabinet_material || !newItem.lighting_rule}
              >
                {editingItem ? 'Update Configuration' : 'Add Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lighting Items List */}
      <div className="items-section">
        <div className="section-header">
          <Package className="section-icon" />
          <h4 className="section-title">Lighting Configurations ({activeItems.length})</h4>
        </div>
        
        <div className="items-list">
          {activeItems.length === 0 ? (
            <div className="empty-state">
              <Lightbulb className="empty-icon" />
              <h4 className="empty-title">No Lighting Configurations</h4>
              <p className="empty-text">
                Add lighting configurations for different materials and cabinet types to calculate costs.
              </p>
            </div>
          ) : (
            activeItems.map(item => (
              <div key={item.id} className={`lighting-item ${!item.is_active ? 'inactive' : ''}`}>
                <div className="item-header">
                  <div className="item-info">
                    <div className="item-title">
                      {item.material_detail?.name || 'Unknown Material'}
                      {item.cabinet_type_detail && ` - ${item.cabinet_type_detail.name}`}
                    </div>
                    <div className="item-subtitle">
                      {item.lighting_rule_detail?.name || 'Custom Rule'}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      className={`toggle-btn ${item.is_active ? 'active' : 'inactive'}`}
                      onClick={() => onToggleLightingItem?.(item.id)}
                      title={item.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {item.is_active ? <Eye className="btn-icon" /> : <EyeOff className="btn-icon" />}
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditItem(item)}
                      title="Edit"
                    >
                      <Settings className="btn-icon" />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteLightingItem?.(item.id)}
                      title="Delete"
                    >
                      <Trash2 className="btn-icon" />
                    </button>
                  </div>
                </div>
                
                {item.is_active && (
                  <div className="item-breakdown">
                    <div className="breakdown-grid">
                      <div className="breakdown-item">
                        <span className="breakdown-label">LED Under Wall:</span>
                        <span className="breakdown-value">{formatCurrency(item.led_under_wall_cost)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">LED Work Top:</span>
                        <span className="breakdown-value">{formatCurrency(item.led_work_top_cost)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">LED Skirting:</span>
                        <span className="breakdown-value">{formatCurrency(item.led_skirting_cost)}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Spot Lights:</span>
                        <span className="breakdown-value">{formatCurrency(item.spot_lights_cost)}</span>
                      </div>
                      <div className="breakdown-item total">
                        <span className="breakdown-label">Total:</span>
                        <span className="breakdown-value">{formatCurrency(item.total_cost)}</span>
                      </div>
                    </div>
                    
                    <div className="item-dimensions">
                      <div className="dimension-item">
                        <span>Wall: {item.wall_cabinet_width_mm}mm ({item.wall_cabinet_count} units)</span>
                      </div>
                      <div className="dimension-item">
                        <span>Base: {item.base_cabinet_width_mm}mm</span>
                      </div>
                      <div className="dimension-item">
                        <span>Work Top: {item.work_top_length_mm}mm</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Grand Total Section */}
      {activeItems.some(item => item.is_active) && (
        <div className="grand-total-section">
          <div className="grand-total-card">
            <div className="grand-total-header">
              <CheckCircle className="grand-total-icon" />
              <span className="grand-total-title">Total Project Lighting Cost</span>
            </div>
            <div className="grand-total-amount">{formatCurrency(totals.grand_total)}</div>
            <div className="grand-total-breakdown">
              <span>LED Strips: {formatCurrency(totals.total_led_cost)}</span>
              <span>+</span>
              <span>Spot Lights: {formatCurrency(totals.total_spot_cost)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightingCalculator;