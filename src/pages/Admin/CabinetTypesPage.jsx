import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  BarChart3,
  Target,
  Layers,
  Ruler,
  Copy
} from 'lucide-react';
import CabinetTypesList from '../../components/masters/cabinet-types/CabinetTypesList';
import CabinetTypeForm from '../../components/masters/cabinet-types/CabinetTypeForm';
import useCabinetTypes from '../../hooks/masters/useCabinetTypes';
import './CabinetTypesPage.css';

const CabinetTypesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [notification, setNotification] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});

  // Use the cabinet types hook
  const {
    cabinetTypes,
    categories,
    standardDimensions,
    loading,
    error,
    createCabinetType,
    updateCabinetType,
    deleteCabinetType,
    duplicateCabinetType,
    toggleCabinetTypeStatus,
    searchLocal,
    filterByCategory,
    bulkUpdateCabinetTypes,
    refresh,
    getCabinetTypesStats,
    getCategoryIcon,
    getCategoryColor
  } = useCabinetTypes();

  // Get statistics
  const stats = getCabinetTypesStats();

  // Map category IDs to category names for proper display
  const mappedCategories = categories.map(category => ({
    ...category,
    value: category.id.toString(), // Convert ID to string for consistent comparison
    label: category.name // Use name as label
  }));

  // Calculate category counts
  useEffect(() => {
    if (cabinetTypes.length > 0 && categories.length > 0) {
      // Create an object to store counts by category ID
      const counts = {};
      
      // Initialize counts for all categories
      categories.forEach(category => {
        counts[category.id] = 0;
      });
      
      // Count cabinet types by category ID
      cabinetTypes.forEach(type => {
        const categoryId = type.category;
        if (categoryId) {
          if (counts[categoryId] !== undefined) {
            counts[categoryId]++;
          } else {
            counts[categoryId] = 1;
          }
        } else {
          // Handle uncategorized
          counts['uncategorized'] = (counts['uncategorized'] || 0) + 1;
        }
      });
      
      setCategoryStats(counts);
    }
  }, [cabinetTypes, categories]);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form save
  const handleSave = async (typeData) => {
    try {
      let result;
      
      if (editingType) {
        result = await updateCabinetType(editingType.id, typeData);
        if (result.success) {
          showNotification('success', 'Cabinet type updated successfully');
        }
      } else {
        result = await createCabinetType(typeData);
        if (result.success) {
          showNotification('success', 'Cabinet type created successfully');
        }
      }

      if (result.success) {
        setShowForm(false);
        setEditingType(null);
      } else {
        showNotification('error', result.error || 'Failed to save cabinet type');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Failed to save cabinet type';
      showNotification('error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Handle edit
  const handleEdit = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  // Handle duplicate
  const handleDuplicate = async (type) => {
    const newName = prompt(`Enter name for duplicated cabinet type:`, `${type.name} - Copy`);
    if (!newName || newName.trim() === '') return;

    try {
      const result = await duplicateCabinetType(type.id, {
        name: newName.trim(),
        description: `Copy of ${type.name}${type.description ? ` - ${type.description}` : ''}`
      });
      
      if (result.success) {
        showNotification('success', `Cabinet type "${newName}" created successfully`);
      } else {
        showNotification('error', result.error || 'Failed to duplicate cabinet type');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to duplicate cabinet type');
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (typeId) => {
    const type = cabinetTypes.find(t => t.id === typeId);
    const typeName = type?.name || 'this cabinet type';
    
    if (window.confirm(`Are you sure you want to delete "${typeName}"? This action cannot be undone and may affect existing quotations.`)) {
      try {
        const result = await deleteCabinetType(typeId);
        if (result.success) {
          showNotification('success', 'Cabinet type deleted successfully');
        } else {
          showNotification('error', result.error || 'Failed to delete cabinet type');
        }
      } catch (error) {
        showNotification('error', error.message || 'Failed to delete cabinet type');
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (typeId, newStatus) => {
    try {
      const result = await toggleCabinetTypeStatus(typeId, newStatus);
      if (result.success) {
        const action = newStatus ? 'activated' : 'deactivated';
        showNotification('success', `Cabinet type ${action} successfully`);
      } else {
        showNotification('error', result.error || 'Failed to update cabinet type status');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update cabinet type status');
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = (selectedIds) => {
    showNotification('info', `Bulk operations for ${selectedIds.length} cabinet types - feature coming soon`);
  };

  const handleExport = () => {
    showNotification('info', 'Export feature coming soon');
  };

  // Handle add new type
  const handleAddNew = () => {
    setEditingType(null);
    setShowForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingType(null);
  };

  // Helper to get category name by ID
  const getCategoryNameById = (categoryId) => {
    if (categoryId === null || categoryId === undefined) {
      return 'Uncategorized';
    }
    
    const category = categories.find(c => c.id === parseInt(categoryId, 10));
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="cabinet-types-page">
      {/* Header */}
      <div className="cabinet-types-header">
        <div className="header-content">
          <div className="header-info">
            <Package className="header-icon" />
            <div className="header-text">
              <h1 className="page-title">Cabinet Types</h1>
              <p className="page-subtitle">
                Manage cabinet categories and specifications for your quotation system
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
              Add Cabinet Type
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="cabinet-types-content">
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
                <p className="stat-label">Total Cabinet Types</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
              <div className="stat-icon stat-icon-red">
                <Package className="icon" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Active Types</p>
                <h3 className="stat-value">{stats.active}</h3>
              </div>
              <div className="stat-icon stat-icon-green">
                <Target className="icon" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Categories</p>
                <h3 className="stat-value">{stats.categoriesCount}</h3>
              </div>
              <div className="stat-icon stat-icon-blue">
                <Layers className="icon" />
              </div>
            </div>
          </div>

        
        </div>

        {/* Category Distribution */}
        <div className="category-overview">
          <div className="overview-header">
            <h3>Category Distribution</h3>
            <p>Cabinet types organized by category with usage insights</p>
          </div>
          
          <div className="categories-grid">
            {categories.map(category => {
              const categoryCount = categoryStats[category.id] || 0;
              const percentage = stats.total > 0 ? Math.round((categoryCount / stats.total) * 100) : 0;
              
              return (
                <div key={category.id} className="category-overview-card">
                  <div className="category-overview-header">
                    <span 
                      className="category-overview-icon"
                      style={{ backgroundColor: '#f0f0f0' }}
                    >
                      <Package />
                    </span>
                    <div className="category-overview-info">
                      <h4 className="category-overview-title">{category.name}</h4>
                      <p className="category-overview-desc">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="category-overview-stats">
                    <div className="category-count">
                      <span className="count-number">{categoryCount}</span>
                      <span className="count-label">types</span>
                    </div>
                    <div className="category-percentage">
                      <div className="percentage-bar">
                        <div 
                          className="percentage-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: '#4a90e2'
                          }}
                        />
                      </div>
                      <span className="percentage-text">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cabinet Types List */}
        <CabinetTypesList
          cabinetTypes={cabinetTypes}
          categories={mappedCategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onToggleStatus={handleToggleStatus}
          onSearch={searchLocal}
          onFilter={filterByCategory}
          onBulkUpdate={handleBulkUpdate}
          onExport={handleExport}
        />
      </div>

      {/* Cabinet Type Form Modal */}
      <CabinetTypeForm
        cabinetType={editingType}
        categories={categories}
        standardDimensions={standardDimensions}
        isOpen={showForm}
        onSave={handleSave}
        onCancel={handleCancelForm}
        loading={loading}
        getCategoryIcon={getCategoryIcon}
        getCategoryColor={getCategoryColor}
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

export default CabinetTypesPage;