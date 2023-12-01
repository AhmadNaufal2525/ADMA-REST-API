const express = require('express');
const { createPengembalian, getAllPengembalian, getPengembalianById, getPengembalianByUserId, acceptPengembalian, rejectPengembalian, getPengembalianHistory, getPengembalianHistoryById } = require('../controller/pengembalian.controller');

const router = express.Router();

router.post('/pengembalian', createPengembalian);
router.get('/listPengembali', getAllPengembalian);
router.get('/listPengembali/:id', getPengembalianById);
router.get('/pengembali/:id', getPengembalianByUserId);
router.post('/acceptPengembalian/:id', acceptPengembalian);
router.post('/rejectPengembalian/:id', rejectPengembalian);
router.get('/pengembalianHistory', getPengembalianHistory);
router.get('/pengembalianHistory/:id', getPengembalianHistoryById);

module.exports = router;