const mongoose = require('mongoose');

const PengembalianSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
    tanggal_pengembalian: {
        type: Date,
        required: true
    },
    foto: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    jenis: {
        type: String,
        default: "Pengembalian"
    },
}, {
    versionKey: false,
});

const PengembalianModel = mongoose.model('Pengembalian', PengembalianSchema); 
module.exports = PengembalianModel;