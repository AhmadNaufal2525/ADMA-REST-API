const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
});

const UsersModel = mongoose.model('users', UsersSchema); 
module.exports = UsersModel;
