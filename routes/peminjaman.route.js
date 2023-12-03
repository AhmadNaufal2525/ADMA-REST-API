const express = require('express');
const { getAllPeminjaman, createPeminjaman, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman, getPeminjamanById, getPeminjamanHistory, getPeminjamanHistoryById } = require('../controller/peminjaman.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/listPeminjam', getAllPeminjaman, authenticate);
router.get('/listPeminjam/:id', getPeminjamanById, authenticate);
router.get('/peminjam/:id', getPeminjamanByUserId, authenticate);
router.post('/acceptPeminjaman/:id', acceptPeminjaman);
router.post('/rejectPeminjaman/:id', rejectPeminjaman);
router.get('/peminjamanHistory', getPeminjamanHistory, authenticate);
router.get('/peminjamanHistory/:id', getPeminjamanHistoryById, authenticate);

module.exports = router;