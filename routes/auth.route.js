const express = require('express');
const { register, login, getAllUsers, logout, resetPassword } = require('../controller/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/signUp', register);
router.post('/signIn', login);
router.get('/users', authenticate, getAllUsers);
router.post('/signOut', logout);
router.post('/reset', resetPassword);

module.exports = router;