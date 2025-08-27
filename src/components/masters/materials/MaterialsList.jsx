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
  Upload
} from 'lucide-react';
import './MaterialsList.css';

const MaterialsList = ({ 
  materials = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onSearch,
  onFilter,
  onBulkImport,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showInactive, setShowInactive] = useState(false);

  // Filter materials based on search and role
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || material.role === selectedRole;
    const matchesStatus = showInactive || material.is_active;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    onFilter?.({ role });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMaterials(filteredMaterials.map(m => m.id));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleSelectMaterial = (id, checked) => {
    if (checked) {
      setSelectedMaterials(prev => [...prev, id]);
    } else {
      setSelectedMaterials(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  if (loading) {
    return (
      <div className="materials-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading materials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="materials-list-container">
      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="search-filter-row">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search materials..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedRole}
                onChange={(e) => handleRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="BOTH">Both</option>
                <option value="CABINET">Cabinet</option>
                <option value="DOOR">Door</option>
                <option value="TOP">Top</option>
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
            <button onClick={onBulkImport} className="action-btn">
              <Upload className="action-icon" />
              Import
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
            Showing {filteredMaterials.length} of {materials.length} materials
          </span>
          {selectedMaterials.length > 0 && (
            <span className="selected-text">
              {selectedMaterials.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Materials Table */}
      <div className="materials-table-container">
        <div className="table-wrapper">
          <table className="materials-table">
            <thead className="table-header">
              <tr>
                <th className="table-th">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="table-th">Material Name</th>
                <th className="table-th">Role</th>
                <th className="table-th">Notes</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <Filter className="empty-icon" />
                      <p className="empty-title">No materials found</p>
                      <p className="empty-subtitle">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr 
                    key={material.id} 
                    className={`table-row ${!material.is_active ? 'inactive' : ''}`}
                  >
                    <td className="table-td">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedMaterials.includes(material.id)}
                        onChange={(e) => handleSelectMaterial(material.id, e.target.checked)}
                      />
                    </td>
                    <td className="table-td">
                      <div className="material-info">
                        <div className="material-name">{material.name}</div>
                        <div className="material-date">
                          Created: {new Date(material.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`role-badge role-${material.role.toLowerCase()}`}>
                        {material.role}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="notes-content" title={material.notes}>
                        {material.notes || '-'}
                      </div>
                    </td>
                    <td className="table-td">
                      <button
                        onClick={() => onToggleStatus?.(material.id, !material.is_active)}
                        className="status-toggle"
                      >
                        <span className={`status-badge ${material.is_active ? 'active' : 'inactive'}`}>
                          {material.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="table-td">
                      <div className="action-buttons-cell">
                        <button
                          onClick={() => onEdit?.(material)}
                          className="action-button edit"
                          title="Edit material"
                        >
                          <Edit3 className="action-icon" />
                        </button>
                        <button
                          onClick={() => onDelete?.(material.id)}
                          className="action-button delete"
                          title="Delete material"
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

      {/* Pagination */}
      {materials.length > 20 && (
        <div className="pagination-container">
          <div className="pagination-content">
            <div className="pagination-info">
              Showing 1-20 of {materials.length} results
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

export default MaterialsList;