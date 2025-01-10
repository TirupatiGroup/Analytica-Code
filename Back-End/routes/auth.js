const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { register, login } = require('../controllers/authController');

// Register route
router.post('/register', upload.single('profile_pic'), register);

// Login route
router.post('/login', login);

module.exports = router;
