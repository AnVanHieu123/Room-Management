const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const notificationController = require('../controller/notification.controller');

router.post('/create', authUser, asyncHandler(notificationController.createNotification));
router.get('/get', authUser, asyncHandler(notificationController.getNotificationByUserId));
router.post('/read-all', authUser, asyncHandler(notificationController.readAllNotification));

module.exports = router;
