import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

import AddArchitectForm from "./AddArchitectForm";
import { getArchitects, createArchitect, updateArchitect } from "../../service/application_api";

// PrimeReact CSS
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "./architect.css";

const ArchitectPage = () => {
  const toast = useRef(null);
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState(null);

  /**
   * Fetch ALL architects once on mount.
   */
  useEffect(() => {
    const fetchArchitects = async () => {
      setLoading(true);
      try {
        const response = await getArchitects(); // Fetch architects from API
        setArchitects(response);
      } catch (err) {
        console.error("Error fetching architects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArchitects();
  }, []);

  /**
   * Handle adding or updating an architect.
   */
  const handleAddOrEditSuccess = async (architect) => {
    if (selectedArchitect) {
      // Editing
      setArchitects((prev) =>
        prev.map((a) =>
          a.architect_id === architect.architect_id ? architect : a
        )
      );
    } else {
      // Adding
      setArchitects((prev) => [...prev, architect]);
    }

    setShowFormDialog(false);
    setSelectedArchitect(null);

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: selectedArchitect ? "Architect updated!" : "Architect added!",
      life: 3000,
    });
  };

  /**
   * Update the global filter value.
   */
  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  /**
   * Render header with search and add button.
   */
  const renderHeader = () => (
    <div className="flex flex-wrap justify-between items-center  bg-red-100 p-3 rounded-md gap-4">
      <h3 className="text-xl font-bold text-red-600">Architect List</h3>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search"
          className="p-inputtext-sm w-full sm:w-60 border p-1 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <Button
        label="Add Architect"
        icon="pi pi-plus"
        className="bg-blue-600 text-white px-4 py-2 border border-blue-600 rounded shadow-sm hover:bg-blue-700 hover:border-blue-700 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
        onClick={() => {
          setSelectedArchitect(null);
          setShowFormDialog(true);
        }}
      />
    </div>
  );

  /**
   * Render action buttons in each row.
   */
  const renderActions = (rowData) => (
    <Button
      label="Edit"
      icon="pi pi-pencil"
      className="p-button-text"
      onClick={() => {
        setSelectedArchitect(rowData);
        setShowFormDialog(true);
      }}
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <DataTable
        value={architects}
        paginator
        rows={10}
        loading={loading}
        dataKey="architect_id"
        header={renderHeader()}
        globalFilter={globalFilterValue}
        globalFilterFields={["name", "firm", "contact_number", "principal_architect_name"]}
        emptyMessage="No architects found."
        className="shadow-lg rounded-md"
        responsiveLayout="scroll"
        tableStyle={{ minWidth: "100%", border: "1px solid #e4e4e4" }}
      >
        <Column field="name" header="Architect Name" />
        <Column field="firm" header="Firm" />
        <Column field="contact_number" header="Contact Number" />
        <Column field="principal_architect_name" header="Principal Architect Name" />
        <Column body={renderActions} header="Actions" />
      </DataTable>

      {showFormDialog && (
        <Dialog
          visible={showFormDialog}
          onHide={() => setShowFormDialog(false)}
          header={selectedArchitect ? "Edit Architect" : "Add Architect"}
          modal
          className="p-fluid rounded-lg shadow-md sm:w-96"
        >
          <AddArchitectForm
            initialData={selectedArchitect}
            onSubmitSuccess={handleAddOrEditSuccess}
            onClose={() => setShowFormDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default ArchitectPage;
