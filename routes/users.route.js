const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  const id = req.user.id;
  const username = req.user.username;
  const role = req.user.role;
  res.json({ username , role, id});
});

module.exports = router;