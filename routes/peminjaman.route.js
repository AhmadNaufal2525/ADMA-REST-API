const express = require('express');
const {createPeminjaman, getAllPeminjaman, getPeminjamanById, getPeminjamanByUserId, approvedPeminjaman} = require('../controller/peminjaman.controllers')
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/peminjaman/:id', getPeminjamanById);
router.get('/peminjam/:id', getPeminjamanByUserId);
router.get('/listpinjam', getAllPeminjaman);
router.post('/peminjaman/approve', approvedPeminjaman);
module.exports = router;