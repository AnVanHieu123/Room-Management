const { OK } = require('../core/success.response');
const FeedbackService = require('../services/feedback.service');

class FeedbackController {
    async createFeedback(req, res) {
        const { id } = req.user;
        const images = req.files.map((file) => file.filename);
        const { roomId, rating, comment } = req.body;
        const feedback = await FeedbackService.create({ userId: id, roomId, images, rating, comment });
        new OK({ message: 'success', metadata: feedback }).send(res);
    }

    async getAllFeedback(req, res) {
        const feedback = await FeedbackService.getAllFeedback();
        new OK({ message: 'success', metadata: feedback }).send(res);
    }
}

module.exports = new FeedbackController();
