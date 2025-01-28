const express = require('express');
const router = express.Router();
const reportTracker = require('../controllers/reportTracker');

// Route for fetching users by department
router.get('/reportusers', reportTracker.getUsersByDepartment);

// Route for fetching reports by department
router.get('/department/reports', reportTracker.getReportsForDepartment);

// Route for fetching users by department 'frd'
router.get('/reportusersfrd', reportTracker.getUsersByDepartmentFRD);

// Route for fetching reports for 'frd' department
router.get('/frddepartment/reports', reportTracker.getReportsForFRD);

module.exports = router;
