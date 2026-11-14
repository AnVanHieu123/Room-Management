const RoomService = require('../services/room.service');

class RoomController {
    async createRoom(req, res, next) {
        try {
            const files = req.files;
            const userId = req.user._id;
            const data = req.body;

            const room = await RoomService.createRoom(data, files, userId);

            return res.status(201).json({
                message: 'Tạo phòng thành công',
                metadata: room,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllRooms(req, res, next) {
        try {
            const result = await RoomService.getAllRooms(req.query);

            return res.status(200).json({
                message: 'Lấy danh sách phòng thành công',
                metadata: result.rooms,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async getFilterOptions(req, res, next) {
        try {
            const result = await RoomService.getFilterOptions();

            return res.status(200).json({
                message: 'Lấy filter options thành công',
                metadata: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllRoomAdmin(req, res) {
        try {
            const data = await RoomService.getAllRoomsAdmin();

            return res.status(200).json({
                message: 'Lấy danh sách phòng thành công',
                metadata: data,
            });
        } catch (error) {
            next(error);
        }
    }

    async getRoomById(req, res, next) {
        try {
            const { id } = req.params;
            const room = await RoomService.getRoomById(id);

            return res.status(200).json({
                message: 'Lấy thông tin phòng thành công',
                metadata: room,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRoom(req, res, next) {
        try {
            const { id } = req.params;
            const files = req.files;
            const data = req.body;

            const room = await RoomService.updateRoom(id, data, files);

            return res.status(200).json({
                message: 'Cập nhật phòng thành công',
                metadata: room,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRoom(req, res, next) {
        try {
            const { id } = req.params;
            await RoomService.deleteRoom(id);

            return res.status(200).json({
                message: 'Xóa phòng thành công',
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RoomController();
