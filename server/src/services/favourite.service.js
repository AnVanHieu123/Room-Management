const { BadRequestError } = require('../core/error.response');
const Favourite = require('../models/favourite.model');
const Room = require('../models/room.model');

class FavouriteService {
    async createFavourite(userId, roomId) {
        const findFavourite = await Favourite.findOne({ userId, roomId });
        if (findFavourite) {
            await Favourite.findByIdAndDelete(findFavourite._id);
            await Room.findByIdAndUpdate(roomId, { $pull: { favourite: userId } });

            throw new BadRequestError('Đã sản phẩm khỏi yêu thích');
        } else {
            const favourite = await Favourite.create({ userId, roomId });
            await Room.findByIdAndUpdate(roomId, { $push: { favourite: userId } });
            return favourite;
        }
    }

    async getFavouriteByUserId(userId) {
        const favourite = await Favourite.find({ userId }).populate('roomId');
        return favourite;
    }
}

module.exports = new FavouriteService();
