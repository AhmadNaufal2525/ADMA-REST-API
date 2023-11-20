const express = require('express');
const { register, login, getAllUsers, logout, resetPassword } = require('../controller/auth.controller');

const router = express.Router();

router.post('/signUp', register);
router.post('/signIn', login);
router.get('/users', getAllUsers);
router.post('/signOut', logout);
router.post('/reset', resetPassword);

module.exports = router;