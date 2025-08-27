import React, { useState } from 'react';
import { 
  Plus, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import MaterialsList from '../../components/masters/materials/MaterialsList';
import MaterialForm from '../../components/masters/materials/MaterialForm';
import useMaterials from '../../hooks/masters/useMaterials';
import './MaterialsPage.css';

const MaterialsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [notification, setNotification] = useState(null);

  // Use the materials hook
  const {
    materials,
    loading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleMaterialStatus,
    searchMaterials,
    filterByRole,
    refresh
  } = useMaterials();

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form save
  const handleSave = async (materialData) => {
    try {
      let result;
      
      if (editingMaterial) {
        result = await updateMaterial(editingMaterial.id, materialData);
        if (result.success) {
          showNotification('success', 'Material updated successfully');
        }
      } else {
        result = await createMaterial(materialData);
        if (result.success) {
          showNotification('success', 'Material created successfully');
        }
      }

      if (result.success) {
        setShowForm(false);
        setEditingMaterial(null);
      } else {
        showNotification('error', result.error || 'Failed to save material');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Failed to save material';
      showNotification('error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Handle edit
  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  // Handle delete with confirmation
  const handleDelete = async (materialId) => {
    const material = materials.find(m => m.id === materialId);
    
    if (window.confirm(`Are you sure you want to delete "${material?.name}"? This action cannot be undone.`)) {
      try {
        const result = await deleteMaterial(materialId);
        if (result.success) {
          showNotification('success', 'Material deleted successfully');
        } else {
          showNotification('error', result.error || 'Failed to delete material');
        }
      } catch (error) {
        showNotification('error', error.message || 'Failed to delete material');
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (materialId, newStatus) => {
    try {
      const result = await toggleMaterialStatus(materialId, newStatus);
      if (result.success) {
        const action = newStatus ? 'activated' : 'deactivated';
        showNotification('success', `Material ${action} successfully`);
      } else {
        showNotification('error', result.error || 'Failed to update material status');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update material status');
    }
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  // Handle bulk import (placeholder)
  const handleBulkImport = () => {
    showNotification('info', 'Bulk import functionality coming soon');
  };

  // Handle export (placeholder)
  const handleExport = () => {
    showNotification('info', 'Export functionality coming soon');
  };

  return (
    <div className="materials-page">
      {/* Page Header */}
      <div className="materials-header">
        <div className="header-content">
          <div className="header-info">
            <Settings className="header-icon" />
            <div className="header-text">
              <h1 className="page-title">Materials Management</h1>
              <p className="page-subtitle">
                Manage cabinet and door materials for your quotation system
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={refresh}
              className={`btn btn-secondary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <RefreshCw className={`btn-icon ${loading ? 'spinning' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="btn-icon" />
              Add Material
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="materials-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Materials</p>
                <p className="stat-value">{materials.length}</p>
              </div>
              <div className="stat-icon stat-icon-red">
                <Settings className="icon" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Active Materials</p>
                <p className="stat-value">
                  {materials.filter(m => m.is_active).length}
                </p>
              </div>
              <div className="stat-icon stat-icon-green">
                <CheckCircle className="icon" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Cabinet Materials</p>
                <p className="stat-value">
                  {materials.filter(m => m.role === 'CABINET' || m.role === 'BOTH').length}
                </p>
              </div>
              <div className="stat-icon stat-icon-blue">
                <Settings className="icon" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Door Materials</p>
                <p className="stat-value">
                  {materials.filter(m => m.role === 'DOOR' || m.role === 'BOTH').length}
                </p>
              </div>
              <div className="stat-icon stat-icon-purple">
                <Settings className="icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <AlertTriangle className="error-icon" />
              <span>Error loading materials: {error}</span>
            </div>
          </div>
        )}

        {/* Materials List */}
        <MaterialsList
          materials={materials}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onSearch={searchMaterials}
          onFilter={filterByRole}
          onBulkImport={handleBulkImport}
          onExport={handleExport}
        />
      </div>

      {/* Material Form Modal */}
      <MaterialForm
        material={editingMaterial}
        isOpen={showForm}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <CheckCircle className="notification-icon" />}
            {notification.type === 'error' && <AlertTriangle className="notification-icon" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;