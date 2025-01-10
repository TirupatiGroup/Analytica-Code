const { executeQuery } = require('../config/db');

// GET all stability products
const getAllStabilityProducts = async (req, res) => {
    try {
        const results = await executeQuery(
            'SELECT * FROM stability_products ORDER BY id DESC' // Sort by id in descending order
        );
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// GET a single stability product by ID
const getStabilityProductById = async (req, res) => {
    const { id } = req.params;
    // console.log('Received ID:', id); // Log the ID to verify it's being passed correctly

    try {
        // Correct query with parameter placeholders
        const query = 'SELECT * FROM stability_products WHERE id = ?';
        console.log('Executing query:', query, 'with ID:', id);

        // Execute the query with the parameterized value
        const results = await executeQuery(query, [id]);

        res.json(results[0] || {}); // Return the result or an empty object if no result is found
    } catch (error) {
        console.error('SQL Error:', error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};
const addStabilityProduct = async (req, res) => {
    const data = req.body;

    // Check if all required fields are in data
    // console.log('Data received for product:', data);

    // Query with explicit column names
    const query = `
        INSERT INTO stability_products 
        (pname, ppacking, protocol, spacking, packsize, reqby, reqdate, vertical, sampleby, samplercby, labelc) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Array of values to be inserted
    const values = [
        data.pname,
        data.ppacking,
        data.protocol,
        data.spacking,
        data.packsize,
        data.reqby,
        data.reqdate,
        data.vertical,
        data.sampleby,
        data.samplercby,
        data.labelc
    ];

    // console.log('Values to be inserted:', values);

    try {
        // Execute the query with the parameterized values
        const result = await executeQuery(query, values);
        res.json({ message: 'Product added successfully!', id: result.insertId });
    } catch (error) {
        console.error('SQL Error:', error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};
// PUT to update a stability product by ID
const updateStabilityProduct = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        // Check if the product exists first
        const existingProduct = await executeQuery('SELECT * FROM stability_products WHERE id = ?', [id]);
        if (!existingProduct.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Construct the query manually to avoid issues with SET ?
        const query = `
            UPDATE stability_products 
            SET pname = ?, ppacking = ?, protocol = ?, spacking = ?, packsize = ?, reqby = ?, reqdate = ?, vertical = ?, sampleby = ?, samplercby = ?, labelc = ?
            WHERE id = ?`;

        // Prepare the values to be updated
        const values = [
            data.pname, data.ppacking, data.protocol, data.spacking, data.packsize, data.reqby, data.reqdate,
            data.vertical, data.sampleby, data.samplercby, data.labelc, id
        ];

        // console.log('Executing query:', query, 'with values:', values);

        // Execute the query with the provided values
        await executeQuery(query, values);

        res.json({ message: 'Product updated successfully!' });
    } catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({ error: error.message });
    }
};



// DELETE a stability product by ID
const deleteStabilityProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM stability_products WHERE id = ?', [id]);
        res.json({ message: 'Product deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllStabilityProducts,
    getStabilityProductById,
    addStabilityProduct,
    updateStabilityProduct,
    deleteStabilityProduct
};
