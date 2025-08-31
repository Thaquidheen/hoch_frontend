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
  X,
  Eye,
  Layers,
  Lightbulb,
  RefreshCw,
  ImageIcon, // Added for plan images
  Download,
  Mail,
  History as HistoryIcon // Renamed to avoid conflict with component
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

// NEW: Added PDF-related imports
import PDFGenerationModal from '../../components/quotations/PDFGenerationModal';
import PDFHistoryTable from '../../components/quotations/PDFHistoryTable';
import useQuotationPDF from '../../hooks/quotations/useQuotationPDF'; // Fixed incomplete import

import './ProjectDetailPage.css';


const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [project, setProject] = useState(null);
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('line-items'); // Updated to include pdf tab
  const [lightingConfig, setLightingConfig] = useState(null);
  const [lightingItems, setLightingItems] = useState([]);
  const [showLightingItemForm, setShowLightingItemForm] = useState(false);
  const [editingLightingItem, setEditingLightingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEW: Added PDF-related states
  const [selectedPdfForEmail, setSelectedPdfForEmail] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPDFHistory, setShowPDFHistory] = useState(false);

  // NEW: Updated PDF hook destructuring with all required functions
  const {
    pdfHistory,
    templates,
    generatePDF: generateQuotationPDF,
    downloadPDF,
    emailPDF,
    previewPDF,
    loading: pdfHookLoading
  } = useQuotationPDF();

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

  // NEW: Updated PDF handlers with complete implementations
  const handleGeneratePDF = async (projectId, templateType, customizations = {}) => {
    try {
      setPdfLoading(true);
      const result = await generateQuotationPDF(projectId, templateType, customizations);
      
      if (result.success) {
        console.log('PDF generated successfully:', result);
        setShowPDFModal(false);
        
        // Show success notification
        showNotification('success', 'PDF generated successfully');
        
        // Optionally auto-download
        if (result.download_url) {
          window.open(result.download_url, '_blank');
        }
      } else {
        console.error('PDF generation failed:', result.error);
        showNotification('error', result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('error', 'Error generating PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPDF = async (pdf) => {
    try {
      await downloadPDF(pdf.id);
      showNotification('success', 'PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showNotification('error', 'Error downloading PDF');
    }
  };

  const handleEmailPDF = async (pdf) => {
    try {
      const emailData = {
        recipient_email: project?.customer?.email || '',
        subject: `Kitchen Quotation - ${project?.name}`,
        message: 'Please find attached your kitchen quotation.'
      };
      
      await emailPDF(pdf.id, emailData);
      showNotification('success', 'PDF emailed successfully');
    } catch (error) {
      console.error('Error emailing PDF:', error);
      showNotification('error', 'Error emailing PDF');
    }
  };

  const handlePreviewPDF = async (pdf) => {
    try {
      await previewPDF(pdf.id);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      showNotification('error', 'Error previewing PDF');
    }
  };

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

  // NEW: Updated tab buttons array to include PDF tab
  const tabButtons = [
    { key: 'line-items', label: 'Line Items', icon: Package, count: lineItems.length },
    { key: 'lighting', label: 'Multi-Category Lighting', icon: Lightbulb, count: lightingItems.length },
    { key: 'accessories', label: 'Accessories', icon: Settings },
    { key: 'plans', label: 'Plan Images', icon: ImageIcon, count: projectStats.totalPlanImages },
    { key: 'pdf', label: 'PDF Documents', icon: FileText, count: pdfHistory.filter(pdf => pdf.project_id === projectId).length }
  ];

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
              {/* NEW: Updated PDF action buttons in header */}
              <div className="pdf-actions-group">
                <button 
                  onClick={() => setShowPDFModal(true)}
                  className="projectdetail-action-btn projectdetail-primary"
                  disabled={pdfLoading}
                >
                  <FileText className="projectdetail-btn-icon" />
                  {pdfLoading ? 'Generating...' : 'Generate PDF'}
                </button>
                
                <button 
                  onClick={() => setShowPDFHistory(!showPDFHistory)}
                  className="projectdetail-action-btn projectdetail-secondary"
                  title="PDF History"
                >
                  <HistoryIcon className="projectdetail-btn-icon" />
                  PDF History
                </button>
              </div>
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
        {/* NEW: Updated tabs rendering to use tabButtons array */}
        <div className="projectdetail-content-tabs">
          {tabButtons.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button 
                key={tab.key}
                className={`projectdetail-tab-button ${activeTab === tab.key ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab.key)}
              >
                <IconComponent className="projectdetail-tab-icon" /> 
                {tab.label}
                {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
              </button>
            );
          })}
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

          {/* NEW: PDF tab content */}
          {activeTab === 'pdf' && (
            <div className="pdf-tab-section">
              <div className="pdf-tab-header">
                <div className="pdf-tab-header-content">
                  <FileText className="pdf-tab-header-icon" />
                  <div className="pdf-tab-header-text">
                    <h3 className="pdf-tab-title">PDF Documents</h3>
                    <p className="pdf-tab-description">
                      Generate, manage, and download PDF quotations for this project.
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pdf-quick-actions">
                  <button
                    onClick={() => setShowPDFModal(true)}
                    className="pdf-quick-action-btn primary"
                    disabled={pdfLoading}
                  >
                    <FileText className="pdf-action-icon" />
                    {pdfLoading ? 'Generating PDF...' : 'Generate New PDF'}
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="pdf-quick-action-btn secondary"
                  >
                    <RefreshCw className="pdf-action-icon" />
                    Refresh History
                  </button>
                </div>
              </div>

              {/* PDF History Table */}
              <PDFHistoryTable
                pdfHistory={pdfHistory.filter(pdf => pdf.project_id === projectId)}
                loading={pdfHookLoading}
                onDownload={handleDownloadPDF}
                onEmail={handleEmailPDF}
                onPreview={handlePreviewPDF}
                onRegenerate={(pdf) => {
                  // Set the modal to regenerate mode
                  setShowPDFModal(true);
                }}
                className="project-pdf-history"
              />

              {/* Empty State */}
              {pdfHistory.filter(pdf => pdf.project_id === projectId).length === 0 && !pdfHookLoading && (
                <div className="pdf-empty-state">
                  <FileText className="pdf-empty-icon" />
                  <h4 className="pdf-empty-title">No PDFs Generated Yet</h4>
                  <p className="pdf-empty-description">
                    Generate your first PDF quotation to get started.
                  </p>
                  <button
                    onClick={() => setShowPDFModal(true)}
                    className="pdf-empty-action-btn"
                  >
                    <Plus className="pdf-action-icon" />
                    Generate First PDF
                  </button>
                </div>
              )}
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

      {/* NEW: PDF Generation Modal */}
      {showPDFModal && (
        <PDFGenerationModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          projectId={projectId}
          projectName={project?.name || `Project #${project?.id}` || 'Untitled Project'}
          onGenerate={handleGeneratePDF}
          templates={templates}
          loading={pdfLoading}
        />
      )}

      {/* NEW: PDF History Sidebar */}
      {showPDFHistory && (
        <div className="pdf-history-sidebar">
          <div className="pdf-history-sidebar-header">
            <div className="pdf-history-sidebar-title">
              <HistoryIcon className="pdf-history-sidebar-icon" />
              <h3>Recent PDFs</h3>
            </div>
            <button
              onClick={() => setShowPDFHistory(false)}
              className="pdf-history-close"
            >
              <X className="icon" />
            </button>
          </div>
          
          <div className="pdf-history-sidebar-content">
            {pdfHistory
              .filter(pdf => pdf.project_id === projectId)
              .slice(0, 5)
              .map(pdf => (
                <div key={pdf.id} className="pdf-history-item">
                  <div className="pdf-history-item-info">
                    <div className="pdf-history-item-header">
                      <FileText className="pdf-history-item-icon" />
                      <span className="pdf-history-filename">
                        {pdf.filename || 'Untitled.pdf'}
                      </span>
                    </div>
                    <div className="pdf-history-item-meta">
                      <span className="pdf-history-date">
                        {new Date(pdf.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="pdf-history-template">
                        {pdf.template_type || 'Default'}
                      </span>
                    </div>
                  </div>
                  <div className="pdf-history-item-actions">
                    <button
                      onClick={() => handleDownloadPDF(pdf)}
                      className="pdf-history-action download"
                      title="Download PDF"
                    >
                      <Download className="icon" />
                    </button>
                    <button
                      onClick={() => handlePreviewPDF(pdf)}
                      className="pdf-history-action preview"
                      title="Preview PDF"
                    >
                      <Eye className="icon" />
                    </button>
                    <button
                      onClick={() => handleEmailPDF(pdf)}
                      className="pdf-history-action email"
                      title="Email PDF"
                    >
                      <Mail className="icon" />
                    </button>
                  </div>
                </div>
              ))}
          
            {pdfHistory.filter(pdf => pdf.project_id === projectId).length === 0 && (
              <div className="pdf-history-empty">
                <FileText className="pdf-history-empty-icon" />
                <p className="pdf-history-empty-text">No PDFs generated yet</p>
              </div>
            )}
          
            {pdfHistory.filter(pdf => pdf.project_id === projectId).length > 5 && (
              <button
                onClick={() => setActiveTab('pdf')}
                className="pdf-history-view-all"
              >
                View All PDFs ({pdfHistory.filter(pdf => pdf.project_id === projectId).length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;