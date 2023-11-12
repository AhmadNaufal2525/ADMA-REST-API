const express = require('express');
const { register, login, getAllUsers } = require('../controller/auth.controller');

const router = express.Router();

router.post('/signUp', register);
router.post('/signIn', login);
router.get('/users', getAllUsers);

module.exports = router;