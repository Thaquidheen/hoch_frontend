// src/hooks/quotations/useQuotationPDF.js
import { useState, useEffect, useCallback } from 'react';
import quotationPdfApi from '../../service/quotations/quotationPdfApi';

const useQuotationPDF = (projectId = null) => {
  const [pdfHistory, setPdfHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState({});

  // Load PDF history
  const loadHistory = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let historyData;
      if (projectId) {
        historyData = await quotationPdfApi.getProjectHistory(projectId);
      } else {
        historyData = await quotationPdfApi.getHistory(filters);
      }
      
      setPdfHistory(Array.isArray(historyData) ? historyData : historyData.results || []);
    } catch (err) {
      console.error('Failed to load PDF history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const templatesData = await quotationPdfApi.getCustomizations();
      setTemplates(Array.isArray(templatesData) ? templatesData : templatesData.results || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Use default templates if API fails
      setTemplates([
        {
          id: 'detailed',
          name: 'Detailed Template',
          template_type: 'DETAILED',
          description: 'Complete quotation with all sections and images',
          is_active: true
        },
        {
          id: 'standard', 
          name: 'Standard Template',
          template_type: 'STANDARD',
          description: 'Professional quotation with essential information',
          is_active: true
        },
        {
          id: 'simple',
          name: 'Simple Template', 
          template_type: 'SIMPLE',
          description: 'Basic price quote with line items',
          is_active: true
        }
      ]);
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async (params = {}) => {
    try {
      const statsData = await quotationPdfApi.getStatistics(params);
      setStatistics(statsData || {});
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setStatistics({});
    }
  }, []);

  // Generate PDF
  const generatePDF = useCallback(async (projectId, templateId = null, options = {}) => {
    const generationKey = `${projectId}-${templateId || 'default'}`;
    
    try {
      setGenerating(prev => ({ ...prev, [generationKey]: true }));
      setError(null);

      console.log('Generating PDF:', { projectId, templateId, options });
      
      const result = await quotationPdfApi.generatePDF(projectId, templateId, options);
      
      console.log('PDF generation result:', result);
      
      // Refresh history after successful generation
      await loadHistory();
      
      return {
        success: true,
        data: result,
        download_url: result.download_url || result.file_url,
        message: 'PDF generated successfully'
      };
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message || 'Failed to generate PDF'
      };
    } finally {
      setGenerating(prev => ({ ...prev, [generationKey]: false }));
    }
  }, [loadHistory]);

  // Download PDF
  const downloadPDF = useCallback(async (pdfId) => {
    try {
      setError(null);
      
      const blob = await quotationPdfApi.downloadPDF(pdfId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from history
      const pdf = pdfHistory.find(p => p.id === pdfId);
      const filename = pdf?.filename || `quotation-${pdfId}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (err) {
      console.error('PDF download failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to download PDF' };
    }
  }, [pdfHistory]);

  // Preview PDF
  const previewPDF = useCallback(async (pdfId) => {
    try {
      setError(null);
      
      const blob = await quotationPdfApi.previewPDF(pdfId);
      const url = window.URL.createObjectURL(blob);
      
      return url;
    } catch (err) {
      console.error('PDF preview failed:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Email PDF
  const emailPDF = useCallback(async (pdfId, emailData) => {
    try {
      setError(null);
      
      const result = await quotationPdfApi.emailPDF(pdfId, {
        recipient_email: emailData.recipient_email,
        subject: emailData.subject || 'Kitchen Quotation',
        message: emailData.message || 'Please find attached your kitchen quotation.'
      });
      
      return { success: true, data: result, message: 'PDF emailed successfully' };
    } catch (err) {
      console.error('PDF email failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to email PDF' };
    }
  }, []);

  // Share PDF
  const sharePDF = useCallback(async (pdfId, shareOptions = {}) => {
    try {
      setError(null);
      
      const result = await quotationPdfApi.sharePDF(pdfId, shareOptions);
      
      return { success: true, data: result, message: 'Share link created successfully' };
    } catch (err) {
      console.error('PDF share failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to create share link' };
    }
  }, []);

  // Regenerate PDF
  const regeneratePDF = useCallback(async (historyId, templateId = null) => {
    try {
      setError(null);
      
      const result = await quotationPdfApi.regeneratePDF(historyId, templateId);
      
      // Refresh history after regeneration
      await loadHistory();
      
      return { success: true, data: result, message: 'PDF regenerated successfully' };
    } catch (err) {
      console.error('PDF regeneration failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to regenerate PDF' };
    }
  }, [loadHistory]);

  // Delete PDF
  const deletePDF = useCallback(async (historyId) => {
    try {
      setError(null);
      
      await quotationPdfApi.archivePDF(historyId);
      
      // Remove from local state
      setPdfHistory(prev => prev.filter(pdf => pdf.id !== historyId));
      
      return { success: true, message: 'PDF deleted successfully' };
    } catch (err) {
      console.error('PDF deletion failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to delete PDF' };
    }
  }, []);

  // Bulk generate PDFs
  const bulkGeneratePDF = useCallback(async (projectIds, templateId = null) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await quotationPdfApi.bulkGenerate(projectIds, templateId);
      
      // Refresh history after bulk generation
      await loadHistory();
      
      return { success: true, data: result, message: 'Bulk PDF generation started' };
    } catch (err) {
      console.error('Bulk PDF generation failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to start bulk generation' };
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  // Get generation status
  const getGenerationStatus = useCallback(async (taskId) => {
    try {
      const status = await quotationPdfApi.getGenerationStatus(taskId);
      return { success: true, data: status };
    } catch (err) {
      console.error('Failed to get generation status:', err);
      return { success: false, error: err.message || 'Failed to get status' };
    }
  }, []);

  // Template management
  const createTemplate = useCallback(async (templateData) => {
    try {
      setError(null);
      
      const result = await quotationPdfApi.createCustomization(templateData);
      
      // Refresh templates
      await loadTemplates();
      
      return { success: true, data: result, message: 'Template created successfully' };
    } catch (err) {
      console.error('Template creation failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to create template' };
    }
  }, [loadTemplates]);

  const updateTemplate = useCallback(async (templateId, templateData) => {
    try {
      setError(null);
      
      const result = await quotationPdfApi.updateCustomization(templateId, templateData);
      
      // Refresh templates
      await loadTemplates();
      
      return { success: true, data: result, message: 'Template updated successfully' };
    } catch (err) {
      console.error('Template update failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to update template' };
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (templateId) => {
    try {
      setError(null);
      
      await quotationPdfApi.deleteCustomization(templateId);
      
      // Remove from local state
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      
      return { success: true, message: 'Template deleted successfully' };
    } catch (err) {
      console.error('Template deletion failed:', err);
      setError(err.message);
      return { success: false, error: err.message || 'Failed to delete template' };
    }
  }, []);

  // Utility functions
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'generated':
      case 'completed':
        return 'success';
      case 'generating':
      case 'in_progress':
        return 'warning';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([loadHistory(), loadTemplates(), loadStatistics()]);
    } catch (err) {
      console.error('Failed to refresh all data:', err);
      setError('Failed to refresh data');
    }
  }, [loadHistory, loadTemplates, loadStatistics]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadHistory(), loadTemplates()]);
    };
    
    initializeData();
  }, [loadHistory, loadTemplates]);

  // Return hook interface
  return {
    // Data
    pdfHistory,
    templates,
    statistics,
    loading,
    error,
    generating,

    // Core PDF operations
    generatePDF,
    downloadPDF,
    previewPDF,
    emailPDF,
    sharePDF,
    regeneratePDF,
    deletePDF,

    // Bulk operations
    bulkGeneratePDF,
    getGenerationStatus,

    // Template management
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Data loading
    loadHistory,
    loadTemplates,
    loadStatistics,
    refreshAll,

    // Utility functions
    formatFileSize,
    getStatusColor,

    // Status checks
    isGenerating: (projectId, templateId) => {
      const key = `${projectId}-${templateId || 'default'}`;
      return generating[key] || false;
    },

    // Get filtered history
    getProjectHistory: (projectId) => {
      return pdfHistory.filter(pdf => pdf.project_id === projectId);
    },

    // Get template by type
    getTemplateByType: (templateType) => {
      return templates.find(template => template.template_type === templateType) ||
             templates.find(template => template.template_type === 'DETAILED');
    }
  };
};

export default useQuotationPDF;