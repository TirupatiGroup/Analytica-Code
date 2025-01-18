const { executeQuery } = require('../config/db');

// GET all stability products
const getAllStabilityProducts = async (req, res) => {
    try {
        const results = await executeQuery(
            'SELECT * FROM stability_products ORDER BY id DESC'
        );
        res.json(results);
    } catch (error) {
        console.error('Error fetching all stability products:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getStabilityProductById = async (req, res) => {
    const { id } = req.params;

    try {
        // console.log('Fetching product with ID:', id); // Debug log

        const query = 'SELECT * FROM stability_products WHERE id = ?;';
        const results = await executeQuery(query, [id]);



        if (results.length === 0) {
            console.warn(`No product found for ID: ${id}`); // Debug log
            return res.status(404).json({ message: 'Stability product not found' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ADD a new stability product
const addStabilityProduct = async (req, res) => {
    const {
        pname, ppacking, protocol, spacking, packsize,
        reqby, reqdate, vertical, sampleby, samplercby, labelc
    } = req.body;

    try {
        const query = `
            INSERT INTO stability_products 
            (pname, ppacking, protocol, spacking, packsize, reqby, reqdate, vertical, sampleby, samplercby, labelc) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [pname, ppacking, protocol, spacking, packsize, reqby, reqdate, vertical, sampleby, samplercby, labelc];
        const result = await executeQuery(query, values);

        res.json({ message: 'Product added successfully!', id: result.insertId });
    } catch (error) {
        console.error('Error adding stability product:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// UPDATE a stability product by ID
const updateStabilityProduct = async (req, res) => {
    const { id } = req.params;
    const {
        pname, ppacking, protocol, spacking, packsize,
        reqby, reqdate, vertical, sampleby, samplercby, labelc
    } = req.body;

    try {
        const existingProduct = await executeQuery('SELECT * FROM stability_products WHERE id = ?', [id]);
        if (existingProduct.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const query = `
            UPDATE stability_products 
            SET pname = ?, ppacking = ?, protocol = ?, spacking = ?, packsize = ?, reqby = ?, reqdate = ?, vertical = ?, sampleby = ?, samplercby = ?, labelc = ?
            WHERE id = ?
        `;
        const values = [pname, ppacking, protocol, spacking, packsize, reqby, reqdate, vertical, sampleby, samplercby, labelc, id];
        await executeQuery(query, values);

        res.json({ message: 'Product updated successfully!' });
    } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE a stability product by ID
const deleteStabilityProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const productExists = await executeQuery('SELECT * FROM stability_products WHERE id = ?', [id]);
        if (productExists.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await executeQuery('DELETE FROM stability_products WHERE id = ?', [id]);
        await executeQuery('ALTER TABLE stability_products AUTO_INCREMENT = (SELECT MAX(id) + 1 FROM stability_products)');

        res.json({ message: `Product with ID ${id} deleted successfully!` });
    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET protocols by product ID
const getProtocolsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery(
            'SELECT * FROM upload_protocols WHERE pid = ?',
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ error: `No protocols found for product ID ${id}` });
        }

        res.json(results);
    } catch (error) {
        console.error(`Error fetching protocols for product ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET test details by product ID, including subtests
const getTestDetailsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch tests by pid
        const tests = await executeQuery(
            `SELECT * 
             FROM trftestforstability 
             WHERE pid = ?`,
            [id]
        );

        if (tests.length === 0) {
            return res.status(404).json({ message: 'No tests found for the given product ID.' });
        }

        // Fetch subtests where trfid matches pid
        const subtests = await executeQuery(
            `SELECT * 
             FROM trf_sub_testforstability 
             WHERE trfid = ?`,
            [id]
        );

        // Group subtests by their corresponding test
        const subtestsByTestId = subtests.reduce((acc, subtest) => {
            if (!acc[subtest.testid]) {
                acc[subtest.testid] = [];
            }
            acc[subtest.testid].push(subtest);
            return acc;
        }, {});

        // Map tests to include their corresponding subtests
        const testsWithSubtests = tests.map(test => ({
            ...test,
            subtests: subtestsByTestId[test.id] || [], // Add subtests array, or empty array if none exist
        }));

        res.json(testsWithSubtests);
    } catch (error) {
        console.error(`Error fetching test details for product ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET batch details by product ID
const getBatchDetailsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery('SELECT * FROM stability_batch_details WHERE pid = ?', [id]);
        res.json(results);
    } catch (error) {
        console.error(`Error fetching batch details for product ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET storage conditions by product ID
const getStorageConditionsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery('SELECT * FROM stability_batch_condition_details WHERE pid = ?', [id]);
        res.json(results);
    } catch (error) {
        console.error(`Error fetching storage conditions for product ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllStabilityProducts,
    getStabilityProductById,
    addStabilityProduct,
    updateStabilityProduct,
    deleteStabilityProduct,
    getProtocolsByProductId,
    getTestDetailsByProductId,
    getBatchDetailsByProductId,
    getStorageConditionsByProductId
};
