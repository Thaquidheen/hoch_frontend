import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { designphase, updateDesignphase } from "../../service/application_api";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import { Toast } from "primereact/toast";

const Design = () => {
  const [designPhases, setDesignPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesignPhase, setSelectedDesignPhase] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  useEffect(() => {
    const fetchDesignPhases = async () => {
      try {
        setLoading(true);
        const response = await designphase();
        setDesignPhases(response);
      } catch (error) {
        console.error("Error fetching design phases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesignPhases();
  }, []);

  const openEditDialog = (designPhase) => {
    setSelectedDesignPhase(designPhase);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    try {
      await updateDesignphase(selectedDesignPhase.designphase_id, selectedDesignPhase);
      setDesignPhases((prev) =>
        prev.map((phase) =>
          phase.designphase_id === selectedDesignPhase.designphase_id
            ? selectedDesignPhase
            : phase
        )
      );
      setShowEditDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Design phase updated successfully!",
      });
    } catch (error) {
      console.error("Error updating design phase:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update design phase.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedDesignPhase((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center bg-red-100 p-4 rounded-md mb-4">
      <h3 className="text-xl font-bold text-red-600 w-full ">
        Design Phase Management
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
          value={designPhases}
          paginator
          rows={10}
          loading={loading}
          header={renderHeader()}
          dataKey="designphase_id"
          emptyMessage="No design phases found."
          scrollable
          className="w-full border border-gray-300"
        >
          <Column
          field="customer_name"
    header="Customer Name"
    headerStyle={{ minWidth: "200px" }}
     />
          <Column
            field="plan"
            header="Plan"
            headerStyle={{ minWidth: "100px" }}
            body={(rowData) => (rowData.plan ? "Yes" : "No")}
          />
          <Column
            field="quotation"
            header="Quotation"
            headerStyle={{ minWidth: "100px" }}
            body={(rowData) => (rowData.quotation ? "Yes" : "No")}
          />
          <Column
            field="design"
            header="Design"
            headerStyle={{ minWidth: "100px" }}
            body={(rowData) => (rowData.design ? "Yes" : "No")}
          />
          <Column
            field="submit_to_client"
            header="Submit to Client"
            headerStyle={{ minWidth: "200px" }}
            body={(rowData) => (rowData.submit_to_client ? "Yes" : "No")}
          />
          <Column
            field="client_feedback"
            header="Client Feedback"
            headerStyle={{ minWidth: "200px" }}

            body={(rowData) => (rowData.client_feedback ? "Yes" : "No")}
          />
          <Column
            field="schedule_client_meeting"
            header="Scheduled Meeting"
            headerStyle={{ minWidth: "200px" }}

            body={(rowData) =>
              rowData.schedule_client_meeting
                ? new Date(rowData.schedule_client_meeting).toLocaleDateString()
                : "Not Scheduled"
            }
          />
          <Column
            field="design_and_amount_freeze"
            header="Design and Amount Freeze"
            headerStyle={{ minWidth: "250px" }}

            body={(rowData) =>
              rowData.design_and_amount_freeze ? "Yes" : "No"
            }
          />
          <Column
            field="create_client_grp"
            header="Create Client Group"
            headerStyle={{ minWidth: "250px" }}

            body={(rowData) => (rowData.create_client_grp ? "Yes" : "No")}
          />
          <Column body={renderActions} header="Actions" />
        </DataTable>
      </div>

      {/* {showEditDialog && selectedDesignPhase && (
        <Dialog
          visible={showEditDialog}
          onHide={() => setShowEditDialog(false)}
          header={<h2 className="text-red-600 font-bold text-lg">Edit Design Phase</h2>}
          modal
          className="p-fluid bg-gray-50 shadow-lg rounded-lg"
        >
          <div className="space-y-4">
            {Object.keys(selectedDesignPhase)     .filter(
          (key) =>
            ![
              "designphase_id",
              "customer",
              "customer_name",
              "customer_location",
            ].includes(key)
        ).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  inputId={key}
                  name={key}
                  checked={!!selectedDesignPhase[key]}
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
      )} */}
      {showEditDialog && selectedDesignPhase && (
  <Dialog
    visible={showEditDialog}
    onHide={() => setShowEditDialog(false)}
    header={<h2 className="text-red-600 font-bold text-lg">Edit Design Phase</h2>}
    modal
    className="p-fluid bg-gray-50 shadow-lg rounded-lg"
  >
    <div className="space-y-6">
      {/* Customer Name Field */}
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
          value={selectedDesignPhase.customer_name || ""}
          disabled
          className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-800"
        />
      </div>

      {/* Render Remaining Editable Fields */}
      {Object.keys(selectedDesignPhase)
        .filter(
          (key) =>
            ![
              "designphase_id",
              "customer",
              "customer_name",
              "customer_location",
            ].includes(key)
        )
        .map((key) => (
          <div key={key} className="flex items-center gap-3">
            {typeof selectedDesignPhase[key] === "boolean" ? (
              <>
                <Checkbox
                  inputId={key}
                  name={key}
                  checked={!!selectedDesignPhase[key]}
                  onChange={handleChange}
                  className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-gray-800"
                >
                  {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
              </>
            ) : (
              <div className="w-full">
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-800"
                >
                  {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={selectedDesignPhase[key] || ""}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
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

export default Design;
