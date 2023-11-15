const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  const username = req.user.username;
  const role = req.user.role;
  res.json({ username , role});
});

module.exports = router;