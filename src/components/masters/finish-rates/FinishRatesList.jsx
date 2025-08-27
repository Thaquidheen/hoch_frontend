import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import './FinishRatesList.css';

const FinishRatesList = ({ 
  finishRates = [], 
  materials = [],
  loading = false, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onSearch,
  onFilter,
  onBulkUpdate,
  onExport,
  onViewHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState('');
  const [selectedRates, setSelectedRates] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'

  // Filter finish rates based on search and filters
  const filteredRates = finishRates.filter(rate => {
    const materialName = rate.material_detail?.name || '';
    const matchesSearch = materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rate.unit_rate.toString().includes(searchTerm);
    const matchesMaterial = !selectedMaterial || rate.material.toString() === selectedMaterial;
    const matchesBudgetTier = !selectedBudgetTier || rate.budget_tier === selectedBudgetTier;
    const matchesStatus = showInactive || rate.is_active;
    
    return matchesSearch && matchesMaterial && matchesBudgetTier && matchesStatus;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleMaterialFilter = (materialId) => {
    setSelectedMaterial(materialId);
    onFilter?.({ material: materialId });
  };

  const handleBudgetTierFilter = (tier) => {
    setSelectedBudgetTier(tier);
    onFilter?.({ budget_tier: tier });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRates(filteredRates.map(r => r.id));
    } else {
      setSelectedRates([]);
    }
  };

  const handleSelectRate = (id, checked) => {
    if (checked) {
      setSelectedRates(prev => [...prev, id]);
    } else {
      setSelectedRates(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const getBudgetTierClass = (tier) => {
    return tier === 'LUXURY' ? 'budget-tier-luxury' : 'budget-tier-economy';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isRateExpired = (rate) => {
    if (!rate.effective_to) return false;
    return new Date(rate.effective_to) < new Date();
  };

  const isRateFuture = (rate) => {
    return new Date(rate.effective_from) > new Date();
  };

  if (loading) {
    return (
      <div className="finish-rates-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading finish rates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="finish-rates-list-container">
      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="search-filter-row">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by material or price..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Material Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedMaterial}
                onChange={(e) => handleMaterialFilter(e.target.value)}
              >
                <option value="">All Materials</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Budget Tier Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedBudgetTier}
                onChange={(e) => handleBudgetTierFilter(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="LUXURY">Luxury</option>
                <option value="ECONOMY">Economy</option>
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Show Inactive Toggle */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`toggle-inactive ${showInactive ? 'active' : ''}`}
            >
              {showInactive ? <Eye className="toggle-icon" /> : <EyeOff className="toggle-icon" />}
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={onBulkUpdate} className="action-btn">
              <TrendingUp className="action-icon" />
              Bulk Update
            </button>
            <button onClick={onExport} className="action-btn">
              <Download className="action-icon" />
              Export
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-text">
            Showing {filteredRates.length} of {finishRates.length} finish rates
          </span>
          {selectedRates.length > 0 && (
            <span className="selected-text">
              {selectedRates.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Finish Rates Table */}
      <div className="finish-rates-table-container">
        <div className="table-wrapper">
          <table className="finish-rates-table">
            <thead className="table-header">
              <tr>
                <th className="table-th">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedRates.length === filteredRates.length && filteredRates.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="table-th">Material</th>
                <th className="table-th">Budget Tier</th>
                <th className="table-th">Unit Rate</th>
                <th className="table-th">Effective From</th>
                <th className="table-th">Effective To</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-content">
                      <DollarSign className="empty-icon" />
                      <p className="empty-title">No finish rates found</p>
                      <p className="empty-subtitle">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr 
                    key={rate.id} 
                    className={`table-row ${!rate.is_active ? 'inactive' : ''} ${isRateExpired(rate) ? 'expired' : ''} ${isRateFuture(rate) ? 'future' : ''}`}
                  >
                    <td className="table-td">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedRates.includes(rate.id)}
                        onChange={(e) => handleSelectRate(rate.id, e.target.checked)}
                      />
                    </td>
                    <td className="table-td">
                      <div className="material-info">
                        <div className="material-name">
                          {rate.material_detail?.name || 'Unknown Material'}
                        </div>
                        <div className="material-role">
                          Role: {rate.material_detail?.role || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`budget-tier-badge ${getBudgetTierClass(rate.budget_tier)}`}>
                        {rate.budget_tier}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="rate-info">
                        <div className="rate-amount">
                          {formatCurrency(rate.unit_rate)}
                        </div>
                        <div className="rate-unit">per sq.ft</div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="date-info">
                        <Calendar className="date-icon" />
                        <span>{formatDate(rate.effective_from)}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      {rate.effective_to ? (
                        <div className="date-info">
                          <Calendar className="date-icon" />
                          <span>{formatDate(rate.effective_to)}</span>
                        </div>
                      ) : (
                        <span className="no-end-date">No end date</span>
                      )}
                    </td>
                    <td className="table-td">
                      <button
                        onClick={() => onToggleStatus?.(rate.id, !rate.is_active)}
                        className="status-toggle"
                      >
                        <span className={`status-badge ${rate.is_active ? 'active' : 'inactive'}`}>
                          {rate.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                      {isRateExpired(rate) && (
                        <span className="rate-status expired">Expired</span>
                      )}
                      {isRateFuture(rate) && (
                        <span className="rate-status future">Future</span>
                      )}
                    </td>
                    <td className="table-td">
                      <div className="action-buttons-cell">
                        <button
                          onClick={() => onViewHistory?.(rate.material)}
                          className="action-button history"
                          title="View price history"
                        >
                          <TrendingUp className="action-icon" />
                        </button>
                        <button
                          onClick={() => onEdit?.(rate)}
                          className="action-button edit"
                          title="Edit finish rate"
                        >
                          <Edit3 className="action-icon" />
                        </button>
                        <button
                          onClick={() => onDelete?.(rate.id)}
                          className="action-button delete"
                          title="Delete finish rate"
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

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Active Rates:</span>
          <span className="stat-value">{finishRates.filter(r => r.is_active).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Luxury Rates:</span>
          <span className="stat-value">{finishRates.filter(r => r.budget_tier === 'LUXURY').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Economy Rates:</span>
          <span className="stat-value">{finishRates.filter(r => r.budget_tier === 'ECONOMY').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Materials:</span>
          <span className="stat-value">{new Set(finishRates.map(r => r.material)).size}</span>
        </div>
      </div>

      {/* Pagination */}
      {finishRates.length > 20 && (
        <div className="pagination-container">
          <div className="pagination-content">
            <div className="pagination-info">
              Showing 1-20 of {finishRates.length} results
            </div>
            <div className="pagination-buttons">
              <button className="pagination-btn">Previous</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishRatesList;