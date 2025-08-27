import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb,
  Calculator,
  Home,
  Building,
  Layers,
  Zap,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Save
} from 'lucide-react';

import './ProjectMultiLightingCalculator.css'
const ProjectMultiLightingCalculator = ({ 
  project,
  lineItems = [],
  lightingRules = [],
  onUpdateProjectTotals,
  onChange
}) => {
  const [lightingConfig, setLightingConfig] = useState(null);
  const [customDimensions, setCustomDimensions] = useState({
    work_top_length_mm: 6000,
    override_enabled: false
  });
  const [editMode, setEditMode] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Analyze line items by category
  const categoryAnalysis = useMemo(() => {
    const analysis = {
      wall: { items: [], total_width: 0, total_count: 0 },
      base: { items: [], total_width: 0, total_count: 0 },
      tall: { items: [], total_width: 0, total_count: 0 }
    };

    lineItems.forEach(item => {
      const category = item.cabinet_type_detail?.category?.name?.toLowerCase();
      if (!category || !analysis[category]) return;

      const width = item.width_mm * item.qty;
      analysis[category].items.push(item);
      analysis[category].total_width += width;
      analysis[category].total_count += item.qty;
    });

    return analysis;
  }, [lineItems]);

  // Find applicable lighting rule
  const applicableRule = useMemo(() => {
    if (!project || !lightingRules.length) return null;

    // Get primary material from project or most used material
    const materialCounts = {};
    lineItems.forEach(item => {
      const material = item.cabinet_material_detail?.name;
      if (material) {
        materialCounts[material] = (materialCounts[material] || 0) + 1;
      }
    });

    const primaryMaterial = Object.keys(materialCounts).reduce((a, b) => 
      materialCounts[a] > materialCounts[b] ? a : b, Object.keys(materialCounts)[0]
    );

    // Find best matching rule
    const rules = lightingRules.filter(rule => {
      const materialMatch = !primaryMaterial || rule.cabinet_material === primaryMaterial;
      const tierMatch = rule.budget_tier === project.budget_tier;
      const customerMatch = rule.is_global || rule.customer === project.customer;
      return materialMatch && tierMatch && customerMatch && rule.is_active;
    });

    // Sort by specificity: customer-specific first, then by effective date
    rules.sort((a, b) => {
      if (!a.is_global && b.is_global) return -1;
      if (a.is_global && !b.is_global) return 1;
      return new Date(b.effective_from) - new Date(a.effective_from);
    });

    return rules[0] || null;
  }, [project, lightingRules, lineItems]);

  // Calculate lighting costs
  const lightingCalculation = useMemo(() => {
    if (!applicableRule) return null;

    const ledRate = parseFloat(applicableRule.led_strip_rate_per_mm) || 0;
    const spotRate = parseFloat(applicableRule.spot_light_rate_per_cabinet) || 0;

    const breakdown = {
      wall: {
        led_under_cabinet: 0,
        spot_lights: 0,
        subtotal: 0,
        enabled: applicableRule.applies_to_wall_cabinets
      },
      base: {
        led_skirting: 0,
        subtotal: 0,
        enabled: applicableRule.applies_to_base_cabinets && 
                 (project.budget_tier === 'LUXURY' || !applicableRule.is_global)
      },
      work_top: {
        led_nosing: 0,
        subtotal: 0,
        enabled: applicableRule.applies_to_work_top
      },
      tall: {
        led_internal: 0,
        subtotal: 0,
        enabled: applicableRule.applies_to_tall_cabinets
      }
    };

    // Wall Cabinet Calculations
    if (breakdown.wall.enabled && categoryAnalysis.wall.total_width > 0) {
      breakdown.wall.led_under_cabinet = categoryAnalysis.wall.total_width * ledRate;
      breakdown.wall.spot_lights = categoryAnalysis.wall.total_count * spotRate;
      breakdown.wall.subtotal = breakdown.wall.led_under_cabinet + breakdown.wall.spot_lights;
    }

    // Base Cabinet Calculations (Luxury tier or customer-specific)
    if (breakdown.base.enabled && categoryAnalysis.base.total_width > 0) {
      breakdown.base.led_skirting = categoryAnalysis.base.total_width * ledRate;
      breakdown.base.subtotal = breakdown.base.led_skirting;
    }

    // Work Top Calculations
    if (breakdown.work_top.enabled) {
      const workTopLength = customDimensions.override_enabled 
        ? customDimensions.work_top_length_mm 
        : Math.max(categoryAnalysis.wall.total_width, 6000); // Default minimum
      
      breakdown.work_top.led_nosing = workTopLength * ledRate;
      breakdown.work_top.subtotal = breakdown.work_top.led_nosing;
    }

    // Tall Cabinet Calculations (if enabled)
    if (breakdown.tall.enabled && categoryAnalysis.tall.total_count > 0) {
      // Assuming 1 meter of internal LED per tall cabinet
      breakdown.tall.led_internal = categoryAnalysis.tall.total_count * 1000 * ledRate;
      breakdown.tall.subtotal = breakdown.tall.led_internal;
    }

    const totalLedCost = Object.values(breakdown).reduce((sum, category) => 
      sum + (category.led_under_cabinet || 0) + (category.led_skirting || 0) + 
      (category.led_nosing || 0) + (category.led_internal || 0), 0
    );

    const totalSpotCost = breakdown.wall.spot_lights || 0;
    const grandTotal = totalLedCost + totalSpotCost;

    return {
      rule: applicableRule,
      breakdown,
      totals: {
        led_cost: totalLedCost,
        spot_cost: totalSpotCost,
        grand_total: grandTotal
      },
      dimensions: {
        wall_width: categoryAnalysis.wall.total_width,
        wall_count: categoryAnalysis.wall.total_count,
        base_width: categoryAnalysis.base.total_width,
        work_top_length: customDimensions.override_enabled 
          ? customDimensions.work_top_length_mm 
          : Math.max(categoryAnalysis.wall.total_width, 6000),
        tall_count: categoryAnalysis.tall.total_count
      }
    };
  }, [applicableRule, categoryAnalysis, customDimensions, project]);

  // Handle dimension override
  const handleDimensionChange = (field, value) => {
    setCustomDimensions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save configuration
  const handleSaveConfig = async () => {
    if (!lightingCalculation) return;

    setCalculating(true);
    try {
      const configData = {
        project_id: project.id,
        lighting_rule_id: lightingCalculation.rule.id,
        work_top_length_mm: lightingCalculation.dimensions.work_top_length,
        grand_total_lighting_cost: lightingCalculation.totals.grand_total,
        breakdown: lightingCalculation.breakdown
      };

      // Call parent to update project totals
      if (onChange) {
        onChange(configData);
      }

      if (onUpdateProjectTotals) {
        await onUpdateProjectTotals();
      }

      setLightingConfig(configData);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save lighting configuration:', error);
    } finally {
      setCalculating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Get category icon and color
  const getCategoryIcon = (category) => {
    const icons = { wall: Home, base: Building, work_top: Zap, tall: Layers };
    return icons[category] || Lightbulb;
  };

  const getCategoryColor = (category) => {
    const colors = {
      wall: '#2563eb', base: '#ea580c', 
      work_top: '#7c3aed', tall: '#059669'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryName = (category) => {
    const names = {
      wall: 'Wall Cabinets', base: 'Base Cabinets',
      work_top: 'Work Top', tall: 'Tall Cabinets'
    };
    return names[category] || category;
  };

  if (!applicableRule) {
    return (
      <div className="lighting-calculator-container">
        <div className="no-rule-message">
          <AlertCircle className="message-icon" />
          <h3>No Lighting Rule Found</h3>
          <p>
            No applicable lighting rule found for this project configuration:
          </p>
          <ul>
            <li>Material: {project?.primary_material || 'Unknown'}</li>
            <li>Budget Tier: {project?.budget_tier || 'Unknown'}</li>
            <li>Customer: {project?.customer_detail?.name || 'Unknown'}</li>
          </ul>
          <p>Please create a lighting rule in the admin panel for this configuration.</p>
        </div>
      </div>
    );
  }

  if (!lightingCalculation) {
    return (
      <div className="lighting-calculator-container">
        <div className="loading-state">
          <RefreshCw className="loading-icon spinning" />
          <span>Calculating lighting costs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lighting-calculator-container">
      {/* Header */}
      <div className="calculator-header">
        <div className="header-info">
          <Lightbulb className="header-icon" />
          <div className="header-text">
            <h3 className="calculator-title">Multi-Category Lighting Calculator</h3>
            <p className="calculator-subtitle">
              Using rule: {lightingCalculation.rule.name}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setEditMode(!editMode)}
            className="action-btn secondary"
          >
            {editMode ? <Eye className="btn-icon" /> : <Edit3 className="btn-icon" />}
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
          {editMode && (
            <button 
              onClick={handleSaveConfig}
              disabled={calculating}
              className="action-btn primary"
            >
              {calculating ? (
                <RefreshCw className="btn-icon spinning" />
              ) : (
                <Save className="btn-icon" />
              )}
              Save Configuration
            </button>
          )}
        </div>
      </div>

      {/* Rule Information */}
      <div className="rule-info-card">
        <div className="rule-header">
          <Settings className="rule-icon" />
          <div className="rule-details">
            <span className="rule-name">{lightingCalculation.rule.name}</span>
            <span className="rule-rates">
              LED: {formatCurrency(lightingCalculation.rule.led_strip_rate_per_mm)}/mm • 
              Spot: {formatCurrency(lightingCalculation.rule.spot_light_rate_per_cabinet)}/cabinet
            </span>
          </div>
        </div>
        <div className="rule-scope">
          <span className={`scope-badge ${lightingCalculation.rule.is_global ? 'global' : 'customer'}`}>
            {lightingCalculation.rule.is_global ? 'Global Rule' : 'Customer-Specific'}
          </span>
        </div>
      </div>

      {/* Dimensions Override */}
      {editMode && (
        <div className="dimensions-override-card">
          <div className="override-header">
            <Calculator className="override-icon" />
            <span>Dimension Overrides</span>
          </div>
          <div className="override-content">
            <label className="override-toggle">
              <input
                type="checkbox"
                checked={customDimensions.override_enabled}
                onChange={(e) => handleDimensionChange('override_enabled', e.target.checked)}
              />
              <span>Override automatic work top length calculation</span>
            </label>
            {customDimensions.override_enabled && (
              <div className="override-input">
                <label>Work Top Length (mm)</label>
                <input
                  type="number"
                  value={customDimensions.work_top_length_mm}
                  onChange={(e) => handleDimensionChange('work_top_length_mm', parseInt(e.target.value) || 0)}
                  min="0"
                  step="100"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="category-breakdown-section">
        <h4 className="breakdown-title">Category-wise Lighting Breakdown</h4>
        <div className="category-grid">
          {Object.entries(lightingCalculation.breakdown).map(([category, data]) => {
            if (!data.enabled || data.subtotal === 0) return null;

            const IconComponent = getCategoryIcon(category);
            const categoryColor = getCategoryColor(category);

            return (
              <div key={category} className="category-card">
                <div className="category-header" style={{ borderLeftColor: categoryColor }}>
                  <IconComponent className="category-icon" style={{ color: categoryColor }} />
                  <span className="category-name">{getCategoryName(category)}</span>
                  <CheckCircle className="enabled-icon" />
                </div>

                <div className="category-content">
                  <div className="category-dimensions">
                    {category === 'wall' && (
                      <div className="dimension-info">
                        <span>Width: {(lightingCalculation.dimensions.wall_width / 1000).toFixed(1)}m</span>
                        <span>Count: {lightingCalculation.dimensions.wall_count} units</span>
                      </div>
                    )}
                    {category === 'base' && (
                      <div className="dimension-info">
                        <span>Width: {(lightingCalculation.dimensions.base_width / 1000).toFixed(1)}m</span>
                      </div>
                    )}
                    {category === 'work_top' && (
                      <div className="dimension-info">
                        <span>Length: {(lightingCalculation.dimensions.work_top_length / 1000).toFixed(1)}m</span>
                      </div>
                    )}
                    {category === 'tall' && (
                      <div className="dimension-info">
                        <span>Count: {lightingCalculation.dimensions.tall_count} units</span>
                      </div>
                    )}
                  </div>

                  <div className="category-breakdown">
                    {Object.entries(data).map(([key, value]) => {
                      if (key === 'subtotal' || key === 'enabled' || value === 0) return null;
                      
                      return (
                        <div key={key} className="cost-item">
                          <span className="cost-label">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="cost-value">{formatCurrency(value)}</span>
                        </div>
                      );
                    })}
                    
                    <div className="cost-item total">
                      <span className="cost-label">Subtotal</span>
                      <span className="cost-value">{formatCurrency(data.subtotal)}</span>
                    </div>
                  </div>
                </div>

                {lightingCalculation.rule[`${category}_specification`] && (
                  <div className="category-spec">
                    <small>{lightingCalculation.rule[`${category}_specification`]}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disabled Categories */}
      {Object.entries(lightingCalculation.breakdown).some(([_, data]) => !data.enabled) && (
        <div className="disabled-categories">
          <h5>Disabled Categories</h5>
          <div className="disabled-list">
            {Object.entries(lightingCalculation.breakdown).map(([category, data]) => {
              if (data.enabled) return null;

              const IconComponent = getCategoryIcon(category);
              return (
                <div key={category} className="disabled-category">
                  <IconComponent className="disabled-icon" />
                  <span>{getCategoryName(category)}</span>
                  <span className="disabled-reason">
                    {category === 'base' && project.budget_tier === 'ECONOMY' 
                      ? 'Not included in Economy tier'
                      : 'Disabled in lighting rule'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="grand-total-card">
        <div className="total-header">
          <Calculator className="total-icon" />
          <span>Total Project Lighting Cost</span>
        </div>
        <div className="total-amount">{formatCurrency(lightingCalculation.totals.grand_total)}</div>
        <div className="total-breakdown">
          <div className="breakdown-item">
            <span>LED Strips</span>
            <span>{formatCurrency(lightingCalculation.totals.led_cost)}</span>
          </div>
          <div className="breakdown-item">
            <span>Spot Lights</span>
            <span>{formatCurrency(lightingCalculation.totals.spot_cost)}</span>
          </div>
        </div>

        {lightingConfig && (
          <div className="save-status">
            <CheckCircle className="status-icon" />
            <span>Configuration saved to project</span>
          </div>
        )}
      </div>

      {/* Technical Specifications */}
      {(lightingCalculation.rule.led_specification || lightingCalculation.rule.spot_light_specification) && (
        <div className="specifications-card">
          <h4 className="spec-title">Technical Specifications</h4>
          {lightingCalculation.rule.led_specification && (
            <div className="spec-item">
              <strong>LED Strips:</strong> {lightingCalculation.rule.led_specification}
            </div>
          )}
          {lightingCalculation.rule.spot_light_specification && (
            <div className="spec-item">
              <strong>Spot Lights:</strong> {lightingCalculation.rule.spot_light_specification}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectMultiLightingCalculator;