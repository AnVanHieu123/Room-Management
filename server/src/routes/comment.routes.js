const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const commentController = require('../controller/comment.controller');

router.post('/create', authUser, asyncHandler(commentController.createComment));
router.get('/house/:houseId', asyncHandler(commentController.getCommentsByHouseId));

module.exports = router;
