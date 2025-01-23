

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Sidebar from '../../../components/HSidebar';
import Modal from 'react-modal';
import TransferTable from './TransferTable'; // Adjust the path as needed
import TestSubTestTable from './TestSubTestTable';
import UpdateFieldButtons from './UpdateFieldButtons'; // Import the new component
import tic from '../../../assets/tichead.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
const ViewFrom = () => {
  const { vertical, trfid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [testData, setTestData] = useState([]);
  const [subTestData, setSubTestData] = useState([]);

  const [newTest, setNewTest] = useState({ test: '', claim: '', spes: '' });
  const [newSubTest, setNewSubTest] = useState({ testId: '', test: '', result: '', remarks: '' });

  const [selectedTest, setSelectedTest] = useState(null);
  const [editTestData, setEditTestData] = useState({ test: '', claim: '', spes: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [addSubTestModalIsOpen, setAddSubTestModalIsOpen] = useState(false); // For add sub-test modal
  const [editSubTestModalIsOpen, setEditSubTestModalIsOpen] = useState(false);
  const [selectedSubTest, setSelectedSubTest] = useState(null);
  const [editSubTestData, setEditSubTestData] = useState({ test: '', claim: '', spes: '' });
  // Check if the user is authorized (role-based logic)
  const userDataString = localStorage.getItem('user');
  const user = userDataString ? JSON.parse(userDataString) : null;
  const userRole = user ? user.auth_role : null; // Get user role

  // add result data 
  const [editResultModalIsOpen, setEditResultModalIsOpen] = useState(false);
  const [editResultData, setEditResultData] = useState({ results: '' });
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  // add subresult data 
  const [isSubTestEditModalOpen, setIsSubTestEditModalOpen] = useState(false); // Modal state
  const [activeSubTest, setActiveSubTest] = useState(null); // Selected sub-test for editing
  const [subTestFormData, setSubTestFormData] = useState({ results: '' });

  const [modalTestId, setModalTestId] = useState(''); // Initialize modalTestId state

  const [unit, setUnit] = useState('');
  const units = ['mg', 'gm', 'ml', 'L', 'mcg', 'kcal', 'IU'];

  useEffect(() => {
    if (!vertical || !trfid) {
      setError('Invalid vertical or trfid.');
      setLoading(false);
      return;
    }

    const apiUrl = `/trfs/${vertical}/${trfid}`;

    const fetchData = async () => {
      try {
        const response = await api.get(apiUrl);
        const data = response.data;
        setData(data);
        setTestData(data.testData || []);
        setSubTestData(data.subTestResults || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vertical, trfid]);
  
  
  //  Add test 
  const handleAddTest = async () => {
    if (!newTest.test) {
      alert("All fields must be filled!");
      return;
    }

    try {
      const claimWithUnit = `${newTest.claim} ${unit}`.trim();
      // Prepare the data to send, always including unit (as empty string if not provided)
      const payload = {
        test: newTest.test,
        claim: claimWithUnit,
        spes: newTest.spes,
        results: "",
        file: "",
        updateby: "",
        resultupdateon: new Date().toISOString(),
        reqby: "",
        reqtime: "",
        samplestage: "",
        upby: "",
        updateon: new Date().toISOString(),
        unit: unit || "",
      };

      const response = await api.post(
        `/trfs/${vertical}/${trfid}`,
        payload
      );

      const newTestData = {
        ...newTest,
        claim: claimWithUnit,
        id: response.data.testId,
      };

      // Update the state to include the new test
      setTestData((prevData) => [...prevData, newTestData]);
      setNewTest({ test: "", claim: "", spes: "" });
      setUnit(''); // Reset unit
    } catch (error) {
      console.error("Error adding test:", error);
    }
  };
  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTest(null);
    setEditTestData({ test: '', claim: '', spes: '' });
    setUnit('');
  };
  // const handleSelectTest = (test) => {
  //   setSelectedTest(test);

  //   // Remove the unit from the claim
  //   const claimParts = test.claim.trim().split(' ');

  //   let unit = '';
  //   if (claimParts.length > 1) {
  //     unit = claimParts.pop(); // Extract the unit
  //   }

  //   const claimWithoutUnit = claimParts.join(' '); // Join remaining parts to form the claim

  //   // Handle claim as a string to preserve its format
  //   let claimValue = claimWithoutUnit;

  //   // If claimWithoutUnit is a valid number, keep it as a string (e.g., "10.000")
  //   if (!isNaN(claimWithoutUnit)) {
  //     claimValue = claimWithoutUnit; // Keep it as is (e.g., "10.000")
  //   }

  //   // Set the state for editing the test
  //   setEditTestData({
  //     test: test.test,
  //     claim: claimValue, // Store as string to preserve format
  //     spes: test.spes
  //   });

  //   // Set the unit for the dropdown
  //   setUnit(unit);

  //   // Open the modal for editing the test
  //   setModalIsOpen(true);
  // };
  const handleSelectTest = (test) => {
    setSelectedTest(test);
  
    // Ensure claim is not null or undefined
    const claim = test.claim || '';
  
    // Remove the unit from the claim
    const claimParts = claim.trim().split(' ');
  
    let unit = '';
    if (claimParts.length > 1) {
      unit = claimParts.pop(); // Extract the unit
    }
  
    const claimWithoutUnit = claimParts.join(' '); // Join remaining parts to form the claim
  
    // Handle claim as a string to preserve its format
    let claimValue = claimWithoutUnit;
  
    // If claimWithoutUnit is a valid number, keep it as a string (e.g., "10.000")
    if (!isNaN(claimWithoutUnit)) {
      claimValue = claimWithoutUnit; // Keep it as is (e.g., "10.000")
    }
  
    // Set the state for editing the test
    setEditTestData({
      test: test.test,
      claim: claimValue, // Store as string to preserve format
      spes: test.spes
    });
  
    // Set the unit for the dropdown
    setUnit(unit);
  
    // Open the modal for editing the test
    setModalIsOpen(true);
  };
  const handleUpdateTest = async () => {
    if (!selectedTest) return;

    try {
      // Ensure that claim is cleared if it's empty
      const claimWithUnit = editTestData.claim.trim();
      // If claim is non-empty, append the unit, else set to null if the claim is empty
      const updatedClaim = claimWithUnit ? `${claimWithUnit} ${unit}`.trim() : null;

      // Prepare the update data object
      const updateData = {
        test: editTestData.test,
        claim: updatedClaim,  // Set the updated claim (with or without unit)
        spes: editTestData.spes || null, // If specification is empty, send null
        upby: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).ename : 'Unknown User',
        resultupdateon: new Date().toISOString(),
        reqby: editTestData.reqby,
        reqtime: editTestData.reqtime,
        unit: unit || null,  // If no unit is selected, send null
      };

      // Send the update request to the backend
      const response = await api.put(
        `/trfs/${vertical}/${trfid}/${selectedTest.id}/test`,
        updateData
      );

      // Update the local state with the new data
      setTestData((prevData) =>
        prevData.map((test) =>
          test.id === selectedTest.id ? { ...test, ...updateData } : test
        )
      );

      // Reset the form and close the modal
      setSelectedTest(null);
      setEditTestData({ test: '', claim: '', spes: '' });
      setUnit('');
      closeModal();

      console.log("Test updated successfully:", response.data);
    } catch (error) {
      console.error('Error updating test:', error);
    }
  };
  const handleDeleteTest = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this test and all associated sub-tests?");

    if (!confirmDelete) return;

    try {
      // Delete the associated sub-tests
      await api.delete(`/trfs/${vertical}/${trfid}/${id}`);

      // Remove the test from the state
      setTestData(testData.filter((test) => test.id !== id));

      // Handle sub-tests if they exist
      if (subTestData && subTestData.length > 0) {
        // Remove sub-tests linked to the deleted test
        const updatedSubTests = subTestData.filter((subTest) => subTest.testId !== id);
        setSubTestData(updatedSubTests);
      }

      // Show success message
      alert("Test and associated sub-tests deleted successfully.");
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test and associated sub-tests.');
    }
  };
  const openEditResultModal = (testResult) => {
    setSelectedTestResult(testResult);
    setEditResultData({
      results: testResult.results || '',
    });
    setEditResultModalIsOpen(true);
  };
  const handleUpdateResult = async () => {
    if (!editResultData.results) {
      alert('Results field is required!');
      return;
    }

    try {
      // Get the current user's name from localStorage
      const userDataString = localStorage.getItem('user');
      const user = userDataString ? JSON.parse(userDataString) : null;
      const userName = user ? user.ename : 'Unknown User'; // Default to 'Unknown User' if not available

      // Make the PUT request to update the result
      const response = await api.put(
        `/trfs/${vertical}/${trfid}/${selectedTestResult.id}/result`,
        {
          updateby: userName, // Use the user's name as the updateby field
          results: editResultData.results, // The new results
        }
      );

      // Update the state with the new result and who updated it
      setTestData((prevData) =>
        prevData.map((test) =>
          test.id === selectedTestResult.id
            ? { ...test, results: editResultData.results, updateby: userName }
            : test
        )
      );

      // Close the modal after update
      setEditResultModalIsOpen(false);

    } catch (error) {
      console.error('Error updating result:', error);
      alert('Failed to update result');
    }
  };
  const handleClearResult = async (testId) => {
    if (window.confirm('Are you sure you want to clear the result data?')) {
      try {
        // Make the PUT request to clear the result field (not delete the test)
        const response = await api.put(
          `/trfs/${vertical}/${trfid}/${testId}/result/clear`
        );

        // Update the test data state to reflect the cleared result
        setTestData((prevData) =>
          prevData.map((test) =>
            test.id === testId ? { ...test, results: null } : test
          )
        );

        alert('Result cleared successfully!');
      } catch (error) {
        console.error('Error clearing result:', error);
        alert('Failed to clear result');
      }
    }
  };
  // Add Subtest Modal 
  const handleAddSubTest = async () => {
    // Ensure both 'testId' and 'test' fields are filled before proceeding
    if (!modalTestId || !newSubTest.test) {
      alert("All fields must be filled!");
      return;
    }

    try {
      // Combine the claim and unit (if provided) into a single string
      const claimWithUnit = `${newSubTest.claim} ${unit}`.trim();

      // Make the API request to add the sub-test
      const response = await api.post(
        `/trfs/${vertical}/${trfid}/subtests`,
        {
          testid: modalTestId, // Use the modalTestId here
          test: newSubTest.test,
          claim: claimWithUnit, // Use the combined claim and unit
          spes: newSubTest.spes || "", // Ensure 'spes' is passed as an empty string if undefined
          unit: unit || "", // Include the selected unit, default to an empty string if not provided
        }
      );

      console.log("Sub-test added:", response.data); // Log the response from the server

      // Create the sub-test object to be added to the local state
      const addedSubTest = {
        sub_testid: response.data.sub_testid, // Assuming 'sub_testid' is returned from the server
        testid: modalTestId, // Use modalTestId here
        test: newSubTest.test,
        claim: claimWithUnit, // Use the combined claim with unit
        spes: newSubTest.spes || "", // Ensure 'spes' is handled if undefined
        unit: unit || "", // Include the selected unit
      };

      // Update the subTestData state by appending the newly added sub-test
      setSubTestData((prevData) => [...prevData, addedSubTest]);

      // Reset the input fields to their initial state
      setNewSubTest({ testId: "", test: "", claim: "", spes: "" });
      setUnit(''); // Reset the unit field
    } catch (error) {
      console.error("Error adding sub-test:", error); // Log any errors to the console
      alert("Error adding sub-test. Please try again."); // Show a user-friendly error message
    }
  };
  const openAddSubTestModal = (test) => {
    // Set the testId in a separate state variable (modalTestId)
    setModalTestId(test.id);

    // Reset the sub-test fields and set the testId for the new sub-test
    setNewSubTest({
      testId: test.id,   // Set the testId for the new sub-test
      test: '',           // Clear the test name
      claim: '',          // Clear the claim field
      spes: '',           // Clear the specification field
    });

    // Open the modal
    setAddSubTestModalIsOpen(true);
  };
  const closeAddSubTestModal = () => {
    setAddSubTestModalIsOpen(false);
    setNewSubTest({ testId: '', test: '', claim: '', spes: '' }); // Reset fields
  };
  const handleSelectSubTest = (subTest) => {
    setSelectedSubTest(subTest);

    // Remove the unit from the claim
    const claimParts = subTest.claim.trim().split(' ');
    // const unit = claimParts.pop(); // Extract the unit
    let unit = '';
    if (claimParts.length > 1) {
      unit = claimParts.pop(); // Extract the unit
    }
    const claimWithoutUnit = claimParts.join(' '); // Join remaining parts to form the claim

    // Handle claim as a string for preserving format
    let claimValue = claimWithoutUnit;

    // If claimWithoutUnit is a valid number, keep it as a string (e.g., 10.000)
    if (!isNaN(claimWithoutUnit)) {
      claimValue = claimWithoutUnit; // Keep it as is (e.g., "10.000")
    }

    setEditSubTestData({
      test: subTest.test,
      claim: claimValue, // Store as string if needed to preserve format
      spes: subTest.spes
    });
    setUnit(unit); // Set the unit for the dropdown
    setEditSubTestModalIsOpen(true); // Open the modal for editing
  };
  const handleUpdateSubTest = async () => {
    if (!selectedSubTest) return; // Ensure a sub-test is selected

    try {
      // Combine claim and unit
      const claimWithUnit = `${editSubTestData.claim} ${unit}`.trim();

      // Prepare the data to send in the update request
      const updateData = {
        test: editSubTestData.test,
        claim: claimWithUnit, // Combine the claim and unit
        spes: editSubTestData.spes,
        unit: unit, // Include the selected unit
        upby: user ? user.ename : '', // Assuming `ename` is stored in the user data
        updateon: new Date().toISOString() // Get the current timestamp for the update
      };

      // Send the PUT request to update the sub-test
      const response = await api.put(
        `/trfs/${vertical}/${trfid}/subtests/${selectedSubTest.sub_testid}`,
        updateData
      );

      // Update the sub-test data in state after successful update
      setSubTestData((prevData) =>
        prevData.map((subTest) =>
          subTest.sub_testid === selectedSubTest.sub_testid ? { ...subTest, ...updateData } : subTest
        )
      );

      // Reset form and close the modal
      setEditSubTestModalIsOpen(false); // Close the modal
      setSelectedSubTest(null); // Clear selected sub-test
      setEditSubTestData({ test: '', claim: '', spes: '' }); // Reset the form data
      setUnit(''); // Reset the unit

      console.log("Sub-Test updated successfully:", response.data);
      // Optionally call a function to handle any extra steps after successful update
      closeAddSubTestModal(); // Close the modal or handle any further actions

    } catch (error) {
      console.error('Error updating sub-test:', error);
      // Optionally display an error message to the user
    }
  };
  const handleDeleteSubTest = async (subTestId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sub-test?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/trfs/${vertical}/${trfid}/subtests/${subTestId}`); // Use subTestId parameter here
      setSubTestData((prevData) => prevData.filter(subTest => subTest.sub_testid !== subTestId)); // Filter using sub_testid
      alert("Sub-test deleted successfully.");
    } catch (error) {
      console.error('Error deleting sub-test:', error);
      alert('Failed to delete sub-test.');
    }
  };
  // Open Edit Sub-Test Result Modal
  const openEditSubTestModal = (subTest) => {
    setActiveSubTest(subTest);
    setSubTestFormData({
      results: subTest.results || '',
    });
    setIsSubTestEditModalOpen(true);
  };
  // Handle Sub-Test Result Update
  const handleUpdateSubTestResult = async () => {
    if (!subTestFormData.results) {
      alert('Results field is required!');
      return;
    }

    if (!vertical || !trfid || !activeSubTest?.sub_testid) {
      console.error('Missing required parameters:', vertical, trfid, activeSubTest?.sub_testid);
      alert('Error: Missing required parameters.');
      return;
    }

    try {
      // Get the current user's name from localStorage
      const userDataString = localStorage.getItem('user');
      const user = userDataString ? JSON.parse(userDataString) : null;
      const userName = user ? user.ename : 'Unknown User'; // Default to 'Unknown User' if not available

      // Make the PUT request to update the sub-test result
      const apiUrl = `/trfs/${vertical}/${trfid}/subtests/${activeSubTest.sub_testid}/subresults`;
      const response = await api.put(apiUrl, {
        updateby: userName,
        results: subTestFormData.results,
      });

      // Optimistically update the local state after API request to reflect the updated result
      setSubTestData((prevData) => {
        const updatedSubTestData = prevData.map((subTest) =>
          subTest.sub_testid === activeSubTest.sub_testid
            ? { ...subTest, results: subTestFormData.results, updateby: userName }
            : subTest
        );
        return updatedSubTestData;
      });

      // Close the modal after updating
      setIsSubTestEditModalOpen(false);

      // You don't need to reload the page, just update the relevant state
      // alert('Sub-test result updated successfully!');
    } catch (error) {
      console.error('Error updating sub-test result:', error);
      alert('Failed to update sub-test result');
    }
  };
  const handleClearSubResult = async (subTestId) => {
    if (!subTestId) {
      alert('Invalid subtest ID');
      return;
    }

    if (window.confirm('Are you sure you want to clear the result data for this subtest?')) {
      try {
        // Make the PUT request to clear the sub-test result
        const apiUrl = `/trfs/${vertical}/${trfid}/subtests/${subTestId}/subresults/clear`;
        const response = await api.put(apiUrl);

        // Optimistically update the local state to reflect the cleared result
        setSubTestData((prevData) =>
          prevData.map((subTest) =>
            subTest.sub_testid === subTestId ? { ...subTest, results: null } : subTest
          )
        );

        // You don't need to reload the page, just update the relevant state
        alert('Sub-test result cleared successfully!');
      } catch (error) {
        console.error('Error clearing sub-test result:', error);
        alert('Failed to clear sub-test result');
      }
    }
  };
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-grow ml-60 p-5">
          <div className='rounded-lg shadow-xl border border-10 mx-18 px-16 py-5'>
            <h1 className="text-2xl font-bold mb-4 text-center">TEST REQUEST FORM</h1>
            <div className="text-center">
              <Skeleton height={30} width="80%" />
              <Skeleton height={30} width="50%" />
              <Skeleton height={30} width="90%" />
            </div>
            <table className="table-auto w-full mt-4 text-xs p-20">
              <tbody className="border border-1 border-gray-100">
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border border-1 border-gray-100">
                    <td className="p-1"><Skeleton height={20} /></td>
                    <td className="p-2"><Skeleton height={20} /></td>
                    <td className="p-2"><Skeleton height={20} /></td>
                    <td className="p-2"><Skeleton height={20} /></td>
                    <td className="p-2"><Skeleton height={20} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  const arnPrefixMap = {
    ay: 'arnayurveda',
    nt: 'arnnutra',
    ph: 'arnpharma',
    sp: 'arnsports',
  };
  const printSelectedColumns = () => {
    // Create the content for the print window
    const printContent = `
    <html>
      <head>
        <style>
        @page {
              margin: 15;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
          }
          h2 {
           display: block;
            text-align: center;
            font-size: 14px;
            margin-top: 75px;
          }
          .header-image {
            display: block;
            width: 100%;
            height: auto;
            margin: 0 auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-size: 12px;
          }
          td {
            font-size: 10px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            font-size: 10px;
          }
          .footer div {
            text-align: center;
            width: 30%;
          }
          .page {
            page-break-after: always;
          }
          @media print {
            .header-image {
              position: fixed;
              top: 0;
              width: 100%;
              height: auto;
            }
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
            }
            .close {
              display: none;
            }
            /* Remove the border from input fields */
            input[type="number"] {
              width: 30px;   /* Adjust width as needed */
              padding: 1px;
              font-size: 10px;
              background-color: #fff;
              text-align: center;       /* Center the number */
              border: none; /* No border */
            }
            /* Hide the Action column in print */
            th:nth-child(4), td:nth-child(4) {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center;">
          <img id="header-image" src="${tic}" class="header-image" alt="Header Image" />
        </div>
        ${generatePages(testData, subTestData, 'ard')}
        
        <script>
          // Function to remove a row in the print window
          function removeRow(rowId, testId) {
            const rowToRemove = document.getElementById(rowId);
            if (rowToRemove) {
              rowToRemove.remove();  // Remove the row from the DOM
              // Remove all related sub-tests
              const subTestRows = document.querySelectorAll(\`tr[data-parent=\${testId}]\`);
              subTestRows.forEach(row => row.remove());
            }
          }
        </script>
      </body>
    </html>
  `;

    // Create a new window and write the print content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      const headerImage = printWindow.document.getElementById('header-image');

      // Add an onload event to print only after the image is fully loaded
      headerImage.onload = function () {
        printWindow.print();
      };
    }
  };
  // Function to generate pages with rows
  const generatePages = (testData, subTestData, department) => {
    const maxRowsPerPage = 18;  // Maximum rows per page
    let rowCount = 0;
    let currentPageRows = [];
    const pages = [];

    testData.forEach((test, testIndex) => {
      // Add the main test row with a remove button
      currentPageRows.push(`
          <tr id="row-${testIndex}" data-parent="${test.id}">
              <td><input type="number" value="${testIndex + 1}" class="editable-serial-no" onchange="updateSerialNo(${testIndex}, event)" /></td>
              <td>${test.test || ''}</td>
              <td>${test.results || ''}</td>
              ${department === 'ard' ? `
                  <td class="close printhide w3-padding-small w3-border-left w3-border-black" style="width:100px;text-align:left;padding:5px 10px;">
                      <b class="w3-border w3-circle w3-red w3-border-red w3-hover-shadow w3-hover-white w3-hover-border-white w3-hover-text-red" style="padding:2px 5px;cursor:pointer;" onclick="removeRow('row-${testIndex}', '${test.id}')"> Remove </b>
                  </td>
              ` : ''}
          </tr>
      `);
      rowCount++;

      // Add rows for sub-tests
      const subTestRows = subTestData
        .filter(subTest => String(subTest.testid) === String(test.id))
        .map((subTest, subTestIndex) => {
          rowCount++;
          return `
                  <tr id="row-${testIndex}.${subTestIndex}" data-parent="${test.id}">
                      <td><input type="number" value="${testIndex + 1}.${subTestIndex + 1}" class="editable-serial-no" onchange="updateSerialNo(${testIndex}, event)" /></td>
                      <td>${subTest.test || ''}</td>
                      <td>${subTest.results || ''}</td>
                      ${department === 'ard' ? `
                          <td class="close printhide w3-padding-small w3-border-left w3-border-black" style="width:100px;text-align:left;padding:5px 10px;">
                              <b class="w3-border w3-circle w3-red w3-border-red w3-hover-shadow w3-hover-white w3-hover-border-white w3-hover-text-red" style="padding:2px 5px;cursor:pointer;" onclick="removeRow('row-${testIndex}.${subTestIndex}', '${test.id}')"> Remove </b>
                          </td>
                      ` : ''}
                  </tr>
              `;
        });
      currentPageRows.push(...subTestRows);

      // Check if we've reached the maximum rows per page
      if (rowCount >= maxRowsPerPage) {
        pages.push(currentPageRows.join(''));
        currentPageRows = [];
        rowCount = 0;
      }
    });

    // Add any remaining rows as the last page
    if (currentPageRows.length > 0) {
      pages.push(currentPageRows.join(''));
    }

    // Generate HTML for all pages
    return pages.map((pageRows, pageIndex) => `
      <div class="page">
          <h2>ANALYSIS REPORT</h2>
          <div id="transferTable" class="transfer-table">
              ${document.querySelector('#transferTable')?.innerHTML || ''}
          </div>
          <table>
              <thead>
                  <tr>
                      <th>Sr. No.</th>
                      <th>Name</th>
                      <th>Results</th>
                      ${department === 'ard' ? '<th>Action</th>' : ''}
                  </tr>
              </thead>
              <tbody>
                  ${pageRows}
              </tbody>
          </table>
          ${pageIndex === pages.length - 1 ? `
              <h4>Remark :</h4>
              <ul style="font-size: 11px; margin-top: 20px;">
                  <li>The above-mentioned material/product Complies/Does not Comply as per specification limit, or the acceptance criteria provided by FRD.</li>
                  <li>For Information purpose only.</li>
              </ul>
          ` : ''}
          <div class="footer">
              <div>
                  Prepared By (ARD)<br>
                  (Sign & Date)
              </div>
              <div>
                  Reviewed By (ARD)<br>
                  (Sign & Date)
              </div>
              <div>
                  Received By (FRD)<br>
                  (Sign & Date)
              </div>
          </div>
      </div>
  `).join('');
  };
  // Update the serial number when changed in the input field
  function updateSerialNo(index, event) {
    const newSerialNo = event.target.value;
    const row = document.getElementById(`row-${index}`);
    if (row) {
      row.cells[0].innerHTML = newSerialNo;  // Update the serial number in the DOM
    }
  }
  const printTRF = () => {
    // Create the content for the print window
    const printContent = `
      <html>
        <head>
          <title>TRF Print </title>
          <style>
          @page {
              margin: 15;
          }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
            }
           h2 {
           display: block;
            text-align: center;
            font-size: 14px;
            margin-top: 75px;
            }

            .header-image {
              display: block;
              width: 100%;
              height: auto; /* Maintain aspect ratio */
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-size: 12px;
            }
            td {
              font-size: 10px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 20px;
              font-size: 10px;
            }
            .footer div {
              text-align: center;
              width: 30%;
            }
            .page {
              page-break-after: always;
            }
            @media print {
              .header-image {
                position: fixed;
                top: 0;
                width: 100%;
                height: auto;
              }
              .footer {
                position: fixed;
                bottom: 0;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
         <div style="text-align: center;">
            <img id="header-image" src="${tic}" class="header-image" alt="Header Image" />
          </div>
          ${generateTRF(testData, subTestData)}
        </body>
      </html>
    `;

    // Create a new window and write the print content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      const headerImage = printWindow.document.getElementById('header-image');

      // Add an onload event to print only after the image is fully loaded
      headerImage.onload = function () {
        printWindow.print();
      };
    }
  };
  const generateTRF = (testData, subTestData) => {
    const maxRowsPerPage = 18; // Maximum rows per page
    let rowCount = 0;
    let currentPageRows = [];
    const pages = [];

    testData.forEach((test, testIndex) => {
      // Add the main test row
      currentPageRows.push(`
        <tr>
          <td>${testIndex + 1}</td>
          <td>${test.test || ''}</td>
          <td>${test.claim || ''}</td>
          <td>${test.spes || ''}</td>
        </tr>
      `);
      rowCount++;

      // Add rows for sub-tests
      const subTestRows = subTestData
        .filter(subTest => String(subTest.testid) === String(test.id))
        .map((subTest, subTestIndex) => {
          rowCount++;
          return `
            <tr>
              <td>${testIndex + 1}.${subTestIndex + 1}</td>
              <td>${subTest.test || ''}</td>
              <td>${subTest.claim || ''}</td>
              <td>${subTest.spes || ''}</td>
            </tr>
          `;
        });
      currentPageRows.push(...subTestRows);

      // Check if we've reached the maximum rows per page
      if (rowCount >= maxRowsPerPage) {
        pages.push(currentPageRows.join(''));
        currentPageRows = [];
        rowCount = 0;
      }
    });

    // Add any remaining rows as the last page
    if (currentPageRows.length > 0) {
      pages.push(currentPageRows.join(''));
    }

    // Generate HTML for all pages
    return pages.map((pageRows, pageIndex) => `
      <div class="page">
        <h2>TEST REQUEST FORM</h2>
        <div id="transferTable" class="transfer-table">
          ${document.querySelector('#transferTable')?.innerHTML || ''}
        </div>
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Claim</th>
              <th>Specification</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows}
          </tbody>
        </table>
        ${pageIndex === pages.length - 1 ? `
          <h4>Remark :</h4>
          <ul style="font-size: 11px; margin-top: 20px;">
            <li>The above-mentioned material/product Complies/Does not Comply as per specification limit, or the acceptance criteria provided by FRD.</li>
            <li>For Information purpose only.</li>
          </ul>
        ` : ''}
        <div class="footer">
          <div>
            Prepared By (ARD)<br>
            (Sign & Date)
          </div>
          <div>
            Reviewed By (ARD)<br>
            (Sign & Date)
          </div>
          <div>
            Received By (FRD)<br>
            (Sign & Date)
          </div>
        </div>
      </div>
    `).join('');
  };
  // const arnColumnName = arnPrefixMap[vertical];
  // const arnValue = data?.trfData[arnColumnName] || 'Not Available';
  const arnColumnName = arnPrefixMap[vertical];
  const arnValue = data?.trfData[arnColumnName] || 'Not Available';

  // Define a mapping object for vertical to their display names
  const verticalDisplayNames = {
    ph: 'Pharma',
    sp: 'Sports',
    ay: 'Ayurveda',
    nt: 'Nutra',
  };
  // Get the display name based on the vertical value
  const displayVertical = verticalDisplayNames[vertical] || 'Unknown Vertical';
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow ml-60 p-5">
        <div className=' rounded-lg shadow-xl border border-10 mx-18 px-16 py-5 '>
          <h1 className="text-2xl font-bold mb-4 text-center">TEST REQUEST FORM</h1>
          <div className='flex gap-4'>
            <p className="text-md">
              From: Formulation Research Development / {displayVertical} To : {data?.trfData?.toard || data?.trfData?.toardmicro || ' '}
            </p>
            <button
              onClick={printSelectedColumns}
              className="bg-green-500 text-white px-2 py-1 rounded-md flex items-center space-x-2 hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5" />
              <span>Analysis Report</span>
            </button>
            <button
              onClick={printTRF}
              className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center space-x-2 hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faClipboardCheck} className="h-5 w-5" />
              <span>TRF Report</span>
            </button>

          </div>


          <div id="transferTable">  <TransferTable trfData={data.trfData} /></div>

          {/* Test And Subtest Table */}
          <div id="testSubTestTable">
            <TestSubTestTable
              testData={testData}
              subTestData={subTestData}
              openAddSubTestModal={openAddSubTestModal}
              openEditResultModal={openEditResultModal}
              openEditSubTestModal={openEditSubTestModal}
              handleClearSubResult={handleClearSubResult}
              handleSelectTest={handleSelectTest}
              handleDeleteTest={handleDeleteTest}
              handleClearResult={handleClearResult}
              handleSelectSubTest={handleSelectSubTest}
              handleDeleteSubTest={handleDeleteSubTest}
              vertical={vertical}
              trfid={trfid}
              userRole={userRole}
            />
          </div>
        </div>
        {/* Update Fields */}
        <UpdateFieldButtons data={data} vertical={vertical} trfid={trfid} />
        {/* Add Test Form */}
        {userRole === 1 || userRole === 2 ? (
          <div className="mt-4 p-6 bg-white rounded-lg shadow-xl border border-10">
            <h3 className="text-2xl font-semibold mb-2 text-center">Add New Test</h3>
            <div className="flex gap-5">
              <input
                type="text"
                className="border border-gray-300 p-2 mb-2 w-full"
                placeholder="Test"
                value={newTest.test}
                onChange={(e) => setNewTest({ ...newTest, test: e.target.value })}
              />
              <input
                type="text"
                className="border border-gray-300 p-2 mb-2 w-full"
                placeholder="Claim"
                value={newTest.claim}
                onChange={(e) => setNewTest({ ...newTest, claim: e.target.value })}
              />
              <select
                className="border border-gray-300 p-2 mb-2 w-full"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="">Select Unit</option>
                {units.map((unitOption, index) => (
                  <option key={index} value={unitOption}>{unitOption}</option>
                ))}
              </select>
              <input
                type="text"
                className="border border-gray-300 p-2 mb-2 w-full"
                placeholder="Specification"
                value={newTest.spes}
                onChange={(e) => setNewTest({ ...newTest, spes: e.target.value })}
              />
            </div>
            <button
              onClick={handleAddTest}
              className="bg-blue-500 text-white p-2 rounded mt-2 flex justify-center items-center w-full"
            >
              Add Test
            </button>
          </div>
        ) : null}


        {/* Edit Test data  */}
        <Modal
          ariaHideApp={false}
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit Test"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Edit Test</h3>
            <p className="text-xs text-center my-3">
              Remark: You can edit only description, Claim, Specification
            </p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Test"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editTestData.test || ''}
                onChange={(e) => setEditTestData({ ...editTestData, test: e.target.value })}
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Claim"
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  value={editTestData.claim || ''}
                  onChange={(e) => setEditTestData({ ...editTestData, claim: e.target.value })}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Unit</option>
                  {units.map((unitOption, index) => (
                    <option key={index} value={unitOption}>
                      {unitOption}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Specification"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editTestData.spes || ''}
                onChange={(e) => setEditTestData({ ...editTestData, spes: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleUpdateTest}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                Submit Changes
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        {/* Add Sub-Test Modal */}
        <Modal
          ariaHideApp={false}
          isOpen={addSubTestModalIsOpen}
          onRequestClose={closeAddSubTestModal}
          contentLabel="Add Sub-Test"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Add New Sub-Test</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Sub-Test Name"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newSubTest.test}
                onChange={(e) => setNewSubTest({ ...newSubTest, test: e.target.value })}
              /><div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Claim"
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSubTest.claim}
                  onChange={(e) => setNewSubTest({ ...newSubTest, claim: e.target.value })}
                />
                <select
                  className="border border-gray-300 p-2 mb-2 w-full"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  {units.map((unitOption, index) => (
                    <option key={index} value={unitOption}>{unitOption}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Specification"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newSubTest.spes}
                onChange={(e) => setNewSubTest({ ...newSubTest, spes: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleAddSubTest}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                Add Sub-Test
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault(); // Prevent any default action
                  closeAddSubTestModal(); // Close the modal
                  window.location.reload(); // Reload the page
                }}
                className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        {/* Edit Sub-Test Modal */}
        <Modal
          ariaHideApp={false}
          isOpen={editSubTestModalIsOpen}
          onRequestClose={() => setEditSubTestModalIsOpen(false)}
          contentLabel="Edit Sub-Test"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Edit Sub-Test</h3>
            <div className="flex flex-col gap-4">
              {/* Sub-Test Name */}
              <input
                type="text"
                placeholder="Sub-Test Name"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editSubTestData.test}
                onChange={(e) => setEditSubTestData({ ...editSubTestData, test: e.target.value })}
              />

              {/* Claim and Unit */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Claim"
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editSubTestData.claim}
                  onChange={(e) => setEditSubTestData({ ...editSubTestData, claim: e.target.value })}
                />
                <select
                  className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={unit} // Keep the selected unit
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">Select Unit</option>
                  {units.map((unitOption, index) => (
                    <option key={index} value={unitOption}>{unitOption}</option>
                  ))}
                </select>
              </div>

              {/* Specification */}
              <input
                type="text"
                placeholder="Specification"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editSubTestData.spes}
                onChange={(e) => setEditSubTestData({ ...editSubTestData, spes: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {/* Submit Button */}
              <button
                onClick={handleUpdateSubTest} // Call the update function on submit
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                Submit Changes
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setEditSubTestModalIsOpen(false)} // Close the modal without saving
                className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        {/* Modal to edit test result */}
        <Modal
          ariaHideApp={false}
          isOpen={editResultModalIsOpen}
          onRequestClose={() => setEditResultModalIsOpen(false)}
          contentLabel="Edit Result"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Add/Edit Test Result</h3>
            <div className="flex flex-col gap-4">
              <textarea
                type="text"
                placeholder="Results"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editResultData.results}
                onChange={(e) => setEditResultData({ ...editResultData, results: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleUpdateResult}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                Submit Changes
              </button>
              <button
                onClick={() => setEditResultModalIsOpen(false)}
                className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        {/* Modal to edit sub-test result */}
        <Modal
          ariaHideApp={false}
          isOpen={isSubTestEditModalOpen}
          onRequestClose={() => setIsSubTestEditModalOpen(false)}
          contentLabel="Edit Sub-Test Result"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Add/Edit Sub-Test Result</h3>
            <div className="flex flex-col gap-4">
              <textarea
                type="text"
                placeholder="Enter Sub-Test Results"
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={subTestFormData.results}
                onChange={(e) => setSubTestFormData({ ...subTestFormData, results: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleUpdateSubTestResult}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              >
                Submit Changes
              </button>
              <button
                onClick={() => setIsSubTestEditModalOpen(false)}
                className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>



      </div>
    </div>
  );
};
export default ViewFrom;