import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  X, 
  Copy, 
  RefreshCw, 
  Download, 
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import './HardwareMatrix.css';

const HardwareMatrix = ({ 
  matrixData = {},
  brands = [], 
  cabinetTypes = [],
  loading = false,
  onUpdateCell,
  onCopyCharges,
  onExport,
  onImport,
  isCellSaving,
  formatCurrency,
  getBrandById,
  getCabinetTypeById
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCells, setSelectedCells] = useState([]);
  const [notification, setNotification] = useState(null);

  // Handle cell edit start
  const handleCellEditStart = (cabinetTypeId, brandId) => {
    const cellValue = matrixData[cabinetTypeId]?.[brandId]?.standard_accessory_charge || '';
    setEditingCell(`${cabinetTypeId}-${brandId}`);
    setEditValue(cellValue);
  };

  // Handle cell edit save
  const handleCellEditSave = async (cabinetTypeId, brandId) => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      showNotification('error', 'Please enter a valid number');
      return;
    }

    try {
      const result = await onUpdateCell(cabinetTypeId, brandId, {
        standard_accessory_charge: parseFloat(editValue),
        effective_from: new Date().toISOString().split('T')[0],
        is_active: true
      });

      if (result.success) {
        setEditingCell(null);
        setEditValue('');
        showNotification('success', 'Charge updated successfully');
      } else {
        showNotification('error', result.error || 'Failed to update charge');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update charge');
    }
  };

  // Handle cell edit cancel
  const handleCellEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle key press in edit mode
  const handleKeyPress = (e, cabinetTypeId, brandId) => {
    if (e.key === 'Enter') {
      handleCellEditSave(cabinetTypeId, brandId);
    } else if (e.key === 'Escape') {
      handleCellEditCancel();
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle cell selection
  const handleCellSelect = (cabinetTypeId, brandId, isCtrlPressed = false) => {
    const cellKey = `${cabinetTypeId}-${brandId}`;
    
    if (isCtrlPressed) {
      setSelectedCells(prev => 
        prev.includes(cellKey) 
          ? prev.filter(key => key !== cellKey)
          : [...prev, cellKey]
      );
    } else {
      setSelectedCells([cellKey]);
    }
  };

  // Handle copy charges
  const handleCopyCharges = async () => {
    if (selectedCells.length === 0) {
      showNotification('error', 'Please select cells to copy');
      return;
    }

    const sourceCellKey = selectedCells[0];
    const [sourceCabinetType] = sourceCellKey.split('-');
    
    const targetCabinetTypes = [...new Set(
      selectedCells
        .filter(key => key !== sourceCellKey)
        .map(key => key.split('-')[0])
    )];

    if (targetCabinetTypes.length === 0) {
      showNotification('error', 'Please select target cells');
      return;
    }

    try {
      const result = await onCopyCharges(sourceCabinetType, targetCabinetTypes);
      if (result.success) {
        showNotification('success', `Charges copied to ${targetCabinetTypes.length} cabinet types`);
        setSelectedCells([]);
      } else {
        showNotification('error', result.error || 'Failed to copy charges');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to copy charges');
    }
  };

  // Get cell status
  const getCellStatus = (cabinetTypeId, brandId) => {
    const cellData = matrixData[cabinetTypeId]?.[brandId];
    if (!cellData) return 'empty';
    if (!cellData.is_active) return 'inactive';
    
    const effectiveFrom = new Date(cellData.effective_from);
    const today = new Date();
    
    if (effectiveFrom > today) return 'future';
    if (cellData.effective_to && new Date(cellData.effective_to) < today) return 'expired';
    
    return 'active';
  };

  // Get cell class names
  const getCellClassName = (cabinetTypeId, brandId) => {
    const cellKey = `${cabinetTypeId}-${brandId}`;
    const status = getCellStatus(cabinetTypeId, brandId);
    const isEditing = editingCell === cellKey;
    const isSelected = selectedCells.includes(cellKey);
    const isSaving = isCellSaving(cabinetTypeId, brandId);
    
    return `matrix-cell ${status} ${isEditing ? 'editing' : ''} ${isSelected ? 'selected' : ''} ${isSaving ? 'saving' : ''}`;
  };

  // Render cell content
  const renderCellContent = (cabinetTypeId, brandId) => {
    const cellKey = `${cabinetTypeId}-${brandId}`;
    const cellData = matrixData[cabinetTypeId]?.[brandId];
    const isEditing = editingCell === cellKey;
    const isSaving = isCellSaving(cabinetTypeId, brandId);

    if (isSaving) {
      return (
        <div className="cell-saving">
          <Loader2 className="saving-spinner" />
          <span>Saving...</span>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="cell-editor">
          <input
            type="number"
            step="0.01"
            className="cell-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, cabinetTypeId, brandId)}
            onBlur={() => handleCellEditSave(cabinetTypeId, brandId)}
            autoFocus
          />
          <div className="cell-actions">
            <button
              onClick={() => handleCellEditSave(cabinetTypeId, brandId)}
              className="cell-action-btn save"
              title="Save"
            >
              <Save className="action-icon" />
            </button>
            <button
              onClick={handleCellEditCancel}
              className="cell-action-btn cancel"
              title="Cancel"
            >
              <X className="action-icon" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="cell-content"
        onClick={() => handleCellEditStart(cabinetTypeId, brandId)}
      >
        {cellData ? (
          <div className="cell-value">
            <span className="charge-amount">
              {formatCurrency(cellData.standard_accessory_charge)}
            </span>
            {cellData.effective_from && (
              <span className="cell-date">
                From: {new Date(cellData.effective_from).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        ) : (
          <div className="cell-empty">
            <span className="empty-text">Click to add</span>
          </div>
        )}
      </div>
    );
  };

  // Get brand category color
  const getBrandCategoryColor = (brand) => {
    const colors = {
      premium: '#dc2626',  // Red
      standard: '#059669', // Green  
      economy: '#2563eb'   // Blue
    };
    return colors[brand?.category] || colors.standard;
  };

  if (loading && Object.keys(matrixData).length === 0) {
    return (
      <div className="matrix-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading hardware charges matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hardware-matrix-container">
      {/* Matrix Header */}
      <div className="matrix-header">
        <div className="matrix-title-section">
          <h3 className="matrix-title">Hardware Charges Matrix</h3>
          <p className="matrix-subtitle">
            Cabinet Types × Brand Charges • Click cells to edit • Ctrl+Click to select multiple
          </p>
        </div>
        
        <div className="matrix-actions">
          {selectedCells.length > 0 && (
            <button
              onClick={handleCopyCharges}
              className="matrix-action-btn copy"
              disabled={loading}
            >
              <Copy className="action-icon" />
              Copy Charges ({selectedCells.length})
            </button>
          )}
  
       
        </div>
      </div>

      {/* Matrix Table */}
      <div className="matrix-table-container">
        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            {/* Table Header */}
            <thead className="matrix-table-head">
              <tr>
                <th className="matrix-header-cell cabinet-type-header">
                  <div className="header-content">
                    {/* <Target className="header-icon" /> */}
                    <span>Cabinet Types</span>
                  </div>
                </th>
                {brands.map(brand => (
                  <th key={brand.id} className="matrix-header-cell brand-header">
                    <div 
                      className="brand-header-content"
                      style={{ borderTopColor: getBrandCategoryColor(brand) }}
                    >
                      <div className="brand-info">
                        <div className="brand-name">{brand.name}</div>
                        <div className="brand-category">{brand.category}</div>
                      </div>
                      <div className="brand-description">{brand.description}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="matrix-table-body">
              {cabinetTypes.map(cabinetType => (
                <tr key={cabinetType.id} className="matrix-row">
                  {/* Cabinet Type Header Cell */}
                  <td className="matrix-row-header">
                    <div className="cabinet-type-info">
                      <div className="cabinet-type-name">{cabinetType.name}</div>
                      <div className="cabinet-type-category">{cabinetType.category}</div>
                      <div className="cabinet-type-depth">
                        Depth: {cabinetType.default_depth}"
                      </div>
                    </div>
                  </td>

                  {/* Matrix Data Cells */}
                  {brands.map(brand => (
                    <td 
                      key={`${cabinetType.id}-${brand.id}`}
                      className={getCellClassName(cabinetType.id, brand.id)}
                      onClick={(e) => handleCellSelect(cabinetType.id, brand.id, e.ctrlKey)}
                    >
                      {renderCellContent(cabinetType.id, brand.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matrix Legend */}
      <div className="matrix-legend">
        <div className="legend-title">Status Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color active"></div>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-color inactive"></div>
            <span>Inactive</span>
          </div>
          <div className="legend-item">
            <div className="legend-color future"></div>
            <span>Future</span>
          </div>
          <div className="legend-item">
            <div className="legend-color expired"></div>
            <span>Expired</span>
          </div>
          <div className="legend-item">
            <div className="legend-color empty"></div>
            <span>Empty</span>
          </div>
        </div>
      </div>

      {/* Matrix Statistics */}
      <div className="matrix-stats">
        <div className="stat-group">
          <DollarSign className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Total Cells</span>
            <span className="stat-value">{cabinetTypes.length * brands.length}</span>
          </div>
        </div>
        <div className="stat-group">
          <CheckCircle className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Filled</span>
            <span className="stat-value">
              {Object.keys(matrixData).reduce((count, ctId) => 
                count + Object.keys(matrixData[ctId] || {}).length, 0
              )}
            </span>
          </div>
        </div>
        <div className="stat-group">
          <TrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Coverage</span>
            <span className="stat-value">
              {Math.round(
                (Object.keys(matrixData).reduce((count, ctId) => 
                  count + Object.keys(matrixData[ctId] || {}).length, 0
                ) / (cabinetTypes.length * brands.length || 1)) * 100
              )}%
            </span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <CheckCircle className="notification-icon" />}
            {notification.type === 'error' && <AlertCircle className="notification-icon" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HardwareMatrix;