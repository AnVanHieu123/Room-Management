const { getIO, connectedUsers } = require('../socket');

const emitToUser = (userId, event, data) => {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
        getIO().to(socketId).emit(event, data);
    }
};

const emitToAll = (event, data) => {
    getIO().emit(event, data);
};

const socketService = {
    emitNewOrder(userId, event, data) {
        emitToUser(userId, event, data);
    },
    emitApproveBooking(userId, event, data) {
        emitToUser(userId, event, data);
    },
    emitNewComment(userId, event, data) {
        emitToUser(userId, event, data);
    },
};

module.exports = socketService;
