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
      case 'DRAFT': return <Edit3 className="projects-list-status-icon" />;
      case 'QUOTED': return <FileText className="projects-list-status-icon" />;
      case 'CONFIRMED': return <CheckCircle className="projects-list-status-icon" />;
      case 'IN_PRODUCTION': return <Package className="projects-list-status-icon" />;
      case 'DELIVERED': return <CheckCircle className="projects-list-status-icon" />;
      case 'CANCELLED': return <XCircle className="projects-list-status-icon" />;
      default: return <Clock className="projects-list-status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'DRAFT': return 'projects-list-status-draft';
      case 'QUOTED': return 'projects-list-status-quoted';
      case 'CONFIRMED': return 'projects-list-status-confirmed';
      case 'IN_PRODUCTION': return 'projects-list-status-production';
      case 'DELIVERED': return 'projects-list-status-delivered';
      case 'CANCELLED': return 'projects-list-status-cancelled';
      default: return 'projects-list-status-draft';
    }
  };

  const getBudgetTierClass = (tier) => {
    return tier === 'LUXURY' ? 'projects-list-budget-tier-luxury' : 'projects-list-budget-tier-economy';
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
      <div className="projects-list-loading">
        <div className="projects-list-loading-content">
          <RefreshCw className="projects-list-loading-icon" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-list-container">
      {/* Search and Filter Bar */}
      <div className="projects-list-search-filter-section">
        <div className="projects-list-search-filter-content">
          <div className="projects-list-search-filter-row">
            {/* Search Input */}
            <div className="projects-list-search-input-container">
              <Search className="projects-list-search-icon" />
              <input
                type="text"
                placeholder="Search by customer, brand, or project ID..."
                className="projects-list-search-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Customer Filter */}
            <div className="projects-list-filter-container">
              <select
                className="projects-list-filter-select"
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
              <Filter className="projects-list-filter-icon" />
            </div>

            {/* Status Filter */}
            <div className="projects-list-filter-container">
              <select
                className="projects-list-filter-select"
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
              <Filter className="projects-list-filter-icon" />
            </div>

            {/* Brand Filter */}
            <div className="projects-list-filter-container">
              <select
                className="projects-list-filter-select"
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
              <Filter className="projects-list-filter-icon" />
            </div>

            {/* Budget Tier Filter */}
            <div className="projects-list-filter-container">
              <select
                className="projects-list-filter-select"
                value={selectedBudgetTier}
                onChange={(e) => setSelectedBudgetTier(e.target.value)}
              >
                <option value="">All Tiers</option>
                <option value="LUXURY">Luxury</option>
                <option value="ECONOMY">Economy</option>
              </select>
              <Filter className="projects-list-filter-icon" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="projects-list-action-buttons">
            <button onClick={onCreateNew} className="projects-list-action-btn projects-list-primary">
              <Plus className="projects-list-action-icon" />
              New Project
            </button>
            <button onClick={onExport} className="projects-list-action-btn">
              <Download className="projects-list-action-icon" />
              Export
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="projects-list-results-summary">
          <span className="projects-list-results-text">
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
          {selectedProjects.length > 0 && (
            <span className="projects-list-selected-text">
              {selectedProjects.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="projects-list-table-container">
        <div className="projects-list-table-wrapper">
          <table className="projects-list-table">
            <thead className="projects-list-table-header">
              <tr>
                <th className="projects-list-table-th">
                  <input
                    type="checkbox"
                    className="projects-list-table-checkbox"
                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="projects-list-table-th">Project ID</th>
                <th className="projects-list-table-th">Customer</th>
                <th className="projects-list-table-th">Brand & Tier</th>
                <th className="projects-list-table-th">Status</th>
                <th className="projects-list-table-th">Total Value</th>
                <th className="projects-list-table-th">Updated</th>
                <th className="projects-list-table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="projects-list-table-body">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="projects-list-empty-state">
                    <div className="projects-list-empty-content">
                      <FileText className="projects-list-empty-icon" />
                      <p className="projects-list-empty-title">No projects found</p>
                      <p className="projects-list-empty-subtitle">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className={`projects-list-table-row ${!project.is_active ? 'projects-list-inactive' : ''}`}
                    onClick={() => onViewDetails?.(project.id)}
                  >
                    <td className="projects-list-table-td" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="projects-list-table-checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                      />
                    </td>
                    <td className="projects-list-table-td">
                      <div className="projects-list-project-id-info">
                        <div className="projects-list-project-id">
                          #{project.id}
                        </div>
                        <div className="projects-list-project-date">
                          Created: {formatDate(project.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="projects-list-table-td">
                      <div className="projects-list-customer-info">
                        <User className="projects-list-customer-icon" />
                        <div className="projects-list-customer-details">
                          <div className="projects-list-customer-name">
                            {project.customer_detail?.name || 'Unknown Customer'}
                          </div>
                          <div className="projects-list-customer-contact">
                            {project.customer_detail?.phone || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="projects-list-table-td">
                      <div className="projects-list-brand-tier-info">
                        <div className="projects-list-brand-name">
                          {project.brand_detail?.name || 'Unknown Brand'}
                        </div>
                        <span className={`projects-list-budget-tier-badge ${getBudgetTierClass(project.budget_tier)}`}>
                          {project.budget_tier}
                        </span>
                      </div>
                    </td>
                    <td className="projects-list-table-td">
                      <div className={`projects-list-status-badge ${getStatusClass(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="projects-list-status-text">{project.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="projects-list-table-td">
                      <div className="projects-list-value-info">
                        <div className="projects-list-total-value">
                          {formatCurrency(project.totals?.grand_total || 0)}
                        </div>
                        <div className="projects-list-margin-info">
                          Margin: {project.margin_pct}%
                        </div>
                      </div>
                    </td>
                    <td className="projects-list-table-td">
                      <div className="projects-list-date-info">
                        <Calendar className="projects-list-date-icon" />
                        <span>{formatDate(project.updated_at)}</span>
                      </div>
                    </td>
                    <td className="projects-list-table-td" onClick={(e) => e.stopPropagation()}>
                      <div className="projects-list-action-buttons-cell">
                        <button
                          onClick={() => onDuplicate?.(project.id)}
                          className="projects-list-action-button projects-list-duplicate"
                          title="Duplicate project"
                        >
                          <Copy className="projects-list-action-icon" />
                        </button>
                        <button
                          onClick={() => onEdit?.(project)}
                          className="projects-list-action-button projects-list-edit"
                          title="Edit project"
                        >
                          <Edit3 className="projects-list-action-icon" />
                        </button>
                        <button
                          onClick={() => onDelete?.(project.id)}
                          className="projects-list-action-button projects-list-delete"
                          title="Delete project"
                        >
                          <Trash2 className="projects-list-action-icon" />
                        </button>
                        <button className="projects-list-action-button projects-list-more">
                          <MoreVertical className="projects-list-action-icon" />
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
      <div className="projects-list-quick-stats">
        <div className="projects-list-stat-item">
          <span className="projects-list-stat-label">Total Projects:</span>
          <span className="projects-list-stat-value">{projects.length}</span>
        </div>
        <div className="projects-list-stat-item">
          <span className="projects-list-stat-label">Draft:</span>
          <span className="projects-list-stat-value">{projects.filter(p => p.status === 'DRAFT').length}</span>
        </div>
        <div className="projects-list-stat-item">
          <span className="projects-list-stat-label">Quoted:</span>
          <span className="projects-list-stat-value">{projects.filter(p => p.status === 'QUOTED').length}</span>
        </div>
        <div className="projects-list-stat-item">
          <span className="projects-list-stat-label">Confirmed:</span>
          <span className="projects-list-stat-value">{projects.filter(p => p.status === 'CONFIRMED').length}</span>
        </div>
        <div className="projects-list-stat-item">
          <span className="projects-list-stat-label">Total Value:</span>
          <span className="projects-list-stat-value">
            {formatCurrency(projects.reduce((sum, p) => sum + (parseFloat(p.totals?.grand_total || 0)), 0))}
          </span>
        </div>
      </div>

      {/* Pagination */}
      {projects.length > 20 && (
        <div className="projects-list-pagination-container">
          <div className="projects-list-pagination-content">
            <div className="projects-list-pagination-info">
              Showing 1-20 of {projects.length} results
            </div>
            <div className="projects-list-pagination-buttons">
              <button className="projects-list-pagination-btn">Previous</button>
              <button className="projects-list-pagination-btn projects-list-active">1</button>
              <button className="projects-list-pagination-btn">2</button>
              <button className="projects-list-pagination-btn">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;