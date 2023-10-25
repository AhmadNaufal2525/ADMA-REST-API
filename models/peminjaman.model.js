const mongoose = require('mongoose');

const PeminjamanSchema = new mongoose.Schema({
    id_pinjam: mongoose.Schema.Types.ObjectId,
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    id_admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    id_aset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "aset",
        required: true
    },
    lokasi: {
        type: String,
        required: true
    },
    kondisi_aset: {
        type: String,
        required: true
    },
    tanggal_peminjaman: {
        type: String,
        required: true
    },
    tujuan_peminjaman: {
        type: String,
        required: true
    },
}, {
    versionKey: false,
});

const PeminjamanModel = mongoose.model('peminjaman', PeminjamanSchema); 
module.exports = PeminjamanModel;
