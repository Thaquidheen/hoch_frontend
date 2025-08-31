import React, { useState, useEffect } from 'react';
import {
  FileText,
  Layout,
  Layers,
  Eye,
  Settings,
  CheckCircle,
  Star,
  Clock,
  Users,
  Image,
  BarChart3,
  Zap,
  Palette
} from 'lucide-react';

import './PDFTemplateSelector.css';
const PDFTemplateSelector = ({
  templates = [],
  selectedTemplate = null,
  onTemplateSelect,
  onTemplatePreview,
  onTemplateCustomize,
  showPreview = true,
  showStats = true,
  className = ''
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Default template options if none provided
  const defaultTemplates = [
    {
      id: 'detailed',
      name: 'Detailed Template',
      type: 'DETAILED',
      category: 'premium',
      description: 'Complete quotation with images, plans, and comprehensive specifications',
      features: ['Product Images', 'Floor Plans', 'Detailed Specs', 'Warranty Info', 'Terms & Conditions'],
      preview_url: null,
      is_popular: true,
      estimated_pages: '6-8 pages',
      best_for: 'High-value projects, detailed presentations',
      color_scheme: 'professional',
      last_used: null,
      usage_count: 0
    },
    {
      id: 'standard',
      name: 'Standard Template',
      type: 'STANDARD',
      category: 'standard',
      description: 'Professional quotation with essential information and key details',
      features: ['Line Items', 'Basic Images', 'Pricing Summary', 'Contact Info'],
      preview_url: null,
      is_popular: true,
      estimated_pages: '3-4 pages',
      best_for: 'Most projects, balanced detail',
      color_scheme: 'balanced',
      last_used: null,
      usage_count: 0
    },
    {
      id: 'simple',
      name: 'Simple Template',
      type: 'SIMPLE',
      category: 'basic',
      description: 'Quick price quote with essential line items and totals',
      features: ['Line Items', 'Total Amount', 'Basic Contact'],
      preview_url: null,
      is_popular: false,
      estimated_pages: '1-2 pages',
      best_for: 'Quick quotes, simple projects',
      color_scheme: 'minimal',
      last_used: null,
      usage_count: 0
    }
  ];

  const templateData = templates.length > 0 ? templates : defaultTemplates;

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Templates', icon: Layout },
    { id: 'premium', label: 'Premium', icon: Star },
    { id: 'standard', label: 'Standard', icon: FileText },
    { id: 'basic', label: 'Basic', icon: Zap }
  ];

  // Filter templates by category
  const filteredTemplates = templateData.filter(template => 
    activeCategory === 'all' || template.category === activeCategory
  );

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'DETAILED':
        return <Layers className="pdftemplateselector-template-type-icon detailed" />;
      case 'STANDARD':
        return <FileText className="pdftemplateselector-template-type-icon standard" />;
      case 'SIMPLE':
        return <Zap className="pdftemplateselector-template-type-icon simple" />;
      default:
        return <FileText className="pdftemplateselector-template-type-icon" />;
    }
  };

  const getColorSchemeClass = (scheme) => {
    switch (scheme) {
      case 'professional':
        return 'professional';
      case 'balanced':
        return 'balanced';
      case 'minimal':
        return 'minimal';
      default:
        return 'default';
    }
  };

  return (
    <div className={`pdftemplateselector-container ${className}`}>
      {/* Header */}
      <div className="pdftemplateselector-header">
        <div className="pdftemplateselector-header-content">
          <Layout className="pdftemplateselector-header-icon" />
          <div className="pdftemplateselector-header-text">
            <h2 className="pdftemplateselector-title">Choose Template</h2>
            <p className="pdftemplateselector-subtitle">
              Select the perfect layout for your quotation
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="pdftemplateselector-categories">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = activeCategory === category.id;
            const categoryCount = category.id === 'all' 
              ? templateData.length 
              : templateData.filter(t => t.category === category.id).length;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`pdftemplateselector-category-btn ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="pdftemplateselector-category-icon" />
                <span className="pdftemplateselector-category-label">{category.label}</span>
                {categoryCount > 0 && (
                  <span className="pdftemplateselector-category-count">{categoryCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="pdftemplateselector-content">
        {filteredTemplates.length === 0 ? (
          <div className="pdftemplateselector-empty">
            <Layout className="pdftemplateselector-empty-icon" />
            <h3 className="pdftemplateselector-empty-title">No Templates Found</h3>
            <p className="pdftemplateselector-empty-desc">
              No templates available in the selected category.
            </p>
          </div>
        ) : (
          <div className="pdftemplateselector-grid">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id || selectedTemplate === template.type;
              const isHovered = hoveredTemplate === template.id;

              return (
                <div
                  key={template.id}
                  className={`pdftemplateselector-card ${isSelected ? 'selected' : ''} ${getColorSchemeClass(template.color_scheme)}`}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  onClick={() => onTemplateSelect && onTemplateSelect(template)}
                >
                  {/* Template Header */}
                  <div className="pdftemplateselector-card-header">
                    <div className="pdftemplateselector-card-header-left">
                      {getTemplateIcon(template.type)}
                      <div className="pdftemplateselector-card-title-section">
                        <h3 className="pdftemplateselector-card-title">{template.name}</h3>
                        <div className="pdftemplateselector-card-badges">
                          {template.is_popular && (
                            <span className="pdftemplateselector-badge popular">
                              <Star className="pdftemplateselector-badge-icon" />
                              Popular
                            </span>
                          )}
                          <span className={`pdftemplateselector-badge type ${template.type.toLowerCase()}`}>
                            {template.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="pdftemplateselector-selected-indicator">
                        <CheckCircle className="pdftemplateselector-selected-icon" />
                      </div>
                    )}
                  </div>

                  {/* Template Description */}
                  <div className="pdftemplateselector-card-description">
                    <p className="pdftemplateselector-description-text">
                      {template.description}
                    </p>
                  </div>

                  {/* Template Features */}
                  <div className="pdftemplateselector-card-features">
                    <h4 className="pdftemplateselector-features-title">Includes:</h4>
                    <ul className="pdftemplateselector-features-list">
                      {template.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="pdftemplateselector-feature-item">
                          <CheckCircle className="pdftemplateselector-feature-icon" />
                          <span className="pdftemplateselector-feature-text">{feature}</span>
                        </li>
                      ))}
                      {template.features.length > 4 && (
                        <li className="pdftemplateselector-feature-item more">
                          <span className="pdftemplateselector-feature-more">
                            +{template.features.length - 4} more features
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Template Stats */}
                  {showStats && (
                    <div className="pdftemplateselector-card-stats">
                      <div className="pdftemplateselector-stat-item">
                        <Clock className="pdftemplateselector-stat-icon" />
                        <span className="pdftemplateselector-stat-text">{template.estimated_pages}</span>
                      </div>
                      {template.usage_count > 0 && (
                        <div className="pdftemplateselector-stat-item">
                          <Users className="pdftemplateselector-stat-icon" />
                          <span className="pdftemplateselector-stat-text">
                            Used {template.usage_count} times
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Template Best For */}
                  <div className="pdftemplateselector-card-bestfor">
                    <span className="pdftemplateselector-bestfor-label">Best for:</span>
                    <span className="pdftemplateselector-bestfor-text">{template.best_for}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pdftemplateselector-card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect && onTemplateSelect(template);
                      }}
                      className={`pdftemplateselector-action-btn primary ${isSelected ? 'selected' : ''}`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="pdftemplateselector-action-icon" />
                          Selected
                        </>
                      ) : (
                        <>
                          <FileText className="pdftemplateselector-action-icon" />
                          Select Template
                        </>
                      )}
                    </button>

                    <div className="pdftemplateselector-secondary-actions">
                      {showPreview && onTemplatePreview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTemplatePreview(template);
                          }}
                          className="pdftemplateselector-action-btn secondary"
                          title="Preview Template"
                        >
                          <Eye className="pdftemplateselector-action-icon" />
                        </button>
                      )}
                      
                      {onTemplateCustomize && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTemplateCustomize(template);
                          }}
                          className="pdftemplateselector-action-btn secondary"
                          title="Customize Template"
                        >
                          <Settings className="pdftemplateselector-action-icon" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  {isHovered && (
                    <div className="pdftemplateselector-card-overlay">
                      <div className="pdftemplateselector-overlay-content">
                        <Palette className="pdftemplateselector-overlay-icon" />
                        <span className="pdftemplateselector-overlay-text">
                          Click to select this template
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Template Comparison Footer */}
      {filteredTemplates.length > 1 && (
        <div className="pdftemplateselector-footer">
          <div className="pdftemplateselector-comparison">
            <BarChart3 className="pdftemplateselector-comparison-icon" />
            <div className="pdftemplateselector-comparison-content">
              <h4 className="pdftemplateselector-comparison-title">Template Comparison</h4>
              <div className="pdftemplateselector-comparison-grid">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="pdftemplateselector-comparison-item">
                    <span className="pdftemplateselector-comparison-name">{template.name}</span>
                    <span className="pdftemplateselector-comparison-pages">{template.estimated_pages}</span>
                    <span className="pdftemplateselector-comparison-features">
                      {template.features.length} features
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFTemplateSelector;