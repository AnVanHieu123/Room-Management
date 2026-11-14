const CommentService = require('../services/comment.service');
const { OK } = require('../core/success.response');

class CommentController {
    async createComment(req, res) {
        const { id } = req.user;
        const { houseId, content, parent } = req.body;
        const comment = await CommentService.createComment({ userId: id, houseId, content, parent });
        new OK({ message: 'success', metadata: comment }).send(res);
    }

    async getCommentsByHouseId(req, res) {
        const { houseId } = req.params;
        const comments = await CommentService.getCommentsByHouseId(houseId);
        new OK({ message: 'success', metadata: comments }).send(res);
    }
}

module.exports = new CommentController();
