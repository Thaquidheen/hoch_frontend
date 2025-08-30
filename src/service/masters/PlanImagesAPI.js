// src/service/planImagesApi.js - FIXED VERSION
import api from '../api'; // Your existing API instance

class PlanImagesAPI {
  constructor() {
    this.baseURL = '/api/pricing';
  }

  // ====================
  // GROUP MANAGEMENT
  // ====================

  /**
   * Get all image groups for a project
   * @param {number} projectId 
   * @returns {Promise<Array>}
   */
  async getProjectImageGroups(projectId) {
    try {
      const response = await api.get(`${this.baseURL}/project-plan-image-groups/`, {
        params: { project: projectId }
      });
      
      // FIXED: Handle different response formats
      let data = response.data;
      
      // If response has results property (paginated), use that
      if (data && typeof data === 'object' && data.results) {
        data = data.results;
      }
      
      // Ensure data is always an array
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data for image groups:', data);
        data = [];
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching image groups:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch image groups',
        data: [] // Always provide empty array on error
      };
    }
  }

  /**
   * Create a new image group
   * @param {Object} groupData - { project, title, description, sort_order }
   * @returns {Promise<Object>}
   */
  async createImageGroup(groupData) {
    try {
      const response = await api.post(`${this.baseURL}/project-plan-image-groups/`, groupData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating image group:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Update an existing image group
   * @param {number} groupId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updateImageGroup(groupId, updateData) {
    try {
      const response = await api.put(`${this.baseURL}/project-plan-image-groups/${groupId}/`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating image group:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Delete an image group
   * @param {number} groupId 
   * @returns {Promise<Object>}
   */
  async deleteImageGroup(groupId) {
    try {
      await api.delete(`${this.baseURL}/project-plan-image-groups/${groupId}/`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting image group:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Reorder image groups
   * @param {Array} groupOrders - [{ id, sort_order }, ...]
   * @returns {Promise<Object>}
   */
  async reorderGroups(groupOrders) {
    try {
      const response = await api.post(`${this.baseURL}/project-plan-image-groups/reorder_groups/`, {
        groups: groupOrders
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error reordering groups:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  // ====================
  // IMAGE MANAGEMENT
  // ====================

  /**
   * Get all images in a group
   * @param {number} groupId 
   * @returns {Promise<Array>}
   */
  async getGroupImages(groupId) {
    try {
      const response = await api.get(`${this.baseURL}/project-plan-images/`, {
        params: { image_group: groupId }
      });
      
      // FIXED: Handle different response formats
      let data = response.data;
      
      // If response has results property (paginated), use that
      if (data && typeof data === 'object' && data.results) {
        data = data.results;
      }
      
      // Ensure data is always an array
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data for group images:', data);
        data = [];
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching group images:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error),
        data: [] // Always provide empty array on error
      };
    }
  }

  /**
   * Upload a single image
   * @param {Object} imageData - { image_group, image, caption, sort_order }
   * @returns {Promise<Object>}
   */
  async uploadImage(imageData) {
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(imageData).forEach(key => {
        if (imageData[key] !== null && imageData[key] !== undefined) {
          formData.append(key, imageData[key]);
        }
      });

      const response = await api.post(`${this.baseURL}/project-plan-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Bulk upload multiple images to a group
   * @param {number} groupId 
   * @param {Array} files - Array of File objects
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>}
   */
async bulkUploadImages(groupId, files, onProgress = null) {
  try {
    const formData = new FormData();
    
    // Add group ID
    formData.append('image_group', groupId);
    
    // Add all files with the key 'images' (as expected by backend)
    files.forEach((file, index) => {
      formData.append('images', file);
      
      // Auto-generate caption from filename if not provided
      const caption = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      formData.append('captions', caption); // Note: 'captions' not 'captions[index]'
    });

    const response = await api.post(`${this.baseURL}/project-plan-images/bulk_upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    // FIXED: Handle the actual backend response format
    let data = response.data;
    console.log('Bulk upload API response:', data);
    
    // Backend returns { uploaded_images: [...], errors: [...], total_uploaded: n }
    if (data && data.uploaded_images) {
      data = data.uploaded_images; // Extract the uploaded images array
    } else if (data && data.results) {
      data = data.results; // Handle paginated response
    }
    
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      console.warn('Bulk upload returned non-array data, converting:', data);
      data = data ? [data] : [];
    }

    return {
      success: true,
      data: data,
      total_uploaded: response.data.total_uploaded || data.length,
      errors: response.data.errors || []
    };
  } catch (error) {
    console.error('Error bulk uploading images:', error);
    return {
      success: false,
      error: this.extractErrorMessage(error),
      data: []
    };
  }
}
  /**
   * Update image details (caption, sort_order)
   * @param {number} imageId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updateImage(imageId, updateData) {
    try {
      const response = await api.put(`${this.baseURL}/project-plan-images/${imageId}/`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating image:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Delete an image
   * @param {number} imageId 
   * @returns {Promise<Object>}
   */
  async deleteImage(imageId) {
    try {
      await api.delete(`${this.baseURL}/project-plan-images/${imageId}/`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Reorder images within a group
   * @param {number} groupId 
   * @param {Array} imageOrders - [{ id, sort_order }, ...]
   * @returns {Promise<Object>}
   */
  async reorderImages(groupId, imageOrders) {
    try {
      const response = await api.post(`${this.baseURL}/project-plan-image-groups/${groupId}/reorder_images/`, {
        images: imageOrders
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error reordering images:', error);
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  // ====================
  // UTILITY METHODS
  // ====================

  /**
   * Extract error message from API response
   * @param {Object} error - Axios error object
   * @returns {string} - Error message
   */
  extractErrorMessage(error) {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle different error formats
      if (typeof data === 'string') {
        return data;
      }
      
      if (data.detail) {
        return data.detail;
      }
      
      if (data.message) {
        return data.message;
      }
      
      if (data.error) {
        return data.error;
      }
      
      // Handle validation errors
      if (typeof data === 'object') {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }
    
    return error.message || 'An unknown error occurred';
  }

  /**
   * Validate file before upload
   * @param {File} file 
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file || !file.type) {
      return {
        valid: false,
        error: 'Invalid file'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please use JPG, PNG, GIF, or PDF files.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 10MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   * @param {number} bytes 
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate thumbnail URL (if your backend supports it)
   * @param {string} imageUrl 
   * @param {string} size - 'small', 'medium', 'large'
   * @returns {string}
   */
  getThumbnailUrl(imageUrl, size = 'medium') {
    if (!imageUrl) return '';
    
    // If your backend has thumbnail generation, modify URL accordingly
    // Example: return imageUrl.replace('/original/', `/thumbnails/${size}/`);
    
    return imageUrl; // Return original for now
  }
}

// Create singleton instance
const planImagesAPI = new PlanImagesAPI();

export default planImagesAPI;

// Named exports for convenience
export const {
  getProjectImageGroups,
  createImageGroup,
  updateImageGroup,
  deleteImageGroup,
  reorderGroups,
  getGroupImages,
  uploadImage,
  bulkUploadImages,
  updateImage,
  deleteImage,
  reorderImages,
  validateFile,
  formatFileSize,
  getThumbnailUrl
} = planImagesAPI;