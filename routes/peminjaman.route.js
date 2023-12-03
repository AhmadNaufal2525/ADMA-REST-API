const express = require('express');
const { getAllPeminjaman, createPeminjaman, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman, getPeminjamanById, getPeminjamanHistory, getPeminjamanHistoryById } = require('../controller/peminjaman.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/listPeminjam', authenticate, getAllPeminjaman);
router.get('/listPeminjam/:id', authenticate, getPeminjamanById);
router.get('/peminjam/:id', authenticate, getPeminjamanByUserId);
router.post('/acceptPeminjaman/:id', acceptPeminjaman);
router.post('/rejectPeminjaman/:id', rejectPeminjaman);
router.get('/peminjamanHistory', authenticate, getPeminjamanHistory);
router.get('/peminjamanHistory/:id', authenticate, getPeminjamanHistoryById);

module.exports = router;