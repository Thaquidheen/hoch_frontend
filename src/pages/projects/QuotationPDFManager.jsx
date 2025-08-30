// src/pages/quotations/QuotationPDFManager.js
import React, { useState } from 'react';
import { 
  FileText, 
  Settings as SettingsIcon,
  History as HistoryIcon,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import useQuotationPDF from '../../hooks/quotations/useQuotationPDF';
import projectsApi from '../../service/quotations/projectsApi';
import './QuotationPDFManager.css';

const QuotationPDFManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Use the PDF hook
  const {
    pdfHistory,
    templates,
    statistics,
    loading: pdfLoading,
    generatePDF,
    downloadPDF,
    emailPDF,
    previewPDF,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    bulkGeneratePDF,
    loadStatistics,
    formatFileSize,
    getStatusColor,
    refreshAll
  } = useQuotationPDF();

  // Load projects for bulk operations
  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await projectsApi.getAll({
        ordering: '-updated_at',
        limit: 50
      });
      setProjects(response.results || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  React.useEffect(() => {
    loadProjects();
    loadStatistics();
  }, []);

  const filteredHistory = pdfHistory.filter(pdf => {
    const matchesSearch = (
      pdf.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.template_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilter = filterStatus === 'all' || pdf.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleBulkGenerate = async (selectedProjectIds) => {
    try {
      await bulkGeneratePDF(selectedProjectIds);
    } catch (error) {
      console.error('Error in bulk generate:', error);
    }
  };

  // Tab Navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'history', label: 'PDF History', icon: HistoryIcon },
    { id: 'templates', label: 'Templates', icon: SettingsIcon },
    { id: 'bulk', label: 'Bulk Operations', icon: Plus }
  ];

  return (
    <div className="pdf-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <FileText className="header-icon" />
            <div>
              <h1>Quotation PDF Management</h1>
              <p>Generate, manage, and track quotation PDFs across all projects</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={refreshAll}
              disabled={pdfLoading || projectsLoading}
              className="btn-secondary"
            >
              <RefreshCw className={`btn-icon ${(pdfLoading || projectsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FileText className="icon" />
              </div>
              <div className="stat-content">
                <span className="stat-value">{statistics.total_pdfs || 0}</span>
                <span className="stat-label">Total PDFs Generated</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar className="icon" />
              </div>
              <div className="stat-content">
                <span className="stat-value">{statistics.this_month || 0}</span>
                <span className="stat-label">This Month</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <SettingsIcon className="icon" />
              </div>
              <div className="stat-content">
                <span className="stat-value">{templates.length}</span>
                <span className="stat-label">Templates</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle className="icon" />
              </div>
              <div className="stat-content">
                <span className="stat-value">{pdfHistory.filter(p => p.status === 'completed').length}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-button ${activeTab === id ? 'active' : ''}`}
          >
            <Icon className="tab-icon" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-grid">
              {/* Recent PDFs */}
              <div className="overview-card">
                <div className="card-header">
                  <h3>Recent PDFs</h3>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="view-all-btn"
                  >
                    View All
                  </button>
                </div>
                <div className="recent-pdfs-list">
                  {pdfHistory.slice(0, 5).map(pdf => (
                    <div key={pdf.id} className="recent-pdf-item">
                      <div className="pdf-info">
                        <FileText className="pdf-icon" />
                        <div className="pdf-details">
                          <span className="pdf-name">{pdf.project_name}</span>
                          <span className="pdf-meta">{pdf.customer_name} • {formatDate(pdf.generated_at)}</span>
                        </div>
                      </div>
                      <div className="pdf-status-badge">
                        {getStatusIcon(pdf.status)}
                      </div>
                    </div>
                  ))}
                  {pdfHistory.length === 0 && (
                    <div className="empty-state-small">
                      <p>No PDFs generated yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Templates */}
              <div className="overview-card">
                <div className="card-header">
                  <h3>Templates</h3>
                  <button 
                    onClick={() => setActiveTab('templates')}
                    className="view-all-btn"
                  >
                    Manage
                  </button>
                </div>
                <div className="templates-list">
                  {templates.map(template => (
                    <div key={template.id} className="template-item">
                      <div className="template-info">
                        <SettingsIcon className="template-icon" />
                        <div className="template-details">
                          <span className="template-name">{template.name}</span>
                          <span className="template-desc">{template.description}</span>
                        </div>
                      </div>
                      {template.is_default && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="empty-state-small">
                      <p>No templates created yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-section">
            {/* Search and Filters */}
            <div className="section-header">
              <div className="search-filter-bar">
                <div className="search-box">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by project, customer, or template..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-group">
                  <Filter className="filter-icon" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="generating">Generating</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="results-count">
                {filteredHistory.length} of {pdfHistory.length} PDFs
              </div>
            </div>

            {/* PDF History Table */}
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Project & Customer</th>
                    <th>Template</th>
                    <th>Generated</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(pdf => (
                    <tr key={pdf.id}>
                      <td>
                        <div className="project-cell">
                          <div className="project-name">{pdf.project_name}</div>
                          <div className="customer-name">{pdf.customer_name}</div>
                        </div>
                      </td>
                      <td>
                        <span className="template-name">{pdf.template_name}</span>
                      </td>
                      <td>
                        <div className="generated-cell">
                          <div className="generated-date">{formatDate(pdf.generated_at)}</div>
                          <div className="generated-by">by {pdf.generated_by_name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          {getStatusIcon(pdf.status)}
                          <span className={`status-text ${getStatusColor(pdf.status)}`}>
                            {pdf.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="file-size">{formatFileSize(pdf.file_size)}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => downloadPDF(pdf.id, `${pdf.project_name}_quotation.pdf`)}
                            className="action-btn"
                            title="Download"
                          >
                            <Download className="btn-icon" />
                          </button>
                          <button
                            onClick={() => emailPDF(pdf.id, {
                              recipient_email: '',
                              recipient_name: pdf.customer_name,
                              subject: `Quotation - ${pdf.project_name}`,
                              message: `Please find attached the quotation for ${pdf.project_name}.`
                            })}
                            className="action-btn"
                            title="Email"
                          >
                            <Mail className="btn-icon" />
                          </button>
                          <button
                            onClick={() => previewPDF(pdf.project_id, pdf.template?.id)}
                            className="action-btn"
                            title="Preview"
                          >
                            <Eye className="btn-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredHistory.length === 0 && (
                <div className="empty-state">
                  <FileText className="empty-icon" />
                  <h3>No PDFs found</h3>
                  <p>No PDFs match your current search and filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="templates-section">
            <div className="section-header">
              <h2>PDF Templates</h2>
              <button 
                onClick={() => {
                  setEditingTemplate(null);
                  setShowTemplateEditor(true);
                }}
                className="btn-primary"
              >
                <Plus className="btn-icon" />
                New Template
              </button>
            </div>

            <div className="templates-grid">
              {templates.map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-card-header">
                    <div className="template-info">
                      <h3 className="template-title">{template.name}</h3>
                      {template.is_default && (
                        <span className="template-badge">Default</span>
                      )}
                    </div>
                    <div className="template-actions">
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateEditor(true);
                        }}
                        className="template-action-btn"
                        title="Edit"
                      >
                        <Edit className="btn-icon" />
                      </button>
                      {!template.is_default && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this template?')) {
                              deleteTemplate(template.id);
                            }
                          }}
                          className="template-action-btn danger"
                          title="Delete"
                        >
                          <Trash2 className="btn-icon" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="template-card-body">
                    <p className="template-description">{template.description}</p>
                    <div className="template-meta">
                      <span className="template-created">
                        <User className="meta-icon" />
                        {template.created_by_name}
                      </span>
                      <span className="template-date">
                        <Calendar className="meta-icon" />
                        {formatDate(template.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="empty-state">
                  <SettingsIcon className="empty-icon" />
                  <h3>No templates created</h3>
                  <p>Create your first PDF template to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Operations Tab */}
        {activeTab === 'bulk' && (
          <div className="bulk-section">
            <div className="section-header">
              <h2>Bulk PDF Generation</h2>
              <p>Select multiple projects to generate PDFs in bulk</p>
            </div>

            <div className="bulk-content">
              {projectsLoading ? (
                <div className="loading-state">
                  <RefreshCw className="loading-icon animate-spin" />
                  <span>Loading projects...</span>
                </div>
              ) : (
                <div className="projects-bulk-list">
                  {projects.map(project => (
                    <div key={project.id} className="project-bulk-item">
                      <input
                        type="checkbox"
                        id={`project-${project.id}`}
                        className="project-checkbox"
                      />
                      <label htmlFor={`project-${project.id}`} className="project-label">
                        <div className="project-info">
                          <span className="project-name">Project #{project.id}</span>
                          <span className="project-customer">{project.customer_name}</span>
                        </div>
                        <div className="project-meta">
                          <span className="project-status">{project.status}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="empty-state">
                      <FileText className="empty-icon" />
                      <h3>No projects available</h3>
                      <p>Create some projects first to use bulk operations.</p>
                    </div>
                  )}
                </div>
              )}
              
              {projects.length > 0 && (
                <div className="bulk-actions">
                  <div className="bulk-options">
                    <label>
                      Template:
                      <select className="template-select">
                        <option value="">Default Template</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  
                  <button
                    onClick={() => {
                      const selected = document.querySelectorAll('.project-checkbox:checked');
                      const selectedIds = Array.from(selected).map(cb => 
                        parseInt(cb.id.replace('project-', ''))
                      );
                      if (selectedIds.length > 0) {
                        handleBulkGenerate(selectedIds);
                      } else {
                        alert('Please select at least one project');
                      }
                    }}
                    className="btn-primary bulk-generate-btn"
                    disabled={pdfLoading}
                  >
                    {pdfLoading ? (
                      <RefreshCw className="btn-icon animate-spin" />
                    ) : (
                      <FileText className="btn-icon" />
                    )}
                    Generate Selected PDFs
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationPDFManager;