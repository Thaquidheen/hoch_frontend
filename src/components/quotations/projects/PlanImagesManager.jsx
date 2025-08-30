// src/components/projects/PlanImagesManager.jsx

import React, { useState, useRef, useCallback } from 'react';
import { 
  Plus, 
  Upload, 
  Edit3, 
  Trash2, 
  ImageIcon,
  FolderPlus,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  Loader,
  Download,
  GripVertical
} from 'lucide-react';
import { usePlanImages } from '../../../hooks/masters/usePlanImages';
import './PlanImagesManager.css';

const PlanImagesManager = ({ projectId, onUpdate }) => {
  const {
    imageGroups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkUploadImages,
    updateImage,
    deleteImage,
    getTotalImageCount,
    formatFileSize,
    validateFile
  } = usePlanImages(projectId);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [previewImage, setPreviewImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  
  const fileInputRef = useRef(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
    if (onUpdate) onUpdate();
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const result = await createGroup(groupData);
      if (result.success) {
        setShowGroupForm(false);
        showNotification('success', 'Group created successfully');
      } else {
        showNotification('error', result.error || 'Failed to create group');
      }
    } catch (error) {
      showNotification('error', 'Failed to create group');
    }
  };

  const handleBulkUpload = useCallback(async (groupId, files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const invalidFiles = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    });

    if (validFiles.length === 0) {
      showNotification('error', 'No valid files to upload');
      return;
    }

    if (invalidFiles.length > 0) {
      showNotification('error', `${invalidFiles.length} files were invalid and skipped`);
    }

    try {
      // Add files to uploading state
      validFiles.forEach(file => {
        setUploadingFiles(prev => new Set(prev).add(file.name));
      });

      const result = await bulkUploadImages(groupId, validFiles);

      if (result.success) {
        showNotification('success', `${validFiles.length} files uploaded successfully`);
      } else {
        showNotification('error', result.error || 'Upload failed');
      }
    } catch (error) {
      showNotification('error', 'Upload failed');
    } finally {
      // Clear uploading state
      validFiles.forEach(file => {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      });
    }
  }, [bulkUploadImages, validateFile, showNotification]);

  const handleDragStart = (e, item, type) => {
    setDraggedItem({ item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem, targetType) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== targetType) return;
    
    // Handle reordering logic here - implement based on your needs
    console.log('Reordering:', draggedItem, 'to position of:', targetItem);
    setDraggedItem(null);
  };

  const handleDeleteGroup = async (groupId) => {
    const group = imageGroups.find(g => g.id === groupId);
    if (!window.confirm(`Delete "${group?.title}" and all its images?`)) return;

    try {
      const result = await deleteGroup(groupId);
      if (result.success) {
        showNotification('success', 'Group deleted successfully');
      } else {
        showNotification('error', result.error || 'Failed to delete group');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete group');
    }
  };

  const handleDeleteImage = async (imageId, groupId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const result = await deleteImage(imageId, groupId);
      if (result.success) {
        showNotification('success', 'Image deleted successfully');
      } else {
        showNotification('error', result.error || 'Failed to delete image');
      }
    } catch (error) {
      showNotification('error', 'Failed to delete image');
    }
  };

  if (loading && imageGroups.length === 0) {
    return (
      <div className="pim-loading">
        <Loader className="pim-loading-spinner" />
        <span>Loading plan images...</span>
      </div>
    );
  }

  return (
    <div className="pim-container">
      {/* Header */}
      <div className="pim-header">
        <div className="pim-header-content">
          <div>
            <h2>Plan Images</h2>
            <p>Organize project images into groups for better management</p>
          </div>
          <button
            onClick={() => setShowGroupForm(true)}
            className="pim-btn pim-btn-primary"
          >
            <FolderPlus className="pim-btn-icon" />
            Add Group
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`pim-notification pim-notification-${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle className="pim-notification-icon" />
          ) : (
            <AlertTriangle className="pim-notification-icon" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="pim-error-banner">
          <AlertTriangle className="pim-error-icon" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Image Groups Grid */}
      <div className="pim-groups-grid">
        {imageGroups.map((group) => (
          <div
            key={group.id}
            className="pim-group-card"
            draggable
            onDragStart={(e) => handleDragStart(e, group, 'group')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, group, 'group')}
          >
            {/* Group Header */}
            <div className="pim-group-header">
              <div className="pim-group-info">
                <GripVertical className="pim-drag-handle" />
                <div className="pim-group-details">
                  <h3>{group.title}</h3>
                  {group.description && <p>{group.description}</p>}
                </div>
              </div>
              <div className="pim-group-actions">
                <span className="pim-image-count">{group.image_count || 0} images</span>
                <button 
                  className="pim-action-btn"
                  onClick={() => {
                    setEditingGroup(group);
                    setShowGroupForm(true);
                  }}
                >
                  <Edit3 className="pim-action-icon" />
                </button>
                <button 
                  className="pim-action-btn pim-delete-btn"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="pim-action-icon" />
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <div
              className="pim-upload-dropzone"
              onClick={() => {
                setSelectedGroup(group);
                fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add('pim-drag-active');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('pim-drag-active');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('pim-drag-active');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleBulkUpload(group.id, files);
                }
              }}
            >
              <Upload className="pim-upload-icon" />
              <p>Drop images here or click to upload</p>
              <span>JPG, PNG, PDF files supported</span>
            </div>

            {/* Images Grid */}
            {group.images && group.images.length > 0 && (
              <div className="pim-images-grid">
                {group.images.map((image) => (
                  <div
                    key={image.id}
                    className="pim-image-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, image, 'image')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, image, 'image')}
                  >
                    {/* Loading overlay */}
                    {uploadingFiles.has(image.caption) && (
                      <div className="pim-upload-overlay">
                        <Loader className="pim-upload-spinner" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="pim-image-wrapper">
                      <img
                        src={image.image}
                        alt={image.caption}
                        className="pim-image-preview"
                      />
                      
                      {/* Overlay Actions */}
                      <div className="pim-image-overlay">
                        <button
                          className="pim-overlay-btn"
                          onClick={() => setPreviewImage(image)}
                        >
                          <Eye className="pim-overlay-icon" />
                        </button>
                        <button
                          className="pim-overlay-btn pim-overlay-delete-btn"
                          onClick={() => handleDeleteImage(image.id, group.id)}
                        >
                          <Trash2 className="pim-overlay-icon" />
                        </button>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="pim-image-caption">
                      <p>{image.caption}</p>
                      <span>{formatFileSize(image.file_size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!group.images || group.images.length === 0) && (
              <div className="pim-empty-group">
                <ImageIcon className="pim-empty-icon" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {imageGroups.length === 0 && (
        <div className="pim-empty-state">
          <ImageIcon className="pim-empty-state-icon" />
          <h3>No Image Groups</h3>
          <p>Create your first image group to organize plan images</p>
          <button
            onClick={() => setShowGroupForm(true)}
            className="pim-btn pim-btn-primary"
          >
            Create First Group
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (selectedGroup && e.target.files.length > 0) {
            handleBulkUpload(selectedGroup.id, e.target.files);
          }
        }}
      />

      {/* Group Form Modal */}
      {showGroupForm && (
        <GroupFormModal
          isOpen={showGroupForm}
          onClose={() => {
            setShowGroupForm(false);
            setEditingGroup(null);
          }}
          onSave={handleCreateGroup}
          editingGroup={editingGroup}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
          onUpdate={(updatedImage) => {
            // Handle image update if needed
            setPreviewImage(null);
          }}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
};

// Group Form Modal Component
const GroupFormModal = ({ isOpen, onClose, onSave, editingGroup }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingGroup) {
      setFormData({
        title: editingGroup.title,
        description: editingGroup.description || ''
      });
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [editingGroup]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
    setFormData({ title: '', description: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="pim-modal-overlay">
      <div className="pim-modal-content">
        <div className="pim-modal-header">
          <h3>{editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
          <button onClick={onClose} className="pim-close-btn">
            <X className="pim-close-icon" />
          </button>
        </div>

        <div className="pim-modal-body">
          <div className="pim-form-group">
            <label>Group Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Floor Plans, 3D Renderings"
              className="pim-form-input"
            />
          </div>

          <div className="pim-form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
              className="pim-form-textarea"
              rows="3"
            />
          </div>
        </div>

        <div className="pim-modal-footer">
          <button
            onClick={onClose}
            className="pim-btn pim-btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="pim-btn pim-btn-primary"
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Image Preview Modal Component
const ImagePreviewModal = ({ image, onClose, formatFileSize }) => {
  return (
    <div className="pim-modal-overlay pim-image-modal-overlay">
      <div className="pim-image-modal-content">
        <div className="pim-image-modal-header">
          <h3>{image.caption}</h3>
          <button onClick={onClose} className="pim-close-btn">
            <X className="pim-close-icon" />
          </button>
        </div>

        <div className="pim-image-modal-body">
          <div className="pim-preview-image-container">
            <img
              src={image.image}
              alt={image.caption}
              className="pim-preview-image"
            />
          </div>

          <div className="pim-image-details">
            <h4>File Details</h4>
            <div className="pim-detail-row">
              <span>Size:</span>
              <span>{formatFileSize(image.file_size)}</span>
            </div>
            <div className="pim-detail-row">
              <span>Type:</span>
              <span>{image.file_type}</span>
            </div>
          </div>
        </div>

        <div className="pim-image-modal-footer">
          <button className="pim-btn pim-btn-primary">
            <Download className="pim-btn-icon" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanImagesManager;