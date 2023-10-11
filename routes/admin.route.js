const express = require('express');
const {signIn, addAdmin, logout, protectedRoute} = require('../controller/admin.controllers');
const router = express.Router();

router.get("/admin/", protectedRoute);
router.post("/admin/signIn", signIn);
router.post("/admin/add", addAdmin);
router.post("/admin/logout", logout);

module.exports = router;