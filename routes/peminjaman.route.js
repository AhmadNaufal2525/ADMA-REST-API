const express = require('express');
const { getAllPeminjaman, createPeminjaman, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman, getPeminjamanById } = require('../controller/peminjaman.controller');

const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/listPeminjam', getAllPeminjaman);
router.get('/listPeminjam/:id', getPeminjamanById);
router.get('/peminjam/:id', getPeminjamanByUserId);
router.post('/acceptPeminjaman/:id', acceptPeminjaman);
router.post('/rejectPeminjaman/:id', rejectPeminjaman);

module.exports = router;