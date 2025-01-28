const express = require('express');
const router = express.Router();
const reportController = require('../controllers/dailyReporting');

// Route for fetching users for the dropdown
router.get('/api/pass-users', reportController.getUsersForDropdown);

// Route for posting daily reporting data (Create or Update)
router.post('/reports', reportController.createOrUpdateReport);

// Route for fetching daily reports by date
router.get('/reports/:date', reportController.getReportsByDate);

// Route for updating a daily report by ID
router.put('/reports/:id', reportController.updateReport);

// Route for deleting a daily report by ID
router.delete('/reports/:id', reportController.deleteReport);

module.exports = router;
