import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Image as ImageIcon, 
  ShoppingCart,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Search,
} from 'lucide-react';
import AccessoryForm from './AccessoryForm';
import useProjectAccessories from '../../../hooks/masters/useProjectAccessories';
import './ProjectAccessoriesList.css';
const ProjectAccessoriesList = ({ project, lineItems, onAccessoryChange }) => {
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [selectedLineItem, setSelectedLineItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the custom hook
  const {
    accessories,
    loading,
    error,
    notification,
    accessoriesByLineItem,
    totals,
    createAccessory,
    updateAccessory,
    deleteAccessory,
    refresh,
    clearNotification,
    clearError,
    getFilteredLineItems,
    debugInfo
  } = useProjectAccessories(project?.id);

  // Filter line items based on search
  const filteredLineItems = getFilteredLineItems(lineItems, searchTerm);

  const handleAddAccessory = (lineItem) => {
    setSelectedLineItem(lineItem);
    setEditingAccessory(null);
    setShowAccessoryForm(true);
  };

  const handleEditAccessory = (accessory) => {
    const lineItem = lineItems.find(li => li.id === accessory.line_item);
    setSelectedLineItem(lineItem);
    setEditingAccessory(accessory);
    setShowAccessoryForm(true);
  };

  const handleSaveAccessory = async (accessoryData) => {
    try {
      let result;
      if (editingAccessory) {
        result = await updateAccessory(editingAccessory.id, accessoryData);
      } else {
        result = await createAccessory(accessoryData);
      }

      if (result.success) {
        setShowAccessoryForm(false);
        setEditingAccessory(null);
        setSelectedLineItem(null);
        
        if (onAccessoryChange) {
          onAccessoryChange();
        }
      }
    } catch (error) {
      console.error('Error saving accessory:', error);
    }
  };

  const handleDeleteAccessory = async (accessoryId) => {
    try {
      const result = await deleteAccessory(accessoryId);
      
      if (result.success) {
        setShowAccessoryForm(false);
        setEditingAccessory(null);
        setSelectedLineItem(null);
        
        if (onAccessoryChange) {
          onAccessoryChange();
        }
      }
    } catch (error) {
      console.error('Error deleting accessory:', error);
    }
  };

  const handleCancelForm = () => {
    setShowAccessoryForm(false);
    setEditingAccessory(null);
    setSelectedLineItem(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const AccessoryCard = ({ accessory }) => (
    <div className="projectaccessories-card">
      <div className="projectaccessories-image">
        {accessory.accessory_image ? (
          <img src={accessory.accessory_image} alt={accessory.accessory_name} />
        ) : (
          <div className="projectaccessories-no-image">
            <ImageIcon size={20} />
          </div>
        )}
      </div>
      
      <div className="projectaccessories-details">
        <h5 className="projectaccessories-name">{accessory.accessory_name}</h5>
        <div className="projectaccessories-meta">
          {accessory.material_code && (
            <span className="projectaccessories-meta-item">Code: {accessory.material_code}</span>
          )}
          {accessory.dimensions && (
            <span className="projectaccessories-meta-item">Size: {accessory.dimensions}</span>
          )}
        </div>
        
        <div className="projectaccessories-pricing">
          <div className="projectaccessories-quantity">Qty: {accessory.qty}</div>
          <div className="projectaccessories-unit-price">₹{accessory.unit_price} each</div>
          <div className="projectaccessories-total-price">{formatCurrency(accessory.total_price)}</div>
        </div>

        {accessory.installation_notes && (
          <div className="projectaccessories-installation-notes">
            <small>Note: {accessory.installation_notes}</small>
          </div>
        )}
      </div>

      <div className="projectaccessories-actions">
        <button 
          onClick={() => handleEditAccessory(accessory)}
          className="projectaccessories-action-btn edit"
          title="Edit accessory"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this accessory?')) {
              handleDeleteAccessory(accessory.id);
            }
          }}
          className="projectaccessories-action-btn delete"
          title="Delete accessory"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const LineItemSection = ({ lineItem }) => {
    const lineItemAccessories = accessoriesByLineItem[lineItem.id] || [];
    const lineItemTotal = lineItemAccessories.reduce((sum, acc) => sum + parseFloat(acc.total_price || 0), 0);

    return (
      <div className="projectaccessories-line-item-section">
        <div className="projectaccessories-line-item-header">
          <div className="projectaccessories-line-item-info">
            <div className="projectaccessories-line-item-title">
              <Package className="projectaccessories-line-item-icon" />
              <div>
                <h3>{lineItem.cabinet_type_detail?.name}</h3>
                <span className="projectaccessories-line-item-subtitle">
                  {lineItem.scope} Kitchen • {lineItem.width_mm}×{lineItem.depth_mm}×{lineItem.height_mm}mm
                </span>
              </div>
            </div>
            
            <div className="projectaccessories-line-item-stats">
              <div className="projectaccessories-stat">
                <span className="projectaccessories-stat-label">Accessories:</span>
                <span className="projectaccessories-stat-value">{lineItemAccessories.length}</span>
              </div>
              <div className="projectaccessories-stat">
                <span className="projectaccessories-stat-label">Total:</span>
                <span className="projectaccessories-stat-value">{formatCurrency(lineItemTotal)}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleAddAccessory(lineItem)}
            className="projectaccessories-add-accessory-btn"
          >
            <Plus size={18} />
            Add Accessory
          </button>
        </div>

        <div className="projectaccessories-container">
          {lineItemAccessories.length === 0 ? (
            <div className="projectaccessories-no-accessories">
              <ShoppingCart className="projectaccessories-no-accessories-icon" />
              <p>No accessories added yet</p>
              <button 
                onClick={() => handleAddAccessory(lineItem)}
                className="projectaccessories-add-first-accessory-btn"
              >
                Add First Accessory
              </button>
            </div>
          ) : (
            <div className="projectaccessories-grid">
              {lineItemAccessories.map(accessory => (
                <AccessoryCard key={accessory.id} accessory={accessory} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="projectaccessories-loading">
        <div className="projectaccessories-loading-spinner" />
        <p>Loading accessories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projectaccessories-error">
        <AlertTriangle className="projectaccessories-error-icon" />
        <div className="projectaccessories-error-content">
          <p>{error}</p>
          <div className="projectaccessories-error-actions">
            <button onClick={refresh} className="projectaccessories-retry-btn">
              Try Again
            </button>
            <button 
              onClick={() => console.log('Debug info:', debugInfo())}
              className="projectaccessories-debug-btn"
            >
              Debug Info
            </button>
            <button onClick={clearError} className="projectaccessories-clear-btn">
              Clear Error
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projectaccessories-list">
      {/* Header */}
      <div className="projectaccessories-header">
        <div className="projectaccessories-header-info">
          <h2>Project Accessories</h2>
          <p>Add product variants as accessories to your cabinet line items</p>
        </div>

        <div className="projectaccessories-header-stats">
          <div className="projectaccessories-stat-card">
            <div className="projectaccessories-stat-number">{accessories.length}</div>
            <div className="projectaccessories-stat-label">Total Accessories</div>
          </div>
          <div className="projectaccessories-stat-card">
            <div className="projectaccessories-stat-number">{formatCurrency(totals.projectTotal)}</div>
            <div className="projectaccessories-stat-label">Accessories Total</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="projectaccessories-controls">
        <div className="projectaccessories-search-container">
          <Search className="projectaccessories-search-icon" />
          <input
            type="text"
            placeholder="Search line items or accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="projectaccessories-search-input"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="projectaccessories-line-items-container">
        {filteredLineItems.length === 0 ? (
          <div className="projectaccessories-no-line-items">
            <Package className="projectaccessories-no-items-icon" />
            <h3>No line items found</h3>
            <p>Add cabinet line items first to manage accessories</p>
          </div>
        ) : (
          filteredLineItems.map(lineItem => (
            <LineItemSection key={lineItem.id} lineItem={lineItem} />
          ))
        )}
      </div>

      {/* Project Summary */}
      {accessories.length > 0 && (
        <div className="projectaccessories-summary">
          <div className="projectaccessories-summary-header">
            <Calculator className="projectaccessories-summary-icon" />
            <h3>Accessories Summary</h3>
          </div>
          <div className="projectaccessories-summary-content">
            <div className="projectaccessories-summary-row">
              <span>Total Accessories:</span>
              <span>{accessories.length} items</span>
            </div>
            <div className="projectaccessories-summary-row">
              <span>Line Items with Accessories:</span>
              <span>{Object.keys(accessoriesByLineItem).length} of {lineItems.length}</span>
            </div>
            <div className="projectaccessories-summary-row total">
              <span>Total Accessories Cost:</span>
              <span>{formatCurrency(totals.projectTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Accessory Form Modal */}
      {showAccessoryForm && (
        <AccessoryForm
          lineItem={selectedLineItem}
          accessory={editingAccessory}
          onSave={handleSaveAccessory}
          onCancel={handleCancelForm}
          onDelete={handleDeleteAccessory}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className={`projectaccessories-notification ${notification.type}`}>
          <div className="projectaccessories-notification-content">
            {notification.type === 'success' ? (
              <CheckCircle className="projectaccessories-notification-icon" />
            ) : (
              <AlertTriangle className="projectaccessories-notification-icon" />
            )}
            <span>{notification.message}</span>
            <button onClick={clearNotification} className="projectaccessories-notification-close">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAccessoriesList;