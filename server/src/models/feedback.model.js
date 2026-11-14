const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelFeedback = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        roomId: { type: String, require: true, ref: 'room' },
        images: { type: [String], require: true },
        rating: { type: Number, require: true },
        comment: { type: String, require: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('feedback', modelFeedback);
