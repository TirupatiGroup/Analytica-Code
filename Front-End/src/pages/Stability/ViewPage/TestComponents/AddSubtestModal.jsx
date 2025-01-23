import React, { useState } from "react";
import api from "../../../../api/axios";

const AddSubtestModal = ({ testId, onClose, onSubtestAdded }) => {
  const [subtestDetails, setSubtestDetails] = useState({
    test: "",
    claim: "",
    spes: "",
    unit: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubtestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Retrieve productDetails and userDetails from localStorage
    const productDetails = JSON.parse(localStorage.getItem("productDetails"));
    const userDetails = JSON.parse(localStorage.getItem("user")) || {};

    if (!productDetails || !productDetails.id) {
      console.error("Product details or product ID not found in local storage");
      setLoading(false);
      alert("Product details not found. Please try again.");
      return;
    }

    const trfid = productDetails.id;

    // Prepare the payload with an array of subtests
    const newSubtest = {
      test: subtestDetails.test || "",
      claim: subtestDetails.claim || "",
      spes: subtestDetails.spes || "",
      results: subtestDetails.results || "",
      file: subtestDetails.file || "",
      updateby: subtestDetails.updateby || "",
      resultupdateon: subtestDetails.resultupdateon || "",
      reqby: `${userDetails.ename || ""} ${userDetails.username || ""}`.trim(),
      unit: subtestDetails.unit || "",
      samplestage: subtestDetails.samplestage || "",
      upby: subtestDetails.upby || "",
      updateon: subtestDetails.updateon || "",
    };

    try {
      const response = await api.post("/api/stability/subtest", {
        pid: trfid, // Product ID
        testId, // Test ID
        subtests: [newSubtest], // Send subtests as an array
      });

      if (response.status === 201) {
        console.log("Subtest added successfully:", response.data);
        onSubtestAdded(newSubtest); // Notify parent component
        onClose(); // Close modal after success
      }
    } catch (error) {
      console.error("Error submitting subtest:", error.message);
      alert("Failed to add subtest. Please check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Subtest</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Test Name</label>
            <input
              type="text"
              name="test"
              value={subtestDetails.test}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Claim</label>
              <input
                type="text"
                name="claim"
                value={subtestDetails.claim}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 ">Unit</label>
              <select
                name="unit"
                value={subtestDetails.unit}
                onChange={handleInputChange}
                className="border p-2 w-full"
              >
                <option value="">Select Unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lbs">lbs</option>
                <option value="oz">oz</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Specification</label>
            <input
              type="text"
              name="spes"
              value={subtestDetails.spes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubtestModal;
