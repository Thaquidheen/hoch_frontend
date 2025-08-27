import React, { useState } from 'react';
import { 
  Plus, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  BarChart3,
  Target,
  Grid3X3,
  DollarSign,
  Package,
  Zap
} from 'lucide-react';
import HardwareMatrix from '../../components/masters/hardware-charges/HardwareMatrix';
import useHardwareCharges from '../../hooks/masters/useHardwareCharges';
import './HardwareChargesPage.css';

const HardwareChargesPage = () => {
  const [notification, setNotification] = useState(null);

  // Use the hardware charges hook
  const {
    matrixData,
    brands,
    cabinetTypes,
    loading,
    error,
    updateMatrixCell,
    copyCharges,
    exportCharges,
    importCharges,
    refresh,
    getHardwareChargesStats,
    isCellSaving,
    formatCurrency,
    getBrandById,
    getCabinetTypeById
  } = useHardwareCharges();

  // Get statistics
  const stats = getHardwareChargesStats();

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle matrix cell update
  const handleUpdateCell = async (cabinetTypeId, brandId, chargeData) => {
    try {
      const result = await updateMatrixCell(cabinetTypeId, brandId, chargeData);
      return result;
    } catch (error) {
      showNotification('error', error.message || 'Failed to update charge');
      return { success: false, error: error.message };
    }
  };

  // Handle copy charges
  const handleCopyCharges = async (sourceCabinetTypeId, targetCabinetTypeIds, brandIds = []) => {
    try {
      const result = await copyCharges(sourceCabinetTypeId, targetCabinetTypeIds, brandIds);
      if (result.success) {
        showNotification('success', `Charges copied to ${targetCabinetTypeIds.length} cabinet types`);
      }
      return result;
    } catch (error) {
      showNotification('error', error.message || 'Failed to copy charges');
      return { success: false, error: error.message };
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const result = await exportCharges('csv');
      if (result.success) {
        showNotification('success', 'Hardware charges exported successfully');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to export charges');
    }
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const result = await importCharges(file);
          if (result.success) {
            showNotification('success', 'Hardware charges imported successfully');
          } else {
            showNotification('error', result.error || 'Failed to import charges');
          }
        } catch (error) {
          showNotification('error', error.message || 'Failed to import charges');
        }
      }
    };
    input.click();
  };

  // Get brand category stats
  const getBrandCategoryStats = () => {
    return brands.reduce((acc, brand) => {
      acc[brand.category] = (acc[brand.category] || 0) + 1;
      return acc;
    }, {});
  };

  const brandCategoryStats = getBrandCategoryStats();

  return (
    <div className="hardware-charges-page">
      {/* Header */}
      <div className="hardware-charges-header">
        <div className="header-content">
          <div className="header-info">
            <Settings className="header-icon" />
            <div className="header-text">
              <h1 className="page-title">Hardware Charges</h1>
              <p className="page-subtitle">
                Manage brand-specific hardware charges across different cabinet types
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hardware-charges-content">
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
                <p className="stat-label">Matrix Coverage</p>
                <h3 className="stat-value">{stats.matrixCoverage}%</h3>
              </div>
              <div className="stat-icon stat-icon-red">
                <Grid3X3 className="icon" />
              </div>
            </div>
            <div className="stat-footer">
              {stats.filledCells} of {stats.totalPossibleCells} cells filled
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Total Brands</p>
                <h3 className="stat-value">{brands.length}</h3>
              </div>
              <div className="stat-icon stat-icon-green">
                <Package className="icon" />
              </div>
            </div>
            <div className="stat-footer">
              {brandCategoryStats.premium || 0} premium • {brandCategoryStats.standard || 0} standard • {brandCategoryStats.economy || 0} economy
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Cabinet Types</p>
                <h3 className="stat-value">{cabinetTypes.length}</h3>
              </div>
              <div className="stat-icon stat-icon-blue">
                <Target className="icon" />
              </div>
            </div>
            <div className="stat-footer">
              Across BASE, WALL, TALL, SPECIAL categories
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Avg. Charge</p>
                <h3 className="stat-value">{formatCurrency(stats.averageCharge)}</h3>
              </div>
              <div className="stat-icon stat-icon-purple">
                <DollarSign className="icon" />
              </div>
            </div>
            <div className="stat-footer">
              Range: {formatCurrency(stats.priceRange.min)} - {formatCurrency(stats.priceRange.max)}
            </div>
          </div>
        </div>

        {/* Brand Overview */}
        <div className="brand-overview">
          <div className="overview-header">
            <h3>Brand Portfolio</h3>
            <p>Hardware brands available for cabinet configurations</p>
          </div>
          
          <div className="brands-grid">
            {brands.map(brand => {
              const brandCharges = Object.keys(matrixData).reduce((count, ctId) => 
                count + (matrixData[ctId][brand.id] ? 1 : 0), 0
              );
              const brandCoverage = cabinetTypes.length > 0 
                ? Math.round((brandCharges / cabinetTypes.length) * 100)
                : 0;

              return (
                <div key={brand.id} className={`brand-overview-card ${brand.category}`}>
                  <div className="brand-overview-header">
                    <div className="brand-icon-wrapper">
                   
                    </div>
                    <div className="brand-overview-info">
                      <h4 className="brand-overview-name">{brand.name}</h4>
                      <p className="brand-overview-category">{brand.category}</p>
                    </div>
                  </div>
                  
                  <div className="brand-overview-content">
                    <p className="brand-overview-desc">{brand.description}</p>
                    
                    <div className="brand-stats">
                      <div className="brand-stat">
                        <span className="brand-stat-value">{brandCharges}</span>
                        <span className="brand-stat-label">Configurations</span>
                      </div>
                      <div className="brand-stat">
                        <span className="brand-stat-value">{brandCoverage}%</span>
                        <span className="brand-stat-label">Coverage</span>
                      </div>
                    </div>

                    <div className="brand-coverage-bar">
                      <div 
                        className="coverage-fill"
                        style={{ width: `${brandCoverage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrix Insights */}
        <div className="matrix-insights">
          <div className="insights-card">
            <div className="insights-header">
              <div className="insights-title-section">
                <Zap className="insights-icon" />
                <div>
                  <h3>Matrix Insights</h3>
                  <p>Analysis of hardware charge distribution and coverage</p>
                </div>
              </div>
            </div>
            
            <div className="insights-content">
              <div className="insights-grid">
                <div className="insight-item">
                  <div className="insight-metric">
                    <span className="metric-value">{stats.filledCells}</span>
                    <span className="metric-label">Filled Cells</span>
                  </div>
                  <div className="insight-description">
                    Active hardware charge configurations
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-metric">
                    <span className="metric-value">{stats.totalPossibleCells - stats.filledCells}</span>
                    <span className="metric-label">Empty Cells</span>
                  </div>
                  <div className="insight-description">
                    Missing configurations requiring attention
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-metric">
                    <span className="metric-value">{Math.round(stats.averageCharge)}</span>
                    <span className="metric-label">Avg. ₹/Unit</span>
                  </div>
                  <div className="insight-description">
                    Average charge across all configurations
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-metric">
                    <span className="metric-value">{stats.matrixCoverage}%</span>
                    <span className="metric-label">Completion</span>
                  </div>
                  <div className="insight-description">
                    Overall matrix completion percentage
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="completion-progress">
                <div className="progress-header">
                  <span className="progress-label">Matrix Completion Progress</span>
                  <span className="progress-percentage">{stats.matrixCoverage}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${stats.matrixCoverage}%` }}
                  />
                </div>
                <div className="progress-footer">
                  <span>{stats.filledCells} completed</span>
                  <span>{stats.totalPossibleCells - stats.filledCells} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Charges Matrix */}
        <HardwareMatrix
          matrixData={matrixData}
          brands={brands}
          cabinetTypes={cabinetTypes}
          loading={loading}
          onUpdateCell={handleUpdateCell}
          onCopyCharges={handleCopyCharges}
          onExport={handleExport}
          onImport={handleImport}
          isCellSaving={isCellSaving}
          formatCurrency={formatCurrency}
          getBrandById={getBrandById}
          getCabinetTypeById={getCabinetTypeById}
        />
      </div>

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

export default HardwareChargesPage;