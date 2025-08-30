// src/hooks/useQuotationPDF.js
import { useState, useCallback } from 'react';
import api from '../../service/api'; // Adjust path as needed

export const useQuotationPDF = () => {
  const [pdfHistory, setPdfHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [statistics, setStatistics] = useState(null);

  // Load PDF history
  const loadHistory = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/api/quotations/pdf-history/', { params });
      setPdfHistory(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load PDF history:', error);
      throw error; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/quotations/pdf-templates/');
      setTemplates(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load PDF templates:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/quotations/pdf-statistics/');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load PDF statistics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([loadHistory(), loadTemplates(), loadStatistics()]);
    } catch (error) {
      console.error('Failed to refresh all data:', error);
      throw error;
    }
  }, [loadHistory, loadTemplates, loadStatistics]);

  // Generate PDF
  const generatePDF = useCallback(async (quotationId, templateId, options = {}) => {
    setGenerating(prev => ({ ...prev, [quotationId]: true }));
    try {
      const response = await api.post(`/api/quotations/${quotationId}/generate-pdf/`, {
        template_id: templateId,
        ...options
      });
      // Refresh history after generation
      await loadHistory();
      return response.data;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    } finally {
      setGenerating(prev => ({ ...prev, [quotationId]: false }));
    }
  }, [loadHistory]);

  // Download PDF
  const downloadPDF = useCallback(async (pdfId) => {
    try {
      const response = await api.get(`/api/quotations/pdf/${pdfId}/download/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${pdfId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  }, []);

  // Email PDF
  const emailPDF = useCallback(async (pdfId, emailData) => {
    try {
      const response = await api.post(`/api/quotations/pdf/${pdfId}/email/`, emailData);
      return response.data;
    } catch (error) {
      console.error('Failed to email PDF:', error);
      throw error;
    }
  }, []);

  // Preview PDF
  const previewPDF = useCallback(async (pdfId) => {
    try {
      const response = await api.get(`/api/quotations/pdf/${pdfId}/preview/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to preview PDF:', error);
      throw error;
    }
  }, []);

  // Get project history
  const getProjectHistory = useCallback(async (projectId) => {
    try {
      const response = await api.get(`/api/quotations/projects/${projectId}/pdf-history/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get project PDF history:', error);
      throw error;
    }
  }, []);

  // Create template
  const createTemplate = useCallback(async (templateData) => {
    try {
      const response = await api.post('/api/quotations/pdf-templates/', templateData);
      await loadTemplates(); // Refresh templates
      return response.data;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }, [loadTemplates]);

  // Update template
  const updateTemplate = useCallback(async (templateId, templateData) => {
    try {
      const response = await api.put(`/api/quotations/pdf-templates/${templateId}/`, templateData);
      await loadTemplates(); // Refresh templates
      return response.data;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }, [loadTemplates]);

  // Delete template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      await api.delete(`/api/quotations/pdf-templates/${templateId}/`);
      await loadTemplates(); // Refresh templates
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }, [loadTemplates]);

  // Bulk generate PDFs
  const bulkGeneratePDF = useCallback(async (projectIds, templateId = null) => {
    try {
      const response = await api.post('/api/quotations/bulk-generate-pdf/', {
        project_ids: projectIds,
        template_id: templateId
      });
      await loadHistory(); // Refresh history
      return response.data;
    } catch (error) {
      console.error('Failed to bulk generate PDFs:', error);
      throw error;
    }
  }, [loadHistory]);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Get status color
  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#10b981';
      case 'processing':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }, []);

  return {
    pdfHistory,
    templates,
    loading,
    generating,
    statistics,
    loadHistory,
    loadTemplates,
    loadStatistics,  // Added
    refreshAll,     // Added
    generatePDF,
    downloadPDF,
    emailPDF,
    previewPDF,
    getProjectHistory,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    bulkGeneratePDF,
    formatFileSize,
    getStatusColor
  };
};

export default useQuotationPDF;

