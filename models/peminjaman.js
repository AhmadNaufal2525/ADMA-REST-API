const mongoose = require('mongoose');

const PeminjamanSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    lokasi: {
        type: String,
        required: true
    },
    kondisi_aset: {
        type: String,
        required: true
    },
    tanggal_peminjaman: {
        type: Date,
        required: true
    },
    tujuan_peminjaman: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
}, {
    versionKey: false,
});

const PeminjamanModel = mongoose.model('peminjaman', PeminjamanSchema); 
module.exports = PeminjamanModel;
