// pages/Admin/StaffManagement.js
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { useRef } from 'react';
import { getStaffList, updateStaff, deactivateStaff } from '../../service/authentication';
import { useNavigate } from 'react-router-dom';

// Custom CSS for black and white theme
const customStyles = `
  .staff-management {
    background: #f8f9fa;
    min-height: 100vh;
    color: #212529;
  }

  .staff-header {
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .search-section {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .custom-datatable {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .custom-datatable .p-datatable-header {
    background: #f8f9fa;
    border-bottom: 2px solid #000000;
    padding: 1rem;
  }

  .custom-datatable .p-datatable-thead > tr > th {
    background: #000000;
    color: white;
    border: none;
    padding: 1rem 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
  }

  .custom-datatable .p-datatable-tbody > tr {
    border-bottom: 1px solid #e9ecef;
    transition: all 0.3s ease;
  }

  .custom-datatable .p-datatable-tbody > tr:hover {
    background: #f8f9fa;
  }

  .custom-datatable .p-datatable-tbody > tr > td {
    padding: 1rem 0.75rem;
    border: none;
    vertical-align: middle;
  }

  .status-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-active {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .status-inactive {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .btn-edit {
    background: #000000;
    border: 1px solid #000000;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .btn-edit:hover {
    background: #333333;
    border-color: #333333;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-delete {
    background: white;
    border: 1px solid #dc3545;
    color: #dc3545;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .btn-delete:hover {
    background: #dc3545;
    border-color: #dc3545;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  }

  .btn-primary {
    background: #000000;
    border: 1px solid #000000;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    background: #333333;
    border-color: #333333;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .custom-dialog {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  .custom-dialog .p-dialog-header {
    background: #000000;
    color: white;
    padding: 1.5rem;
    border-bottom: none;
  }

  .custom-dialog .p-dialog-content {
    padding: 2rem;
  }

  .form-field {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .form-input:focus {
    border-color: #000000;
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .staff-header {
      padding: 1rem;
    }

    .search-section {
      padding: 1rem;
    }

    .search-controls {
      flex-direction: column;
      gap: 1rem;
    }

    .action-buttons {
      justify-content: center;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .custom-datatable .p-datatable-thead > tr > th,
    .custom-datatable .p-datatable-tbody > tr > td {
      padding: 0.75rem 0.5rem;
      font-size: 0.875rem;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .custom-dialog {
      margin: 1rem;
    }
  }
`;

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const toast = useRef(null);
  const navigate = useNavigate();

  // Add custom styles to head
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    setLoading(true);
    const result = await getStaffList();
    if (result.success) {
      setStaffList(result.data.results);
    } else {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load staff list' 
      });
    }
    setLoading(false);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setEditData({
      email: staff.email,
      first_name: staff.first_name,
      last_name: staff.last_name,
      is_active: staff.is_active
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    const result = await updateStaff(selectedStaff.id, editData);
    if (result.success) {
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Staff member updated successfully' 
      });
      setEditDialog(false);
      loadStaffList();
    } else {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: result.error 
      });
    }
  };

  const handleDeactivate = async (staff) => {
    if (window.confirm(`Are you sure you want to deactivate ${staff.username}?`)) {
      const result = await deactivateStaff(staff.id);
      if (result.success) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: result.data.message 
        });
        loadStaffList();
      } else {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: result.error 
        });
      }
    }
  };

  // Calculate statistics
  const getStats = () => {
    const total = staffList.length;
    const active = staffList.filter(staff => staff.is_active).length;
    const inactive = total - active;
    const roles = [...new Set(staffList.map(staff => staff.role))].length;
    
    return { total, active, inactive, roles };
  };

  const stats = getStats();

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`status-badge ${rowData.is_active ? 'status-active' : 'status-inactive'}`}>
        {rowData.is_active ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <button 
          className="btn-edit"
          onClick={() => handleEdit(rowData)}
          title="Edit Staff"
        >
          <i className="pi pi-pencil"></i>
          <span className="ml-1 hidden sm:inline">Edit</span>
        </button>
        {rowData.is_active && (
          <button 
            className="btn-delete"
            onClick={() => handleDeactivate(rowData)}
            title="Deactivate Staff"
          >
            <i className="pi pi-ban"></i>
            <span className="ml-1 hidden sm:inline">Deactivate</span>
          </button>
        )}
      </div>
    );
  };

  const renderHeader = () => (
    <div className="staff-header p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
          <p className="text-gray-300">Manage your team members and their access</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate('/admin/staff/register')}
        >
          <i className="pi pi-plus"></i>
          <span>Add New Staff</span>
        </button>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="stats-grid">
      <Card className="stat-card">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total}</div>
          <div className="text-gray-600 font-medium">Total Staff</div>
        </div>
      </Card>
      <Card className="stat-card">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.active}</div>
          <div className="text-gray-600 font-medium">Active Members</div>
        </div>
      </Card>
      <Card className="stat-card">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.inactive}</div>
          <div className="text-gray-600 font-medium">Inactive Members</div>
        </div>
      </Card>
      <Card className="stat-card">
        <div className="text-center p-4">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.roles}</div>
          <div className="text-gray-600 font-medium">Different Roles</div>
        </div>
      </Card>
    </div>
  );

  const renderSearchSection = () => (
    <div className="search-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 search-controls">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3">Search & Filter</h3>
          <div className="relative">
            <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              className="form-input pl-10"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by name, email, username, or role..."
            />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {globalFilter && `Showing ${staffList.filter(staff => 
            staff.username?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            staff.email?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            staff.first_name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            staff.last_name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
            staff.role?.toLowerCase().includes(globalFilter.toLowerCase())
          ).length} results`}
        </div>
      </div>
    </div>
  );

  return (
    <div className="staff-management p-4 lg:p-6">
      <Toast ref={toast} />
      
      {renderHeader()}
      
      <div className="mt-6">
        {renderStats()}
        {renderSearchSection()}
        
        <DataTable 
          value={staffList} 
          loading={loading}
          globalFilter={globalFilter}
          globalFilterFields={['username', 'email', 'first_name', 'last_name', 'role']}
          paginator 
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="custom-datatable"
          emptyMessage="No staff members found"
          responsiveLayout="scroll"
          breakpoint="768px"
          size="normal"
        >
          <Column 
            field="username" 
            header="Username" 
            sortable 
            className="min-w-32"
          />
          <Column 
            field="email" 
            header="Email" 
            sortable 
            className="min-w-48"
          />
          <Column 
            field="first_name" 
            header="First Name" 
            sortable 
            className="min-w-32"
          />
          <Column 
            field="last_name" 
            header="Last Name" 
            sortable 
            className="min-w-32"
          />
          <Column 
            field="role" 
            header="Role" 
            sortable 
            className="min-w-24"
          />
          <Column 
            body={statusBodyTemplate} 
            header="Status" 
            sortable
            sortField="is_active"
            className="min-w-24"
          />
          <Column 
            field="date_joined" 
            header="Joined Date" 
            sortable
            body={(rowData) => new Date(rowData.date_joined).toLocaleDateString()}
            className="min-w-32"
          />
          <Column 
            body={actionBodyTemplate} 
            header="Actions" 
            className="min-w-40"
            exportable={false}
          />
        </DataTable>
      </div>

      <Dialog 
        visible={editDialog} 
        onHide={() => setEditDialog(false)}
        header="Edit Staff Member"
        className="custom-dialog w-11/12 sm:w-96 max-w-md"
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        modal
      >
        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email"
              className="form-input"
              value={editData.email || ''} 
              onChange={(e) => setEditData({...editData, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="first_name">First Name</label>
            <input 
              id="first_name"
              type="text"
              className="form-input"
              value={editData.first_name || ''} 
              onChange={(e) => setEditData({...editData, first_name: e.target.value})}
              placeholder="Enter first name"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="last_name">Last Name</label>
            <input 
              id="last_name"
              type="text"
              className="form-input"
              value={editData.last_name || ''} 
              onChange={(e) => setEditData({...editData, last_name: e.target.value})}
              placeholder="Enter last name"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button 
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => setEditDialog(false)}
          >
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={handleUpdate}
          >
            Save Changes
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default StaffManagement;