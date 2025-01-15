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

    try {
        // Query to fetch data from stability_products and related tables
        const query = `
            SELECT 
                sp.*,
                ltsr.*,
                sbd.*,
                sbcd.*,
                sltr.*,
                ssp.*
            FROM 
                stability_products sp
            LEFT JOIN stability_lt_sub_results ltsr ON sp.id = ltsr.pid
            LEFT JOIN stability_batch_details sbd ON sp.id = sbd.pid
            LEFT JOIN stability_batch_condition_details sbcd ON sp.id = sbcd.pid
            LEFT JOIN stability_lt_results sltr ON sp.id = sltr.pid
            LEFT JOIN stability_summary_products ssp ON sp.id = ssp.pid
            WHERE sp.id = ?;
        `;

        console.log('Executing query:', query, 'with ID:', id);

        // Execute the query with the parameterized value
        const results = await executeQuery(query, [id]);

        res.json(results.length > 0 ? results : []); // Return results or an empty array if no match
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
        // Delete the product from the table
        await executeQuery('DELETE FROM stability_products WHERE id = ?', [id]);

        // Construct the ALTER TABLE query dynamically
        const query = `ALTER TABLE stability_products AUTO_INCREMENT = ${id}`;
        await executeQuery(query);

        res.json({ message: `Product with ID ${id} deleted and AUTO_INCREMENT reset to ${id} successfully!` });
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
