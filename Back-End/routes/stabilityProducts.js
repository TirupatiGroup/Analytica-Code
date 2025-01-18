const express = require('express');
const router = express.Router();
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

// GET test details by product ID
router.get('/test-details/:id', stabilityController.getTestDetailsByProductId);

// GET batch details by product ID
router.get('/batch-details/:id', stabilityController.getBatchDetailsByProductId);

// GET storage conditions by product ID
router.get('/storage-conditions/:id', stabilityController.getStorageConditionsByProductId);

module.exports = router;