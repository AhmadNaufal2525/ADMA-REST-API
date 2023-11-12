const mongoose = require('mongoose');

const PeminjamanSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    id_aset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Aset",
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

const PeminjamanModel = mongoose.model('Peminjaman', PeminjamanSchema); 
module.exports = PeminjamanModel;