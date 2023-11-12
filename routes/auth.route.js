const express = require('express');
const { register, login, getAllUsers, logout } = require('../controller/auth.controller');

const router = express.Router();

router.post('/signUp', register);
router.post('/signIn', login);
router.get('/users', getAllUsers);
router.get('/signOut', logout);

module.exports = router;