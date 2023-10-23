const express = require('express');
const {createPeminjaman, getAllPeminjaman, getPeminjamanById, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman} = require('../controller/peminjaman.controllers')
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/peminjaman/:id', getPeminjamanById);
router.get('/peminjam/:id', getPeminjamanByUserId);
router.get('/listpinjam', getAllPeminjaman);
router.post('/peminjaman/accept/:id', acceptPeminjaman);
router.post('/peminjaman/reject/:id', rejectPeminjaman);
module.exports = router;