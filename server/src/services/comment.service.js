const CommentModel = require('../models/comment.model');
const socketService = require('../utils/socket.service');
const UserModel = require('../models/users.model');
const NotificationModel = require('../models/notication.model');

// Helper function to build recursive populate options for nested comments
const buildPopulateOptions = (depth = 10) => {
    if (depth === 0) {
        return {
            path: 'replies',
            populate: { path: 'userId', select: 'fullName avatar email' },
        };
    }
    return {
        path: 'replies',
        populate: [{ path: 'userId', select: 'fullName avatar email' }, buildPopulateOptions(depth - 1)],
    };
};

class CommentService {
    async createComment({ houseId, userId, content, parent }) {
        const newComment = await CommentModel.create({ houseId, userId, content, parent });
        const findAdmin = await UserModel.findOne({ role: 'admin' });
        if (parent) {
            await CommentModel.findByIdAndUpdate(parent, { $push: { replies: newComment._id } });
        }

        if (findAdmin) {
            socketService.emitNewComment(findAdmin._id, 'newComment', newComment);
        }
        return newComment;
    }

    async getCommentsByHouseId(houseId) {
        const comments = await CommentModel.find({ houseId, parent: null })
            .populate('userId', 'fullName avatar email')
            .populate(buildPopulateOptions(10))
            .sort({ createdAt: -1 });
        return comments;
    }
}

module.exports = new CommentService();
