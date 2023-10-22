const express = require('express');
const {createPengembalian, getAllPengembalian} = require('../controller/pengembalian.controllers')
const router = express.Router();

router.post('/pengembalian', createPengembalian);
router.get('/listpengembalian', getAllPengembalian);
module.exports = router;