import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { WorkflowHistoryService } from "../../service/application_api"; 


const WorkflowHistory = () => {
  const [workflowHistories, setWorkflowHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    const fetchWorkflowHistories = async () => {
      try {
        const response = await WorkflowHistoryService(); // Fetch WorkflowHistory data
        setWorkflowHistories(response); // Assuming API returns data in `response`
      } catch (error) {
        console.error("Error fetching workflow histories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowHistories();
  }, []);

  const onGlobalFilterChange = (e) => {
    setGlobalFilterValue(e.target.value);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center bg-red-100 p-4 rounded-md">
      <h3 className="text-xl font-bold text-red-600">Workflow History</h3>
      <div className="flex items-center gap-2">
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search"
          className="p-inputtext-sm w-60 border p-1 border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
        />
      </div>
    </div>
  );

  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.timestamp).toLocaleDateString() + 
           " " + 
           new Date(rowData.timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-4">
      <DataTable
        value={workflowHistories}
        paginator
        rows={10}
        loading={loading}
        dataKey="workflow_id"
        header={renderHeader()}
        globalFilterFields={[
          "customer",
          "previous_state",
          "new_state",
          "changed_by",
          "timestamp",
        ]}
        emptyMessage="No workflow history found."
        className="shadow-lg rounded-md"
        responsiveLayout="scroll" 
        tableStyle={{ minWidth: "100%", border: "1px solid #e4e4e4" }}
      >
        <Column field="customer" header="Customer" />
        <Column field="previous_state" header="Previous State" />
        <Column field="new_state" header="New State" />
        <Column field="changed_by" header="Changed By" />
        <Column
          field="timestamp"
          header="Timestamp"
          body={dateBodyTemplate}
        />
      </DataTable>
    </div>
  );
};

export default WorkflowHistory;
