const express = require('express');
const { createPengembalian, getAllPengembalian, getPengembalianById, getPengembalianByUserId } = require('../controller/pengembalian.controller');

const router = express.Router();

router.post('/pengembalian', createPengembalian);
router.get('/listPengembalian', getAllPengembalian);
router.get('/listPengembali/:id', getPengembalianById);
router.get('/pengembali/:id', getPengembalianByUserId);

module.exports = router;