const express = require('express');
const {createPeminjaman, getAllPeminjaman, getPeminjamanById} = require('../controller/peminjaman.controllers')
const router = express.Router();

router.post('/peminjaman', createPeminjaman);
router.get('/peminjaman/:id', getPeminjamanById);
router.get('/listpinjam', getAllPeminjaman);

module.exports = router;