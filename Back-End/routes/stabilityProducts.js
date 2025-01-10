const express = require('express');
const router = express.Router();
const stabilityProductsController = require('../controllers/stabilityController');

// GET all stability products
router.get('/', stabilityProductsController.getAllStabilityProducts);

// GET a single stability product by ID
router.get('/:id', stabilityProductsController.getStabilityProductById);

// POST a new stability product
router.post('/', stabilityProductsController.addStabilityProduct);

// PUT to update a stability product by ID
router.put('/:id', stabilityProductsController.updateStabilityProduct);

// DELETE a stability product by ID
router.delete('/:id', stabilityProductsController.deleteStabilityProduct);

module.exports = router;
