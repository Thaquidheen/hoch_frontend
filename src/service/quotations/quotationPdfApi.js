// src/service/quotations/quotationPdfApi.js
import api from '../api';

const quotationPdfApi = {
  // ============================================================================
  // PDF GENERATION - ALIGNED WITH YOUR BACKEND
  // ============================================================================
  
  // Generate PDF for a project
  generatePDF: async (projectId, templateId = null, options = {}) => {
    try {
      console.log('PDF API - generatePDF called:', { projectId, templateId, options });
      
      const payload = {
        template_id: templateId,
        template_type: templateId || options.template_type || 'DETAILED',
        
        // Content sections
        include_cabinet_details: options.include_cabinet_details ?? true,
        include_door_details: options.include_door_details ?? true,
        include_accessories: options.include_accessories ?? true,
        include_accessory_images: options.include_accessory_images ?? true,
        include_plan_images: options.include_plan_images ?? true,
        include_lighting: options.include_lighting ?? true,
        
        // Display options
        show_item_codes: options.show_item_codes ?? true,
        show_dimensions: options.show_dimensions ?? true,
        include_warranty_info: options.include_warranty_info ?? true,
        include_terms_conditions: options.include_terms_conditions ?? true,
        
        // Discount settings
        discount_percentage: options.discount_percentage || 0,
        discount_amount: options.discount_amount || 0,
        discount_reason: options.discount_reason || '',
        
        // Customer notes
        special_instructions: options.special_instructions || '',
        installation_notes: options.installation_notes || '',
        timeline_notes: options.timeline_notes || '',
        custom_requirements: options.custom_requirements || '',
        
        // Selected plan images (if any)
        selected_plan_images: options.selected_plan_images || [],
        
        ...options
      };

      console.log('PDF API - Final payload:', payload);

      // CORRECTED: Use the actual backend URL pattern
      const response = await api.post(`/api/quotation-pdf/generate/${projectId}/`, payload);
      
      console.log('PDF API - Generation response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - generatePDF error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to generate PDF';
      throw new Error(errorMessage);
    }
  },

  // ============================================================================
  // PDF DOWNLOAD & PREVIEW - ALIGNED WITH YOUR BACKEND
  // ============================================================================

  // Download PDF by ID
  downloadPDF: async (pdfId) => {
    try {
      console.log('PDF API - downloadPDF called:', pdfId);
      
      // CORRECTED: Use the actual backend URL pattern
      const response = await api.get(`/api/quotation-pdf/download/${pdfId}/`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      console.log('PDF API - Download response received');
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - downloadPDF error:', error);
      throw new Error('Failed to download PDF');
    }
  },

  // Get PDF preview
  previewPDF: async (projectId, templateId = null) => {
    try {
      console.log('PDF API - previewPDF called:', { projectId, templateId });
      
      // CORRECTED: Use the actual backend URL pattern
      const response = await api.post(`/api/quotation-pdf/preview/${projectId}/`, {
        template_id: templateId
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      console.log('PDF API - Preview response received');
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - previewPDF error:', error);
      throw new Error('Failed to generate PDF preview');
    }
  },

  // ============================================================================
  // PDF HISTORY & MANAGEMENT - ALIGNED WITH YOUR BACKEND
  // ============================================================================

  // Get PDF generation history (all PDFs) - FALLBACK FOR GENERAL HISTORY
  getHistory: async (params = {}) => {
    try {
      console.log('PDF API - getHistory called:', params);
      
      // Since your backend doesn't have general history endpoint, 
      // we'll need to implement this or use a different approach
      const response = await api.get('/api/quotation-pdf/history/', { params });
      
      console.log('PDF API - History response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getHistory error:', error);
      // Fallback to empty array if endpoint doesn't exist
      return [];
    }
  },

  // Get PDF history for a specific project - CORRECTED URL
  getProjectHistory: async (projectId) => {
    try {
      console.log('PDF API - getProjectHistory called:', projectId);
      
      // CORRECTED: Use your actual backend URL pattern
      const response = await api.get(`/api/quotation-pdf/history/${projectId}/`);
      
      console.log('PDF API - Project history response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getProjectHistory error:', error);
      throw new Error('Failed to fetch project PDF history');
    }
  },

  // ============================================================================
  // TEMPLATE & CUSTOMIZATION MANAGEMENT - ALIGNED WITH YOUR BACKEND
  // ============================================================================

  // Get PDF templates
  getCustomizations: async () => {
    try {
      console.log('PDF API - getCustomizations called');
      
      // CORRECTED: Use your actual backend URL pattern
      const response = await api.get('/api/quotation-pdf/templates/');
      
      console.log('PDF API - Templates response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getCustomizations error:', error);
      
      // Fallback to default templates if API fails
      return [
        {
          id: 'detailed',
          name: 'Detailed Template',
          template_type: 'DETAILED',
          description: 'Complete quotation with all sections, images, and specifications',
          is_active: true,
          features: ['Product Images', 'Floor Plans', 'Detailed Specs', 'Warranty Info', 'Terms & Conditions'],
          estimated_pages: '6-8 pages',
          best_for: 'High-value projects, detailed presentations'
        },
        {
          id: 'standard',
          name: 'Standard Template',
          template_type: 'STANDARD',
          description: 'Professional quotation with essential information and key details',
          is_active: true,
          features: ['Line Items', 'Basic Images', 'Pricing Summary', 'Contact Info'],
          estimated_pages: '3-4 pages',
          best_for: 'Most projects, balanced detail'
        },
        {
          id: 'simple',
          name: 'Simple Template',
          template_type: 'SIMPLE',
          description: 'Quick price quote with essential line items and totals',
          is_active: true,
          features: ['Line Items', 'Total Amount', 'Basic Contact'],
          estimated_pages: '1-2 pages',
          best_for: 'Quick quotes, simple projects'
        }
      ];
    }
  },

  // Get project's PDF customization settings - CORRECTED URL
  getProjectCustomization: async (projectId) => {
    try {
      console.log('PDF API - getProjectCustomization called:', projectId);
      
      // CORRECTED: Use your actual backend URL pattern
      const response = await api.get(`/api/quotation-pdf/customization/${projectId}/`);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - getProjectCustomization error:', error);
      
      // Return default settings if none exist
      return {
        template_type: 'DETAILED',
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
        timeline_notes: '',
        custom_requirements: ''
      };
    }
  },

  // Save project's PDF customization settings - CORRECTED URL
  saveProjectCustomization: async (projectId, customizationData) => {
    try {
      console.log('PDF API - saveProjectCustomization called:', { projectId, customizationData });
      
      // CORRECTED: Use your actual backend URL pattern
      const response = await api.post(`/api/quotation-pdf/customization/${projectId}/save/`, customizationData);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - saveProjectCustomization error:', error);
      throw new Error('Failed to save PDF customization');
    }
  },

  // ============================================================================
  // VALIDATION - ALIGNED WITH YOUR BACKEND
  // ============================================================================

  // Validate customization before generation - CORRECTED URL
  validateCustomization: async (projectId, customizationData) => {
    try {
      console.log('PDF API - validateCustomization called:', { projectId, customizationData });
      
      // CORRECTED: Use your actual backend URL pattern
      const response = await api.post(`/api/quotation-pdf/validate/${projectId}/`, customizationData);
      
      return response.data;
    } catch (error) {
      console.error('QuotationPDF API - validateCustomization error:', error);
      throw new Error('Failed to validate customization');
    }
  },

  // ============================================================================
  // METHODS NOT IMPLEMENTED IN YOUR BACKEND YET
  // These will return mock responses or errors until you implement them
  // ============================================================================

  // Email PDF to customer - NOT IMPLEMENTED YET
  emailPDF: async (historyId, emailData) => {
    try {
      console.log('PDF API - emailPDF called (NOT IMPLEMENTED):', { historyId, emailData });
      
      // This endpoint doesn't exist in your backend yet
      // Returning a mock success response
      return {
        success: true,
        message: 'Email functionality not implemented yet in backend'
      };
    } catch (error) {
      console.error('QuotationPDF API - emailPDF error:', error);
      throw new Error('Email functionality not implemented yet');
    }
  },

  // Share PDF via link - NOT IMPLEMENTED YET
  sharePDF: async (historyId, shareOptions = {}) => {
    try {
      console.log('PDF API - sharePDF called (NOT IMPLEMENTED):', { historyId, shareOptions });
      
      // This endpoint doesn't exist in your backend yet
      return {
        success: true,
        share_url: '#',
        message: 'Share functionality not implemented yet in backend'
      };
    } catch (error) {
      console.error('QuotationPDF API - sharePDF error:', error);
      throw new Error('Share functionality not implemented yet');
    }
  },

  // Bulk generate PDFs - NOT IMPLEMENTED YET
  bulkGenerate: async (projectIds, templateId = null) => {
    try {
      console.log('PDF API - bulkGenerate called (NOT IMPLEMENTED):', { projectIds, templateId });
      
      return {
        success: true,
        message: 'Bulk generation not implemented yet in backend'
      };
    } catch (error) {
      console.error('QuotationPDF API - bulkGenerate error:', error);
      throw new Error('Bulk generation not implemented yet');
    }
  },

  // Get PDF statistics - NOT IMPLEMENTED YET
  getStatistics: async (params = {}) => {
    try {
      console.log('PDF API - getStatistics called (NOT IMPLEMENTED):', params);
      
      return {
        total_pdfs: 0,
        total_projects: 0,
        most_used_template: 'DETAILED',
        success_rate: 100
      };
    } catch (error) {
      console.error('QuotationPDF API - getStatistics error:', error);
      return {};
    }
  },

  // Regenerate PDF - NOT IMPLEMENTED YET
  regeneratePDF: async (historyId, templateId = null) => {
    try {
      console.log('PDF API - regeneratePDF called (NOT IMPLEMENTED):', { historyId, templateId });
      
      return {
        success: true,
        message: 'Regenerate functionality not implemented yet in backend'
      };
    } catch (error) {
      console.error('QuotationPDF API - regeneratePDF error:', error);
      throw new Error('Regenerate functionality not implemented yet');
    }
  },

  // Archive PDF - NOT IMPLEMENTED YET
  archivePDF: async (historyId) => {
    try {
      console.log('PDF API - archivePDF called (NOT IMPLEMENTED):', historyId);
      
      return {
        success: true,
        message: 'Archive functionality not implemented yet in backend'
      };
    } catch (error) {
      console.error('QuotationPDF API - archivePDF error:', error);
      throw new Error('Archive functionality not implemented yet');
    }
  },

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Format file size for display
  formatFileSize: (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Get status color for UI
  getStatusColor: (status) => {
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
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Format currency for display
  formatCurrency: (amount) => {
    if (!amount) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  },

  // ============================================================================
  // DEVELOPMENT & TESTING HELPERS
  // ============================================================================

  // Test API connection
  testConnection: async () => {
    try {
      // Test with a simple endpoint that exists
      const response = await api.get('/api/quotation-pdf/templates/');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Connection test failed' 
      };
    }
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export default quotationPdfApi;

// Named exports for convenience
export const {
  generatePDF,
  downloadPDF,
  previewPDF,
  getHistory,
  getProjectHistory,
  getCustomizations,
  getProjectCustomization,
  saveProjectCustomization,
  validateCustomization,
  emailPDF,
  sharePDF,
  bulkGenerate,
  getStatistics,
  regeneratePDF,
  archivePDF,
  formatFileSize,
  getStatusColor,
  formatDate,
  formatCurrency,
  testConnection
} = quotationPdfApi;