const express = require('express');
const router = express.Router();
const { registerUser, getUsersByRole } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Route to register a user profile with role into Firestore after signing up
router.post('/register', authenticateUser, registerUser);

// Route to get a list of users by a certain role (e.g. 'fic' or 'ksac_core')
router.get('/role/:role', authenticateUser, getUsersByRole);

module.exports = router;
