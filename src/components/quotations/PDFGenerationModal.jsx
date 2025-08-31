import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Settings, 
  Eye, 
  Download, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import './PDFGenerationModal.css';
const PDFGenerationModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName = '', 
  onGenerate,
  templates = [],
  loading = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('DETAILED');
  const [customizations, setCustomizations] = useState({
    include_cabinet_details: true,
    include_door_details: true,
    include_accessories: true,
    include_accessory_images: true,
    include_plan_images: true,
    include_lighting: true,
    show_item_codes: true,
    show_dimensions: true,
    include_warranty_info: true,
    include_terms_conditions: true,
    discount_percentage: 0,
    discount_amount: 0,
    discount_reason: '',
    special_instructions: '',
    installation_notes: '',
    timeline_notes: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationStep, setGenerationStep] = useState('template'); // template, customize, generate, complete

  useEffect(() => {
    if (isOpen) {
      setGenerationStep('template');
      setShowAdvanced(false);
    }
  }, [isOpen]);

  const handleCustomizationChange = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickGenerate = () => {
    const quickOptions = {
      template_type: selectedTemplate,
      ...customizations
    };
    onGenerate(projectId, selectedTemplate, quickOptions);
  };

  const handleAdvancedGenerate = () => {
    setGenerationStep('generate');
    const advancedOptions = {
      template_type: selectedTemplate,
      ...customizations
    };
    onGenerate(projectId, selectedTemplate, advancedOptions);
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'DETAILED':
        return <FileText className="pdfgenerationmodal-template-icon detailed" />;
      case 'STANDARD':
        return <FileText className="pdfgenerationmodal-template-icon standard" />;
      case 'SIMPLE':
        return <FileText className="pdfgenerationmodal-template-icon simple" />;
      default:
        return <FileText className="pdfgenerationmodal-template-icon" />;
    }
  };

  const getTemplateDescription = (type) => {
    switch (type) {
      case 'DETAILED':
        return 'Complete quotation with images, plans, and detailed specifications';
      case 'STANDARD':
        return 'Professional quotation with essential information and key details';
      case 'SIMPLE':
        return 'Basic price quote with line items and totals';
      default:
        return 'Standard quotation template';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pdfgenerationmodal-overlay">
      <div className="pdfgenerationmodal-container">
        {/* Header */}
        <div className="pdfgenerationmodal-header">
          <div className="pdfgenerationmodal-header-content">
            <FileText className="pdfgenerationmodal-header-icon" />
            <div className="pdfgenerationmodal-header-text">
              <h2 className="pdfgenerationmodal-title">Generate PDF Quotation</h2>
              <p className="pdfgenerationmodal-subtitle">
                Project: {projectName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="pdfgenerationmodal-close-btn"
            disabled={loading}
          >
            <X className="pdfgenerationmodal-close-icon" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="pdfgenerationmodal-progress">
          <div className={`pdfgenerationmodal-progress-step ${generationStep === 'template' ? 'active' : generationStep === 'customize' || generationStep === 'generate' || generationStep === 'complete' ? 'completed' : ''}`}>
            <span className="pdfgenerationmodal-progress-number">1</span>
            <span className="pdfgenerationmodal-progress-label">Template</span>
          </div>
          <div className="pdfgenerationmodal-progress-line"></div>
          <div className={`pdfgenerationmodal-progress-step ${generationStep === 'customize' ? 'active' : generationStep === 'generate' || generationStep === 'complete' ? 'completed' : ''}`}>
            <span className="pdfgenerationmodal-progress-number">2</span>
            <span className="pdfgenerationmodal-progress-label">Customize</span>
          </div>
          <div className="pdfgenerationmodal-progress-line"></div>
          <div className={`pdfgenerationmodal-progress-step ${generationStep === 'generate' ? 'active' : generationStep === 'complete' ? 'completed' : ''}`}>
            <span className="pdfgenerationmodal-progress-number">3</span>
            <span className="pdfgenerationmodal-progress-label">Generate</span>
          </div>
        </div>

        {/* Content */}
        <div className="pdfgenerationmodal-content">
          {generationStep === 'template' && (
            <div className="pdfgenerationmodal-template-section">
              <h3 className="pdfgenerationmodal-section-title">Choose Template Type</h3>
              
              <div className="pdfgenerationmodal-template-grid">
                {['DETAILED', 'STANDARD', 'SIMPLE'].map((templateType) => (
                  <div
                    key={templateType}
                    className={`pdfgenerationmodal-template-card ${selectedTemplate === templateType ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(templateType)}
                  >
                    {getTemplateIcon(templateType)}
                    <div className="pdfgenerationmodal-template-info">
                      <h4 className="pdfgenerationmodal-template-name">
                        {templateType.charAt(0) + templateType.slice(1).toLowerCase()} Template
                      </h4>
                      <p className="pdfgenerationmodal-template-desc">
                        {getTemplateDescription(templateType)}
                      </p>
                    </div>
                    {selectedTemplate === templateType && (
                      <CheckCircle className="pdfgenerationmodal-template-selected" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pdfgenerationmodal-template-actions">
                <button 
                  onClick={handleQuickGenerate}
                  className="pdfgenerationmodal-btn primary"
                  disabled={loading}
                >
                  <Download className="pdfgenerationmodal-btn-icon" />
                  Quick Generate
                </button>
                <button 
                  onClick={() => setGenerationStep('customize')}
                  className="pdfgenerationmodal-btn secondary"
                >
                  <Settings className="pdfgenerationmodal-btn-icon" />
                  Customize Options
                </button>
              </div>
            </div>
          )}

          {generationStep === 'customize' && (
            <div className="pdfgenerationmodal-customize-section">
              <h3 className="pdfgenerationmodal-section-title">Customize PDF Content</h3>
              
              {/* Content Sections */}
              <div className="pdfgenerationmodal-customize-group">
                <h4 className="pdfgenerationmodal-group-title">Include Sections</h4>
                <div className="pdfgenerationmodal-checkbox-grid">
                  {[
                    { key: 'include_cabinet_details', label: 'Cabinet Details' },
                    { key: 'include_door_details', label: 'Door Specifications' },
                    { key: 'include_accessories', label: 'Accessories' },
                    { key: 'include_accessory_images', label: 'Accessory Images' },
                    { key: 'include_plan_images', label: 'Plan Images' },
                    { key: 'include_lighting', label: 'Lighting Details' }
                  ].map((item) => (
                    <label key={item.key} className="pdfgenerationmodal-checkbox-item">
                      <input
                        type="checkbox"
                        checked={customizations[item.key]}
                        onChange={(e) => handleCustomizationChange(item.key, e.target.checked)}
                        className="pdfgenerationmodal-checkbox"
                      />
                      <span className="pdfgenerationmodal-checkbox-label">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display Options */}
              <div className="pdfgenerationmodal-customize-group">
                <h4 className="pdfgenerationmodal-group-title">Display Options</h4>
                <div className="pdfgenerationmodal-checkbox-grid">
                  {[
                    { key: 'show_item_codes', label: 'Show Item Codes' },
                    { key: 'show_dimensions', label: 'Show Dimensions' },
                    { key: 'include_warranty_info', label: 'Include Warranty' },
                    { key: 'include_terms_conditions', label: 'Terms & Conditions' }
                  ].map((item) => (
                    <label key={item.key} className="pdfgenerationmodal-checkbox-item">
                      <input
                        type="checkbox"
                        checked={customizations[item.key]}
                        onChange={(e) => handleCustomizationChange(item.key, e.target.checked)}
                        className="pdfgenerationmodal-checkbox"
                      />
                      <span className="pdfgenerationmodal-checkbox-label">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount Settings */}
              <div className="pdfgenerationmodal-customize-group">
                <h4 className="pdfgenerationmodal-group-title">Discount Settings</h4>
                <div className="pdfgenerationmodal-input-row">
                  <div className="pdfgenerationmodal-input-group">
                    <label className="pdfgenerationmodal-input-label">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={customizations.discount_percentage}
                      onChange={(e) => handleCustomizationChange('discount_percentage', parseFloat(e.target.value) || 0)}
                      className="pdfgenerationmodal-input"
                    />
                  </div>
                  <div className="pdfgenerationmodal-input-group">
                    <label className="pdfgenerationmodal-input-label">Discount Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customizations.discount_amount}
                      onChange={(e) => handleCustomizationChange('discount_amount', parseFloat(e.target.value) || 0)}
                      className="pdfgenerationmodal-input"
                    />
                  </div>
                </div>
                <div className="pdfgenerationmodal-input-group">
                  <label className="pdfgenerationmodal-input-label">Discount Reason</label>
                  <input
                    type="text"
                    value={customizations.discount_reason}
                    onChange={(e) => handleCustomizationChange('discount_reason', e.target.value)}
                    className="pdfgenerationmodal-input"
                    placeholder="e.g., Bulk order discount, Seasonal offer"
                  />
                </div>
              </div>

              {/* Customer Notes */}
              <div className="pdfgenerationmodal-customize-group">
                <h4 className="pdfgenerationmodal-group-title">Customer Notes</h4>
                <div className="pdfgenerationmodal-input-group">
                  <label className="pdfgenerationmodal-input-label">Special Instructions</label>
                  <textarea
                    value={customizations.special_instructions}
                    onChange={(e) => handleCustomizationChange('special_instructions', e.target.value)}
                    className="pdfgenerationmodal-textarea"
                    rows="3"
                    placeholder="Any special requirements or instructions..."
                  />
                </div>
                <div className="pdfgenerationmodal-input-group">
                  <label className="pdfgenerationmodal-input-label">Installation Notes</label>
                  <textarea
                    value={customizations.installation_notes}
                    onChange={(e) => handleCustomizationChange('installation_notes', e.target.value)}
                    className="pdfgenerationmodal-textarea"
                    rows="3"
                    placeholder="Installation-specific notes and requirements..."
                  />
                </div>
              </div>

              <div className="pdfgenerationmodal-customize-actions">
                <button 
                  onClick={() => setGenerationStep('template')}
                  className="pdfgenerationmodal-btn secondary"
                >
                  Back to Templates
                </button>
                <button 
                  onClick={handleAdvancedGenerate}
                  className="pdfgenerationmodal-btn primary"
                  disabled={loading}
                >
                  <Download className="pdfgenerationmodal-btn-icon" />
                  Generate PDF
                </button>
              </div>
            </div>
          )}

          {generationStep === 'generate' && (
            <div className="pdfgenerationmodal-generating-section">
              <div className="pdfgenerationmodal-generating-content">
                <Clock className="pdfgenerationmodal-generating-icon" />
                <h3 className="pdfgenerationmodal-generating-title">Generating PDF...</h3>
                <p className="pdfgenerationmodal-generating-desc">
                  Please wait while we compile your quotation document
                </p>
                <div className="pdfgenerationmodal-progress-bar">
                  <div className="pdfgenerationmodal-progress-bar-fill"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generationStep !== 'generate' && (
          <div className="pdfgenerationmodal-footer">
            <p className="pdfgenerationmodal-footer-note">
              The generated PDF will be automatically downloaded and saved to your project history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFGenerationModal;