const { executeQuery } = require('../config/db');
const upload = require('../config/upload');
const fs = require('fs');
const path = require('path');
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
        // Check if the product exists
        const productExists = await executeQuery('SELECT * FROM stability_products WHERE id = ?', [id]);
        if (productExists.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Fetch and delete associated tests and subtests
        const tests = await executeQuery(
            'SELECT id FROM trftestforstability WHERE pid = ?',
            [id]
        );

        if (tests.length > 0) {
            for (const test of tests) {
                // Delete subtests
                await executeQuery(
                    'DELETE FROM trf_sub_testforstability WHERE testid = ?',
                    [test.id]
                );

                // Delete tests
                await executeQuery(
                    'DELETE FROM trftestforstability WHERE id = ?',
                    [test.id]
                );
            }
        }

        // Delete associated protocols
        await executeQuery(
            'DELETE FROM upload_protocols WHERE pid = ?',
            [id]
        );

        // Delete associated batch details
        await executeQuery(
            'DELETE FROM stability_batch_details WHERE pid = ?',
            [id]
        );

        // Delete associated storage conditions
        await executeQuery(
            'DELETE FROM stability_batch_condition_details WHERE pid = ?',
            [id]
        );

        // Delete the product
        await executeQuery('DELETE FROM stability_products WHERE id = ?', [id]);

        // Optionally reset AUTO_INCREMENT value
        await executeQuery(`ALTER TABLE stability_products AUTO_INCREMENT = ${id}`);

        res.json({ message: `Product with ID ${id} and all associated data deleted successfully!` });
    } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

{/* For Add More Product */}
// GET protocols by product ID
const getProtocolsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery(
            'SELECT * FROM upload_protocols WHERE pid = ?',
            [id]
        );

        if (results.length === 0) {
            return res.status(200).json({ message: `No protocols found for product ID ${id}` });
        }

        res.json(results);
    } catch (error) {
        console.error(`Error fetching protocols for product ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// POST protocols 
const addProtocolWithFile = async (req, res) => {
    try {
        const { pname, protocol, vertical, updateby, pid } = req.body;
        const file = req.file?.filename; // Extract uploaded file

        if (!pname || !protocol || !vertical || !file || !updateby || !pid) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await executeQuery(
            `INSERT INTO upload_protocols (pname, protocol, vertical, file, updateby, pid) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [pname, protocol, vertical, file, updateby, pid]
        );

        res.status(201).json({
            message: 'Protocol with file added successfully',
            protocolId: result.insertId
        });
    } catch (error) {
        console.error('Error adding protocol with file:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// DELETE protocols (Delete Protocol)
const deleteProtocol = async (req, res) => {
    const { id } = req.params; // Protocol ID from the request URL

    try {
        // Step 1: Fetch the protocol record to get the file name
        const protocol = await executeQuery(
            `SELECT file FROM upload_protocols WHERE id = ?`,
            [id]
        );

        if (!protocol || protocol.length === 0) {
            return res.status(404).json({ error: 'Protocol not found' });
        }

        const fileName = protocol[0].file;

        // Step 2: Delete the protocol record from the database
        await executeQuery(`DELETE FROM upload_protocols WHERE id = ?`, [id]);

        // Step 3: Delete the file from the uploads/protocols folder
        const filePath = path.join(__dirname, '../uploads/protocols', fileName); // Ensure path matches your multer configuration

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res
                    .status(500)
                    .json({ error: 'Protocol deleted, but failed to delete file' });
            }
        });

        // Step 4: Send a success response
        res.status(200).json({ message: 'Protocol and file deleted successfully' });
    } catch (error) {
        console.error('Error deleting protocol:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

{/* For Add More Product Test Details */}
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
            return res.status(200).json({ message: 'No tests found for the given product ID.' });
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
// POST test details by product ID
const addTest = async (req, res) => {
    const { pid, testDetails } = req.body;

    try {
        const {
            test,
            claim,
            spes,
            results,
            file,
            updateby,
            resultupdateon,
            reqby,
            unit,
            upby,
            updateon,
            inirupby,
            inirupdateon
        } = testDetails;

        const testResult = await executeQuery(
            `INSERT INTO trftestforstability 
             (pid, test, claim, spes, results, file, updateby, resultupdateon, reqby, unit, upby, updateon, inirupby, inirupdateon) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pid, test, claim, spes, results, file, updateby, 
                resultupdateon, reqby, unit, upby, updateon, 
                inirupby, inirupdateon
            ]
        );

        res.status(201).json({
            message: 'Test added successfully',
            testId: testResult.insertId
        });
    } catch (error) {
        console.error('Error adding test:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Post subtest
const addSubtests = async (req, res) => {
    const { pid, testId, subtests } = req.body;

    if (!pid || !testId || !subtests || subtests.length === 0) {
        return res.status(400).json({ error: "Missing required fields or no subtests provided" });
    }

    try {
        const placeholders = subtests
            .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)') // One set of ? for each subtest
            .join(', ');

        const subtestValues = subtests.flatMap(subtest => [
            pid,      // `trfid` (same as `pid`)
            testId,   // `testid` (foreign key to test table)
            subtest.test ,
            subtest.claim ,
            subtest.spes ,
            subtest.results,
            subtest.file ,
            subtest.updateby ,
            subtest.resultupdateon ,
            subtest.reqby ,
            subtest.unit ,
            subtest.samplestage ,
            subtest.upby,
            subtest.updateon
        ]);

        await executeQuery(
            `INSERT INTO trf_sub_testforstability 
             (trfid, testid, test, claim, spes, results, file, updateby, resultupdateon, reqby, unit, samplestage, upby, updateon) 
             VALUES ${placeholders}`,
            subtestValues
        );

        res.status(201).json({ message: "Subtests added successfully" });
    } catch (error) {
        console.error("Error adding subtests:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
//Delete Test with Subtests
const deleteTestWithSubtests = async (req, res) => {
    const { testId } = req.params;

    try {
        // Delete subtests first
        await executeQuery(
            `DELETE FROM trf_sub_testforstability WHERE testid = ?`,
            [testId]
        );

        // Delete the main test
        await executeQuery(
            `DELETE FROM trftestforstability WHERE id = ?`,
            [testId]
        );

        res.status(200).json({ message: 'Test and subtests deleted successfully' });
    } catch (error) {
        console.error('Error deleting test and subtests:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Update Test with Subtests
const updateTestWithSubtests = async (req, res) => {
    const { testId } = req.params;
    const { testDetails, subtests } = req.body;

    try {
        // Destructure test details from the request
        const {
            test,
            claim,
            spes,
            results,
            file,
            updateby,
            resultupdateon,
            reqby,
            unit,
            upby,
            updateon,
            inirupby,
            inirupdateon
        } = testDetails;

        // Update the main test
        await executeQuery(
            `UPDATE trftestforstability 
             SET test = ?, claim = ?, spes = ?, results = ?, file = ?, updateby = ?, resultupdateon = ?, reqby = ?, unit = ?, upby = ?, updateon = ?, inirupby = ?, inirupdateon = ?
             WHERE id = ?`,
            [
                test, claim, spes, results, file, updateby, resultupdateon, reqby, unit, upby, updateon, inirupby, inirupdateon, testId
            ]
        );

        // Delete existing subtests
        await executeQuery(
            `DELETE FROM trf_sub_testforstability WHERE testid = ?`,
            [testId]
        );

        // Insert new subtests
        if (subtests && subtests.length > 0) {
            const placeholders = subtests
                .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)') // One set of ? for each subtest
                .join(', ');

            const subtestValues = subtests.flatMap(subtest => [
                testDetails.pid, // `trfid` (same as `pid`)
                testId,          // `testid` (foreign key to test table)
                subtest.test,
                subtest.claim,
                subtest.spes,
                subtest.results,
                subtest.file,
                subtest.updateby,
                subtest.resultupdateon,
                subtest.reqby,
                subtest.unit,
                subtest.samplestage,
                subtest.upby,
                subtest.updateon
            ]);

            await executeQuery(
                `INSERT INTO trf_sub_testforstability 
                 (trfid, testid, test, claim, spes, results, file, updateby, resultupdateon, reqby, unit, samplestage, upby, updateon) 
                 VALUES ${placeholders}`,
                subtestValues
            );
        }

        res.status(200).json({ message: 'Test and subtests updated successfully' });
    } catch (error) {
        console.error('Error updating test and subtests:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


{/* For Add Product Batch Details */}
// GET batch details by product ID
const getBatchDetailsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery('SELECT * FROM stability_batch_details WHERE pid = ?', [id]);

        if (results.length === 0) {
            return res.status(200).json({ message: 'No batch details found for the given product ID.' });
        }

        res.json(results);
    } catch (error) {
        console.error(`Error fetching batch details for product ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// POST batch details by product ID
const addBatchDetails = async (req, res) => {
    const {
        pid,
        vertical,
        pname,
        protocol,
        ppacking,
        psize,
        spacking,
        batchno,
        mfgdate,
        batchsize,
        expdate,
        reqby,
        chrdate,
    } = req.body;

    // Validate required fields
    if (!pid || !batchno || !mfgdate || !batchsize || !reqby || !chrdate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO stability_batch_details 
            (pid, vertical, pname, protocol, ppacking, psize, spacking, batchno, mfgdate, batchsize, expdate, reqby, chrdate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            pid || null,
            vertical || null,
            pname || null,
            protocol || null,
            ppacking || null,
            psize || null,
            spacking || null,
            batchno,
            mfgdate,
            batchsize,
            expdate || null,
            reqby,
            chrdate,
        ];

        await executeQuery(query, values);
        res.status(201).json({ message: 'Batch details added successfully.' });
    } catch (error) {
        console.error('Error adding batch details:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateBatchDetailsById = async (req, res) => {
    const { id } = req.params; // The batch id from the URL
    const {
        pid,        // Product ID to ensure we are updating for the correct product
        vertical,
        pname,
        protocol,
        ppacking,
        psize,
        spacking,
        batchno,
        mfgdate,
        batchsize,
        expdate,
        reqby,
        chrdate,
    } = req.body;

    try {
        const query = `
            UPDATE stability_batch_details
            SET 
                pid = ?, 
                vertical = ?, 
                pname = ?, 
                protocol = ?, 
                ppacking = ?, 
                psize = ?, 
                spacking = ?, 
                batchno = ?, 
                mfgdate = ?, 
                batchsize = ?, 
                expdate = ?, 
                reqby = ?, 
                chrdate = ?
            WHERE id = ? AND pid = ?`; // Added pid check to ensure the correct batch is updated

        const values = [pid, vertical, pname, protocol, ppacking, psize, spacking, batchno, mfgdate, batchsize, expdate, reqby, chrdate, id, pid];

        const result = await executeQuery(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Batch details not found for the given product ID.' });
        }

        res.status(200).json({ message: 'Batch details updated successfully.' });
    } catch (error) {
        console.error('Error updating batch details:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const deleteBatchDetailsById = async (req, res) => {
    const { id } = req.params;  // Only using batch ID from URL

    try {
        const query = `DELETE FROM stability_batch_details WHERE id = ?`;  // Deleting by id only

        const result = await executeQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Batch details not found for the given ID.' });
        }

        res.status(200).json({ message: 'Batch details deleted successfully.' });
    } catch (error) {
        console.error('Error deleting batch details:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// GET storage conditions by product ID
const getStorageConditionsByProductId = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery('SELECT * FROM stability_batch_condition_details WHERE pid = ?', [id]);

        if (results.length === 0) {
            return res.status(200).json({ message: 'No storage conditions found for the given product ID.' });
        }

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
    updateTestWithSubtests,
    deleteTestWithSubtests,
    updateStabilityProduct,
    deleteStabilityProduct,
    getProtocolsByProductId,
    addProtocolWithFile,
    deleteProtocol,
    getTestDetailsByProductId,
    addTest,
    addSubtests,
    getBatchDetailsByProductId,
    addBatchDetails,
    updateBatchDetailsById,
    deleteBatchDetailsById,
    getStorageConditionsByProductId
};
