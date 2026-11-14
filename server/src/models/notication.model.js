const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        roomId: { type: Schema.Types.ObjectId, ref: 'room', required: false },

        type: {
            type: String,
            enum: ['comment', 'view', 'favorite', 'order'],
            required: true,
        },

        message: { type: String, required: true },

        data: { type: mongoose.Schema.Types.Mixed, required: false },

        // id của người tạo ra hành động (ví dụ: người comment)
        fromUser: { type: Schema.Types.ObjectId, ref: 'user', required: false },

        // đã đọc hay chưa
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('notification', notificationSchema);
