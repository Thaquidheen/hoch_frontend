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
  Copy,
  Grid3X3,
  List,
  Package,
  Ruler,
  Tag
} from 'lucide-react';
import './CabinetTypesList.css';

const CabinetTypesList = ({ 
  cabinetTypes = [], 
  categories = [],
  loading = false, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleStatus,
  onSearch,
  onFilter,
  onBulkUpdate,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Filter cabinet types based on search and filters
  const filteredTypes = cabinetTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // FIX: Convert both to numbers for comparison
    const matchesCategory = !selectedCategory || Number(type.category) === Number(selectedCategory);
    
    const matchesStatus = showInactive || type.is_active;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group filtered types by category
  const groupedTypes = filteredTypes.reduce((acc, type) => {
    const categoryId = type.category || 'UNCATEGORIZED';
    if (!acc[categoryId]) {
      const categoryInfo = categories.find(c => c.id === categoryId);
      acc[categoryId] = {
        category: categoryInfo || { id: categoryId, name: 'Uncategorized', description: '' },
        types: []
      };
    }
    acc[categoryId].types.push(type);
    return acc;
  }, {});

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleCategoryFilter = (categoryValue) => {
    // Convert to number if not empty string
    const categoryId = categoryValue === '' ? '' : Number(categoryValue);
    setSelectedCategory(categoryId);
    onFilter?.({ category: categoryId });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTypes(filteredTypes.map(t => t.id));
    } else {
      setSelectedTypes([]);
    }
  };

  const handleSelectType = (id, checked) => {
    if (checked) {
      setSelectedTypes(prev => [...prev, id]);
    } else {
      setSelectedTypes(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const formatDimensions = (depth) => {
    if (!depth) return 'Not specified';
    return `${depth}"`;
  };

  // Helper to get category name from category ID
const getCategoryName = (categoryId) => {
  // Handle null/undefined case
  if (categoryId === null || categoryId === undefined) {
    return 'Uncategorized';
  }
  
  // Find category by ID (not by value)
  const categoryObj = categories.find(c => {
    // Handle case where c.id might be null or undefined
    if (c.id === null || c.id === undefined) {
      return false;
    }
    // Compare IDs (both as numbers)
    return Number(c.id) === Number(categoryId);
  });
  
  // Return name property (not label)
  return categoryObj?.name || 'Uncategorized';
};

  if (loading) {
    return (
      <div className="cabinet-types-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading cabinet types...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cabinet-types-list-container">
      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="search-filter-row">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search cabinet types..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
          <div className="filter-container">
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
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

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                onClick={() => setViewMode('cards')}
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                title="Card view"
              >
                <Grid3X3 className="view-icon" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table view"
              >
                <List className="view-icon" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {selectedTypes.length > 0 && (
              <button 
                onClick={() => onBulkUpdate?.(selectedTypes)} 
                className="action-btn bulk"
              >
                <Package className="action-icon" />
                Bulk Actions ({selectedTypes.length})
              </button>
            )}
        
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-text">
            Showing {filteredTypes.length} of {cabinetTypes.length} cabinet types
          </span>
          {selectedTypes.length > 0 && (
            <span className="selected-text">
              {selectedTypes.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'cards' ? (
        /* Card View */
        <div className="cabinet-types-cards">
          {Object.keys(groupedTypes).length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <Package className="empty-icon" />
                <p className="empty-title">No cabinet types found</p>
                <p className="empty-subtitle">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            Object.entries(groupedTypes).map(([categoryKey, { category, types }]) => (
              <div key={categoryKey} className="category-section">
                {/* Category Header */}
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-details">
                      <h3 className="category-title">{getCategoryName(category.id)}</h3>  {/* Use id */}
                      <p className="category-description">{category.description}</p>
                    </div>
                  </div>
                  <div className="category-stats">
                    <span className="types-count">{types.length} types</span>
                  </div>
                </div>

                {/* Cabinet Types Cards */}
                <div className="types-grid">
                  {types.map((type) => (
                    <div 
                      key={type.id} 
                      className={`type-card ${!type.is_active ? 'inactive' : ''}`}
                    >
                      <div className="card-header">
                        <div className="card-title-section">
                          <input
                            type="checkbox"
                            className="card-checkbox"
                            checked={selectedTypes.includes(type.id)}
                            onChange={(e) => handleSelectType(type.id, e.target.checked)}
                          />
                          <div className="card-title-content">
                            <h4 className="card-title">{type.name}</h4>
                            <span className={`status-indicator ${type.is_active ? 'active' : 'inactive'}`}>
                              {type.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => onDuplicate?.(type)}
                            className="card-action-btn duplicate"
                            title="Duplicate cabinet type"
                          >
                            <Copy className="action-icon" />
                          </button>
                          <button
                            onClick={() => onEdit?.(type)}
                            className="card-action-btn edit"
                            title="Edit cabinet type"
                          >
                            <Edit3 className="action-icon" />
                          </button>
                          <button
                            onClick={() => onDelete?.(type.id)}
                            className="card-action-btn delete"
                            title="Delete cabinet type"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        </div>
                      </div>

                      <div className="card-content">
                        {type.description && (
                          <p className="card-description">{type.description}</p>
                        )}

                        <div className="card-specs">
                          {type.default_depth && (
                            <div className="spec-item">
                              <Ruler className="spec-icon" />
                              <div className="spec-content">
                                <span className="spec-label">Default Depth</span>
                                <span className="spec-value">{formatDimensions(type.default_depth)}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="spec-item">
                            <Tag className="spec-icon" />
                            <div className="spec-content">
                              <span className="spec-label">Category</span>
                              <span className="spec-value">{getCategoryName(type.category)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card-quick-actions">
                          <button
                            onClick={() => onToggleStatus?.(type.id, !type.is_active)}
                            className={`quick-action-btn ${type.is_active ? 'deactivate' : 'activate'}`}
                          >
                            {type.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="cabinet-types-table-container">
          <div className="table-wrapper">
            <table className="cabinet-types-table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedTypes.length === filteredTypes.length && filteredTypes.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Default Depth</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div className="empty-content">
                        <Package className="empty-icon" />
                        <p className="empty-title">No cabinet types found</p>
                        <p className="empty-subtitle">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((type) => (
                    <tr 
                      key={type.id} 
                      className={`table-row ${!type.is_active ? 'inactive' : ''}`}
                    >
                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedTypes.includes(type.id)}
                          onChange={(e) => handleSelectType(type.id, e.target.checked)}
                        />
                      </td>
                      <td className="table-td">
                        <div className="name-cell">
                          <span className="type-name">{type.name}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="category-cell">
                          <span className="category-name">
                            {getCategoryName(type.category)}
                          </span>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="description-cell">
                          {type.description || <span className="no-description">No description</span>}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="dimension-cell">
                          <Ruler className="dimension-icon" />
                          <span>{formatDimensions(type.default_depth)}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => onToggleStatus?.(type.id, !type.is_active)}
                          className="status-toggle"
                        >
                          <span className={`status-badge ${type.is_active ? 'active' : 'inactive'}`}>
                            {type.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="table-td">
                        <div className="action-buttons-cell">
                          <button
                            onClick={() => onDuplicate?.(type)}
                            className="action-button duplicate"
                            title="Duplicate cabinet type"
                          >
                            <Copy className="action-icon" />
                          </button>
                          <button
                            onClick={() => onEdit?.(type)}
                            className="action-button edit"
                            title="Edit cabinet type"
                          >
                            <Edit3 className="action-icon" />
                          </button>
                          <button
                            onClick={() => onDelete?.(type.id)}
                            className="action-button delete"
                            title="Delete cabinet type"
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
      )}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Total Types:</span>
          <span className="stat-value">{cabinetTypes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Types:</span>
          <span className="stat-value">{cabinetTypes.filter(t => t.is_active).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Categories:</span>
          <span className="stat-value">{new Set(cabinetTypes.map(t => t.category)).size}</span>
        </div>
       
      </div>

      {/* Pagination */}
      {cabinetTypes.length > 20 && (
        <div className="pagination-container">
          <div className="pagination-content">
            <div className="pagination-info">
              Showing 1-20 of {cabinetTypes.length} results
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

export default CabinetTypesList;