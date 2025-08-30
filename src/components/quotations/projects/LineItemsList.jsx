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
        return scope === 'OPEN' ? 'line-items-list-scope-open' : 'line-items-list-scope-working';
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
            <div className="line-items-list-loading">
                <div className="line-items-list-loading-content">
                    <RefreshCw className="line-items-list-loading-icon" />
                    <span>Loading line items...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="line-items-list-container">
            {/* Search and Filter Bar */}
            <div className="line-items-list-search-filter-section">
                <div className="line-items-list-search-filter-content">
                    <div className="line-items-list-search-filter-row">
                        {/* Search Input */}
                        <div className="line-items-list-search-input-container">
                            <Search className="line-items-list-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by cabinet type, materials, dimensions..."
                                className="line-items-list-search-input"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Scope Filter */}
                        <div className="line-items-list-filter-container">
                            <select
                                className="line-items-list-filter-select"
                                value={selectedScope}
                                onChange={(e) => handleScopeFilter(e.target.value)}
                            >
                                <option value="">All Scopes</option>
                                <option value="OPEN">Open Kitchen</option>
                                <option value="WORKING">Working Kitchen</option>
                            </select>
                            <Filter className="line-items-list-filter-icon" />
                        </div>

                        {/* Cabinet Type Filter */}
                        <div className="line-items-list-filter-container">
                            <select
                                className="line-items-list-filter-select"
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
                            <Filter className="line-items-list-filter-icon" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="line-items-list-action-buttons">
                        <button onClick={onAddNew} className="line-items-list-action-btn line-items-list-primary">
                            <Plus className="line-items-list-action-icon" />
                            Add Line Item
                        </button>
                        {selectedLineItems.length > 0 && (
                            <button onClick={handleBatchCompute} className="line-items-list-action-btn line-items-list-secondary">
                                <Calculator className="line-items-list-action-icon" />
                                Recalculate Selected ({selectedLineItems.length})
                            </button>
                        )}
                        <button onClick={onExport} className="line-items-list-action-btn">
                            <Download className="line-items-list-action-icon" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="line-items-list-results-summary">
                    <span className="line-items-list-results-text">
                        Showing {filteredLineItems.length} of {lineItems.length} line items
                    </span>
                    {selectedLineItems.length > 0 && (
                        <span className="line-items-list-selected-text">
                            {selectedLineItems.length} selected
                        </span>
                    )}
                </div>
            </div>

            {/* Line Items Table */}
            <div className="line-items-list-table-container">
                <div className="line-items-list-table-wrapper">
                    <table className="line-items-list-table">
                        <thead className="line-items-list-table-header">
                            <tr>
                                <th className="line-items-list-table-th">
                                    <input
                                        type="checkbox"
                                        className="line-items-list-table-checkbox"
                                        checked={selectedLineItems.length === filteredLineItems.length && filteredLineItems.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="line-items-list-table-th">Cabinet Type</th>
                                <th className="line-items-list-table-th">Dimensions</th>
                                <th className="line-items-list-table-th">Materials</th>
                                <th className="line-items-list-table-th">Area (sq.ft)</th>
                                <th className="line-items-list-table-th">Scope</th>
                                <th className="line-items-list-table-th">Pricing Breakdown</th>
                                <th className="line-items-list-table-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="line-items-list-table-body">
                            {filteredLineItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="line-items-list-empty-state">
                                        <div className="line-items-list-empty-content">
                                            <Package className="line-items-list-empty-icon" />
                                            <p className="line-items-list-empty-title">No line items found</p>
                                            <p className="line-items-list-empty-subtitle">
                                                {lineItems.length === 0
                                                    ? "Add cabinet line items to start building your quotation"
                                                    : "Try adjusting your search or filters"
                                                }
                                            </p>
                                            {lineItems.length === 0 && (
                                                <button onClick={onAddNew} className="line-items-list-empty-action-btn">
                                                    <Plus className="line-items-list-btn-icon" />
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
                                        className={`line-items-list-table-row ${calculating[item.id] ? 'line-items-list-calculating' : ''}`}
                                    >
                                        <td className="line-items-list-table-td">
                                            <input
                                                type="checkbox"
                                                className="line-items-list-table-checkbox"
                                                checked={selectedLineItems.includes(item.id)}
                                                onChange={(e) => handleSelectLineItem(item.id, e.target.checked)}
                                            />
                                        </td>
                                        
                                        <td className="line-items-list-table-td">
                                            <div className="line-items-list-cabinet-type-info">
                                                <div className="line-items-list-cabinet-type-name">
                                                    {item.cabinet_type_detail?.name || 'Unknown Type'}
                                                </div>
                                                <div className="line-items-list-cabinet-qty">
                                                    <Hash className="line-items-list-qty-icon" />
                                                    {item.qty} pc{item.qty > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="line-items-list-table-td">
                                            <div className="line-items-list-dimensions-info">
                                                <Ruler className="line-items-list-dimensions-icon" />
                                                <div className="line-items-list-dimensions-details">
                                                    <div className="line-items-list-dimensions-text">
                                                        {formatDimensions(item.width_mm, item.depth_mm, item.height_mm)}
                                                    </div>
                                                    <div className="line-items-list-dimensions-note">
                                                        W×D×H
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="line-items-list-table-td">
                                            <div className="line-items-list-materials-info">
                                                <div className="line-items-list-material-item">
                                                    <Layers className="line-items-list-material-icon line-items-list-cabinet" />
                                                    <div className="line-items-list-material-details">
                                                        <span className="line-items-list-material-label">Cabinet:</span>
                                                        <span className="line-items-list-material-name">
                                                            {item.cabinet_material_detail?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="line-items-list-material-item">
                                                    <Layers className="line-items-list-material-icon line-items-list-door" />
                                                    <div className="line-items-list-material-details">
                                                        <span className="line-items-list-material-label">Door:</span>
                                                        <span className="line-items-list-material-name">
                                                            {item.door_material_detail?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="line-items-list-table-td">
                                            <div className="line-items-list-area-info">
                                                <div className="line-items-list-area-item">
                                                    <span className="line-items-list-area-label">Cabinet:</span>
                                                    <span className="line-items-list-area-value">
                                                        {formatSquareFeet(item.computed_cabinet_sqft)}
                                                    </span>
                                                </div>
                                                <div className="line-items-list-area-item">
                                                    <span className="line-items-list-area-label">Door:</span>
                                                    <span className="line-items-list-area-value">
                                                        {formatSquareFeet(item.computed_door_sqft)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="line-items-list-table-td">
                                            <span className={`line-items-list-scope-badge ${getScopeClass(item.scope)}`}>
                                                {item.scope === 'OPEN' ? 'Open Kitchen' : 'Working Kitchen'}
                                            </span>
                                        </td>

                                        <td className="line-items-list-table-td">
                                            <div className="line-items-list-pricing-breakdown">
                                                <div className="line-items-list-price-item">
                                                    <span className="line-items-list-price-label">Cabinet:</span>
                                                    <span className="line-items-list-price-value">
                                                        {formatCurrency(item.cabinet_material_price)}
                                                    </span>
                                                </div>
                                                <div className="line-items-list-price-item line-items-list-door-price">
                                                    <span className="line-items-list-price-label">Door:</span>
                                                    <span className="line-items-list-price-value">
                                                        {formatCurrency(item.door_price)}
                                                    </span>
                                                </div>
                                                {(parseFloat(item.standard_accessory_charge) > 0) && (
                                                    <div className="line-items-list-price-item">
                                                        <span className="line-items-list-price-label">Base Acc:</span>
                                                        <span className="line-items-list-price-value">
                                                            {formatCurrency(item.standard_accessory_charge)}
                                                        </span>
                                                    </div>
                                                )}
                                                {(parseFloat(item.top_price) > 0) && (
                                                    <div className="line-items-list-price-item">
                                                        <span className="line-items-list-price-label">Top:</span>
                                                        <span className="line-items-list-price-value">
                                                            {formatCurrency(item.top_price)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="line-items-list-price-item line-items-list-total-price">
                                                    <span className="line-items-list-price-label">Total:</span>
                                                    <span className="line-items-list-price-value">
                                                        {formatCurrency(item.line_total_before_tax)}
                                                    </span>
                                                </div>
                                                {calculating[item.id] && (
                                                    <div className="line-items-list-calculating-indicator">
                                                        <RefreshCw className="line-items-list-calculating-icon" />
                                                        Calculating...
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="line-items-list-table-td">
                                            <div className="line-items-list-action-buttons-cell">
                                                <button
                                                    onClick={() => onCompute?.(item.id)}
                                                    className="line-items-list-action-button line-items-list-compute"
                                                    title="Recalculate pricing"
                                                    disabled={calculating[item.id]}
                                                >
                                                    <Calculator className="line-items-list-action-icon" />
                                                </button>
                                                <button
                                                    onClick={() => onDuplicate?.(item.id)}
                                                    className="line-items-list-action-button line-items-list-duplicate"
                                                    title="Duplicate line item"
                                                >
                                                    <Copy className="line-items-list-action-icon" />
                                                </button>
                                                <button
                                                    onClick={() => onEdit?.(item)}
                                                    className="line-items-list-action-button line-items-list-edit"
                                                    title="Edit line item"
                                                >
                                                    <Edit3 className="line-items-list-action-icon" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(item.id)}
                                                    className="line-items-list-action-button line-items-list-delete"
                                                    title="Delete line item"
                                                >
                                                    <Trash2 className="line-items-list-action-icon" />
                                                </button>
                                                <button className="line-items-list-action-button line-items-list-more">
                                                    <MoreVertical className="line-items-list-action-icon" />
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
                <div className="line-items-list-totals-summary">
                    <div className="line-items-list-totals-grid">
                        <div className="line-items-list-total-item">
                            <DollarSign className="line-items-list-total-icon" />
                            <div className="line-items-list-total-content">
                                <span className="line-items-list-total-label">Total Value</span>
                                <span className="line-items-list-total-value">{formatCurrency(totals.totalValue)}</span>
                            </div>
                        </div>
                        <div className="line-items-list-total-item">
                            <Package className="line-items-list-total-icon" />
                            <div className="line-items-list-total-content">
                                <span className="line-items-list-total-label">Total Items</span>
                                <span className="line-items-list-total-value">{totals.totalQty} pcs</span>
                            </div>
                        </div>
                        <div className="line-items-list-total-item">
                            <Layers className="line-items-list-total-icon line-items-list-cabinet" />
                            <div className="line-items-list-total-content">
                                <span className="line-items-list-total-label">Cabinet Price</span>
                                <span className="line-items-list-total-value">{formatCurrency(totals.totalCabinetPrice)}</span>
                            </div>
                        </div>
                        <div className="line-items-list-total-item">
                            <Layers className="line-items-list-total-icon line-items-list-door" />
                            <div className="line-items-list-total-content">
                                <span className="line-items-list-total-label">Door Price</span>
                                <span className="line-items-list-total-value">{formatCurrency(totals.totalDoorPrice)}</span>
                            </div>
                        </div>
                        <div className="line-items-list-total-item">
                            <Layers className="line-items-list-total-icon" />
                            <div className="line-items-list-total-content">
                                <span className="line-items-list-total-label">Cabinet Area</span>
                                <span className="line-items-list-total-value">{formatSquareFeet(totals.totalCabinetSqft)}</span>
                            </div>
                        </div>
                        <div className="line-items-list-total-item">
                            <Layers className="line-items-list-total-icon" />
                            <div className="line-items-list-total-content">
                                <span className="line-items-list-total-label">Door Area</span>
                                <span className="line-items-list-total-value">{formatSquareFeet(totals.totalDoorSqft)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="line-items-list-totals-note">
                        Values shown are before margin and taxes
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineItemsList;