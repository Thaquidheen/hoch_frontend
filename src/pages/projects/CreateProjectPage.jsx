import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb
} from 'lucide-react';
import ProjectForm from '../../components/quotations/projects/ProjectForm';
import useProjects from '../../hooks/quotations/useProjects';
import './CreateProjectPage.css';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  // Use the projects hook
  const {
    customers,
    brands,
    createProject,
    loading
  } = useProjects();

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle project creation
  const handleCreateProject = async (projectData) => {
    try {
      const result = await createProject(projectData);
      
      if (result.success) {
        showNotification('success', 'Project created successfully! You can now add line items.');
        // Navigate to the project details page
        setTimeout(() => {
          navigate(`/quotations/project/${result.data.id}`);
        }, 1500);
      } else {
        showNotification('error', result.error || 'Failed to create project');
        return { success: false, error: result.error };
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.message || 'Failed to create project';
      showNotification('error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/quotations/projects');
  };

  return (
    <div className="project-creation-view"> {/* <-- ClassName Changed Here */}
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-navigation">
            <button onClick={handleCancel} className="back-button">
              <ArrowLeft className="back-icon" />
              Back to Projects
            </button>
          </div>
          
          <div className="header-info">
            <div className="header-main">
              <FileText className="header-icon" />
              <div className="header-text">
                <h1 className="page-title">Create New Project</h1>
                <p className="page-subtitle">
                  Set up a new project for customer quotation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-content">
        {/* Getting Started Guide */}
        <div className="getting-started-section">
          <div className="guide-card">
            <div className="guide-header">
              <Lightbulb className="guide-icon" />
              <h3 className="guide-title">Getting Started</h3>
            </div>
            <div className="guide-content">
              <p className="guide-description">
                Create a new project to generate quotations for your customers. Follow these steps:
              </p>
              <div className="guide-steps">
                <div className="step-item">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <span className="step-title">Select Customer & Brand</span>
                    <span className="step-description">Choose the customer and hardware brand</span>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <span className="step-title">Configure Pricing</span>
                    <span className="step-description">Set budget tier, margin, and GST percentage</span>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <span className="step-title">Select Scopes</span>
                    <span className="step-description">Choose Open Kitchen and/or Working Kitchen</span>
                  </div>
                </div>
                <div className="step-item">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <span className="step-title">Add Line Items</span>
                    <span className="step-description">Add cabinet specifications after project creation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <span className="stat-label">Available Customers</span>
                  <span className="stat-value">{customers.length}</span>
                </div>
                <div className="stat-description">
                  Active customers ready for new projects
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <span className="stat-label">Hardware Brands</span>
                  <span className="stat-value">{brands.length}</span>
                </div>
                <div className="stat-description">
                  Available hardware brands for selection
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <span className="stat-label">Budget Tiers</span>
                  <span className="stat-value">2</span>
                </div>
                <div className="stat-description">
                  Luxury and Economy pricing options
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <div className="tips-card">
            <div className="tips-header">
              <h3 className="tips-title">💡 Pro Tips</h3>
            </div>
            <div className="tips-content">
              <div className="tip-item">
                <span className="tip-label">Budget Tier:</span>
                <span className="tip-description">
                  Choose <strong>Luxury</strong> for premium projects with higher-end finishes, 
                  or <strong>Economy</strong> for cost-effective solutions.
                </span>
              </div>
              <div className="tip-item">
                <span className="tip-label">Margin Setting:</span>
                <span className="tip-description">
                  Typical margins range from 20-35%. Consider market conditions and project complexity.
                </span>
              </div>
              <div className="tip-item">
                <span className="tip-label">Project Scopes:</span>
                <span className="tip-description">
                  <strong>Open Kitchen</strong> for customer quotes, <strong>Working Kitchen</strong> for technical specs.
                  You can select both if needed.
                </span>
              </div>
              <div className="tip-item">
                <span className="tip-label">After Creation:</span>
                <span className="tip-description">
                  Once created, you'll be able to add cabinet line items, accessories, and plan images.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Form */}
        <ProjectForm
          isOpen={true}
          customers={customers}
          brands={brands}
          loading={loading}
          onSave={handleCreateProject}
          onCancel={handleCancel}
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' ? (
              <CheckCircle className="notification-icon" />
            ) : (
              <AlertTriangle className="notification-icon" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProjectPage;