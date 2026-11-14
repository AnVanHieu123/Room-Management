const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelUser = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: false, default: '' },
        address: { type: String, required: false, default: '' },
        phone: { type: String, required: false, default: '' },
        birthDay: { type: Date, required: false, default: null },
        typeLogin: { type: String, enum: ['email', 'google'], default: 'email' },
        avatar: { type: String, required: false, default: '' },
        role: { type: String, enum: ['user', 'landlord', 'admin'], default: 'user' },
        isAdmin: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('user', modelUser);

