const express = require('express');
const { createPengembalian, getAllPengembalian, getPengembalianById, getPengembalianByUserId, acceptPengembalian, rejectPengembalian, getPengembalianHistory, getPengembalianHistoryById } = require('../controller/pengembalian.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/pengembalian', createPengembalian);
router.get('/listPengembali', authenticate, getAllPengembalian);
router.get('/listPengembali/:id', authenticate, getPengembalianById);
router.get('/pengembali/:id', authenticate, getPengembalianByUserId);
router.post('/acceptPengembalian/:id', acceptPengembalian);
router.post('/rejectPengembalian/:id', rejectPengembalian);
router.get('/pengembalianHistory', authenticate, getPengembalianHistory);
router.get('/pengembalianHistory/:id', authenticate, getPengembalianHistoryById);

module.exports = router;