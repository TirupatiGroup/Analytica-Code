const express = require('express');
const router = express.Router();
const prefixController = require('../controllers/prefixController'); // Import the controller

// Define the route for counting prefixes
router.get('/count-prefixes', prefixController.countPrefixes);

module.exports = router;
