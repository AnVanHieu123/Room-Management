const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/rooms');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerRoom = require('../controller/room.controller');

// Create room
router.post('/create', authUser, upload.array('images'), asyncHandler(controllerRoom.createRoom));

router.get('/admin', authAdmin, asyncHandler(controllerRoom.getAllRoomAdmin));

// Get filter options (locations, categories, new listings)
router.get('/filter-options', asyncHandler(controllerRoom.getFilterOptions));

// Get all rooms
router.get('/', asyncHandler(controllerRoom.getAllRooms));

// Get room by id
router.get('/:id', asyncHandler(controllerRoom.getRoomById));

// Update room
router.put('/update/:id', authUser, upload.array('images'), asyncHandler(controllerRoom.updateRoom));

// Delete room
router.delete('/delete/:id', authUser, asyncHandler(controllerRoom.deleteRoom));

module.exports = router;
