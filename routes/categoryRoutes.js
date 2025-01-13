const express = require('express');
const router = express.Router();
const { getCategoryDataByMonth, getCategoryDataByRange } = require('../controllers/categoryController');

router.get('/category-data-month', getCategoryDataByMonth);
router.get('/category-data', getCategoryDataByRange);

module.exports = router;
