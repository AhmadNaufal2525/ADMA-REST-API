const express = require('express');
const { createPengembalian } = require('../controller/pengembalian.controller');

const router = express.Router();

router.post('/pengembalian', createPengembalian);

module.exports = router;