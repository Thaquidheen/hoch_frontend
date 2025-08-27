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
  FileText,
  User,
  Calendar,
  IndianRupee,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import './ProjectsList.css';

const ProjectsList = ({ 
  projects = [], 
  customers = [],
  brands = [],
  loading = false, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onStatusUpdate,
  onSearch,
  onFilter,
  onExport,
  onCreateNew,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const customerName = project.customer_detail?.name || '';
    const brandName = project.brand_detail?.name || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.id.toString().includes(searchTerm);
    const matchesCustomer = !selectedCustomer || project.customer.toString() === selectedCustomer;
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    const matchesBrand = !selectedBrand || project.brand.toString() === selectedBrand;
    const matchesBudgetTier = !selectedBudgetTier || project.budget_tier === selectedBudgetTier;
    
    return matchesSearch && matchesCustomer && matchesStatus && matchesBrand && matchesBudgetTier;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleCustomerFilter = (customerId) => {
    setSelectedCustomer(customerId);
    onFilter?.({ customer: customerId });
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    onFilter?.({ status: status });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProjects(filteredProjects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (id, checked) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, id]);
    } else {
      setSelectedProjects(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT': return <Edit3 className="status-icon" />;
      case 'QUOTED': return <FileText className="status-icon" />;
      case 'CONFIRMED': return <CheckCircle className="status-icon" />;
      case 'IN_PRODUCTION': return <Package className="status-icon" />;
      case 'DELIVERED': return <CheckCircle className="status-icon" />;
      case 'CANCELLED': return <XCircle className="status-icon" />;
      default: return <Clock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'DRAFT': return 'status-draft';
      case 'QUOTED': return 'status-quoted';
      case 'CONFIRMED': return 'status-confirmed';
      case 'IN_PRODUCTION': return 'status-production';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-draft';
    }
  };

  const getBudgetTierClass = (tier) => {
    return tier === 'LUXURY' ? 'budget-tier-luxury' : 'budget-tier-economy';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
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

  if (loading) {
    return (
      <div className="projects-loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-list-container">
      {/* Search and Filter Bar */}
      <div className="search-filter-section">
        <div className="search-filter-content">
          <div className="search-filter-row">
            {/* Search Input */}
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by customer, brand, or project ID..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Customer Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedCustomer}
                onChange={(e) => handleCustomerFilter(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Status Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="QUOTED">Quoted</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Filter className="filter-icon" />
            </div>

            {/* Brand Filter */}
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
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
                onChange={(e) => setSelectedBudgetTier(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="LUXURY">Luxury</option>
                <option value="ECONOMY">Economy</option>
              </select>
              <Filter className="filter-icon" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={onCreateNew} className="action-btn primary">
              <Plus className="action-icon" />
              New Project
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
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
          {selectedProjects.length > 0 && (
            <span className="selected-text">
              {selectedProjects.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="projects-table-container">
        <div className="table-wrapper">
          <table className="projects-table">
            <thead className="table-header">
              <tr>
                <th className="table-th">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="table-th">Project ID</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Brand & Tier</th>
                <th className="table-th">Status</th>
                <th className="table-th">Total Value</th>
                <th className="table-th">Updated</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-content">
                      <FileText className="empty-icon" />
                      <p className="empty-title">No projects found</p>
                      <p className="empty-subtitle">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className={`table-row ${!project.is_active ? 'inactive' : ''}`}
                    onClick={() => onViewDetails?.(project.id)}
                  >
                    <td className="table-td" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                      />
                    </td>
                    <td className="table-td">
                      <div className="project-id-info">
                        <div className="project-id">
                          #{project.id}
                        </div>
                        <div className="project-date">
                          Created: {formatDate(project.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="customer-info">
                        <User className="customer-icon" />
                        <div className="customer-details">
                          <div className="customer-name">
                            {project.customer_detail?.name || 'Unknown Customer'}
                          </div>
                          <div className="customer-contact">
                            {project.customer_detail?.phone || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="brand-tier-info">
                        <div className="brand-name">
                          {project.brand_detail?.name || 'Unknown Brand'}
                        </div>
                        <span className={`budget-tier-badge ${getBudgetTierClass(project.budget_tier)}`}>
                          {project.budget_tier}
                        </span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className={`status-badge ${getStatusClass(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="status-text">{project.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="value-info">
                        <div className="total-value">
                          {formatCurrency(project.totals?.grand_total || 0)}
                        </div>
                        <div className="margin-info">
                          Margin: {project.margin_pct}%
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="date-info">
                        <Calendar className="date-icon" />
                        <span>{formatDate(project.updated_at)}</span>
                      </div>
                    </td>
                    <td className="table-td" onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons-cell">
                        <button
                          onClick={() => onDuplicate?.(project.id)}
                          className="action-button duplicate"
                          title="Duplicate project"
                        >
                          <Copy className="action-icon" />
                        </button>
                        <button
                          onClick={() => onEdit?.(project)}
                          className="action-button edit"
                          title="Edit project"
                        >
                          <Edit3 className="action-icon" />
                        </button>
                        <button
                          onClick={() => onDelete?.(project.id)}
                          className="action-button delete"
                          title="Delete project"
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
          <span className="stat-label">Total Projects:</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Draft:</span>
          <span className="stat-value">{projects.filter(p => p.status === 'DRAFT').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Quoted:</span>
          <span className="stat-value">{projects.filter(p => p.status === 'QUOTED').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Confirmed:</span>
          <span className="stat-value">{projects.filter(p => p.status === 'CONFIRMED').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Value:</span>
          <span className="stat-value">
            {formatCurrency(projects.reduce((sum, p) => sum + (parseFloat(p.totals?.grand_total || 0)), 0))}
          </span>
        </div>
      </div>

      {/* Pagination */}
      {projects.length > 20 && (
        <div className="pagination-container">
          <div className="pagination-content">
            <div className="pagination-info">
              Showing 1-20 of {projects.length} results
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

export default ProjectsList;