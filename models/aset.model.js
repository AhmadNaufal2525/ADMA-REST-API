const mongoose = require('mongoose');

const AsetSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    nama_alat: {
        type: String,
        required: true
    },
    tag_number: {
        type: String,
        required: true
    },
    merek: {
        type: String,
        required: true
    },
    tipe: {
        type: String,
        required: true
    },
    lokasi_alat: {
        type: String,
        required: true
    },
    nomor_seri: {
        type: String,
        required: true
    },
    penanggung_jawab: {
        type: String,
        required: true
    },
    is_borrowed: {
        type: Boolean
    }
}, {
    versionKey: false,
});

const AsetModel = mongoose.model('aset', AsetSchema); 
module.exports = AsetModel;
