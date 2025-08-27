import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import {
  CustomerService,
  CustomerRequirements,
  UpdateCustomerRequirements,
  DeleteDocument,
} from "../../service/application_api";

import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "./records.css";

// Define document choices with stored value and display label.
const documentChoices = [
  { value: "site_photos_and_measurements", label: "Site Photos and Measurements" },
  { value: "plan_and_elevation", label: "Plan and Elevation" },
  { value: "3d", label: "3D" },
  { value: "ept", label: "EPT" },
  { value: "factory_quotation", label: "Factory Quotation" },
  { value: "client_quotation", label: "Client Quotation" },
  { value: "appliances", label: "Appliances" },
  { value: "counter_tops_with_sink_and_faucet", label: "Counter Tops with Sink and Faucet" },
  { value: "site_completion_photos", label: "Site Completion Photos" },
];

// For convenience, map stored document names to their display labels.
const documentDisplayMapping = documentChoices.reduce((acc, choice) => {
  acc[choice.value] = choice.label;
  return acc;
}, {});

const CustomerRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]); // Customer data
  const [requirements, setRequirements] = useState(null); // Requirements data
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

  // Store new files as objects: { file, documentName }
  // Using the default stored value from documentChoices[0]
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // When files are selected, update state immediately.
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map((file) => ({
      file,
      documentName: documentChoices[0].value, // default stored value
    }));
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  // Update the document category for a new file.
  const updateUploadedFileName = (index, newValue) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.map((item, i) =>
        i === index ? { ...item, documentName: newValue } : item
      )
    );
  };

  // Remove a new file (unsaved) from state.
  const removeNewFile = (indexToRemove) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  // Group new files by their selected documentName.
  const groupNewFilesByCategory = () => {
    return uploadedFiles.reduce((grouped, item) => {
      const key = item.documentName;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
      return grouped;
    }, {});
  };

  // Delete an existing document from the backend and update UI.
  const handleDeleteDocument = async (documentId) => {
    try {
      await DeleteDocument(documentId);
      // Update state: remove deleted document from requirements.documents_data.
      setRequirements((prev) => ({
        ...prev,
        documents_data: prev.documents_data.filter((doc) => doc.id !== documentId),
      }));
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Document deleted successfully!",
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete document.",
      });
    }
  };

  // Render new (unsaved) documents grouped by category.


  // Render existing documents from the backend grouped by document choice.
  const renderExistingDocuments = () => {
    const existingDocuments = requirements?.documents_data || [];
    if (existingDocuments.length === 0) return null;
  
    // Group documents by their stored name.
    const groupedDocs = existingDocuments.reduce((group, doc) => {
      const key = doc.name; // stored value
      if (!group[key]) {
        group[key] = [];
      }
      group[key].push(doc);
      return group;
    }, {});
  
    return (
      <div className="mb-6">
        <h4 className="text-lg font-bold text-red-600 mb-2">Existing Documents</h4>
        {Object.entries(groupedDocs).map(([category, docs]) => (
          <div key={category} className="mb-4">
            <h5 className="text-md font-semibold text-gray-700 mb-1">
              {documentDisplayMapping[category] || category}
            </h5>
            <div className="flex flex-wrap gap-4">
              {docs.map((doc) => (
                <div
                  key={`existing-${doc.id}`}
                  className="relative w-32 h-32 p-2 border rounded-md shadow-sm bg-gray-50 flex flex-col items-center"
                >
                  {doc.file.endsWith(".pdf") ? (
                    <div className="relative flex flex-col items-center justify-center text-center h-full w-full">
                      <i className="pi pi-file-pdf text-red-600 text-4xl"></i>
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 mt-1 truncate block"
                      >
                        {documentDisplayMapping[doc.name] ||
                          doc.file.split("/").pop()}
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                      >
                        <i className="pi pi-trash" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={doc.file}
                        alt={documentDisplayMapping[doc.name] || "Document"}
                        className="w-full h-full object-contain rounded-md"
                      />
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                      >
                        <i className="pi pi-trash" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderNewDocuments = () => {
    if (uploadedFiles.length === 0) return null;
    const groupedNewFiles = groupNewFilesByCategory();
    return (
      <div className="mb-6">
        <h4 className="text-lg font-bold text-red-600 mb-2">New Documents</h4>
        {Object.entries(groupedNewFiles).map(([category, files]) => (
          <div key={category} className="mb-4">
            {/* Use documentDisplayMapping to show the human-friendly label */}
            <h5 className="text-md font-semibold text-gray-700 mb-1">
              {documentDisplayMapping[category] || category}
            </h5>
            <div className="flex flex-wrap gap-4">
              {files.map((item, index) => (
                <div
                  key={`new-${category}-${index}`}
                  className="relative w-32 h-48 p-2 border rounded-md shadow-sm bg-gray-50 flex flex-col items-center"
                >
                  {item.file.type?.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={documentDisplayMapping[item.documentName]}
                      className="w-full h-24 object-contain rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-24">
                      <i className="pi pi-file-pdf text-red-600 text-4xl"></i>
                    </div>
                  )}
                  {/* Dropdown to choose a category */}
                  <select
                    value={item.documentName}
                    onChange={(e) =>
                      updateUploadedFileName(index, e.target.value)
                    }
                    className="mt-2 px-2 py-1 border border-gray-300 rounded w-full text-sm"
                  >
                    {documentChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeNewFile(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  // ------------------ Fields Rendering (Other Requirements) ------------------ //
  const fieldLabels = {
    cabinet_wpc: "WPC Cabinet",
    cabinet_ss: "Stainless Cabinet",
    door_wpc: "WPC Door",
    door_ss: "Stainless Door",
    finish_glax: "Glax",
    finish_ceramic: "Ceramic",
    finish_glass: "Glass",
    finish_pu: "PU",
    finish_laminate: "Laminate",
    layout_l_shape: "L-Shape",
    layout_u_shape: "U-Shape",
    layout_c_shape: "C-Shape",
    layout_g_shape: "G-Shape",
    layout_island: "Island",
    layout_linear: "Linear",
    layout_parallel: "Parallel",
    design_island: "Island",
    design_breakfast: "Breakfast",
    design_bar_unit: "Bar Unit",
    design_pantry_unit: "Pantry",
    cabinet_tall_units: "Tall",
    cabinet_base_units: "Base",
    cabinet_wall_units: "Wall",
    cabinet_loft_units: "Loft",
    base_drawers: "Drawers",
    base_hinge_doors: "Hinge Doors",
    base_pullouts: "Pullouts",
    base_wicker_basket: "Wicker Basket",
    wall_unit_imove: "I move",
    wall_hinge_doors: "Wall Hinge Doors",
    wall_bifold_liftup: "Bifold Liftup",
    wall_bifold_motorised: "Bifold Motorised",
    wall_flapup: "Flapup",
    wall_rolling_shutter: "Rolling Shutter",
    tall_unit_pantry_pullout: "Pantry Pullout",
    lavido_pullout: "Lavido Pullout",
    tall_unit_ss_shelves: "Stainless Shelves",
    tall_unit_glass_shelf: "Glass Shelves",
    handle_g: "G",
    handle_j: "J",
    handle_gola: "Gola Handle",
    handle_lip_profile: "Lip Profile Handle",
    handle_expose_handless: "Exposed Handless",
    inbuilt_handles: "Inbuilt Handles",
    handle_color_rose_gold: "Rose Gold",
    handle_color_silver: "Silver",
    handle_color_gold: "Gold",
    handle_color_black: "Black",
    profile_lights: "Profile Lights",
    oven_built_in: "Built-in",
    oven_free_standing: "Free Standing",
    refrigerator_built_in: "Built-in Refrigerator",
    refrigerator_free_standing: "Free Standing Refrigerator",
    dishwasher_built_in: "Built-in Dishwasher",
    dishwasher_free_standing: "Free Standing Dishwasher",
    coffee_maker_built_in: "Built-in Coffee Maker",
    coffee_maker_free_standing: "Free Standing Coffee Maker",
    cook_top_90: "90cm Cook Top",
    cook_top_60: "60cm Cook Top",
    cook_top_120: "120cm Cook Top",
    sink_double_bowl: "Double Bowl Sink",
    sink_single_bowl: "Single Bowl Sink",
    sink_double_with_drain: "Double Bowl Sink With Drain",
    sink_multifunction: "Multifunction",
    sink_base_drawers: "Sink Base Drawers",
    sink_base_doors: "Sink Base Doors",
    sink_base_waste_bin: "Waste Bin",
    sink_base_detergent_holder: "Detergent Holder",
    sink_base_detergent_pullouts: "Detergent Pullouts",
    sink_base_wastebin_pullout: "Wastebin Pullout",
    corner_solution_lemans: "Le Mans Corner Solution",
    corner_solution_magic_corner: "Magic Corner",
    corner_solution_shelves: "Corner Shelves",
    built_in_sink_over_counter: "Over Counter Sink",
    built_in_sink_under_counter: "Under Counter Sink",
    countertop_quartz: "Quartz",
    countertop_granite: "Granite",
    countertop_tiles: "Tile",
    timeline_45_60_days: "45-60 Days",
    timeline_60_90_days: "60-90 Days",
    timeline_above_90_days: "Above 90 Days",
    aesthetics_and_colors: "Aesthetics & Colors",
    interior_designer: "Interior Designer",
    comments: "Comments",
  };

  const fieldGroups = {
    Cabinet: ["cabinet_wpc", "cabinet_ss"],
    "Door Material": ["door_wpc", "door_ss"],
    Finish: [
      "finish_glax",
      "finish_ceramic",
      "finish_glass",
      "finish_pu",
      "finish_laminate",
    ],
    Layout: [
      "layout_l_shape",
      "layout_u_shape",
      "layout_c_shape",
      "layout_g_shape",
      "layout_island",
      "layout_linear",
      "layout_parallel",
    ],
    Design: [
      "design_island",
      "design_breakfast",
      "design_bar_unit",
      "design_pantry_unit",
    ],
    "Cabinets and Storage": [
      "cabinet_tall_units",
      "cabinet_base_units",
      "cabinet_wall_units",
      "cabinet_loft_units",
    ],
    "Base Units": [
      "base_drawers",
      "base_hinge_doors",
      "base_pullouts",
      "base_wicker_basket",
    ],
    "Wall Units": [
      "wall_unit_imove",
      "wall_hinge_doors",
      "wall_bifold_liftup",
      "wall_bifold_motorised",
      "wall_flapup",
      "wall_rolling_shutter",
    ],
    "Tall Units": [
      "tall_unit_pantry_pullout",
      "lavido_pullout",
      "tall_unit_ss_shelves",
      "tall_unit_glass_shelf",
    ],
    Handles: [
      "handle_g",
      "handle_j",
      "handle_gola",
      "handle_lip_profile",
      "handle_expose_handless",
      "inbuilt_handles",
    ],
    "Handles Color": [
      "handle_color_rose_gold",
      "handle_color_silver",
      "handle_color_gold",
      "handle_color_black",
    ],
    "Profile Lights": ["profile_lights"],
    Ovens: ["oven_built_in", "oven_free_standing"],
    Refrigerators: ["refrigerator_built_in", "refrigerator_free_standing"],
    Dishwashers: ["dishwasher_built_in", "dishwasher_free_standing"],
    "Coffee Makers": ["coffee_maker_built_in", "coffee_maker_free_standing"],
    "Cook Tops": ["cook_top_90", "cook_top_60", "cook_top_120"],
    "Sinks and Faucets": [
      "sink_double_bowl",
      "sink_single_bowl",
      "sink_double_with_drain",
      "sink_multifunction",
    ],
    "Sinks and Faucets Base Unit": [
      "sink_base_drawers",
      "sink_base_doors",
      "sink_base_waste_bin",
      "sink_base_detergent_holder",
      "sink_base_detergent_pullouts",
      "sink_base_wastebin_pullout",
    ],
    "Corner Solutions": [
      "corner_solution_lemans",
      "corner_solution_magic_corner",
      "corner_solution_shelves",
    ],
    "Built-in Sinks": ["built_in_sink_over_counter", "built_in_sink_under_counter"],
    Countertops: ["countertop_quartz", "countertop_granite", "countertop_tiles"],
    Timeline: [
      "timeline_45_60_days",
      "timeline_60_90_days",
      "timeline_above_90_days",
    ],
    "Text Fields": ["aesthetics_and_colors", "interior_designer"],
    Comments: ["comments"],
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await CustomerService();
        setCustomers(response);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load customers.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleRequirementsClick = async (customerId) => {
    try {
      const data = await CustomerRequirements(customerId);
      console.log("Backend Raw Data:", data);
      const requirementsData = Array.isArray(data) ? data[0] : data;
      const initializedData = Object.fromEntries(
        Object.values(fieldGroups).flat().map((field) => [field, false])
      );
      const mergedData = { ...initializedData, ...requirementsData };
      console.log("Final State:", mergedData);
      setRequirements(mergedData);
      setSelectedCustomerId(customerId);
      setShowDialog(true);
    } catch (error) {
      console.error("Failed to load requirements:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load requirements.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setRequirements((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(requirements)) {
        if (typeof value === "boolean" || typeof value === "string") {
          formData.append(key, value);
        }
      }
      // Append new files to formData
      uploadedFiles.forEach((item) => {
        formData.append("documents", item.file);
        // Note: The backend expects an array for documentNames
        formData.append("documentNames[]", item.documentName);
      });
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      await UpdateCustomerRequirements(selectedCustomerId, formData);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Requirements updated successfully!",
      });
      // Clear new files after saving
      setUploadedFiles([]);
      setShowDialog(false);
    } catch (error) {
      console.error("Error saving requirements:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save requirements.",
      });
    }
  };

  const renderFields = () => {
    return Object.entries(fieldGroups)
      .filter(([group, fields]) =>
        group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fields.some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .map(([group, fields]) => (
        <div
          key={group}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold text-red-600 mb-4 border-b border-gray-200 pb-2 uppercase">
            {group}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fields
              .filter((field) =>
                field.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((field) => (
                <div key={field} className="flex items-center gap-2">
                  {group === "Text Fields" || group === "Comments" ? (
                    <div className="w-full">
                      <label
                        htmlFor={field}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {fieldLabels[field] ||
                          field
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        id={field}
                        name={field}
                        value={requirements[field] || ""}
                        onChange={(e) =>
                          setRequirements((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 mt-1 text-gray-800 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="Enter value"
                      />
                    </div>
                  ) : (
                    <>
                      <Checkbox
                        inputId={field}
                        name={field}
                        checked={requirements[field] || false}
                        onChange={handleChange}
                        className="h-5 w-5 border-gray-300 rounded-md checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-500"
                      />
                      <label
                        htmlFor={field}
                        className="text-gray-800 text-sm font-medium cursor-pointer"
                      >
                        {fieldLabels[field] ||
                          field
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      ));
  };

  const renderHeader = () => (
    <div className="flex flex-wrap justify-between items-center bg-red-100 p-3 rounded-md gap-4">
      <h3 className="text-xl font-bold text-red-600">Customer List</h3>
      <div className="flex items-center gap-2 w-full sm:w-auto"></div>
    </div>
  );

  const renderRequirementsButton = (rowData) => (
    <Button
      label="Records"
      icon="pi pi-list"
      className="p-button-text"
      onClick={() => handleRequirementsClick(rowData.customer_id)}
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <DataTable
        value={customers}
        paginator
        rows={10}
        loading={loading}
        header={renderHeader()}
        dataKey="customer_id"
        responsiveLayout="scroll"
        emptyMessage="No customers found."
        className="shadow-lg rounded-md"
      >
        <Column field="name" header="Customer Name" />
        <Column
          body={renderRequirementsButton}
          header="Actions"
          style={{ textAlign: "center", width: "150px" }}
        />
      </DataTable>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={
          <div className="text-2xl font-bold text-red-600">
            Customer Requirements
          </div>
        }
        modal
        className="w-11/12 md:w-3/4 bg-gray-50 rounded-lg shadow-lg"
      >
        <div className="p-4 bg-gray-50 rounded-md mb-4">
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {requirements ? (
          <div className="space-y-6 p-6 bg-white rounded-md">
            {renderFields()}

            {/* New Documents Section */}
        

            {/* Existing Documents Section */}
            {renderExistingDocuments()}
            {renderNewDocuments()}

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Upload PDF or Images
              </h3>
              <input
                type="file"
                accept="application/pdf, image/*"
                multiple
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-6">Loading...</div>
        )}

        <div className="flex justify-end border-t p-4 bg-gray-100">
          <Button
            label="Save"
            icon="pi pi-check"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition"
            onClick={handleSave}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default CustomerRecords;
