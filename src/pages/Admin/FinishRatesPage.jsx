import React, { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  BarChart3,
  Target
} from 'lucide-react';
import FinishRatesList from '../../components/masters/finish-rates/FinishRatesList';
import FinishRateForm from '../../components/masters/finish-rates/FinishRateForm';
import useFinishRates from '../../hooks/masters/useFinishRates';
import './FinishRatesPage.css';

const FinishRatesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [notification, setNotification] = useState(null);

  // Use the finish rates hook
  const {
    finishRates,
    materials,
    loading,
    error,
    createFinishRate,
    updateFinishRate,
    deleteFinishRate,
    toggleFinishRateStatus,
    searchFinishRates,
    filterByMaterial,
    filterByBudgetTier,
    bulkUpdatePrices,
    refresh,
    getFinishRatesStats
  } = useFinishRates();



  const handleSave = async (RateData) => {
    try {
      let result;

      if (editingRate) {
        result = await updateFinishRate(editingRate.id, RateData);
        if (result.success) {
          showNotification('success', 'Cabinet Rate updated successfully');
        }
      } else {
        result = await createFinishRate(RateData);
        if (result.success) {
          showNotification('success', 'Cabinet Rate created successfully');
        }
      }

      if (result.success) {
        setShowForm(false);
        setEditingRate(null);
      } else {
        showNotification('error', result.error || 'Failed to save cabinet rate');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Failed to save cabinet rate';
      showNotification('error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

   const handleDelete = async (cabinetId) => {
    const cabinet= materials.find(m => m.id === cabinetId);

    if (window.confirm(`Are you sure you want to delete "${cabinet?.name}"? This action cannot be undone.`)) {
      try {
        const result = await deleteFinishRate(cabinetId);
        if (result.success) {
          showNotification('success', 'Cabinet Rate deleted successfully');
        } else {
          showNotification('error', result.error || 'Failed to delete cabinet rate');
        }
      } catch (error) {
        showNotification('error', error.message || 'Failed to delete cabinet rate');
      }
    }
  };

   const handleToggleStatus = async (RateId, newStatus) => {
    try {
      const result = await toggleFinishRateStatus(RateId, newStatus);
      if (result.success) {
        const action = newStatus ? 'activated' : 'deactivated';
        showNotification('success', `Cabinet Rate ${action} successfully`);
      } else {
        showNotification('error', result.error || 'Failed to update cabinet rate status');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update cabinet rate status');
    }
  };
  // Get statistics
  const stats = getFinishRatesStats();

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingRate(null);
  };

  // Handle bulk update (placeholder)
  const handleBulkUpdate = () => {
    showNotification('info', 'Bulk update functionality coming soon');
  };

  // Handle export (placeholder)
  const handleExport = () => {
    showNotification('info', 'Export functionality coming soon');
  };

  // Handle view history (placeholder)
  const handleViewHistory = (materialId) => {
    showNotification('info', 'Price history view coming soon');
  };

  // Handle filter changes
  const handleFilter = (filters) => {
    if (filters.material) {
      filterByMaterial(filters.material);
    }
    if (filters.budget_tier) {
      filterByBudgetTier(filters.budget_tier);
    }
  };

  return (
    <div className="finish-rates-page">
      {/* Page Header */}
      <div className="finish-rates-header">
        <div className="header-content">
          <div className="header-info">
            <DollarSign className="header-icon" />
            <div className="header-text">
              <h1 className="page-title">Finish Rates Management</h1>
              <p className="page-subtitle">
                Manage cabinet material pricing with luxury and economy tiers
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
              Add Finish Rate
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="finish-rates-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Rates</p>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat-icon stat-icon-red">
                <DollarSign className="icon" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Active Rates</p>
                <p className="stat-value">{stats.active}</p>
              </div>
              <div className="stat-icon stat-icon-green">
                <CheckCircle className="icon" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Materials Covered</p>
                <p className="stat-value">{stats.uniqueMaterials}</p>
              </div>
              <div className="stat-icon stat-icon-blue">
                <Target className="icon" />
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Avg Luxury Rate</p>
                <p className="stat-value">₹{stats.averageLuxuryRate}</p>
              </div>
              <div className="stat-icon stat-icon-purple">
                <TrendingUp className="icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Tier Breakdown */}
        <div className="tier-breakdown">
          <div className="breakdown-card luxury">
            <div className="breakdown-header">
              <span className="tier-badge luxury">LUXURY</span>
              <span className="tier-count">{stats.byBudgetTier.LUXURY || 0} rates</span>
            </div>
            <div className="breakdown-content">
              <div className="breakdown-stat">
                <span className="breakdown-label">Average Rate:</span>
                <span className="breakdown-value">₹{stats.averageLuxuryRate}/sq.ft</span>
              </div>
            </div>
          </div>
          
          <div className="breakdown-card economy">
            <div className="breakdown-header">
              <span className="tier-badge economy">ECONOMY</span>
              <span className="tier-count">{stats.byBudgetTier.ECONOMY || 0} rates</span>
            </div>
            <div className="breakdown-content">
              <div className="breakdown-stat">
                <span className="breakdown-label">Average Rate:</span>
                <span className="breakdown-value">₹{stats.averageEconomyRate}/sq.ft</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <AlertTriangle className="error-icon" />
              <span>Error loading finish rates: {error}</span>
            </div>
          </div>
        )}

        {/* Finish Rates List */}
        <FinishRatesList
          finishRates={finishRates}
          materials={materials}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onSearch={searchFinishRates}
          onFilter={handleFilter}
          onBulkUpdate={handleBulkUpdate}
          onExport={handleExport}
          onViewHistory={handleViewHistory}
        />
      </div>

      {/* Finish Rate Form Modal */}
      <FinishRateForm
        finishRate={editingRate}
        materials={materials}
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

export default FinishRatesPage;

const handleSave = async (rateData) => {
    try {
      let result;
      
      if (editingRate) {
        result = await updateFinishRate(editingRate.id, rateData);
        if (result.success) {
          showNotification('success', 'Finish rate updated successfully');
        }
      } else {
        result = await createFinishRate(rateData);
        if (result.success) {
          showNotification('success', 'Finish rate created successfully');
        }
      }

      if (result.success) {
        setShowForm(false);
        setEditingRate(null);
      } else {
        showNotification('error', result.error || 'Failed to save finish rate');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Failed to save finish rate';
      showNotification('error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Handle edit
  const handleEdit = (rate) => {
    setEditingRate(rate);
    setShowForm(true);
  };

  // Handle delete with confirmation
  const handleDelete = async (rateId) => {
    const rate = finishRates.find(r => r.id === rateId);
    const materialName = rate?.material_detail?.name || 'this rate';
    
    if (window.confirm(`Are you sure you want to delete the finish rate for "${materialName}"? This action cannot be undone.`)) {
      try {
        const result = await deleteFinishRate(rateId);
        if (result.success) {
          showNotification('success', 'Finish rate deleted successfully');
        } else {
          showNotification('error', result.error || 'Failed to delete finish rate');
        }
      } catch (error) {
        showNotification('error', error.message || 'Failed to delete finish rate');
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (rateId, newStatus) => {
    try {
      const result = await toggleFinishRateStatus(rateId, newStatus);
      if (result.success) {
        const action = newStatus ? 'activated' : 'deactivated';
        showNotification('success', `Finish rate ${action} successfully`);
      } else {
        showNotification('error', result.error || 'Failed to update finish rate status');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update finish rate status');
    }
  };