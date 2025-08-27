import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  BarChart3,
  Users,
  TrendingUp,
  Package
} from 'lucide-react';
import ProjectsList from '../../components/quotations/projects/ProjectsList';
import useProjects from '../../hooks/quotations/useProjects';
import './ProjectsPage.css';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  // Use the projects hook
  const {
    projects,
    customers,
    brands,
    loading,
    error,
    deleteProject,
    duplicateProject,
    updateProjectStatus,
    searchProjects,
    filterByCustomer,
    filterByStatus,
    exportProjects,
    refresh,
    getProjectsStats
  } = useProjects();

  // Get statistics
  const stats = getProjectsStats();

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle create new project
  const handleCreateNew = () => {
    navigate('/quotations/create-project');
  };

  // Handle edit project
  const handleEdit = (project) => {
    navigate(`/quotations/project/${project.id}/edit`);
  };

  // Handle view project details
  const handleViewDetails = (projectId) => {
    navigate(`/quotations/project/${projectId}`);
  };

  // Handle delete with confirmation
  const handleDelete = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    const customerName = project?.customer_detail?.name || 'this project';
    
    if (window.confirm(`Are you sure you want to delete the project for "${customerName}"? This action cannot be undone and will remove all line items and accessories.`)) {
      try {
        const result = await deleteProject(projectId);
        if (result.success) {
          showNotification('success', 'Project deleted successfully');
        } else {
          showNotification('error', result.error || 'Failed to delete project');
        }
      } catch (error) {
        showNotification('error', error.message || 'Failed to delete project');
      }
    }
  };

  // Handle duplicate project
  const handleDuplicate = async (projectId) => {
    try {
      const result = await duplicateProject(projectId, {
        status: 'DRAFT' // Reset status to draft for new project
      });
      if (result.success) {
        showNotification('success', 'Project duplicated successfully');
        // Navigate to the new duplicated project
        navigate(`/quotations/project/${result.data.id}`);
      } else {
        showNotification('error', result.error || 'Failed to duplicate project');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to duplicate project');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const result = await updateProjectStatus(projectId, newStatus);
      if (result.success) {
        showNotification('success', `Project status updated to ${newStatus.replace('_', ' ')}`);
      } else {
        showNotification('error', result.error || 'Failed to update project status');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to update project status');
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    searchProjects(searchTerm);
  };

  // Handle filter
  const handleFilter = (filters) => {
    if (filters.customer) {
      filterByCustomer(filters.customer);
    }
    if (filters.status) {
      filterByStatus(filters.status);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const result = await exportProjects();
      if (result.success) {
        showNotification('success', 'Projects exported successfully');
      } else {
        showNotification('error', result.error || 'Failed to export projects');
      }
    } catch (error) {
      showNotification('error', error.message || 'Failed to export projects');
    }
  };

  return (
    <div className="projectspage-view"> {/* <-- ClassName Changed Here */}
      {/* Header Section */}
      <div className="projectspage-header">
        <div className="projectspage-header-content">
          <div className="projectspage-header-info">
            <FileText className="projectspage-header-icon" />
            <div className="projectspage-header-text">
              <h1 className="projectspage-title">Projects & Quotations</h1>
              <p className="projectspage-subtitle">
                Manage customer projects, create quotations, and track progress
              </p>
            </div>
          </div>
          <div className="projectspage-header-actions">
            <button
              onClick={refresh}
              disabled={loading}
              className={`projectspage-btn projectspage-btn-secondary ${loading ? 'loading' : ''}`}
            >
              <RefreshCw className={`projectspage-btn-icon ${loading ? 'spinning' : ''}`} />
              Refresh
            </button>
            <button onClick={handleCreateNew} className="projectspage-btn projectspage-btn-primary">
              <Plus className="projectspage-btn-icon" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="projectspage-content">
        {/* Statistics Grid */}
        <div className="projectspage-stats-grid">
          <div className="projectspage-stat-card">
            <div className="projectspage-stat-content">
              <div className="projectspage-stat-info">
                <h3 className="projectspage-stat-label">Total Projects</h3>
                <p className="projectspage-stat-value">{stats.total}</p>
              </div>
              <div className="projectspage-stat-icon projectspage-stat-icon-blue">
                <FileText className="icon" />
              </div>
            </div>
          </div>

          <div className="projectspage-stat-card">
            <div className="projectspage-stat-content">
              <div className="projectspage-stat-info">
                <h3 className="projectspage-stat-label">Active Quotes</h3>
                <p className="projectspage-stat-value">{stats.quoted}</p>
              </div>
              <div className="projectspage-stat-icon projectspage-stat-icon-green">
                <CheckCircle className="icon" />
              </div>
            </div>
          </div>

          <div className="projectspage-stat-card">
            <div className="projectspage-stat-content">
              <div className="projectspage-stat-info">
                <h3 className="projectspage-stat-label">Confirmed Orders</h3>
                <p className="projectspage-stat-value">{stats.confirmed}</p>
              </div>
              <div className="projectspage-stat-icon projectspage-stat-icon-purple">
                <Package className="icon" />
              </div>
            </div>
          </div>

          <div className="projectspage-stat-card">
            <div className="projectspage-stat-content">
              <div className="projectspage-stat-info">
                <h3 className="projectspage-stat-label">Total Value</h3>
                <p className="projectspage-stat-value">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
              </div>
              <div className="projectspage-stat-icon projectspage-stat-icon-red">
                <TrendingUp className="icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="projectspage-status-breakdown">
          <div className="projectspage-breakdown-card">
            <div className="projectspage-breakdown-header">
              <h3 className="projectspage-breakdown-title">Project Status Breakdown</h3>
            </div>
            <div className="projectspage-breakdown-content">
              <div className="projectspage-status-items">
                <div className="projectspage-status-item">
                  <span className="projectspage-status-dot draft"></span>
                  <span className="projectspage-status-name">Draft</span>
                  <span className="projectspage-status-count">{stats.draft}</span>
                </div>
                <div className="projectspage-status-item">
                  <span className="projectspage-status-dot quoted"></span>
                  <span className="projectspage-status-name">Quoted</span>
                  <span className="projectspage-status-count">{stats.quoted}</span>
                </div>
                <div className="projectspage-status-item">
                  <span className="projectspage-status-dot confirmed"></span>
                  <span className="projectspage-status-name">Confirmed</span>
                  <span className="projectspage-status-count">{stats.confirmed}</span>
                </div>
                <div className="projectspage-status-item">
                  <span className="projectspage-status-dot production"></span>
                  <span className="projectspage-status-name">In Production</span>
                  <span className="projectspage-status-count">{stats.inProduction}</span>
                </div>
                <div className="projectspage-status-item">
                  <span className="projectspage-status-dot delivered"></span>
                  <span className="projectspage-status-name">Delivered</span>
                  <span className="projectspage-status-count">{stats.delivered}</span>
                </div>
                <div className="projectspage-status-item">
                  <span className="projectspage-status-dot cancelled"></span>
                  <span className="projectspage-status-name">Cancelled</span>
                  <span className="projectspage-status-count">{stats.cancelled}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="projectspage-breakdown-card">
            <div className="projectspage-breakdown-header">
              <h3 className="projectspage-breakdown-title">Quick Insights</h3>
            </div>
            <div className="projectspage-breakdown-content">
              <div className="projectspage-insight-items">
                <div className="projectspage-insight-item">
                  <Users className="projectspage-insight-icon" />
                  <div className="projectspage-insight-details">
                    <span className="projectspage-insight-label">Active Customers</span>
                    <span className="projectspage-insight-value">{stats.uniqueCustomers}</span>
                  </div>
                </div>
                <div className="projectspage-insight-item">
                  <BarChart3 className="projectspage-insight-icon" />
                  <div className="projectspage-insight-details">
                    <span className="projectspage-insight-label">Avg Project Value</span>
                    <span className="projectspage-insight-value">₹{(stats.averageProjectValue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
                <div className="projectspage-insight-item">
                  <Package className="projectspage-insight-icon" />
                  <div className="projectspage-insight-details">
                    <span className="projectspage-insight-label">Conversion Rate</span>
                    <span className="projectspage-insight-value">
                      {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="projectspage-error-banner">
            <div className="projectspage-error-content">
              <AlertTriangle className="projectspage-error-icon" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Projects List */}
        <ProjectsList
          projects={projects}
          customers={customers}
          brands={brands}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onStatusUpdate={handleStatusUpdate}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onExport={handleExport}
          onCreateNew={handleCreateNew}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`projectspage-notification-toast projectspage-notification-${notification.type}`}>
          <div className="projectspage-notification-content">
            {notification.type === 'success' ? (
              <CheckCircle className="projectspage-notification-icon" />
            ) : (
              <AlertTriangle className="projectspage-notification-icon" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;