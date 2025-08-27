import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  BarChart3,
  Target,
  DollarSign,
  Activity
} from 'lucide-react';
import DoorRatesList from '../../components/masters/door-rates/DoorRatesList';
import DoorRateForm from '../../components/masters/door-rates/DoorRateForm';
import useDoorRates from '../../hooks/masters/useDoorRates';
import './DoorRatesPage.css';

const DoorRatesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [notification, setNotification] = useState(null);

  // Use the door rates hook
  const {
    doorRates,
    materials,
    loading,
    error,
    createDoorRate,
    updateDoorRate,
    deleteDoorRate,
    toggleDoorRateStatus,
    searchDoorRates,
    filterByMaterial,
    bulkUpdatePrices,
    refresh,
    getDoorRatesStats
  } = useDoorRates();

  // Get statistics
  const stats = getDoorRatesStats();

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form save
  const handleSave = async (rateData) => {
    try {
      let result;
      
      if (editingRate) {
        result = await updateDoorRate(editingRate.id, rateData);
        if (result.success) {
          showNotification('success', 'Door rate updated successfully');
        }
      } else {
        result = await createDoorRate(rateData);
        if (result.success) {
          showNotification('success', 'Door rate created successfully');
        }
      }

      if (result.success) {
        setShowForm(false);
        setEditingRate(null);
      } else {
        showNotification('error', result.error || 'Failed to save door rate');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Failed to save door rate';
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
    const rate = doorRates.find(r => r.id === rateId);
    const materialName = rate?.material_detail?.name || 'this rate';
    
    if (window.confirm(`Are you sure you want to delete the door rate for "${materialName}"? This action cannot be undone.`)) {
      try {
        const result = await deleteDoorRate(rateId);
        if (result.success) {
          showNotification('success', 'Door rate deleted successfully');
        } else {
          showNotification('error', result.error || 'Failed to delete door rate');
        }
      } catch (error) {
        showNotification('error', error.message || 'Failed to delete door rate');
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (rateId, newStatus) => {
    try {
      const result = await toggleDoorRateStatus(rateId, newStatus);
      if (result.success) {
        const action = newStatus ? 'activated' : 'deactivated';
        showNotification('success', `Door rate ${action} successfully`);
      } else {
        showNotification('error', result.error || 'Failed to update door rate status');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update door rate status');
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = () => {
    showNotification('info', 'Bulk update feature coming soon');
  };

  const handleExport = () => {
    showNotification('info', 'Export feature coming soon');
  };

  const handleViewHistory = (materialId) => {
    showNotification('info', 'Price history feature coming soon');
  };

  const handleCompareRates = (rateIds) => {
    showNotification('info', `Comparing ${rateIds.length} selected rates - feature coming soon`);
  };

  // Handle add new rate
  const handleAddNew = () => {
    setEditingRate(null);
    setShowForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRate(null);
  };

  return (
    <div className="door-rates-page">
      {/* Header */}
      <div className="door-rates-header">
        <div className="header-content">
          <div className="header-info">
            <Layers className="header-icon" />
            <div className="header-text">
              <h1 className="page-title">Door Rates</h1>
              <p className="page-subtitle">
                Manage pricing for door materials and track rate changes over time
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={refresh}
              disabled={loading}
              className={`btn btn-secondary ${loading ? 'loading' : ''}`}
            >
              <RefreshCw className={`btn-icon ${loading ? 'spinning' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={handleAddNew}
              className="btn btn-primary"
            >
              <Plus className="btn-icon" />
              Add Door Rate
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="door-rates-content">
        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <AlertTriangle className="error-icon" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Door Rates</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
              <div className="stat-icon stat-icon-red">
                <Layers className="icon" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Active Rates</p>
                <h3 className="stat-value">{stats.active}</h3>
              </div>
              <div className="stat-icon stat-icon-green">
                <Activity className="icon" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Materials Covered</p>
                <h3 className="stat-value">{stats.uniqueMaterials}</h3>
              </div>
              <div className="stat-icon stat-icon-blue">
                <Target className="icon" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Average Rate</p>
                <h3 className="stat-value">₹{stats.averageRate}</h3>
              </div>
              <div className="stat-icon stat-icon-purple">
                <DollarSign className="icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Price Range Overview */}
        <div className="price-range-overview">
          <div className="range-card">
            <div className="range-header">
              <h3>Door Rate Analysis</h3>
              <p>Current pricing insights for door materials</p>
            </div>
            <div className="range-content">
              <div className="range-stats">
                <div className="range-stat">
                  <span className="range-label">Lowest Rate</span>
                  <span className="range-value lowest">₹{stats.lowestRate}</span>
                </div>
                <div className="range-stat">
                  <span className="range-label">Highest Rate</span>
                  <span className="range-value highest">₹{stats.highestRate}</span>
                </div>
                <div className="range-stat">
                  <span className="range-label">Price Spread</span>
                  <span className="range-value spread">₹{stats.priceRange?.spread || 0}</span>
                </div>
                <div className="range-stat">
                  <span className="range-label">Active Percentage</span>
                  <span className="range-value percentage">{stats.activePercentage}%</span>
                </div>
              </div>
              
              {/* Visual Price Range Bar */}
              <div className="price-range-bar">
                <div className="range-bar-container">
                  <div 
                    className="range-bar-fill" 
                    style={{ width: `${Math.min(stats.activePercentage, 100)}%` }}
                  />
                </div>
                <div className="range-bar-labels">
                  <span>₹0</span>
                  <span>₹{stats.highestRate}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Material Distribution */}
          <div className="material-distribution">
            <div className="distribution-header">
              <h4>Material Distribution</h4>
              <p>Door rates by material type</p>
            </div>
            <div className="distribution-content">
              {Object.entries(stats.materialTypes || {}).slice(0, 5).map(([material, count]) => (
                <div key={material} className="distribution-item">
                  <div className="material-info">
                    <span className="material-name">{material}</span>
                    <span className="material-count">{count} rates</span>
                  </div>
                  <div className="material-bar">
                    <div 
                      className="material-bar-fill"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Door Rates List */}
        <DoorRatesList
          doorRates={doorRates}
          materials={materials}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onSearch={searchDoorRates}
          onFilter={filterByMaterial}
          onBulkUpdate={handleBulkUpdate}
          onExport={handleExport}
          onViewHistory={handleViewHistory}
          onCompareRates={handleCompareRates}
        />
      </div>

      {/* Door Rate Form Modal */}
      <DoorRateForm
        doorRate={editingRate}
        materials={materials}
        isOpen={showForm}
        onSave={handleSave}
        onCancel={handleCancelForm}
        loading={loading}
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <CheckCircle className="notification-icon" />}
            {notification.type === 'error' && <AlertTriangle className="notification-icon" />}
            {notification.type === 'info' && <TrendingUp className="notification-icon" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoorRatesPage;