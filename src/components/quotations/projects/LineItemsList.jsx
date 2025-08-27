import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  RefreshCw,
  Download,
  Copy,
  Calculator,
  Ruler,
  Package,
  Layers,
  DollarSign,
  Hash,
  AlertCircle
} from 'lucide-react';
import './LineItemsList.css';

const LineItemsList = ({ 
  lineItems = [], 
  cabinetTypes = [],
  materials = [],
  loading = false,
  calculating = {},
  onEdit, 
  onDelete, 
  onDuplicate,
  onCompute,
  onBatchCompute,
  onSearch,
  onFilter,
  onExport,
  onAddNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScope, setSelectedScope] = useState('');
  const [selectedCabinetType, setSelectedCabinetType] = useState('');
  const [selectedLineItems, setSelectedLineItems] = useState([]);

  // Filter line items based on search and filters
  const filteredLineItems = lineItems.filter(item => {
    const cabinetTypeName = item.cabinet_type_detail?.name || '';
    const cabinetMaterialName = item.cabinet_material_detail?.name || '';
    const doorMaterialName = item.door_material_detail?.name || '';
    const dimensions = `${item.width_mm}×${item.depth_mm}×${item.height_mm}`;
    
    const matchesSearch = cabinetTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cabinetMaterialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doorMaterialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dimensions.includes(searchTerm) ||
                         item.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScope = !selectedScope || item.scope === selectedScope;
    const matchesCabinetType = !selectedCabinetType || item.cabinet_type.toString() === selectedCabinetType;
    
    return matchesSearch && matchesScope && matchesCabinetType;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleScopeFilter = (scope) => {
    setSelectedScope(scope);
    onFilter?.({ scope: scope });
  };

  const handleCabinetTypeFilter = (cabinetTypeId) => {
    setSelectedCabinetType(cabinetTypeId);
    onFilter?.({ cabinet_type: cabinetTypeId });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLineItems(filteredLineItems.map(item => item.id));
    } else {
      setSelectedLineItems([]);
    }
  };

  const handleSelectLineItem = (id, checked) => {
    if (checked) {
      setSelectedLineItems(prev => [...prev, id]);
    } else {
      setSelectedLineItems(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBatchCompute = () => {
    if (selectedLineItems.length > 0) {
      onBatchCompute?.(selectedLineItems);
    }
  };

  const getScopeClass = (scope) => {
    return scope === 'OPEN' ? 'scope-open' : 'scope-working';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDimensions = (width, depth, height) => {
    return `${width}×${depth}×${height}mm`;
  };

  const formatSquareFeet = (sqft) => {
    return `${parseFloat(sqft || 0).toFixed(2)} sq.ft`;
  };

  // Calculate totals
  const calculateTotals = () => {
    return filteredLineItems.reduce((totals, item) => {
      return {
        totalValue: totals.totalValue + (parseFloat(item.line_total_before_tax) || 0),
        totalCabinetPrice: totals.totalCabinetPrice + (parseFloat(item.cabinet_material_price) || 0),
        totalDoorPrice: totals.totalDoorPrice + (parseFloat(item.door_price) || 0),
        totalCabinetSqft: totals.totalCabinetSqft + (parseFloat(item.computed_cabinet_sqft) || 0),
        totalDoorSqft: totals.totalDoorSqft + (parseFloat(item.computed_door_sqft) || 0),
        totalQty: totals.totalQty + (parseInt(item.qty) || 0)
      };
    }, { 
      totalValue: 0, 
      totalCabinetPrice: 0, 
      totalDoorPrice: 0, 
      totalCabinetSqft: 0, 
      totalDoorSqft: 0, 
      totalQty: 0 
    });
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="line-items-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading line items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="line-items-list-container">
      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="search-filter-row">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by cabinet type, materials, dimensions..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Scope Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedScope}
                onChange={(e) => handleScopeFilter(e.target.value)}
              >
                <option value="">All Scopes</option>
                <option value="OPEN">Open Kitchen</option>
                <option value="WORKING">Working Kitchen</option>
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Cabinet Type Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedCabinetType}
                onChange={(e) => handleCabinetTypeFilter(e.target.value)}
              >
                <option value="">All Cabinet Types</option>
                {cabinetTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <Filter className="filter-icon" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={onAddNew} className="action-btn primary">
              <Plus className="action-icon" />
              Add Line Item
            </button>
            {selectedLineItems.length > 0 && (
              <button onClick={handleBatchCompute} className="action-btn secondary">
                <Calculator className="action-icon" />
                Recalculate Selected ({selectedLineItems.length})
              </button>
            )}
            <button onClick={onExport} className="action-btn">
              <Download className="action-icon" />
              Export
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-text">
            Showing {filteredLineItems.length} of {lineItems.length} line items
          </span>
          {selectedLineItems.length > 0 && (
            <span className="selected-text">
              {selectedLineItems.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="line-items-table-container">
        <div className="table-wrapper">
          <table className="line-items-table">
            <thead className="table-header">
              <tr>
                <th className="table-th">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedLineItems.length === filteredLineItems.length && filteredLineItems.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="table-th">Cabinet Type</th>
                <th className="table-th">Dimensions</th>
                <th className="table-th">Materials</th>
                <th className="table-th">Area (sq.ft)</th>
                <th className="table-th">Scope</th>
                <th className="table-th">Pricing Breakdown</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredLineItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-content">
                      <Package className="empty-icon" />
                      <p className="empty-title">No line items found</p>
                      <p className="empty-subtitle">
                        {lineItems.length === 0 
                          ? "Add cabinet line items to start building your quotation"
                          : "Try adjusting your search or filters"
                        }
                      </p>
                      {lineItems.length === 0 && (
                        <button onClick={onAddNew} className="empty-action-btn">
                          <Plus className="btn-icon" />
                          Add First Line Item
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLineItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`table-row ${calculating[item.id] ? 'calculating' : ''}`}
                  >
                    <td className="table-td">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedLineItems.includes(item.id)}
                        onChange={(e) => handleSelectLineItem(item.id, e.target.checked)}
                      />
                    </td>
                    
                    <td className="table-td">
                      <div className="cabinet-type-info">
                        <div className="cabinet-type-name">
                          {item.cabinet_type_detail?.name || 'Unknown Type'}
                        </div>
                        <div className="cabinet-qty">
                          <Hash className="qty-icon" />
                          {item.qty} pc{item.qty > 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>

                    <td className="table-td">
                      <div className="dimensions-info">
                        <Ruler className="dimensions-icon" />
                        <div className="dimensions-details">
                          <div className="dimensions-text">
                            {formatDimensions(item.width_mm, item.depth_mm, item.height_mm)}
                          </div>
                          <div className="dimensions-note">
                            W×D×H
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="table-td">
                      <div className="materials-info">
                        <div className="material-item">
                          <Layers className="material-icon cabinet" />
                          <div className="material-details">
                            <span className="material-label">Cabinet:</span>
                            <span className="material-name">
                              {item.cabinet_material_detail?.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="material-item">
                          <Layers className="material-icon door" />
                          <div className="material-details">
                            <span className="material-label">Door:</span>
                            <span className="material-name">
                              {item.door_material_detail?.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="table-td">
                      <div className="area-info">
                        <div className="area-item">
                          <span className="area-label">Cabinet:</span>
                          <span className="area-value">
                            {formatSquareFeet(item.computed_cabinet_sqft)}
                          </span>
                        </div>
                        <div className="area-item">
                          <span className="area-label">Door:</span>
                          <span className="area-value">
                            {formatSquareFeet(item.computed_door_sqft)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="table-td">
                      <span className={`scope-badge ${getScopeClass(item.scope)}`}>
                        {item.scope === 'OPEN' ? 'Open Kitchen' : 'Working Kitchen'}
                      </span>
                    </td>

                    <td className="table-td">
                      <div className="pricing-breakdown">
                        <div className="price-item">
                          <span className="price-label">Cabinet:</span>
                          <span className="price-value">
                            {formatCurrency(item.cabinet_material_price)}
                          </span>
                        </div>
                        <div className="price-item door-price">
                          <span className="price-label">Door:</span>
                          <span className="price-value">
                            {formatCurrency(item.door_price)}
                          </span>
                        </div>
                        {(parseFloat(item.standard_accessory_charge) > 0) && (
                          <div className="price-item">
                            <span className="price-label">Base Acc:</span>
                            <span className="price-value">
                              {formatCurrency(item.standard_accessory_charge)}
                            </span>
                          </div>
                        )}
                        {(parseFloat(item.top_price) > 0) && (
                          <div className="price-item">
                            <span className="price-label">Top:</span>
                            <span className="price-value">
                              {formatCurrency(item.top_price)}
                            </span>
                          </div>
                        )}
                        <div className="price-item total-price">
                          <span className="price-label">Total:</span>
                          <span className="price-value">
                            {formatCurrency(item.line_total_before_tax)}
                          </span>
                        </div>
                        {calculating[item.id] && (
                          <div className="calculating-indicator">
                            <RefreshCw className="calculating-icon" />
                            Calculating...
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="table-td">
                      <div className="action-buttons-cell">
                        <button
                          onClick={() => onCompute?.(item.id)}
                          className="action-button compute"
                          title="Recalculate pricing"
                          disabled={calculating[item.id]}
                        >
                          <Calculator className="action-icon" />
                        </button>
                        <button
                          onClick={() => onDuplicate?.(item.id)}
                          className="action-button duplicate"
                          title="Duplicate line item"
                        >
                          <Copy className="action-icon" />
                        </button>
                        <button
                          onClick={() => onEdit?.(item)}
                          className="action-button edit"
                          title="Edit line item"
                        >
                          <Edit3 className="action-icon" />
                        </button>
                        <button
                          onClick={() => onDelete?.(item.id)}
                          className="action-button delete"
                          title="Delete line item"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                        <button className="action-button more">
                          <MoreVertical className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Summary */}
      {filteredLineItems.length > 0 && (
        <div className="totals-summary">
          <div className="totals-grid">
            <div className="total-item">
              <DollarSign className="total-icon" />
              <div className="total-content">
                <span className="total-label">Total Value</span>
                <span className="total-value">{formatCurrency(totals.totalValue)}</span>
              </div>
            </div>
            <div className="total-item">
              <Package className="total-icon" />
              <div className="total-content">
                <span className="total-label">Total Items</span>
                <span className="total-value">{totals.totalQty} pcs</span>
              </div>
            </div>
            <div className="total-item">
              <Layers className="total-icon cabinet" />
              <div className="total-content">
                <span className="total-label">Cabinet Price</span>
                <span className="total-value">{formatCurrency(totals.totalCabinetPrice)}</span>
              </div>
            </div>
            <div className="total-item">
              <Layers className="total-icon door" />
              <div className="total-content">
                <span className="total-label">Door Price</span>
                <span className="total-value">{formatCurrency(totals.totalDoorPrice)}</span>
              </div>
            </div>
            <div className="total-item">
              <Layers className="total-icon" />
              <div className="total-content">
                <span className="total-label">Cabinet Area</span>
                <span className="total-value">{formatSquareFeet(totals.totalCabinetSqft)}</span>
              </div>
            </div>
            <div className="total-item">
              <Layers className="total-icon" />
              <div className="total-content">
                <span className="total-label">Door Area</span>
                <span className="total-value">{formatSquareFeet(totals.totalDoorSqft)}</span>
              </div>
            </div>
          </div>
          <div className="totals-note">
            Values shown are before margin and taxes
          </div>
        </div>
      )}
    </div>
  );
};

export default LineItemsList;