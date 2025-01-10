import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../../components/HSidebar';
import { FaSearch, FaHandHoldingHeart, FaBasketballBall, FaLeaf, FaPills,FaTrashAlt,FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

// Modal setup
Modal.setAppElement('#root');

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQueries, setSearchQueries] = useState({});
  const [activeTable, setActiveTable] = useState('N'); // Initially show Nutra table (prefix N)
  const [prefixCounts, setPrefixCounts] = useState({}); // State to store prefix counts (hours and days)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null); // Store selected product for editing
  const searchInputRef = useRef(null);

  // Fetch product data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/all-products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data); // Assuming the data includes pname and prepix
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch prefix counts from the /count-prefixes API
  useEffect(() => {
    const fetchPrefixCounts = async () => {
      try {
        const response = await fetch('http://localhost:3000/count-prefixes');
        if (!response.ok) {
          throw new Error('Failed to fetch prefix counts');
        }
        const data = await response.json();

        // Convert the list of prefixes into a dictionary for easier access
        const prefixCountMap = data.reduce((acc, { prefix, hours_worked, days_worked }) => {
          acc[prefix] = { hours: hours_worked, days: days_worked };
          return acc;
        }, {});

        setPrefixCounts(prefixCountMap);
      } catch (err) {
        console.error('Error fetching prefix counts:', err);
      }
    };

    fetchPrefixCounts();
  }, []);

  // Filter products based on the prefix and search query, and sort by prepix with number suffix in descending order
  const filterProductsByPrefixAndSearch = (prefixCode) => {
    const searchQuery = (searchQueries[prefixCode]?.toLowerCase() || '').trim();
  
    return products
      .filter((product) => {
        const productName = product.pname?.toLowerCase() || '';
        const productId = product.id?.toString() || '';
        const prefixColumn = product.prepix || '';
  
        // Check if the product matches the prefix
        const matchesPrefix = prefixColumn.startsWith(prefixCode);
  
        // Check if the product name or id matches the search query
        const matchesSearchQuery =
          productName.includes(searchQuery) || productId.includes(searchQuery);
  
        // Return products that match both the prefix and the search query
        return matchesPrefix && matchesSearchQuery;
      })
      .sort((a, b) => {
        // Extract numeric suffix from prepix (e.g., N1 -> 1, P10 -> 10)
        const getNumericSuffix = (prefix) => {
          const match = prefix.match(/[A-Za-z]+(\d+)/); // Match numeric part after alphabetic prefix
          return match ? parseInt(match[1], 10) : 0;  // Default to 0 if no numeric part found
        };
  
        const numA = getNumericSuffix(a.prepix);
        const numB = getNumericSuffix(b.prepix);
  
        // Sort in descending order by the numeric suffix
        return numB - numA;
      });
  };
  
  // Prefix mapping for categories
  const prefixMapping = {
    N: { name: 'Nutra', color: 'bg-orange-500', icon: <FaHandHoldingHeart className="text-white" /> },
    S: { name: 'Sports', color: 'bg-yellow-500', icon: <FaBasketballBall className="text-white" /> },
    P: { name: 'Pharma', color: 'bg-blue-500', icon: <FaLeaf className="text-white" /> },
    A: { name: 'Ayurveda', color: 'bg-green-500', icon: <FaPills className="text-white" /> },
  };

  // Set active table when a button is clicked
  const handleTableButtonClick = (prefixCode) => {
    setActiveTable(prefixCode);
  };

  // Update search query for specific vertical
  const handleSearchChange = (e) => {
    setSearchQueries((prev) => ({
      ...prev,
      [activeTable]: e.target.value,
    }));
  };

  // Delete product from the list
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this product?");
      if (confirmDelete) {
        await axios.delete(`http://localhost:3000/Delete-Product/${id}`);

        // Immediately remove the deleted product from the UI
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));

        toast.success('Product deleted successfully!', { position: 'top-right' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product. Please try again.');
    }
  };

  // Open the edit modal
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle modal input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit (save changes) in the modal
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/Edit-Product/${selectedProduct.id}`, {
        pname: selectedProduct.pname,
        prepix: selectedProduct.prepix,
      });

      toast.success('Product updated successfully!', { position: 'top-right' });
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === selectedProduct.id ? { ...product, ...selectedProduct } : product
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product. Please try again.');
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-grow ml-60 py-4 px-2 h-screen">
        {/* Header with "All Products" on the left and search bar on the right */}
        <div className="flex justify-between items-center mb-6">
          {/* Buttons to toggle tables */}
          <div className="flex flex-row space-x-4">
            {Object.keys(prefixMapping).map((prefixCode) => (
              <div className="flex items-center" key={prefixCode}>
                <button
                  onClick={() => handleTableButtonClick(prefixCode)}
                  className={`px-3 py-2 text-white rounded-lg flex items-center ${prefixMapping[prefixCode].color} hover:bg-opacity-65 ${activeTable === prefixCode ? 'border-2 border-white bg-opacity-65' : ''}`}
                >
                  <span className="mr-2">{prefixMapping[prefixCode].icon}</span>
                  <span>{prefixMapping[prefixCode].name}</span>
                </button>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 text-center flex-grow">All Products</h2>

          {/* Search Bar */}
          <div className="flex justify-end">
            <div className="relative w-64">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQueries[activeTable] || ''}
                onChange={handleSearchChange}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full"
                placeholder="Search Products"
              />
              <div className="absolute top-0 right-0 p-2">
                <FaSearch className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Display products table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg" style={{ maxHeight: '500px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${prefixMapping[activeTable]?.color} text-white sticky top-0 `}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Prefix</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-red-600">{error}</td>
                </tr>
              ) : (
                filterProductsByPrefixAndSearch(activeTable).map((product, index) => {
                  const prefixData = prefixCounts[product.prepix]; // Retrieve prefix data based on the product's prefix

                  return (
                    <tr key={product.id}>
                      {/* Fixed width for the first column */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border">{index + 1}</td>

                      {/* Fixed width for product name column */}
                      <td className="px-6 py-4 text-sm text-gray-500 w-64 border">{product.pname}</td>

                      {/* Fixed width for prefix column */}
                      <td className="px-6 py-4 text-sm text-gray-500 w-64 border">{product.prepix}</td>
                      <td className="p-2 border">
                        <div className="flex flex-col space-y-1 text-gray-500 text-xs ">
                          <div className="flex justify-between border p-1 rounded-md">
                            <span>Hours:</span>
                            <span>{prefixData ? `${prefixData.hours} H` : '00'}</span> {/* Display hours or N/A if not found */}
                          </div>
                          <div className="flex justify-between border p-1 rounded-md">
                            <span>Days:</span>
                            <span>{prefixData ? `${prefixData.days} D` : '00'}</span> {/* Display days or N/A if not found */}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-white space-x-2 ">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="bg-blue-500 hover:bg-blue-700 px-3 py-1.5 rounded-md"
                        >
                          <FaEdit className="inline-block mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-500 hover:bg-red-700 px-3 py-1.5  rounded-md"
                        >
                           <FaTrashAlt className="inline-block mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>



        {/* Modal for Editing Product */}
        <Modal isOpen={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)} className="bg-white p-6 w-1/3 mx-auto rounded-lg shadow-lg mt-36">
          <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
          {selectedProduct && (
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="pname" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  id="pname"
                  name="pname"
                  value={selectedProduct.pname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="prepix" className="block text-sm font-medium text-gray-700">Prefix</label>
                <input
                  type="text"
                  id="prepix"
                  name="prepix"
                  value={selectedProduct.prepix}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">Save Changes</button>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AllProducts;
