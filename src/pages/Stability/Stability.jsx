
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { FaHospital, FaSpa, FaDumbbell, FaLeaf, FaFilter } from 'react-icons/fa';

const Stability = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All'); // Track active filter

    // Fetch all products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/stability_products');
                const sortedProducts = response.data.sort((a, b) => b.id - a.id); // Sort in descending order
                setProducts(sortedProducts);
                setFilteredProducts(sortedProducts); // Initially show all products
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Open the add product modal
    const openAddModal = () => setAddModalOpen(true);

    // Close the add product modal
    const closeAddModal = () => setAddModalOpen(false);

    // Open the edit product modal with data
    const openEditModal = (product) => {
        setEditProduct(product);
        setEditModalOpen(true);
    };

    // Close the edit product modal
    const closeEditModal = () => setEditModalOpen(false);

    // Handle adding a new product
    const handleAddProduct = async (data) => {
        try {
            const response = await axios.post('http://localhost:3000/api/stability_products', data);
            const updatedProducts = [...products, response.data];
            setProducts(updatedProducts); // Update the full product list
            setFilteredProducts(updatedProducts); // Update the filtered product list
            closeAddModal();
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    // Handle editing a product
    const handleEditProduct = async (data) => {
        try {
            await axios.put(`http://localhost:3000/api/stability_products/${data.id}`, data);
            const updatedProducts = products.map((product) =>
                product.id === data.id ? data : product
            );
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
            closeEditModal();
        } catch (error) {
            console.error('Error editing product:', error);
        }
    };

    // Handle deleting a product
    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/stability_products/${id}`);
            const updatedProducts = products.filter((product) => product.id !== id);
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    // Handle filtering products by vertical
    const filterProducts = (vertical) => {
        setActiveFilter(vertical);
        if (vertical === 'All') {
            setFilteredProducts(products); // Show all products
        } else {
            setFilteredProducts(products.filter((product) => product.vertical === vertical));
        }
    };

    return (
        <div className="p-8">
             {/* Filter Buttons */}
             <div className="flex justify-between items-center mb-4">
                {/* Filter Buttons Group */}
                <div className="flex gap-4">
                    {[
                        { label: 'All', icon: <FaFilter /> },
                        { label: 'Pharma', icon: <FaHospital /> },
                        { label: 'Nutra', icon: <FaSpa /> },
                        { label: 'Sport', icon: <FaDumbbell /> },
                        { label: 'Ayurveda', icon: <FaLeaf /> },
                    ].map(({ label, icon }) => (
                        <button
                            key={label}
                            onClick={() => filterProducts(label)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                                activeFilter === label
                                    ? 'bg-teal-custom text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </div>

                {/* Add Product Button */}
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-teal-custom text-white px-4 py-2 rounded-md"
                >
                    <FaFilter /> {/* Add Icon */}
                    Add Product
                </button>
            </div>
            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onSubmit={handleAddProduct}
            />

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                onSubmit={handleEditProduct}
                product={editProduct}
            />

            {/* Product Table */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto mt-8">
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-teal-custom text-white">
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Date</th>
                                <th className="border px-4 py-2">Product Name</th>
                                <th className="border px-4 py-2">Protocol</th>
                                <th className="border px-4 py-2">Vertical</th>
                                <th className="border px-4 py-2">Packing</th>
                                <th className="border px-4 py-2">File</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-2">
                                        No products available
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="border px-4 py-2">{product.id}</td>
                                        <td className="border px-4 py-2">{product.reqdate}</td>
                                        <td className="border px-4 py-2">{product.pname}</td>
                                        <td className="border px-4 py-2">{product.protocol}</td>
                                        <td className="border px-4 py-2">{product.vertical}</td>
                                        <td className="border px-4 py-2">{product.ppacking}</td>
                                        <td className="border px-4 py-2">#</td>
                                        <td className="border px-4 py-2 flex gap-1">
                                            <button
                                                className="bg-teal-custom text-white px-4 py-2 rounded-md"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-md"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Stability;
