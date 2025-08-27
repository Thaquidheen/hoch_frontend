import React, { useState, useEffect } from "react";
import { addCustomer, updateCustomer } from "../../service/application_api.js";

/** 
 * Possible Kitchen Types. 
 * You can also fetch this from your backend if needed.
 */
const KITCHEN_TYPE_OPTIONS = ["WPC", "SS", "Hybrid"];

const AddCustomerForm = ({ initialData, onSubmitSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact_number: "",
    state: "Lead",
    // Now we have an array of {type, count} objects
    kitchen_types: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        location: initialData.location || "",
        contact_number: initialData.contact_number || "",
        state: initialData.state || "Lead",
        kitchen_types: initialData.kitchen_types || [],
      });
    }
  }, [initialData]);

  /**
   * Handle top-level form input changes (name, location, contact_number, state).
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handle changes for each kitchen type entry (e.g., type, count).
   */
  const handleKitchenTypeChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedKitchenTypes = [...prevData.kitchen_types];
      updatedKitchenTypes[index][field] = value;
      return { ...prevData, kitchen_types: updatedKitchenTypes };
    });
  };

  /**
   * Add a new kitchen type row.
   */
  const addKitchenTypeRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      kitchen_types: [...prevData.kitchen_types, { type: "", count: 1 }],
    }));
  };

  /**
   * Remove an existing kitchen type row by index.
   */
  const removeKitchenTypeRow = (index) => {
    setFormData((prevData) => {
      const updatedKitchenTypes = [...prevData.kitchen_types];
      updatedKitchenTypes.splice(index, 1);
      return { ...prevData, kitchen_types: updatedKitchenTypes };
    });
  };

  /**
   * Submit handler for creating/updating Customer (and nested KitchenTypes).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData && initialData.customer_id) {
        // Edit customer logic
        const updatedCustomer = await updateCustomer(
          initialData.customer_id,
          formData
        );
        onSubmitSuccess(updatedCustomer);
      } else {
        // Add customer logic
        const newCustomer = await addCustomer(formData);
        onSubmitSuccess(newCustomer);
      }

      // Reset the form
      setFormData({
        name: "",
        location: "",
        contact_number: "",
        state: "Lead",
        kitchen_types: [],
      });

      onClose();
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg max-w-md mx-auto">
      {/* Error Message */}
      {error && (
        <p className="text-sm text-white bg-red-600 rounded-md p-2 mt-4">
          {error}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Customer Fields */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter location"
          />
        </div>

        <div>
          <label
            htmlFor="contact_number"
            className="block text-sm font-medium text-gray-700"
          >
            Contact Number
          </label>
          <input
            id="contact_number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter contact number"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="Lead">Lead</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Design">Design</option>
            <option value="Confirmation">Confirmation</option>
            <option value="Production">Production</option>
            <option value="Installation">Installation</option>
            <option value="Sign Out">Sign Out</option>
          </select>
        </div>

        {/* Kitchen Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kitchen Types
          </label>

          {formData.kitchen_types.map((kitchenObj, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 mb-2"
            >
              {/* Select for Kitchen Type */}
              <select
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={kitchenObj.type}
                onChange={(e) =>
                  handleKitchenTypeChange(index, "type", e.target.value)
                }
              >
                <option value="">-- Select Type --</option>
                {KITCHEN_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {/* Count Input */}
              <input
                type="number"
                className="p-2 w-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Count"
                value={kitchenObj.count}
                onChange={(e) =>
                  handleKitchenTypeChange(index, "count", e.target.value)
                }
                min="1"
              />

              {/* Remove Row Button */}
              <button
                type="button"
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                onClick={() => removeKitchenTypeRow(index)}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add Row Button */}
          <button
            type="button"
            className="mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={addKitchenTypeRow}
          >
            + Add Kitchen Type
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300 font-bold text-base"
        >
          {loading
            ? "Submitting..."
            : initialData
            ? "Save Changes"
            : "Add Customer"}
        </button>
      </form>
    </div>
  );
};

export default AddCustomerForm;
