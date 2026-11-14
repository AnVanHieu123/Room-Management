const Notification = require('../models/notication.model');
const socketService = require('../utils/socket.service');

class NotificationService {
    async createNotification({ userId, houseId, type, message, fromUser }) {
        const notification = await Notification.create({
            userId,
            houseId,
            type,
            message,
            fromUser,
        });
        socketService.emitNotification(fromUser, 'notification', notification);
        return notification;
    }

    async getNotificationByUserId(userId) {
        const notification = await Notification.find({ fromUser: userId });
        return notification;
    }

    async readAllNotification(userId) {
        const notification = await Notification.updateMany({ fromUser: userId }, { isRead: true });
        return notification;
    }
}

module.exports = new NotificationService();
