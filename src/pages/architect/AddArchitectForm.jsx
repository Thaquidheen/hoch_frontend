import React, { useState, useEffect } from "react";
import { createArchitect, updateArchitect } from "../../service/application_api.js";

const AddArchitectForm = ({ initialData, onSubmitSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    firm: "",
    contact_number: "",
    principal_architect_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        firm: initialData.firm || "",
        contact_number: initialData.contact_number || "",
        principal_architect_name: initialData.principal_architect_name || "",
      });
    }
  }, [initialData]);

  /**
   * Handle form input changes.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Submit handler for adding or updating an Architect.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData && initialData.architect_id) {
        // Edit architect logic
        const updatedArchitect = await updateArchitect(
          initialData.architect_id,
          formData
        );
        onSubmitSuccess(updatedArchitect);
      } else {
        // Add architect logic
        const newArchitect = await createArchitect(formData);
        onSubmitSuccess(newArchitect);
      }

      // Reset the form
      setFormData({
        name: "",
        firm: "",
        contact_number: "",
        principal_architect_name: "",
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
        {/* Architect Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Architect Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter architect name"
          />
        </div>

        {/* Firm */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Firm
          </label>
          <input
            type="text"
            name="firm"
            value={formData.firm}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter firm name"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter contact number"
          />
        </div>

        {/* Principal Architect Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Principal Architect Name
          </label>
          <input
            type="text"
            name="principal_architect_name"
            value={formData.principal_architect_name}
            onChange={handleChange}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter principal architect's name"
          />
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
            : "Add Architect"}
        </button>
      </form>
    </div>
  );
};

export default AddArchitectForm;
