const express = require('express');
const { createPengembalian, getAllPengembalian, getPengembalianById, getPengembalianByUserId, acceptPengembalian, rejectPengembalian } = require('../controller/pengembalian.controller');

const router = express.Router();

router.post('/pengembalian', createPengembalian);
router.get('/listPengembalian', getAllPengembalian);
router.get('/listPengembali/:id', getPengembalianById);
router.get('/pengembali/:id', getPengembalianByUserId);
router.post('/acceptPengembalian/:id', acceptPengembalian);
router.post('/rejectPengembalian/:id', rejectPengembalian);

module.exports = router;