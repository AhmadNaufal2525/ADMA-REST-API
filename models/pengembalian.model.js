const mongoose = require('mongoose');

const PengembalianSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
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
        required: true
    },
}, {
    versionKey: false,
});

const PengembalianModel = mongoose.model('pengembalian', PengembalianSchema); 
module.exports = PengembalianModel;
