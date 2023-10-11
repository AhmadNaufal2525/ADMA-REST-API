const express = require('express');
const {signIn, addAdmin, logout, protectedRoute, checkAdminRole} = require('../controller/admin.controllers');
const router = express.Router();

router.get("/admin/", checkAdminRole, protectedRoute);
router.post("/admin/signin", signIn);
router.post("/admin/add", checkAdminRole, addAdmin);
router.post("/admin/logout", logout);

module.exports = router;