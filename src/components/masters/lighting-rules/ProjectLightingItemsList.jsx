// src/components/masters/lighting-rules/ProjectLightingItemsList.jsx
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import LightingItemForm from './LightingItemForm';
import './ProjectLightingItemsList.css';
const ProjectLightingItemsList = ({ 
  project, 
  lightingItems, 
  lightingRules, 
  cabinetTypes, 
  materials,
  onSaveItem,
  onToggleItem,
  onDeleteItem,
    formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };
  
  
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };
  
  const handleSaveItem = async (itemData) => {
    const result = await onSaveItem(itemData);
    if (result?.success) {
      setShowForm(false);
    }
    return result;
  };
  
  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Unknown';
  };
  
  const getCabinetTypeName = (typeId) => {
    const type = cabinetTypes.find(t => t.id === typeId);
    return type ? type.name : 'All Types';
  };
  
  return (
    <div className="lighting-items-list">
      <div className="items-header">
        <h4>Cabinet-Specific Lighting Items</h4>
        <button className="add-item-btn" onClick={handleAddItem}>
          <Plus className="btn-icon" />
          Add Lighting Item
        </button>
      </div>
      
      {lightingItems.length === 0 ? (
        <div className="no-items-message">
          No lighting items configured. Click "Add Lighting Item" to create one, 
          or use "Auto-Create" to generate lighting items based on your line items.
        </div>
      ) : (
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Cabinet Type</th>
                <th>Rule</th>
                <th>Dimensions</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lightingItems.map(item => (
                <tr key={item.id} className={item.is_active ? 'active' : 'inactive'}>
                  <td>{getMaterialName(item.cabinet_material)}</td>
                  <td>{getCabinetTypeName(item.cabinet_type)}</td>
                  <td>{item.lighting_rule_detail?.name || 'Unknown'}</td>
                  <td>
                    {item.wall_cabinet_width_mm > 0 && `Wall: ${item.wall_cabinet_width_mm}mm`}
                    {item.base_cabinet_width_mm > 0 && <br />}
                    {item.base_cabinet_width_mm > 0 && `Base: ${item.base_cabinet_width_mm}mm`}
                  </td>
                <td className="amount-cell">{formatCurrency(item.total_cost || 0)}</td>
                  <td>
                    <button 
                      className={`toggle-btn ${item.is_active ? 'active' : 'inactive'}`}
                      onClick={() => onToggleItem(item.id, !item.is_active)}
                    >
                      {item.is_active ? 
                        <><ToggleRight className="toggle-icon" /> Active</> : 
                        <><ToggleLeft className="toggle-icon" /> Inactive</>
                      }
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit3 className="btn-icon-small" />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash2 className="btn-icon-small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Lighting Item Form */}
      <LightingItemForm 
        isOpen={showForm}
        lightingItem={editingItem}
        project={project}
        lightingRules={lightingRules}
        cabinetTypes={cabinetTypes}
        materials={materials}
        onSave={handleSaveItem}
        onCancel={() => setShowForm(false)}
      />
    </div>
  );
};

export default ProjectLightingItemsList;