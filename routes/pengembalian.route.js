const express = require('express');
const { addPengembalian } = require('../controller/pengembalian.controller');

const router = express.Router();

router.post('/pengembalian', addPengembalian);

module.exports = router;