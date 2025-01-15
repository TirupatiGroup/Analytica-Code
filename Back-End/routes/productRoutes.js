const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define routes
router.get('/all-products', productController.getAllProducts);
router.post('/Add-Product', productController.addProduct);
router.put('/Edit-Product/:id', productController.editProduct);
router.delete('/Delete-Product/:id', productController.deleteProduct);

module.exports = router;
