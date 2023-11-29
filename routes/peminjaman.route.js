const express = require('express');
const { getAllPeminjaman, createPeminjaman, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman, getPeminjamanById, getPeminjamanHistory, getPeminjamanHistoryById } = require('../controller/peminjaman.controller');

const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/listPeminjam', getAllPeminjaman);
router.get('/listPeminjam/:id', getPeminjamanById);
router.get('/peminjam/:id', getPeminjamanByUserId);
router.post('/acceptPeminjaman/:id', acceptPeminjaman);
router.post('/rejectPeminjaman/:id', rejectPeminjaman);
router.get('/peminjamanHistory', getPeminjamanHistory);
router.get('/peminjamanHistory/:id', getPeminjamanHistoryById);

module.exports = router;