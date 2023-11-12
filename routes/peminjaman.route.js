const express = require('express');
const { getAllPeminjaman, createPeminjaman, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman } = require('../controller/peminjaman.controller');

const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/listPeminjam', getAllPeminjaman);
router.get('/peminjam/:id', getPeminjamanByUserId);
router.put('/acceptPeminjaman/:id', acceptPeminjaman);
router.put('/rejectPeminjaman/:id', rejectPeminjaman);

module.exports = router;