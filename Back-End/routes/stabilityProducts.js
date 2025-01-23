const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const stabilityController = require('../controllers/stabilityController');

// GET all stability products
router.get('/', stabilityController.getAllStabilityProducts);

// GET a single stability product by ID
router.get('/:id', stabilityController.getStabilityProductById);

// POST a new stability product
router.post('/', stabilityController.addStabilityProduct);

// PUT to update a stability product by ID
router.put('/:id', stabilityController.updateStabilityProduct);

// DELETE a stability product by ID
router.delete('/:id', stabilityController.deleteStabilityProduct);

// GET products by product ID
router.get('/products/:id', stabilityController.getStabilityProductById);

// GET protocols by product IDs
router.get('/protocols/:id', stabilityController.getProtocolsByProductId);
router.post('/protocols', upload.single('file'), stabilityController.addProtocolWithFile); // POST a protocol with file upload
// PUT: Update an existing protocol
router.put('/protocols/:id', stabilityController.updateProtocol);

// DELETE: Delete a protocol by ID
router.delete('/protocols/:id', stabilityController.deleteProtocol);

// GET test details by product ID
router.get('/test-details/:id', stabilityController.getTestDetailsByProductId);

// Route to add a new test with subtests
router.post('/tests', stabilityController.addTest);
router.post('/subtest', stabilityController.addSubtests);

// Route to delete a test with subtests
router.delete('/tests/:testId', stabilityController.deleteTestWithSubtests);

// Route to update a test with subtests
router.put('/tests/:testId', stabilityController.updateTestWithSubtests);




















// GET batch details by product ID
router.get('/batch-details/:id', stabilityController.getBatchDetailsByProductId);

// GET storage conditions by product ID
router.get('/storage-conditions/:id', stabilityController.getStorageConditionsByProductId);

module.exports = router;