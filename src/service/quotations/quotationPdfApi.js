// src/service/quotations/quotationPdfApi.js
import api from '../api';

const quotationPdfApi = {
  // Generate PDF for a project
  generatePDF: async (projectId, templateId = null, options = {}) => {
    try {
      const payload = {
        project_id: projectId,
        template_id: templateId,
        ...options
      };

      const response = await api.post(`api/quotation-pdf/generate/${pdfId}`, payload);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - generatePDF error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to generate PDF';
      throw new Error(errorMessage);
    }
  },

  // Download PDF by ID or file path
  downloadPDF: async (pdfId) => {
    try {
      const response = await api.get(`api/quotation-pdf/download/${pdfId}/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - downloadPDF error:', error);
      throw new Error('Failed to download PDF');
    }
  },

  // Get PDF generation history
  getHistory: async (params = {}) => {
    try {
      const response = await api.get('api/quotation-pdf/history/', { params });
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getHistory error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to fetch PDF history';
      throw new Error(errorMessage);
    }
  },

  // Get PDF history for a specific project
  getProjectHistory: async (projectId) => {
    try {
      const response = await api.get(`api/quotation-pdf/history/project/${projectId}/`);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getProjectHistory error:', error);
      throw new Error('Failed to fetch project PDF history');
    }
  },

  // Get PDF customizations/templates
  getCustomizations: async () => {
    try {
      const response = await api.get('api/quotation-pdf/customizations/');
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getCustomizations error:', error);
      throw new Error('Failed to fetch PDF templates');
    }
  },

  // Get single customization/template
  getCustomization: async (id) => {
    try {
      const response = await api.get(`api/quotation-pdf/customizations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getCustomization error:', error);
      throw new Error('Failed to fetch PDF template');
    }
  },

  // Create new PDF customization/template
  createCustomization: async (customizationData) => {
    try {
      const response = await api.post('api/quotation-pdf/customizations/', customizationData);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - createCustomization error:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        const errorMessage = errors.detail || errors.message || 'Failed to create template';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to create PDF template');
    }
  },

  // Update PDF customization/template
  updateCustomization: async (id, customizationData) => {
    try {
      const response = await api.put(`api/quotation-pdf/customizations/${id}/`, customizationData);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - updateCustomization error:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object' && !errors.detail && !errors.message) {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(fieldErrors);
        }
        
        const errorMessage = errors.detail || errors.message || 'Failed to update template';
        throw new Error(errorMessage);
      }
      
      throw new Error('Failed to update PDF template');
    }
  },

  // Delete PDF customization/template
  deleteCustomization: async (id) => {
    try {
      await api.delete(`api/quotation-pdf/customizations/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('QuotationPDF API - deleteCustomization error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete template';
      throw new Error(errorMessage);
    }
  },

  // Get PDF preview
  previewPDF: async (projectId, templateId = null) => {
    try {
      const response = await api.post('api/quotation-pdf/preview/', {
        project_id: projectId,
        template_id: templateId
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - previewPDF error:', error);
      throw new Error('Failed to generate PDF preview');
    }
  },

  // Bulk generate PDFs for multiple projects
  bulkGenerate: async (projectIds, templateId = null) => {
    try {
      const response = await api.post('api/quotation-pdf/bulk-generate/', {
        project_ids: projectIds,
        template_id: templateId
      });
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - bulkGenerate error:', error);
      throw new Error('Failed to generate bulk PDFs');
    }
  },

  // Get PDF generation status (for async generation)
  getGenerationStatus: async (taskId) => {
    try {
      const response = await api.get(`api/quotation-pdf/status/${taskId}/`);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getGenerationStatus error:', error);
      throw new Error('Failed to get generation status');
    }
  },

  // Email PDF to customer
  emailPDF: async (historyId, emailData) => {
    try {
      const response = await api.post(`api/quotation-pdf/email/${historyId}/`, emailData);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - emailPDF error:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Failed to send PDF email';
      throw new Error(errorMessage);
    }
  },

  // Share PDF via link
  sharePDF: async (historyId, shareOptions = {}) => {
    try {
      const response = await api.post(`api/quotation-pdf/share/${historyId}/`, shareOptions);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - sharePDF error:', error);
      throw new Error('Failed to create share link');
    }
  },

  // Get PDF statistics and analytics
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get('api/quotation-pdf/statistics/', { params });
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getStatistics error:', error);
      throw new Error('Failed to fetch PDF statistics');
    }
  },

  // Regenerate existing PDF with new template
  regeneratePDF: async (historyId, templateId = null) => {
    try {
      const response = await api.post(`api/quotation-pdf/regenerate/${historyId}/`, {
        template_id: templateId
      });
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - regeneratePDF error:', error);
      throw new Error('Failed to regenerate PDF');
    }
  },

  // Archive/Delete PDF from history
  archivePDF: async (historyId) => {
    try {
      const response = await api.post(`api/quotation-pdf/archive/${historyId}/`);
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - archivePDF error:', error);
      throw new Error('Failed to archive PDF');
    }
  }
};

export default quotationPdfApi;