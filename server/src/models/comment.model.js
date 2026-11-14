const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelComment = new Schema(
    {
        houseId: { type: Schema.Types.ObjectId, ref: 'house' },
        userId: { type: Schema.Types.ObjectId, ref: 'user' },
        content: { type: String, required: true },
        parent: { type: Schema.Types.ObjectId, ref: 'comment' },
        replies: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('comment', modelComment);
