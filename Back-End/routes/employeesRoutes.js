const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeeController');

// Define routes
router.get('/', employeesController.getAllEmployees);
router.get('/:id', employeesController.getEmployeeById);
router.put('/:id', employeesController.updateEmployee);
router.delete('/:id', employeesController.deleteEmployee);

module.exports = router;
