import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios'; // Adjust the import based on your project structure
import { FaFileAlt, FaListAlt, FaClipboardList, FaWarehouse, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import Sidebar from '../../components/HSidebar';
import AddTestForm from './ViewPage/TestComponents/AddTest';
import AddSubtestModal from './ViewPage/TestComponents/AddSubtestModal';
import ProtocolList from './ViewPage/ProtocolComponents/ProtocolList';
const ViewProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [testDetails, setTestDetails] = useState([]);
  const [batchDetails, setBatchDetails] = useState([]);
  const [storageConditions, setStorageConditions] = useState([]);
  const [activeTab, setActiveTab] = useState('Protocols');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [isSubtestModalOpen, setSubtestModalOpen] = useState(false);
  const [currentTestId, setCurrentTestId] = useState(null);
  const tabs = [
    { key: 'Protocols', label: 'Protocols', icon: <FaFileAlt /> },
    { key: 'testDetails', label: 'Test Details', icon: <FaListAlt /> },
    { key: 'batchDetails', label: 'Batch Details', icon: <FaClipboardList /> },
    { key: 'storageConditions', label: 'Storage Conditions', icon: <FaWarehouse /> },
  ];

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsLoading(true); // Start loading
  };

  const closeModal = () => {
    setSelectedFile(null);
    setIsLoading(false); // Reset loading state
  };
  useEffect(() => {
    // Fetch product details initially
    const fetchProduct = async () => {
      try {
        const productResponse = await api.get(`/api/stability/products/${id}`);
        setProduct(productResponse.data);

        // Save product details to localStorage
        localStorage.setItem('productDetails', JSON.stringify(productResponse.data));
      } catch (error) {
        console.error('Error fetching product details', error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Fetch data dynamically based on the active tab
    const fetchTabData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'Protocols' && protocols.length === 0) {
          const response = await api.get(`/api/stability/protocols/${id}`);
          setProtocols(response.data);
        } else if (activeTab === 'testDetails' && testDetails.length === 0) {
          const response = await api.get(`/api/stability/test-details/${id}`);
          setTestDetails(response.data);
        } else if (activeTab === 'batchDetails' && batchDetails.length === 0) {
          const response = await api.get(`/api/stability/batch-details/${id}`);
          setBatchDetails(response.data);
        } else if (activeTab === 'storageConditions' && storageConditions.length === 0) {
          const response = await api.get(`/api/stability/storage-conditions/${id}`);
          setStorageConditions(response.data);
        }
      } catch (error) {
        console.error(`Error fetching data for ${activeTab}`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, id, protocols, testDetails, batchDetails, storageConditions]); // Check if data is already available

  if (!product) {
    return <div className="text-center text-lg font-semibold py-10">Loading...</div>;
  }

  const handleAddTest = (newTest) => {
    console.log('New Test Data:', newTest); // Debugging line
    setTestDetails((prevDetails) => {
      // Ensure prevDetails is always an array
      if (!Array.isArray(prevDetails)) {
        console.error('prevDetails is not an array:', prevDetails);
        return [newTest]; // Return a new array with the new test if the previous value is not an array
      }
      return [...prevDetails, newTest];
    });
  };

  const handleAddSubtest = (subtest) => {
    setTestDetails((prevDetails) =>
      prevDetails.map((test) =>
        test.id === currentTestId
          ? { ...test, subtests: [...(test.subtests || []), subtest] }
          : test
      )
    );
    closeSubtestModal();
  };

  const handleDeleteTest = async (testId) => {
    try {
      // Send request to API to delete the test
      await api.delete(`/api/stability/tests/${testId}`);

      // Immediately remove the test from the state after successful deletion
      setTestDetails((prevDetails) => prevDetails.filter(test => test.id !== testId));

      alert('Test deleted successfully!');
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test.');
    }
  };

  const openEditModal = (test) => {
    setEditTest(test);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditTest(null);
  };
  const openSubtestModal = (testId) => {
    setCurrentTestId(testId);
    setSubtestModalOpen(true);
  };

  const closeSubtestModal = () => {
    setCurrentTestId(null);
    setSubtestModalOpen(false);
  };
  const handleUpdateTest = async (updatedTest) => {
    try {
      await api.put(`/api/stability/tests/${updatedTest.id}`, updatedTest);
      setTestDetails((prevDetails) =>
        prevDetails.map(test => (test.id === updatedTest.id ? updatedTest : test))
      );
      closeEditModal();
    } catch (error) {
      console.error('Error updating test:', error);
    }
  };
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow ml-60 py-4 px-2">
        <div className="container mx-auto p-6 border border-gray-200 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Test Details</h1>

          {/* Product Details - Always Visible */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-md font-sans mb-4">From : Formulation Research Development / {product.vertical}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Product Name:</strong> {product.pname}</p>
              <p><strong>Protocol:</strong> {product.protocol}</p>
              <p><strong>Primary Packing:</strong> {product.ppacking}</p>
              <p><strong>Secondary Packing:</strong> {product.spacking}</p>
              <p><strong>Pack Size:</strong> {product.packsize}</p>
              <p><strong>Requested By:</strong> {product.reqby}</p>
              <p><strong>Sample By:</strong> {product.sampleby}</p>
              <p><strong>Sample Received By:</strong> {product.samplercby}</p>
              <p><strong>Label Content:</strong> {product.labelc}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 text-lg font-semibold px-4 py-2 rounded-md ${activeTab === tab.key
                  ? 'bg-teal-custom text-white' // Active tab styling
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100' // Inactive tab styling with hover effect
                  }`}
              >
                {tab.icon} {/* Icon */}
                <span>{tab.label}</span> {/* Label */}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {activeTab === 'Protocols' && (
             <ProtocolList
             protocols={protocols}
             selectedFile={selectedFile}
             isLoading={isLoading}
             handleFileClick={handleFileClick}
             closeModal={closeModal}
         />
            )}

            {activeTab === 'testDetails' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Test Details</h2>
                {Array.isArray(testDetails) && testDetails.length > 0 ? (
                  <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Sr. No.</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Test Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Claim</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Specification</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testDetails.map((test, testIndex) => (
                    <React.Fragment key={test.id}>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        {testIndex + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{test.test}</td>
                      <td className="border border-gray-300 px-4 py-2">{test.claim}</td>
                      <td className="border border-gray-300 px-4 py-2">{test.spes}</td>
                      <td className="border border-gray-300 px-4 py-2 flex">
                        <FaPlus
                          className="text-green-500 cursor-pointer"
                          onClick={() => openSubtestModal(test.id)}
                        />
                        <FaEdit
                          className="text-blue-500 cursor-pointer ml-2"
                          onClick={() => openEditModal(test)}
                        />
                        <FaTrash
                          className="text-red-500 cursor-pointer ml-2"
                          onClick={() => handleDeleteTest(test.id)}
                        />
                      </td>
                    </tr>
                  
                    {/* Render subtests only if it's an array */}
                    {Array.isArray(test.subtests) && test.subtests.length > 0 && test.subtests.map((subtest, subtestIndex) => (
                      <tr key={subtest.id || `${test.id}-${subtestIndex}`} className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 pl-8">
                          {testIndex + 1}.{subtestIndex + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{subtest.test}</td>
                        <td className="border border-gray-300 px-4 py-2">{subtest.claim}</td>
                        <td className="border border-gray-300 px-4 py-2">{subtest.spes}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                  

                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No test details available.</p>
                )}
                <AddTestForm onTestAdded={handleAddTest} />
                {isSubtestModalOpen && (
                  <AddSubtestModal
                    testId={currentTestId}
                    onClose={closeSubtestModal}
                    onSubtestAdded={handleAddSubtest}
                  />
                )}

              </div>
            )}

            {activeTab === 'batchDetails' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Batch Details</h2>
                {batchDetails.length > 0 ? (
                  <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-2">Sr. No.</th>
                        <th className="border border-gray-300 px-2 py-2">Batch Number</th>
                        <th className="border border-gray-300 px-2 py-2">Manufacturing Date</th>
                        <th className="border border-gray-300 px-2 py-2">Batch Size</th>
                        <th className="border border-gray-300 px-2 py-2">Charging Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchDetails.map((batch, index) => (
                        <tr key={batch.id} className="text-center">
                          <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                          <td className="border border-gray-300 px-2 py-2">{batch.batchno}</td>
                          <td className="border border-gray-300 px-2 py-2">
                            {new Date(batch.mfgdate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="border border-gray-300 px-2 py-2">{batch.batchsize}</td>
                          <td className="border border-gray-300 px-2 py-2">
                            {new Date(batch.chrdate).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No batch details available.</p>
                )}
              </div>
            )}

            {activeTab === 'storageConditions' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Storage Conditions</h2>
                {storageConditions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100 text-xs">
                        <tr>
                          <th className="border border-gray-300 px-2 py-2">Sr. No.</th>
                          <th className="border border-gray-300 px-2 py-2">Batch No</th>
                          <th className="border border-gray-300 px-2 py-2">Charging Date</th>
                          <th className="border border-gray-300 px-2 py-2">Storage Condition</th>
                          <th className="border border-gray-300 px-2 py-2">Sample Qty</th>
                          <th className="border border-gray-300 px-2 py-2">1 Month</th>
                          <th className="border border-gray-300 px-2 py-2">2 Months</th>
                          <th className="border border-gray-300 px-2 py-2">3 Months</th>
                          <th className="border border-gray-300 px-2 py-2">6 Months</th>
                          <th className="border border-gray-300 px-2 py-2">9 Months</th>
                          <th className="border border-gray-300 px-2 py-2">12 Months</th>
                          <th className="border border-gray-300 px-2 py-2">18 Months</th>
                          <th className="border border-gray-300 px-2 py-2">24 Months</th>
                          <th className="border border-gray-300 px-2 py-2">36 Months</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storageConditions.map((condition, index) => (
                          <tr key={condition.id} className="text-center text-xs">
                            <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.batchno}</td>
                            <td className="border border-gray-300 px-2 py-2">
                              {new Date(condition.mfgdate).toLocaleDateString('en-GB')}
                            </td>
                            <td className="border border-gray-300 px-2 py-2">{condition.scondition}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.sampleqty}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.onemonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.twomonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.threemonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.sixmonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.ninemonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.onetwomonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.oneeightmonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.twofourmonth || 'N.A.'}</td>
                            <td className="border border-gray-300 px-2 py-2">{condition.threesixmonth || 'N.A.'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No storage conditions available.</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
