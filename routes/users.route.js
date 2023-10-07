const express = require('express');
const {signIn, signUp, logout, getAllUsers, getUserByUsername, protectedRoute} = require('../controller/users.controllers');
const router = express.Router();

router.post('/signIn', signIn);
router.post('/signUp', signUp);
router.post('/logout', logout);
router.get('/users', getAllUsers);
router.get('/users/:username', getUserByUsername);
router.post('/', protectedRoute);

module.exports = router;