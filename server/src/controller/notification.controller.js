const notificationService = require('../services/notification.service');

const { Created, OK } = require('../core/success.response');

class NotificationController {
    async createNotification(req, res) {
        const { id } = req.user;
        const { houseId, type, message, fromUser } = req.body;
        const notification = await notificationService.createNotification({
            userId: id,
            houseId,
            type,
            message,
            fromUser,
        });
        return new Created({
            message: 'Create notification success',
            metadata: notification,
        }).send(res);
    }
    async getNotificationByUserId(req, res) {
        const { id } = req.user;
        const notification = await notificationService.getNotificationByUserId(id);
        return new OK({
            message: 'Get notification success',
            metadata: notification,
        }).send(res);
    }
    async readAllNotification(req, res) {
        const { id } = req.user;
        const notification = await notificationService.readAllNotification(id);
        return new OK({
            message: 'Read all notification success',
            metadata: notification,
        }).send(res);
    }
}

module.exports = new NotificationController();
