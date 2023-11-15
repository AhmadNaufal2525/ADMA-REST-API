const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  const username = req.user.username;
  res.json({ username });
});

module.exports = router;