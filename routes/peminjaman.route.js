const express = require('express');
const {createPeminjaman, getAllPeminjaman, getPeminjamanByUserId, acceptPeminjaman, rejectPeminjaman} = require('../controller/peminjaman.controllers')
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/peminjaman/:id', getPeminjamanByUserId);
router.get('/listpinjam', getAllPeminjaman);
router.post('/peminjaman/accept/:id', acceptPeminjaman);
router.post('/peminjaman/reject/:id', rejectPeminjaman);
module.exports = router;