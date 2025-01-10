import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');        // Ensure day is 2 digits
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure month is 2 digits
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const TestSubTestTable = ({
  testData,
  subTestData,
  openAddSubTestModal,
  handleSelectTest,
  handleDeleteTest,
  handleSelectSubTest,
  handleDeleteSubTest,
  openEditResultModal,
  handleClearResult,
  handleClearSubResult,
  openEditSubTestModal,
  vertical,
  trfid,
  userRole,
  data, // Assuming 'data' contains 'trfData' and 'prepby'
}) => {
  // State to track the visibility of the "Add Result" and "Remove Result" buttons
  const [showResultButtons, setShowResultButtons] = useState(false);
  const [trfData, setTrfData] = useState(null);

  // Fetch TRF data
  const fetchData = () => {
    const url = `http://localhost:3000/trfs/${vertical}/${trfid}`;
    axios.get(url)
      .then(response => setTrfData(response.data))
      .catch(error => console.error('Error fetching TRF data:', error));
  };

  // Initially fetch the data
  useEffect(() => {
    fetchData();
  }, [vertical, trfid]);

  // Check if 'receivedby' and 'receivedate' exist
  const isReceived = trfData && trfData.trfData?.receivedby && trfData.trfData?.receivedate;

  const updateField = (field) => {
    const userDataString = localStorage.getItem('user');
    const user = userDataString ? JSON.parse(userDataString) : null;
    const username = user ? user.ename : null;

    if (!username) {
      alert('User is not logged in.');
      return;
    }

    const url = `http://localhost:3000/trfs/${vertical}/${trfid}/${field}`;
    axios.put(url, { [field]: username })
      .then(response => {
        alert(response.data.message);
        fetchData(); // Refresh data after update
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error updating: ' + error.response?.data?.message || error.message);
      });
  };

  // Show the "Add Result" and "Remove Result" buttons if `prepby` exists
  const isPrepByPresent = trfData?.trfData?.prepby;
  const showButtons = isPrepByPresent || showResultButtons;

  return (
    <div className="combined-test-table my-6 text-xs">
      <div className="flex items-center space-x-4 mt-2 p-1 ">
        <h1 className="text-lg">Test to be carried out as per below mentioned parameters:</h1>
        {!isReceived ? (
          <p className="text-sm text-gray-800">Received By: <br /><span className="text-sm text-red-500">Not Yet Received</span></p>
        ) : (
          <>
            {(userRole === 1 || userRole === 3 || userRole === 4) && !trfData.trfData.prepby ? (
              <div className="items-center space-x-3 p-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 ease-in-out">
                <p className="text-xs text-gray-700 my-2 text-center">Click to Prepare this TRF</p>
                <button
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
                  onClick={() => updateField('prepby')}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                  <span>Prepared</span>
                </button>
              </div>
            ) : (
              <span className="p-2 bg-gray-50 border border-gray-300 rounded-lg">
                Prepared By: <strong>{trfData?.trfData?.prepby}</strong>
                {trfData?.trfData?.prepdate ? `(${formatDate(trfData.trfData.prepdate)})` : ''}
              </span>
            )}
          </>
        )}
      </div>

      <table className="table-auto w-full mt-4 border-collapse border border-1 border-black">
        <thead className="border border-1 border-black">
          <tr>
            <th className="p-1 font-medium border border-1 border-black">SR. NO.</th>
            <th className="p-1 font-medium border border-1 border-black">Name</th>
            <th className="p-1 font-medium border border-1 border-black">Claim</th>
            <th className="p-1 font-medium border border-1 border-black">Specification</th>
            <th className="p-1 font-medium border border-1 border-black">Results</th>
            <th className="p-1 font-medium border border-1 border-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {testData.map((test, testIndex) => {
            // Check if the test has related sub-tests
            const hasSubTest = subTestData.some(subTest => String(subTest.testid) === String(test.id));

            return (
              <React.Fragment key={test.id}>
                <tr className="border border-1 border-black">
                  <td className="p-0.5 font-normal border border-1 border-black text-sm">{testIndex + 1}</td>
                  <td className={`p-0.5 font-normal border border-1 border-black ${hasSubTest ? 'border-0' : ''}`}>{test.test}</td>

                  {/* Conditionally remove borders for claim and spes columns if the test has sub-tests */}
                  <td className={`p-0.5 font-normal border border-1 border-black ${hasSubTest ? 'border-0' : ''}`}>
                    {test.claim || ''}
                  </td>
                  <td className={`p-0.5 font-normal border border-1 border-black ${hasSubTest ? 'border-0' : ''}`}>
                    {test.spes || ''}
                  </td>
                  <td className={`p-0.5 font-normal border border-1 border-black ${hasSubTest ? 'border-0' : ''}`}>{test.results || ''}</td>

                  <td className="p-1 flex border-l border-black">
                    {userRole === 1 || userRole === 2 ? (
                      <>
                        <button
                          className="p-1 mx-1 bg-gray-500 text-white rounded-sm"
                          onClick={() => openAddSubTestModal(test)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button
                          className="p-1 mx-1 bg-blue-500 text-white rounded-sm"
                          onClick={() => handleSelectTest(test)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="p-1 mx-1 bg-red-500 text-white rounded-sm"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="p-1 mx-1 bg-blue-500 text-white rounded-sm"
                        onClick={() => handleSelectTest(test)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}

                    {/* Show the "Add Result" and "Remove Result" buttons conditionally */}
                    {showButtons && userRole !== 2 && (
                      <>
                        <button
                          onClick={() => openEditResultModal(test)}
                          className="bg-yellow-500 text-[10px] text-white p-1 mx-0.5 rounded hover:bg-yellow-600"
                        >
                          Add Result
                        </button>
                        <button
                          onClick={() => handleClearResult(test.id)}
                          className="bg-blue-500 text-white p-1 text-[10px] rounded hover:bg-blue-600 transition"
                        >
                          Remove Result
                        </button>
                      </>
                    )}
                  </td>
                </tr>

                {/* Render sub-test rows */}
                {subTestData
                  .filter(subTest => String(subTest.testid) === String(test.id))
                  .map((subTest, subTestIndex) => (
                    <tr key={subTest.id} className="border border-1 border-black bg-gray-200">
                      <td className="p-1 border border-1 border-black">
                        {testIndex + 1}.{subTestIndex + 1}
                      </td>
                      <td className="p-0.5 border border-1 border-black">{subTest.test || ''}</td>
                      <td className="p-0.5 border border-1 border-black">{subTest.claim || ''}</td>
                      <td className="p-0.5 border border-1 border-black">{subTest.spes || ''}</td>
                      <td className="p-0.5 border border-1 border-black">{subTest.results || ''}</td>
                      <td className="p-1 flex">
                        {userRole === 1 || userRole === 2 ? (
                          <>
                            <button
                              className="p-1 mx-1 bg-green-500 text-white rounded-sm"
                              onClick={() => handleSelectSubTest(subTest)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="p-1 bg-orange-500 text-white rounded-sm"
                              onClick={() => handleDeleteSubTest(subTest.sub_testid)}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="p-1 mx-1 bg-green-500 text-white rounded-sm"
                            onClick={() => handleSelectSubTest(subTest)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}

                        {/* Conditionally show the sub-test result buttons */}
                        {showButtons && userRole !== 2 && (
                          <>
                            <button
                              onClick={() => openEditSubTestModal(subTest)}
                              className="bg-yellow-500 text-[10px] text-white p-1 mx-0.5 rounded hover:bg-yellow-600"
                            >
                              Add Sub-Test Result
                            </button>
                            <button
                              onClick={() => handleClearSubResult(subTest.sub_testid)}
                              className="bg-blue-500 text-white p-1 text-[10px] rounded hover:bg-blue-600 transition"
                            >
                              Clear Result
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>

      </table>

    </div>
  );
};

export default TestSubTestTable;