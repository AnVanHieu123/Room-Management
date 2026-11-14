const modelFeedback = require('../models/feedback.model');

class FeedbackService {
    async create({ userId, roomId, images, rating, comment }) {
        const feedback = await modelFeedback.create({ userId, roomId, images, rating, comment });
        return feedback;
    }

    async getAllFeedback() {
        const feedback = await modelFeedback.find().populate('userId').populate('roomId');
        return feedback;
    }
}

module.exports = new FeedbackService();
