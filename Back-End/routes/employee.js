const express = require('express');
const router = express.Router();
const {
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

// Get all employees
router.get('/', getEmployees);

// Get single employee by ID
router.get('/:id', getEmployeeById);

// Edit employee details
router.put('/:id', updateEmployee);

// Delete employee
router.delete('/:id', deleteEmployee);

module.exports = router;
