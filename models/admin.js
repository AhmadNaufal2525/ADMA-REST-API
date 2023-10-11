const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
});

const AdminModel = mongoose.model('admin', AdminSchema); 
module.exports = AdminModel;
