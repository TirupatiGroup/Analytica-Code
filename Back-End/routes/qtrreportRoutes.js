const express = require('express');
const router = express.Router();
const QtrreportController = require('../controllers/qtrReporting');

// Fetch reported dates for a specific user
router.get('/reports/user/:userId', QtrreportController.getReportedDatesForUser);

// Update the report details
router.put('/update-report', QtrreportController.updateReportDetails);

// Search products based on pname and prepix
router.get('/search-prefix-columns', QtrreportController.searchProductsByPrefix);

// Post quarterly report
router.post('/qtr-report', QtrreportController.postQuarterlyReport);

// Fetch quarterly reported dates for a specific user
router.get('/qtr_report/user/:username', QtrreportController.getQuarterlyReportedDatesForUser);

module.exports = router;
