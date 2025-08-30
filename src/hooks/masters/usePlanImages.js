// src/hooks/usePlanImages.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import planImagesAPI from '../../service/masters/PlanImagesAPI';

/**
 * Custom hook for managing plan images and groups
 * @param {number} projectId - The project ID
 * @returns {Object} - State and methods for managing plan images
 */
export const usePlanImages = (projectId) => {
  // State
  const [imageGroups, setImageGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  // Fetch image groups on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchImageGroups();
    }
  }, [projectId]);

  /**
   * Fetch all image groups for the project
   */
  const fetchImageGroups = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await planImagesAPI.getProjectImageGroups(projectId);
      
      if (result.success) {
        // FIXED: Ensure result.data is always an array
        const groups = Array.isArray(result.data) ? result.data : [];
        
        // Fetch images for each group
        const groupsWithImages = await Promise.all(
          groups.map(async (group) => {
            try {
              const imagesResult = await planImagesAPI.getGroupImages(group.id);
              return {
                ...group,
                images: imagesResult.success && Array.isArray(imagesResult.data) 
                  ? imagesResult.data 
                  : []
              };
            } catch (err) {
              console.error(`Error fetching images for group ${group.id}:`, err);
              return {
                ...group,
                images: []
              };
            }
          })
        );
        
        setImageGroups(groupsWithImages);
      } else {
        setError(result.error || 'Failed to fetch image groups');
        setImageGroups([]); // FIXED: Always set as array
      }
    } catch (err) {
      setError('Failed to fetch image groups');
      setImageGroups([]); // FIXED: Always set as array
      console.error('Error in fetchImageGroups:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * Create a new image group
   * @param {Object} groupData - { title, description }
   */
  const createGroup = useCallback(async (groupData) => {
    if (!projectId) return { success: false, error: 'No project ID' };

    setLoading(true);
    
    try {
      const result = await planImagesAPI.createImageGroup({
        ...groupData,
        project: projectId,
        sort_order: imageGroups.length
      });

      if (result.success) {
        const newGroup = { ...result.data, images: [] };
        setImageGroups(prev => [...prev, newGroup]);
      }

      return result;
    } catch (err) {
      console.error('Error creating group:', err);
      return { success: false, error: 'Failed to create group' };
    } finally {
      setLoading(false);
    }
  }, [projectId, imageGroups.length]);

  /**
   * Update an existing image group
   * @param {number} groupId 
   * @param {Object} updateData 
   */
  const updateGroup = useCallback(async (groupId, updateData) => {
    setLoading(true);
    
    try {
      const result = await planImagesAPI.updateImageGroup(groupId, updateData);

      if (result.success) {
        setImageGroups(prev => prev.map(group => 
          group.id === groupId ? { ...group, ...result.data } : group
        ));
      }

      return result;
    } catch (err) {
      console.error('Error updating group:', err);
      return { success: false, error: 'Failed to update group' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an image group
   * @param {number} groupId 
   */
  const deleteGroup = useCallback(async (groupId) => {
    setLoading(true);
    
    try {
      const result = await planImagesAPI.deleteImageGroup(groupId);

      if (result.success) {
        setImageGroups(prev => prev.filter(group => group.id !== groupId));
      }

      return result;
    } catch (err) {
      console.error('Error deleting group:', err);
      return { success: false, error: 'Failed to delete group' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reorder image groups
   * @param {Array} newOrder - Array of group objects in new order
   */
  const reorderGroups = useCallback(async (newOrder) => {
    // Optimistically update UI
    setImageGroups(newOrder);

    const groupOrders = newOrder.map((group, index) => ({
      id: group.id,
      sort_order: index
    }));

    try {
      const result = await planImagesAPI.reorderGroups(groupOrders);
      
      if (!result.success) {
        // Revert on failure
        fetchImageGroups();
        return result;
      }

      return result;
    } catch (err) {
      console.error('Error reordering groups:', err);
      fetchImageGroups(); // Revert on error
      return { success: false, error: 'Failed to reorder groups' };
    }
  }, [fetchImageGroups]);

  /**
   * Upload multiple images to a group
   * @param {number} groupId 
   * @param {Array} files - Array of File objects
   */
  const bulkUploadImages = useCallback(async (groupId, files) => {
    // Validate files
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      const validation = planImagesAPI.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    });

    if (validFiles.length === 0) {
      return {
        success: false,
        error: 'No valid files to upload',
        invalidFiles
      };
    }

    // Set upload progress
    setUploadProgress(prev => ({ ...prev, [groupId]: 0 }));

    try {
      const result = await planImagesAPI.bulkUploadImages(
        groupId,
        validFiles,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [groupId]: progress }));
        }
      );

      if (result.success) {
        // FIXED: Ensure result.data is always an array
        const newImages = Array.isArray(result.data) ? result.data : [];
        
        // Update the specific group with new images
        setImageGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              images: [...(Array.isArray(group.images) ? group.images : []), ...newImages],
              image_count: (group.image_count || 0) + newImages.length
            };
          }
          return group;
        }));
      }

      // Clear upload progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[groupId];
        return newProgress;
      });

      return {
        ...result,
        invalidFiles: invalidFiles.length > 0 ? invalidFiles : undefined
      };
    } catch (err) {
      console.error('Error uploading images:', err);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[groupId];
        return newProgress;
      });
      
      return {
        success: false,
        error: 'Failed to upload images',
        invalidFiles: invalidFiles.length > 0 ? invalidFiles : undefined
      };
    }
  }, []);

  /**
   * Update image details
   * @param {number} imageId 
   * @param {Object} updateData 
   */
  const updateImage = useCallback(async (imageId, updateData) => {
    try {
      const result = await planImagesAPI.updateImage(imageId, updateData);

      if (result.success) {
        setImageGroups(prev => prev.map(group => ({
          ...group,
          images: Array.isArray(group.images) 
            ? group.images.map(image =>
                image.id === imageId ? { ...image, ...result.data } : image
              )
            : []
        })));
      }

      return result;
    } catch (err) {
      console.error('Error updating image:', err);
      return { success: false, error: 'Failed to update image' };
    }
  }, []);

  /**
   * Delete an image
   * @param {number} imageId 
   * @param {number} groupId 
   */
  const deleteImage = useCallback(async (imageId, groupId) => {
    try {
      const result = await planImagesAPI.deleteImage(imageId);

      if (result.success) {
        setImageGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            const currentImages = Array.isArray(group.images) ? group.images : [];
            return {
              ...group,
              images: currentImages.filter(image => image.id !== imageId),
              image_count: Math.max(0, (group.image_count || 0) - 1)
            };
          }
          return group;
        }));
      }

      return result;
    } catch (err) {
      console.error('Error deleting image:', err);
      return { success: false, error: 'Failed to delete image' };
    }
  }, []);

  /**
   * Reorder images within a group
   * @param {number} groupId 
   * @param {Array} newImageOrder 
   */
  const reorderImages = useCallback(async (groupId, newImageOrder) => {
    // Optimistically update UI
    setImageGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, images: newImageOrder };
      }
      return group;
    }));

    const imageOrders = newImageOrder.map((image, index) => ({
      id: image.id,
      sort_order: index
    }));

    try {
      const result = await planImagesAPI.reorderImages(groupId, imageOrders);
      
      if (!result.success) {
        // Revert on failure
        fetchImageGroups();
        return result;
      }

      return result;
    } catch (err) {
      console.error('Error reordering images:', err);
      fetchImageGroups(); // Revert on error
      return { success: false, error: 'Failed to reorder images' };
    }
  }, [fetchImageGroups]);

  /**
   * Get total image count across all groups
   */
  const getTotalImageCount = useCallback(() => {
    if (!Array.isArray(imageGroups)) return 0;
    return imageGroups.reduce((total, group) => total + (group.image_count || 0), 0);
  }, [imageGroups]);

  /**
   * Get group by ID
   * @param {number} groupId 
   */
  const getGroupById = useCallback((groupId) => {
    if (!Array.isArray(imageGroups)) return null;
    return imageGroups.find(group => group.id === groupId);
  }, [imageGroups]);

  /**
   * Get image by ID across all groups
   * @param {number} imageId 
   */
  const getImageById = useCallback((imageId) => {
    if (!Array.isArray(imageGroups)) return null;
    
    for (const group of imageGroups) {
      if (Array.isArray(group.images)) {
        const image = group.images.find(img => img.id === imageId);
        if (image) {
          return { image, group };
        }
      }
    }
    return null;
  }, [imageGroups]);

  return {
    // State
    imageGroups: Array.isArray(imageGroups) ? imageGroups : [], // FIXED: Always return array
    loading,
    error,
    uploadProgress,
    
    // Group operations
    fetchImageGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroups,
    
    // Image operations
    bulkUploadImages,
    updateImage,
    deleteImage,
    reorderImages,
    
    // Utility functions
    getTotalImageCount,
    getGroupById,
    getImageById,
    
    // Helper functions
    formatFileSize: planImagesAPI.formatFileSize,
    validateFile: planImagesAPI.validateFile
  };
};