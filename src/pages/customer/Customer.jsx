import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";

import AddCustomerForm from "./AddCustomerForm";
import { CustomerService, updateCustomerState } from "../../service/application_api";

// PrimeReact CSS
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "./customer.css";

const Customer = () => {
  const toast = useRef(null);

  // Store all customers here (the entire list).
  const [customers, setCustomers] = useState([]);

  // Track whether data is loading for the table spinner.
  const [loading, setLoading] = useState(true);

  // For the global (client-side) filter, if desired.
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // Status filter
  const [statusFilter, setStatusFilter] = useState("");

  // Control the dialog for Add/Edit.
  const [showFormDialog, setShowFormDialog] = useState(false);

  // Selected customer for editing (null if adding new).
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Possible states (dropdown values).
  const states = [
    { label: "Lead", value: "Lead" },
    { label: "Pipeline", value: "Pipeline" },
    { label: "Design", value: "Design" },
    { label: "Confirmation", value: "Confirmation" },
    { label: "Production", value: "Production" },
    { label: "Installation", value: "Installation" },
    { label: "Sign Out", value: "Sign Out" },
  ];

  // Status filter options (including "All")
  const statusFilterOptions = [
    { label: "All Status", value: "" },
    ...states
  ];

  /**
   * Fetch ALL customers once on mount (client-side pagination).
   */
  useEffect(() => {
    const fetchAllCustomers = async () => {
      setLoading(true);
      try {
        // This call should return an array of all customers
        // E.g.: [{ customer_id: 123, name: "...", ... }, ...]
        const response = await CustomerService(); 
        setCustomers(response); 
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCustomers();
  }, []);

  // Filter customers based on global filter and status filter
  const filteredCustomers = customers.filter((customer) => {
    // Global filter check
    const globalMatch = !globalFilterValue || 
      customer.name?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      customer.location?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      customer.contact_number?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      customer.state?.toLowerCase().includes(globalFilterValue.toLowerCase());

    // Status filter check
    const statusMatch = !statusFilter || customer.state === statusFilter;

    return globalMatch && statusMatch;
  });

  // Get status counts for display
  const getStatusCounts = () => {
    const counts = {};
    states.forEach(state => {
      counts[state.value] = customers.filter(c => c.state === state.value).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  /**
   * Handle changing state via dropdown in the DataTable.
   */
  const handleStateChange = async (customerId, newState) => {
    try {
      await updateCustomerState(customerId, newState);

      // Update local state to reflect the new state
      setCustomers((prev) =>
        prev.map((c) =>
          c.customer_id === customerId ? { ...c, state: newState } : c
        )
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Customer state updated!",
        life: 3000,
      });
    } catch (error) {
      console.error("Error updating customer state:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update customer state.",
        life: 3000,
      });
    }
  };

  /**
   * Custom editor for the "state" column (cell editing).
   */
  const stateEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={states}
        onChange={(e) => {
          handleStateChange(options.rowData.customer_id, e.value);
          options.editorCallback(e.value);
        }}
        placeholder="Select State"
        className="p-inputtext-sm w-full"
      />
    );
  };

  /**
   * Create a text to show all kitchen types in one cell: "WPC(2), SS(3)"
   */
  const kitchenTypesBodyTemplate = (rowData) => {
    if (!rowData.kitchen_types || rowData.kitchen_types.length === 0) {
      return "N/A";
    }
    return rowData.kitchen_types
      .map((kt) => `${kt.type}(${kt.count})`)
      .join(", ");
  };

  /**
   * After adding/editing a customer in the form:
   * - If editing, replace in the array
   * - If adding, push to the array
   */
  const handleAddOrEditSuccess = (customer) => {
    if (selectedCustomer) {
      // Editing
      setCustomers((prev) =>
        prev.map((c) =>
          c.customer_id === customer.customer_id ? customer : c
        )
      );
    } else {
      // Adding
      setCustomers((prev) => [...prev, customer]);
    }
    setShowFormDialog(false);
    setSelectedCustomer(null);
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: selectedCustomer
        ? "Customer updated!"
        : "Customer added!",
      life: 3000,
    });
  };

  /**
   * Update the local global filter text (client-side filtering).
   */
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  /**
   * Handle status filter change
   */
  const onStatusFilterChange = (e) => {
    setStatusFilter(e.value);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setGlobalFilterValue("");
    setStatusFilter("");
  };

  /**
   * Convert `created_at` to a user-friendly date string.
   */
  const dateBodyTemplate = (rowData) =>
    new Date(rowData.created_at).toLocaleDateString();

  /**
   * Header with search, filters, and "Add Customer" button.
   */
  const renderHeader = () => (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="bg-red-100 p-3 sm:p-4 rounded-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="text-xl font-bold text-red-600">Customer List</h3>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-initial">
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search customers..."
                className="p-inputtext-sm w-full sm:w-48 border p-2 border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
              />
              <Dropdown
                value={statusFilter}
                options={statusFilterOptions}
                onChange={onStatusFilterChange}
                placeholder="Filter by Status"
                className="w-full sm:w-48"
                showClear
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                label="Clear"
                icon="pi pi-filter-slash"
                className="p-button-outlined p-button-secondary text-sm px-3 py-2"
                onClick={clearFilters}
                disabled={!globalFilterValue && !statusFilter}
              />
              <Button
                label="Add Customer"
                icon="pi pi-plus"
                className="bg-red-600 text-white px-3 sm:px-4 py-2 border border-red-600 rounded shadow-sm hover:bg-red-700 hover:border-red-700 focus:ring focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 text-sm whitespace-nowrap"
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowFormDialog(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {(globalFilterValue || statusFilter) && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
            {globalFilterValue && <span> • Search: "{globalFilterValue}"</span>}
            {statusFilter && <span> • Status: {statusFilter}</span>}
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Edit button in the last column.
   */
  const renderActions = (rowData) => (
    <Button
      label="Edit"
      icon="pi pi-pencil"
      className="p-button-text p-button-sm"
      onClick={() => {
        setSelectedCustomer(rowData);
        setShowFormDialog(true);
      }}
    />
  );

  return (
    <div className="p-2 sm:p-4 max-w-full overflow-hidden">
      <Toast ref={toast} />

      <DataTable
        value={filteredCustomers}
        // Enable built-in pagination & show 10 rows per page
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        loading={loading}
        dataKey="customer_id"
        header={renderHeader()}
        emptyMessage="No customers found."
        className="shadow-lg rounded-md"
        responsiveLayout="scroll"
        breakpoint="768px"
        tableStyle={{ minWidth: "100%" }}
        editMode="cell"
        size="small"
      >
        <Column 
          field="name" 
          header="Name" 
          sortable
          className="min-w-32"
        />
        <Column 
          field="location" 
          header="Location" 
          sortable
          className="min-w-32"
        />
        <Column 
          field="contact_number" 
          header="Contact" 
          className="min-w-32"
        />
        <Column
          header="Kitchen Types"
          body={kitchenTypesBodyTemplate}
          className="min-w-40"
        />
        <Column
          field="state"
          header="Status"
          editor={stateEditor}
          sortable
          className="min-w-32"
        />
        <Column 
          field="created_at" 
          header="Created" 
          body={dateBodyTemplate} 
          sortable
          className="min-w-24"
        />
        <Column 
          body={renderActions} 
          header="Actions" 
          className="min-w-20"
          exportable={false}
        />
      </DataTable>

      {showFormDialog && (
        <Dialog
          visible={showFormDialog}
          onHide={() => setShowFormDialog(false)}
          header={selectedCustomer ? "Edit Customer" : "Add Customer"}
          modal
          className="p-fluid rounded-lg shadow-md w-11/12 sm:w-96 max-w-md"
          breakpoints={{ '960px': '75vw', '640px': '90vw' }}
        >
          <AddCustomerForm
            initialData={selectedCustomer}
            onSubmitSuccess={handleAddOrEditSuccess}
            onClose={() => setShowFormDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default Customer;