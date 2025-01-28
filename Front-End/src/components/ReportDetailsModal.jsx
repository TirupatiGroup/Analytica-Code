import React from "react";

const RepoDetails = ({ username, ename, reportDetails, reportDate, onClose }) => {
  if (!reportDetails) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
  <h3 className="text-xl font-semibold mb-4">Report Details</h3>
  <div className="mb-4">
    <p>
      <strong>Mr./Ms. :</strong> {ename} ({username}) <br />
      Reported on: <strong>{reportDate}</strong>
    </p>
  </div>
  <p><strong>Reported Details:</strong> {reportDetails}</p>
  <button
    onClick={onClose}
    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
  >
    Close
  </button>
</div>

    </div>
  );
};

export default RepoDetails;
