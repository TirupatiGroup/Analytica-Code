

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API requests
import { toast, ToastContainer } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';  

const AddProduct = () => {
  const [products, setProducts] = useState([]); // State to hold product list
  const [productName, setProductName] = useState(''); // State to hold product name
  const [vertical, setVertical] = useState(''); // State to hold selected vertical

  // Function to get prefix based on vertical selection
  const getPrefix = (vertical) => {
    switch (vertical) {
      case 'Nutra':
        return 'N';
      case 'Sports':
        return 'S';
      case 'Pharma':
        return 'P';
      case 'Ayurveda':
        return 'A';
      default:
        return '';
    }
  };

  // Fetch the last 5 products from the API, sorted by most recent first
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/all-products');
      
      // Sort the products by id (assuming "id" is the field that increments with new products)
      const sortedProducts = response.data.sort((a, b) => b.id - a.id); // Sorting in descending order
      
      const lastFiveProducts = sortedProducts.slice(0, 5); // Get only the last 5 products
      setProducts(lastFiveProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products. Please try again.');
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle adding a new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const prefix = getPrefix(vertical);

    if (prefix && productName) {
      try {
        // Call the API to add a product
        const response = await axios.post('http://localhost:3000/Add-Product', {
          prepix: prefix,        // Updated to match backend key
          pname: productName,    // Updated to match backend key
        });

        // Show success toast and refresh the list with the newly added product
        if (response.status === 201) {
          toast.success('Product added successfully!', { position: 'top-right' });

          // Refresh the product list including the newly added one
          fetchProducts();
          
          // Reset the form
          setProductName('');
          setVertical('');
        }
      } catch (error) {
        console.error('Error adding product:', error);
        toast.error('Error adding product. Please try again.');
      }
    } else {
      toast.error('Please select a vertical and enter a product name.');
    }
  };

  // Handle deleting a product
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this product?");
      if (confirmDelete) {
        await axios.delete(`http://localhost:3000/Delete-Product/${id}`);
        toast.success('Product deleted successfully!', { position: 'top-right' });
        fetchProducts(); // Refresh the product list after deletion
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row space-x-4 max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Form Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg">
        <h2 className="text-3xl font-semibold text-white mb-6">Add Products for Reporting</h2>
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="space-y-2">
            <label className="text-white font-semibold">Choose Vertical</label>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Vertical</option>
              <option value="Nutra">Nutra</option>
              <option value="Sports">Sports</option>
              <option value="Ayurveda">Ayurveda</option>
              <option value="Pharma">Pharma</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-white font-semibold">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none"
              placeholder="Enter product name"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="w-full md:w-1/2 p-6 bg-white shadow-md rounded-lg mt-6 md:mt-0">
        <h3 className="text-2xl font-semibold mb-4">Last Added Products</h3>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left font-medium">Prefix</th>
              <th className="px-4 py-2 text-left font-medium">Product Name</th>
              <th className="px-4 py-2 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="px-4 py-2">{product.prepix}</td>  {/* Updated to match backend field */}
                  <td className="px-4 py-2">{product.pname}</td>   {/* Updated to match backend field */}
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center px-4 py-2 text-gray-500">
                  No products added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AddProduct;
