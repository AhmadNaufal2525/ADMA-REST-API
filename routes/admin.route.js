const express = require('express');
const {signIn, addAdmin, logout, protectedRoute, getAdminById} = require('../controller/admin.controllers');
const router = express.Router();

router.get("/", protectedRoute);
router.post("/signIn", signIn);
router.post("/add", addAdmin);
router.post("/logout", logout);
router.get("/admin/:id", getAdminById)

module.exports = router;