const express = require('express');
const {createPeminjaman, getAllPeminjaman, getPeminjamanById, acceptPeminjaman, rejectPeminjaman} = require('../controller/peminjaman.controllers')
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/peminjaman/:id', getPeminjamanById);
router.get('/listpinjam', getAllPeminjaman);
router.post('/peminjaman/accept/:id', acceptPeminjaman);
router.post('/peminjaman/reject/:id', rejectPeminjaman);
module.exports = router;