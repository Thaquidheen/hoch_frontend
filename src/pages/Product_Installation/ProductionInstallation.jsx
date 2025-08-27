import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";

import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import { Toast } from "primereact/toast";
import { productioninstallation, updateproductioninstallation } from "../../service/application_api";

const ProductionInstallation = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        setLoading(true);
        const response = await productioninstallation();
        setPhases(response);
      } catch (error) {
        console.error("Error fetching production/installation phases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhases();
  }, []);

  const openEditDialog = (phase) => {
    setSelectedPhase(phase);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    try {
      await updateproductioninstallation(selectedPhase.phase_id , selectedPhase);
      setPhases((prev) =>
        prev.map((phase) =>
          phase.phase_id === selectedPhase.phase_id 
            ? selectedPhase
            : phase
        )
      );
      setShowEditDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Production/Installation phase updated successfully!",
      });
    } catch (error) {
      console.error("Error updating production/installation phase:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update production/installation phase.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedPhase((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center bg-red-100 p-4 rounded-md mb-4">
      <h3 className="text-xl font-bold text-red-600 w-full ">
        Production & Installation Phase Management
      </h3>
      <InputText
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search"
        className="p-inputtext-sm w-60 border p-1 border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
      />
    </div>
  );

  const renderActions = (rowData) => (
    <Button
      label="Edit"
      icon="pi pi-pencil"
      className="p-button-text"
      style={{ color: "#FF0000" }}
      onClick={() => openEditDialog(rowData)}
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="overflow-auto shadow-lg rounded-md">
        <DataTable
          value={phases}
          paginator
          rows={10}
          loading={loading}
          header={renderHeader()}
          dataKey="production_installation_id"
          emptyMessage="No production/installation phases found."
          scrollable
          className="w-full border border-gray-300"
        >
          <Column field="customer_name" header="Customer Name" headerStyle={{ minWidth: "200px" }} />
          <Column field="epd_received" header="EPD Received" headerStyle={{ minWidth: "150px" }} body={(rowData) => (rowData.epd_received ? "Yes" : "No")} />
          <Column field="site_visit_for_marking" header="Site Visit for Marking" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.site_visit_for_marking ? "Yes" : "No")} />
          <Column field="flooring_completed" header="Flooring Completed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.flooring_completed ? "Yes" : "No")} />
          <Column field="ceiling_completed" header="Ceiling Completed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.ceiling_completed ? "Yes" : "No")} />
          <Column field="carcass_at_site" header="Carcass at Site" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.carcass_at_site ? "Yes" : "No")} />
          <Column field="countertop_at_site" header="Countertop at Site" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.countertop_at_site ? "Yes" : "No")} />
          <Column field="shutters_at_site" header="Shutters at Site" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.shutters_at_site ? "Yes" : "No")} />
          <Column field="carcass_installed" header="Carcass Installed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.carcass_installed ? "Yes" : "No")} />
          <Column field="countertop_installed" header="Countertop Installed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.countertop_installed ? "Yes" : "No")} />
          <Column field="shutters_installed" header="Shutters Installed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.shutters_installed ? "Yes" : "No")} />
          <Column field="appliances_received" header="Appliances Received" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.appliances_received ? "Yes" : "No")} />
          <Column field="appliances_installed" header="Appliances Installed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.appliances_installed ? "Yes" : "No")} />
          <Column field="lights_installed" header="Lights Installed" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.lights_installed ? "Yes" : "No")} />
          <Column field="handover_to_client" header="Handover to Client" headerStyle={{ minWidth: "200px" }} body={(rowData) => (rowData.handover_to_client ? "Yes" : "No")} />
          <Column field="client_feedback_photography" header="Client Feedback & Photography" headerStyle={{ minWidth: "250px" }} body={(rowData) => (rowData.client_feedback_photography ? "Yes" : "No")} />
          <Column body={renderActions} header="Actions" />
        </DataTable>
      </div>

      {showEditDialog && selectedPhase && (
        <Dialog
          visible={showEditDialog}
          onHide={() => setShowEditDialog(false)}
          header={<h2 className="text-red-600 font-bold text-lg">Edit Production/Installation Phase</h2>}
          modal
          className="p-fluid bg-gray-50 shadow-lg rounded-lg"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-gray-800"
              >
                Customer Name
              </label>
              <input
                id="customer_name"
                name="customer_name"
                value={selectedPhase.customer_name || ""}
                disabled
                className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-800"
              />
            </div>
            {Object.keys(selectedPhase)
              .filter(
                (key) =>
                  ![
                    "production_installation_id",
                    "customer",
                    "customer_name",
                    "customer_location",
                  ].includes(key)
              )
              .map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox
                    inputId={key}
                    name={key}
                    checked={!!selectedPhase[key]}
                    onChange={handleChange}
                    className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <label
                    htmlFor={key}
                    className="text-sm font-medium text-gray-800"
                  >
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                </div>
              ))}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ProductionInstallation;
