const express = require('express');
const { createPengembalian, getAllPengembalian, getPengembalianById, getPengembalianByUserId, acceptPengembalian, rejectPengembalian, getPengembalianHistory, getPengembalianHistoryById } = require('../controller/pengembalian.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/pengembalian', createPengembalian);
router.get('/listPengembali', getAllPengembalian, authenticate);
router.get('/listPengembali/:id', getPengembalianById, authenticate);
router.get('/pengembali/:id', getPengembalianByUserId, authenticate);
router.post('/acceptPengembalian/:id', acceptPengembalian);
router.post('/rejectPengembalian/:id', rejectPengembalian);
router.get('/pengembalianHistory', getPengembalianHistory,authenticate);
router.get('/pengembalianHistory/:id', getPengembalianHistoryById, authenticate);

module.exports = router;