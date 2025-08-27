import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { PipelineService, updatePipeline } from "../../service/application_api"; // API service to fetch and update pipeline data
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import { Toast } from "primereact/toast";

const PipelineTable = () => {
  const [pipelines, setPipelines] = useState([]); // State to store pipeline data
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedPipeline, setSelectedPipeline] = useState(null); // Selected pipeline for editing
  const [showEditDialog, setShowEditDialog] = useState(false); // Toggle for edit modal
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);
  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        setLoading(true); 
        const response = await PipelineService(); 
        setPipelines(response); 
      } catch (error) {
        console.error("Error fetching pipelines:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchPipelines();
  }, []); 


  const openEditDialog = (pipeline) => {
    setSelectedPipeline(pipeline);
    setShowEditDialog(true);
  };

 
  const handleSave = async () => {
    try {
      await updatePipeline(selectedPipeline.pipeline_id, selectedPipeline); 
      setPipelines((prevPipelines) =>
        prevPipelines.map((pipeline) =>
          pipeline.pipeline_id === selectedPipeline.pipeline_id
            ? selectedPipeline
            : pipeline
        )
      );
      setShowEditDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Customer state updated successfully!",
        life: 3000,
        className: "custom-toast-success",
      });
    } catch (error) {
      console.error("Error updating pipeline:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Customer was not updated!",
        life: 3000,
      });
    }
  };

 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedPipeline((prev) => (prev ? { ...prev, [name]: type === "checkbox" ? checked : value } : {}));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center bg-red-100 p-4 rounded-md mb-4">
      <h3 className="text-xl font-bold text-red-600">Pipeline Management</h3>
      <div className="flex items-center gap-2">
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search"
          className="p-inputtext-sm w-60 border p-1 border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
        />
      </div>
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
      <DataTable
        value={pipelines}
        paginator
        rows={10}
        loading={loading}
        header={renderHeader()}
        dataKey="pipeline_id"
        responsiveLayout="scroll"
        emptyMessage="No pipelines found."
        className="shadow-lg rounded-md"
        tableStyle={{ minWidth: "100%", border: "1px solid #e4e4e4" }}
      >
        <Column field="customer_name" header="Customer Name"/>
        <Column
          field="site_plan"
          header="Site Measurments"
          body={(rowData) => (rowData.site_plan ? "Yes" : "No")}
        
        />
        <Column
          field="site_photos"
          header="Site Photos Uploaded"
          body={(rowData) => (rowData.site_photos ? "Yes" : "No")}
        
        />
        <Column
          field="requirements_checklist"
          header="Requirements Fulfilled"
          body={(rowData) => (rowData.requirements_checklist ? "Yes" : "No")}
  
        />
        <Column
          field="created_at"
          header="Created At"
          body={(rowData) => new Date(rowData.created_at).toLocaleDateString()}
      
        />
   
        <Column body={renderActions} header="Actions"  />
      </DataTable>

      {showEditDialog && selectedPipeline && (
        <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header={<h2 className="text-red-600 font-bold text-lg">Edit Pipeline</h2>}
        modal
        className="p-fluid bg-gray-50 shadow-lg rounded-lg"
      >
        <div className="space-y-4">
          {/* Customer Name Field */}
          <div>
            <label
              htmlFor="customer_name"
              className="block text-sm font-bold text-gray-800"
            >
              Customer Name
            </label>
            <input
              id="customer_name"
              name="customer_name"
              value={selectedPipeline.customer_name}
              disabled
              className="mt-2 p-2 w-full border border-gray-300 rounded-md bg-gray-100 text-gray-700"
            />
          </div>

          {/* Site Plan Completed */}
          <div className="flex items-center gap-3">
            <input
              id="site_plan"
              name="site_plan"
              type="checkbox"
              checked={selectedPipeline.site_plan}
              onChange={handleChange}
              className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <label
              htmlFor="site_plan"
              className="text-sm font-medium text-gray-800"
            >
              Site Plan Completed
            </label>
          </div>

          {/* Site Photos Uploaded */}
          <div className="flex items-center gap-3">
            <input
              id="site_photos"
              name="site_photos"
              type="checkbox"
              checked={selectedPipeline.site_photos}
              onChange={handleChange}
              className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <label
              htmlFor="site_photos"
              className="text-sm font-medium text-gray-800"
            >
              Site Photos Uploaded
            </label>
          </div>

          {/* Requirements Fulfilled */}
          <div className="flex items-center gap-3">
            <input
              id="requirements_checklist"
              name="requirements_checklist"
              type="checkbox"
              checked={selectedPipeline.requirements_checklist}
              onChange={handleChange}
              className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <label
              htmlFor="requirements_checklist"
              className="text-sm font-medium text-gray-800"
            >
              Requirements Fulfilled
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300"
            >
              <i className="pi pi-check mr-2"></i> Save
            </button>
          </div>
        </div>
      </Dialog>
      )}
    </div>
  );
};

export default PipelineTable;
