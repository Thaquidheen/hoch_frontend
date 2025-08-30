import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText,
  Calculator,
  Package,
  User,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus,
  Layers,
  Lightbulb,
  RefreshCw,
  ImageIcon, // Added for plan images
} from 'lucide-react';

import LineItemsList from '../../components/quotations/projects/LineItemsList';
import LineItemForm from '../../components/quotations/projects/LineItemForm';
import ProjectMultiLightingCalculator from '../../components/masters/lighting-rules/ProjectMultiLightingCalculator';
import ProjectLightingItemsList from '../../components/masters/lighting-rules/ProjectLightingItemsList';
import LightingItemForm from '../../components/masters/lighting-rules/LightingItemForm';
import ProjectAccessoriesList from '../../components/quotations/projects/ProjectAccessoriesList';
import useProjects from '../../hooks/quotations/useProjects';
import useLineItems from '../../hooks/quotations/useLineItems';
import useLightingRules from '../../hooks/masters/useLightingRules';
import { enhancedLightingApi } from '../../service/masters/lightingRulesApi';
import PlanImagesManager from '../../components/quotations/projects/PlanImagesManager';
import { usePlanImages } from '../../hooks/masters/usePlanImages';
import api from '../../service/api';

import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State Management
  const [project, setProject] = useState(null);
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('line-items');
  const [lightingConfig, setLightingConfig] = useState(null);
  const [lightingItems, setLightingItems] = useState([]);
  const [showLightingItemForm, setShowLightingItemForm] = useState(false);
  const [editingLightingItem, setEditingLightingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hooks
  const {
    getProjectById,
    recalculateProjectTotals,
    loading: projectLoading
  } = useProjects();

  const {
    lineItems,
    materials,
    cabinetTypes,
    loading: lineItemsLoading,
    calculating,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    duplicateLineItem,
    computeLineItemPricing,
    calculatePricingPreview,
    batchComputePricing,
    getCabinetMaterials,
    getDoorMaterials,
    getLineItemsStats,
    exportLineItems,
  } = useLineItems(projectId);

  const {
    imageGroups,
    loading: planImagesLoading,
    error: planImagesError,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkUploadImages,
    updateImage,
    deleteImage,
    getTotalImageCount
  } = usePlanImages(projectId);

  const { lightingRules } = useLightingRules();

  // Fetch lighting items when project changes
  useEffect(() => {
    const fetchLightingItems = async () => {
      if (project?.id) {
        try {
          const response = await enhancedLightingApi.getLightingItems(project.id);
          setLightingItems(response);
        } catch (error) {
          console.error('Failed to fetch lighting items:', error);
        }
      }
    };
    
    fetchLightingItems();
  }, [project]);

  // Memoized calculations including lighting
  const lineItemsStats = useMemo(() => ({
    ...getLineItemsStats(),
    totalWallWidth: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'WALL')
      .reduce((sum, item) => sum + (item.width_mm * item.qty), 0),
    totalBaseWidth: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'BASE') 
      .reduce((sum, item) => sum + (item.width_mm * item.qty), 0),
    wallCabinetCount: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'WALL')
      .reduce((sum, item) => sum + item.qty, 0),
    tallCabinetCount: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'TALL')
      .reduce((sum, item) => sum + item.qty, 0)
  }), [lineItems, getLineItemsStats]);

  // Enhanced project totals including lighting
  const enhancedProjectTotals = useMemo(() => {
    const baseTotals = project?.totals || {};
    const lightingCost = lightingConfig?.grand_total_lighting_cost || 0;
    
    return {
      ...baseTotals,
      subtotal_lighting: lightingCost,
      grand_total_with_lighting: (baseTotals.grand_total || 0) + lightingCost
    };
  }, [project?.totals, lightingConfig]);

  // Project statistics with plan images
  const projectStats = useMemo(() => ({
    totalLineItems: lineItems.length,
    totalLightingItems: lightingItems.length,
    totalPlanImages: getTotalImageCount(),
    baseCabinetCount: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'BASE')
      .reduce((sum, item) => sum + item.qty, 0),
    wallCabinetCount: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'WALL')
      .reduce((sum, item) => sum + item.qty, 0),
    tallCabinetCount: lineItems
      .filter(item => item.cabinet_type_detail?.category?.name === 'TALL')
      .reduce((sum, item) => sum + item.qty, 0)
  }), [lineItems, lightingItems, getTotalImageCount]);

  // Project Fetch Logic
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const result = await getProjectById(projectId);
          if (result.success) {
            setProject(result.data);
          } else {
            showNotification('error', result.error || 'Failed to load project');
            navigate('/quotations/projects');
          }
        } catch (error) {
          showNotification('error', 'Failed to load project');
          navigate('/quotations/projects');
        }
      } else {
        showNotification('error', 'Invalid project ID');
        navigate('/quotations/projects');
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  // Handler Functions
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLineItemSave = async (lineItemData) => {
    try {
      const result = editingLineItem 
        ? await updateLineItem(editingLineItem.id, lineItemData) 
        : await createLineItem(lineItemData);

      if (result.success) {
        showNotification('success', editingLineItem ? 'Line item updated' : 'Line item added');
        setShowLineItemForm(false);
        setEditingLineItem(null);
        await recalculateProjectTotals(projectId);
      } else {
        showNotification('error', result.error || 'Failed to save line item');
      }
      return result;
    } catch (error) {
      showNotification('error', error.message || 'Failed to save line item');
      return { success: false, error: error.message };
    }
  };

  const handleLineItemDelete = async (lineItemId) => {
    const lineItem = lineItems.find(item => item.id === lineItemId);
    if (window.confirm(`Delete "${lineItem?.cabinet_type_detail?.name || 'this item'}"?`)) {
      const result = await deleteLineItem(lineItemId);
      if (result.success) {
        showNotification('success', 'Line item deleted');
        await recalculateProjectTotals(projectId);
      } else {
        showNotification('error', result.error || 'Failed to delete line item');
      }
    }
  };

  const handleLineItemDuplicate = async (lineItemId) => {
    try {
      const result = await duplicateLineItem(lineItemId);
      if (result.success) {
        showNotification('success', 'Line item duplicated successfully');
        await recalculateProjectTotals(projectId);
      } else {
        showNotification('error', result.error || 'Failed to duplicate line item');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to duplicate line item');
    }
  };
  
  const handleLineItemCompute = async (lineItemId) => {
    try {
        const result = await computeLineItemPricing(lineItemId);
        if (result.success) {
            showNotification('success', 'Line item pricing recalculated');
            await recalculateProjectTotals(projectId);
        } else {
            showNotification('error', result.error || 'Failed to compute pricing');
        }
    } catch (error) {
        showNotification('error', error.message || 'Failed to compute pricing');
    }
  };
  
  const handleBatchCompute = async (lineItemIds) => {
    try {
        const result = await batchComputePricing(lineItemIds);
        if (result.success) {
            showNotification('success', `${lineItemIds.length} line items recalculated`);
            await recalculateProjectTotals(projectId);
        } else {
            showNotification('error', result.error || 'Failed to compute pricing');
        }
    } catch (error) {
        showNotification('error', error.message || 'Failed to compute pricing');
    }
  };
  
  const handleExportLineItems = async () => {
    try {
        const result = await exportLineItems('csv');
        if (result.success) {
            showNotification('success', 'Line items exported');
        } else {
            showNotification('error', result.error || 'Failed to export line items');
        }
    } catch (error) {
        showNotification('error', error.message || 'Failed to export line items');
    }
  };

  const handleRecalculateProject = async () => {
    const result = await recalculateProjectTotals(projectId);
    if (result.success) {
      showNotification('success', 'Project totals recalculated');
      const refreshedProject = await getProjectById(projectId);
      if (refreshedProject.success) setProject(refreshedProject.data);
    } else {
      showNotification('error', 'Failed to recalculate totals');
    }
  };

  // Lighting configuration change handler
  const handleLightingConfigChange = (configData) => {
    setLightingConfig(configData);
    showNotification('success', 'Lighting configuration updated');
  };

  // New handlers for multiple lighting items
  const handleAutoCreateLightingItems = async () => {
    try {
      setLoading(true);
      
      const response = await enhancedLightingApi.autoCreateLightingItems(projectId);
      
      const projectData = await getProjectById(projectId);
      if (projectData.success) setProject(projectData.data);
      
      const updatedItems = await enhancedLightingApi.getLightingItems(projectId);
      setLightingItems(updatedItems);
      
      const createdCount = response.created_items?.length || response.created_items || 0;
      showNotification('success', `${createdCount} lighting items created successfully`);
      
    } catch (error) {
      console.error('Auto-create lighting items error:', error);
      showNotification('error', error.message || 'Failed to create lighting items');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLightingItem = async (itemData) => {
    try {
      setLoading(true);
      
      const response = itemData.id
        ? await enhancedLightingApi.updateLightingItem(itemData.id, itemData)
        : await enhancedLightingApi.createLightingItem(itemData);
      
      const projectData = await getProjectById(projectId);
      if (projectData.success) setProject(projectData.data);
      
      const updatedItems = await enhancedLightingApi.getLightingItems(projectId);
      setLightingItems(updatedItems);
      
      showNotification('success', `Lighting item ${itemData.id ? 'updated' : 'created'} successfully`);
      
      return { success: true, data: response };
    } catch (error) {
      showNotification('error', error.message || 'Failed to save lighting item');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLightingItem = async (itemId, isActive) => {
    try {
      setLoading(true);
      await enhancedLightingApi.toggleLightingItem(itemId, isActive);
      
      const projectData = await getProjectById(projectId);
      if (projectData.success) setProject(projectData.data);
      
      const updatedItems = await enhancedLightingApi.getLightingItems(projectId);
      setLightingItems(updatedItems);
      
      showNotification('success', `Lighting item ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      showNotification('error', error.message || 'Failed to toggle lighting item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLightingItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this lighting item?')) {
      return;
    }
    
    try {
      setLoading(true);
      await enhancedLightingApi.deleteLightingItem(itemId);
      
      const projectData = await getProjectById(projectId);
      if (projectData.success) setProject(projectData.data);
      
      const updatedItems = await enhancedLightingApi.getLightingItems(projectId);
      setLightingItems(updatedItems);
      
      showNotification('success', 'Lighting item deleted successfully');
    } catch (error) {
      showNotification('error', error.message || 'Failed to delete lighting item');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessoryChange = async () => {
    try {
      await recalculateProjectTotals(projectId);
      const refreshedProject = await getProjectById(projectId);
      if (refreshedProject.success) {
        setProject(refreshedProject.data);
      }
    } catch (error) {
      console.error('Error refreshing project after accessory change:', error);
    }
  };

  const handleUpdateLightingTotals = async () => {
    try {
      setLoading(true);
      
      const config = await enhancedLightingApi.getLightingConfiguration(projectId);
      
      await api.post(`/api/pricing/lighting-configurations/${config.id}/recalculate_totals/`);
      
      await recalculateProjectTotals(projectId);
      
      const projectData = await getProjectById(projectId);
      if (projectData.success) setProject(projectData.data);
      
      showNotification('success', 'Lighting totals updated successfully');
    } catch (error) {
      console.error('Update lighting totals error:', error);
      showNotification('error', error.message || 'Failed to update lighting totals');
    } finally {
      setLoading(false);
    }
  };

  // Plan Images handler
  const handlePlanImagesUpdate = () => {
    showNotification('success', 'Plan images updated successfully');
  };

  // Helper Functions
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  const getStatusClass = (status) => `projectdetail-status-${(status || 'DRAFT').toLowerCase().replace('_', '-')}`;

  // Render Logic
  if (projectLoading) {
    return (
      <div className="projectdetail-loading">
        <RefreshCw className="projectdetail-loading-icon" />
        <span>Loading project...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="projectdetail-error">
        <AlertTriangle className="projectdetail-error-icon" />
        <span>Project not found.</span>
      </div>
    );
  }

  return (
    <div className="projectdetail-page">
      <div className="projectdetail-header">
        <div className="projectdetail-header-content">
          <div className="projectdetail-header-navigation">
            <button onClick={() => navigate('/quotations/projects')} className="projectdetail-back-button">
              <ArrowLeft className="projectdetail-back-icon" /> Back to Projects
            </button>
          </div>
          <div className="projectdetail-project-info">
            <div className="projectdetail-project-main">
              <FileText className="projectdetail-project-icon" />
              <div className="projectdetail-project-details">
                <h1 className="projectdetail-project-title">Project #{project.id}</h1>
                <div className="projectdetail-project-meta">
                  <span className="projectdetail-project-customer"><User className="projectdetail-meta-icon" />{project.customer_detail?.name}</span>
                  <span className="projectdetail-project-brand"><Building className="projectdetail-meta-icon" />{project.brand_detail?.name}</span>
                  <span className={`projectdetail-project-status ${getStatusClass(project.status)}`}>{project.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <div className="projectdetail-project-actions">
              <button onClick={handleRecalculateProject} className="projectdetail-action-btn projectdetail-secondary" disabled={projectLoading || loading}>
                <Calculator className="projectdetail-btn-icon" /> Recalculate Totals
              </button>
              <button className="projectdetail-action-btn projectdetail-primary">
                <FileText className="projectdetail-btn-icon" /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="projectdetail-project-summary">
        <div className="projectdetail-summary-content">
          <div className="projectdetail-summary-cards">
            {/* Project Settings Card */}
            <div className="projectdetail-summary-card">
              <div className="projectdetail-card-header">
                <Settings className="projectdetail-card-icon" />
                <h3 className="projectdetail-card-title">Project Settings</h3>
              </div>
              <div className="projectdetail-card-content">
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Budget Tier:</span>
                  <span className={`projectdetail-setting-value projectdetail-tier-${project.budget_tier.toLowerCase()}`}>
                    {project.budget_tier}
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Margin:</span>
                  <span className="projectdetail-setting-value">{project.margin_pct}%</span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">GST:</span>
                  <span className="projectdetail-setting-value">{project.gst_pct}%</span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Scopes:</span>
                  <span className="projectdetail-setting-value">
                    {project.scopes?.open && 'Open'}{project.scopes?.open && project.scopes?.working && ' + '}{project.scopes?.working && 'Working'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Line Items Stats Card */}
            <div className="projectdetail-summary-card">
              <div className="projectdetail-card-header">
                <Package className="projectdetail-card-icon" />
                <h3 className="projectdetail-card-title">Cabinet Analysis</h3>
              </div>
              <div className="projectdetail-card-content">
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Total Items:</span>
                  <span className="projectdetail-setting-value">{lineItemsStats.total}</span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Wall Cabinets:</span>
                  <span className="projectdetail-setting-value">
                    {lineItemsStats.wallCabinetCount} ({(lineItemsStats.totalWallWidth/1000).toFixed(1)}m)
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Base Cabinets:</span>
                  <span className="projectdetail-setting-value">
                    {lineItems.filter(i => i.cabinet_type_detail?.category?.name === 'BASE').reduce((s, i) => s + i.qty, 0)} ({(lineItemsStats.totalBaseWidth/1000).toFixed(1)}m)
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Tall Cabinets:</span>
                  <span className="projectdetail-setting-value">{lineItemsStats.tallCabinetCount}</span>
                </div>
                {/* NEW: Plan Images count */}
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Plan Images:</span>
                  <span className="projectdetail-setting-value">{projectStats.totalPlanImages}</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Project Totals Card with Lighting */}
            <div className="projectdetail-summary-card">
              <div className="projectdetail-card-header">
                <DollarSign className="projectdetail-card-icon" />
                <h3 className="projectdetail-card-title">Project Totals</h3>
              </div>
              <div className="projectdetail-card-content">
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Cabinets & Doors:</span>
                  <span className="projectdetail-setting-value">
                    {formatCurrency(
                      (project.totals?.subtotal_cabinets || 0) + 
                      (project.totals?.subtotal_doors || 0)
                    )}
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Accessories:</span>
                  <span className="projectdetail-setting-value">
                    {formatCurrency(project.totals?.subtotal_accessories || 0)}
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Lighting:</span>
                  <span className="projectdetail-setting-value">
                    {formatCurrency(enhancedProjectTotals.subtotal_lighting)}
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">Margin:</span>
                  <span className="projectdetail-setting-value">
                    {formatCurrency(project.totals?.margin_amount || 0)}
                  </span>
                </div>
                <div className="projectdetail-setting-item">
                  <span className="projectdetail-setting-label">GST:</span>
                  <span className="projectdetail-setting-value">
                    {formatCurrency(project.totals?.gst_amount || 0)}
                  </span>
                </div>
                <div className="projectdetail-setting-item projectdetail-total">
                  <span className="projectdetail-setting-label">Grand Total:</span>
                  <span className="projectdetail-setting-value">
                    {formatCurrency(enhancedProjectTotals.grand_total_with_lighting)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="projectdetail-project-content">
        <div className="projectdetail-content-tabs">
          <button 
            className={`projectdetail-tab-button ${activeTab === 'line-items' ? 'active' : ''}`} 
            onClick={() => setActiveTab('line-items')}
          >
            <Package className="projectdetail-tab-icon" /> Line Items ({lineItems.length})
          </button>
          <button 
            className={`projectdetail-tab-button ${activeTab === 'lighting' ? 'active' : ''}`} 
            onClick={() => setActiveTab('lighting')}
          >
            <Lightbulb className="projectdetail-tab-icon" /> Multi-Category Lighting
            {lightingItems.length > 0 && <span className="tab-count">{lightingItems.length}</span>}
          </button>
          <button 
            className={`projectdetail-tab-button ${activeTab === 'accessories' ? 'active' : ''}`} 
            onClick={() => setActiveTab('accessories')}
          >
            <Settings className="projectdetail-tab-icon" /> Accessories
          </button>
          {/* CORRECTED: Plan Images tab */}
          <button 
            className={`projectdetail-tab-button ${activeTab === 'plans' ? 'active' : ''}`} 
            onClick={() => setActiveTab('plans')}
          >
            <ImageIcon className="projectdetail-tab-icon" /> Plan Images
            {projectStats.totalPlanImages > 0 && (
              <span className="tab-count">{projectStats.totalPlanImages}</span>
            )}
          </button>
        </div>
        
        <div className="projectdetail-tab-content">
          {activeTab === 'line-items' && (
            <LineItemsList
              lineItems={lineItems} 
              loading={lineItemsLoading} 
              calculating={calculating}
              onEdit={(item) => { setEditingLineItem(item); setShowLineItemForm(true); }}
              onDelete={handleLineItemDelete} 
              onDuplicate={handleLineItemDuplicate} 
              onCompute={handleLineItemCompute}
              onBatchCompute={handleBatchCompute} 
              onExport={handleExportLineItems} 
              onAddNew={() => { setEditingLineItem(null); setShowLineItemForm(true); }}
            />
          )}
          
          {activeTab === 'lighting' && (
            <div className="projectdetail-lighting-tab">
              <div className="lighting-header">
                <h3 className="lighting-section-title">Cabinet-Specific Lighting Configuration</h3>
                <div className="lighting-actions">
                  <button 
                    className="lighting-action-btn secondary"
                    onClick={handleAutoCreateLightingItems}
                    disabled={loading}
                  >
                    <Plus className="btn-icon" />
                    Auto-Create Lighting Items
                  </button>
                  <button 
                    className="lighting-action-btn primary"
                    onClick={handleUpdateLightingTotals}
                    disabled={loading}
                  >
                    <Calculator className="btn-icon" />
                    Recalculate Lighting
                  </button>
                </div>
              </div>
              
              <ProjectLightingItemsList 
                project={project}
                lightingItems={lightingItems}
                lightingRules={lightingRules.filter(rule => 
                  rule.is_active && (
                    rule.is_global || rule.customer === project.customer
                  )
                )}
                cabinetTypes={cabinetTypes}
                materials={materials}
                loading={loading}
                onSaveItem={handleSaveLightingItem}
                onAddItem={() => { setEditingLightingItem(null); setShowLightingItemForm(true); }}
                onEditItem={(item) => { setEditingLightingItem(item); setShowLightingItemForm(true); }}
                onDeleteItem={handleDeleteLightingItem}
                onToggleItem={handleToggleLightingItem}
                formatCurrency={formatCurrency}
              />
              
              <div className="lighting-section-divider"></div>
              
              <ProjectMultiLightingCalculator
                project={project}
                lineItems={lineItems}
                lightingRules={lightingRules.filter(rule => 
                  rule.is_active && (
                    rule.is_global || rule.customer === project.customer
                  )
                )}
                lightingItems={lightingItems}
                onUpdateProjectTotals={handleUpdateLightingTotals}
                onChange={handleLightingConfigChange}
              />
            </div>
          )}
          
          {activeTab === 'accessories' && (
            <div className="tab-content">
              <ProjectAccessoriesList 
                project={project}
                lineItems={lineItems}
                onAccessoryChange={handleAccessoryChange}
              />
            </div>
          )}
          
          {/* CORRECTED: Plan Images tab implementation */}
          {activeTab === 'plans' && (
            <div className="plan-images-section">
              {planImagesError && (
                <div className="error-message">
                  <AlertTriangle className="error-icon" />
                  <span>Error loading plan images: {planImagesError}</span>
                </div>
              )}
              <PlanImagesManager
                projectId={projectId}
                onUpdate={handlePlanImagesUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Line Item Form */}
      <LineItemForm
        isOpen={showLineItemForm}
        onCancel={() => { setShowLineItemForm(false); setEditingLineItem(null); }}
        onSave={handleLineItemSave}
        lineItem={editingLineItem}
        project={project}
        cabinetTypes={cabinetTypes}
        cabinetMaterials={getCabinetMaterials()}
        doorMaterials={getDoorMaterials()}
        onPreviewCalculation={calculatePricingPreview}
        loading={lineItemsLoading}
        calculating={calculating[editingLineItem?.id]}
      />

      {/* Lighting Item Form */}
      <LightingItemForm
        isOpen={showLightingItemForm}
        lightingItem={editingLightingItem}
        project={project}
        lightingRules={lightingRules.filter(rule => 
          rule.is_active && (
            rule.is_global || rule.customer === project.customer
          )
        )}
        cabinetTypes={cabinetTypes}
        materials={materials}
        onSave={handleSaveLightingItem}
        onCancel={() => { setShowLightingItemForm(false); setEditingLightingItem(null); }}
        loading={loading}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`projectdetail-notification-toast projectdetail-notification-${notification.type}`}>
          <div className="projectdetail-notification-content">
            {notification.type === 'success' ? (
              <CheckCircle className="projectdetail-notification-icon" />
            ) : (
              <AlertTriangle className="projectdetail-notification-icon" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;