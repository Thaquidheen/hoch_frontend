// src/utils/masters/validation.js

// Material validation schemas and utilities
export const materialValidation = {
  // Validation rules
  rules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-\_\/]+$/, // Allow letters, numbers, spaces, hyphens, underscores, slashes
      message: 'Material name must be 2-100 characters and contain only letters, numbers, spaces, and common symbols'
    },
    role: {
      required: true,
      options: ['BOTH', 'CABINET', 'DOOR', 'TOP'],
      message: 'Please select a valid role'
    },
    notes: {
      required: false,
      maxLength: 500,
      message: 'Notes must be less than 500 characters'
    }
  },

  // Validate single field
  validateField: (field, value, existingMaterials = []) => {
    const rule = materialValidation.rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!rule.required && (!value || value.toString().trim() === '')) {
      return null;
    }

    const stringValue = value.toString().trim();

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message;
    }

    // Options validation
    if (rule.options && !rule.options.includes(value)) {
      return rule.message;
    }

    // Custom validations
    switch (field) {
      case 'name':
        // Check for duplicate names (case-insensitive)
        const duplicateExists = existingMaterials.some(
          material => material.name.toLowerCase() === stringValue.toLowerCase()
        );
        if (duplicateExists) {
          return 'A material with this name already exists';
        }

        // Check for reserved words
        const reservedWords = ['null', 'undefined', 'admin', 'system', 'default'];
        if (reservedWords.includes(stringValue.toLowerCase())) {
          return 'This name is reserved and cannot be used';
        }
        break;

      default:
        break;
    }

    return null;
  },

  // Validate entire material object
  validateMaterial: (materialData, existingMaterials = []) => {
    const errors = {};
    
    // Validate each field
    Object.keys(materialValidation.rules).forEach(field => {
      const error = materialValidation.validateField(field, materialData[field], existingMaterials);
      if (error) {
        errors[field] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Real-time validation for forms
  validateFormField: (field, value, formData, existingMaterials = []) => {
    // For name field, exclude current material from duplicate check
    let materialsToCheck = existingMaterials;
    if (field === 'name' && formData.id) {
      materialsToCheck = existingMaterials.filter(m => m.id !== formData.id);
    }

    return materialValidation.validateField(field, value, materialsToCheck);
  }
};

// Material formatting utilities
export const materialFormatting = {
  // Format material name for display
  formatName: (name) => {
    if (!name) return '';
    return name.trim().toUpperCase();
  },

  // Format role for display
  formatRole: (role) => {
    const roleLabels = {
      'BOTH': 'Cabinet & Door',
      'CABINET': 'Cabinet Only',
      'DOOR': 'Door Only',
      'TOP': 'Countertop Only'
    };
    return roleLabels[role] || role;
  },

  // Get role description
  getRoleDescription: (role) => {
    const descriptions = {
      'BOTH': 'Can be used for both cabinet construction and door finishing',
      'CABINET': 'Only used for cabinet body/carcass construction',
      'DOOR': 'Only used for door panels and shutters',
      'TOP': 'Only used for countertops and work surfaces'
    };
    return descriptions[role] || '';
  },

  // Format material for API submission
  formatForApi: (materialData) => {
    return {
      name: materialData.name.trim().toUpperCase(),
      role: materialData.role,
      notes: materialData.notes ? materialData.notes.trim() : '',
      is_active: materialData.is_active !== undefined ? materialData.is_active : true
    };
  },

  // Format material received from API
  formatFromApi: (apiData) => {
    return {
      id: apiData.id,
      name: apiData.name,
      role: apiData.role,
      notes: apiData.notes || '',
      is_active: apiData.is_active,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at
    };
  }
};

// Material search and filter utilities
export const materialUtils = {
  // Search materials by name, role, or notes
  searchMaterials: (materials, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return materials;

    const term = searchTerm.toLowerCase().trim();
    
    return materials.filter(material => {
      const name = (material.name || '').toLowerCase();
      const role = (material.role || '').toLowerCase();
      const notes = (material.notes || '').toLowerCase();
      
      return name.includes(term) || 
             role.includes(term) || 
             notes.includes(term);
    });
  },

  // Filter materials by role
  filterByRole: (materials, role) => {
    if (!role || role === 'ALL') return materials;
    return materials.filter(material => material.role === role);
  },

  // Filter materials by status
  filterByStatus: (materials, showInactive = false) => {
    if (showInactive) return materials;
    return materials.filter(material => material.is_active);
  },

  // Sort materials
  sortMaterials: (materials, sortBy = 'name', sortDirection = 'asc') => {
    return [...materials].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      // Handle different data types
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (typeof valueA === 'boolean') {
        valueA = valueA ? 1 : 0;
        valueB = valueB ? 1 : 0;
      }

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },

  // Get materials statistics
  getMaterialsStats: (materials) => {
    const total = materials.length;
    const active = materials.filter(m => m.is_active).length;
    const inactive = total - active;
    
    const byRole = materials.reduce((acc, material) => {
      acc[material.role] = (acc[material.role] || 0) + 1;
      return acc;
    }, {});

    const cabinetMaterials = materials.filter(m => 
      m.role === 'CABINET' || m.role === 'BOTH'
    ).length;
    
    const doorMaterials = materials.filter(m => 
      m.role === 'DOOR' || m.role === 'BOTH'
    ).length;

    const topMaterials = materials.filter(m => 
      m.role === 'TOP'
    ).length;

    return {
      total,
      active,
      inactive,
      byRole,
      cabinetMaterials,
      doorMaterials,
      topMaterials,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  },

  // Validate bulk import data
  validateBulkImport: (csvData) => {
    const errors = [];
    const validMaterials = [];
    
    if (!Array.isArray(csvData)) {
      return {
        success: false,
        error: 'Invalid data format',
        validMaterials: [],
        errors: ['Data must be an array']
      };
    }

    csvData.forEach((row, index) => {
      const rowNumber = index + 1;
      
      // Validate required fields
      if (!row.name || !row.name.trim()) {
        errors.push(`Row ${rowNumber}: Material name is required`);
        return;
      }

      if (!row.role || !['BOTH', 'CABINET', 'DOOR', 'TOP'].includes(row.role)) {
        errors.push(`Row ${rowNumber}: Invalid role. Must be BOTH, CABINET, DOOR, or TOP`);
        return;
      }

      // Validate material
      const validation = materialValidation.validateMaterial(row, validMaterials);
      
      if (!validation.isValid) {
        const fieldErrors = Object.entries(validation.errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        errors.push(`Row ${rowNumber}: ${fieldErrors}`);
        return;
      }

      validMaterials.push(materialFormatting.formatForApi(row));
    });

    return {
      success: errors.length === 0,
      validMaterials,
      errors,
      totalRows: csvData.length,
      validRows: validMaterials.length,
      invalidRows: errors.length
    };
  }
};

// Export all utilities
export default {
  materialValidation,
  materialFormatting,
  materialUtils
};