const modelRoom = require('../models/room.model');

class RoomService {
    async createRoom(data, files, userId) {
        // Get image paths from uploaded files
        const images = files?.map((file) => `/uploads/rooms/${file.filename}`) || [];

        // Parse JSON strings if needed (from FormData)
        const utilities = typeof data.utilities === 'string' ? JSON.parse(data.utilities) : data.utilities || [];
        const buildingAmenities =
            typeof data.buildingAmenities === 'string'
                ? JSON.parse(data.buildingAmenities)
                : data.buildingAmenities || [];
        const pricesDetail =
            typeof data.pricesDetail === 'string'
                ? JSON.parse(data.pricesDetail)
                : data.pricesDetail || {
                      electricity: 3800,
                      water: 25000,
                      internet: 100000,
                      parking: 0,
                  };

        const room = await modelRoom.create({
            title: data.title,
            description: data.description,
            price: Number(data.price),
            area: Number(data.area),
            categoryId: data.categoryId,
            address: data.address,
            images: images,
            status: data.status || 'available',
            utilities: utilities,
            buildingAmenities: buildingAmenities,
            pricesDetail: pricesDetail,
            deposit: Number(data.deposit) || 0,
            minContractMonths: Number(data.minContractMonths) || 6,
            ownerName: data.ownerName,
            ownerPhone: data.ownerPhone,
            createdBy: userId,
        });

        return room;
    }

    async getAllRooms(query = {}) {
        const {
            status,
            categoryId,
            search,
            page = 1,
            limit = 10,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            location,
        } = query;

        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        if (search) {
            filter.$or = [{ title: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Area range filter
        if (minArea || maxArea) {
            filter.area = {};
            if (minArea) filter.area.$gte = Number(minArea);
            if (maxArea) filter.area.$lte = Number(maxArea);
        }

        // Location filter - search in address
        if (location) {
            filter.address = { $regex: location, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const rooms = await modelRoom
            .find(filter)
            .populate('categoryId', 'nameCategory')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await modelRoom.countDocuments(filter);

        return {
            rooms,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getFilterOptions() {
        const modelCategory = require('../models/category.model');

        // Get all unique locations (cities) from addresses
        const rooms = await modelRoom.find({}, { address: 1 });
        const locationSet = new Set();

        rooms.forEach((room) => {
            // Extract city from address (usually last part after comma)
            const parts = room.address.split(',');
            if (parts.length > 0) {
                const city = parts[parts.length - 1].trim();
                if (city) locationSet.add(city);
            }
        });

        // Get all categories
        const categories = await modelCategory.find({}, { nameCategory: 1 });

        // Get new listings (5 most recent)
        const newListings = await modelRoom
            .find({ status: 'available' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title price images createdAt');

        return {
            locations: Array.from(locationSet),
            categories: categories.map((cat) => ({ _id: cat._id, name: cat.nameCategory })),
            newListings,
        };
    }

    async getRoomById(id) {
        const room = await modelRoom.findById(id).populate('categoryId', 'nameCategory');

        if (!room) {
            throw new Error('Không tìm thấy phòng');
        }

        return room;
    }

    async updateRoom(id, data, files) {
        const room = await modelRoom.findById(id);

        if (!room) {
            throw new Error('Không tìm thấy phòng');
        }

        // Handle images
        // oldImages: array of existing image paths that user wants to keep
        // files: new images to upload
        let oldImages = [];
        if (data.oldImages) {
            oldImages = typeof data.oldImages === 'string' ? JSON.parse(data.oldImages) : data.oldImages;
        }

        // Get new uploaded images
        const newImages = files?.map((file) => `/uploads/rooms/${file.filename}`) || [];

        // Combine old images (that user kept) with new images
        const images = [...oldImages, ...newImages];

        // Parse JSON strings if needed
        const utilities = typeof data.utilities === 'string' ? JSON.parse(data.utilities) : data.utilities;
        const buildingAmenities =
            typeof data.buildingAmenities === 'string' ? JSON.parse(data.buildingAmenities) : data.buildingAmenities;
        const pricesDetail = typeof data.pricesDetail === 'string' ? JSON.parse(data.pricesDetail) : data.pricesDetail;

        const updatedRoom = await modelRoom
            .findByIdAndUpdate(
                id,
                {
                    title: data.title || room.title,
                    description: data.description || room.description,
                    price: data.price ? Number(data.price) : room.price,
                    area: data.area ? Number(data.area) : room.area,
                    categoryId: data.categoryId || room.categoryId,
                    address: data.address || room.address,
                    images: images.length > 0 ? images : room.images,
                    status: data.status || room.status,
                    utilities: utilities || room.utilities,
                    buildingAmenities: buildingAmenities || room.buildingAmenities,
                    pricesDetail: pricesDetail || room.pricesDetail,
                    deposit: data.deposit ? Number(data.deposit) : room.deposit,
                    minContractMonths: data.minContractMonths ? Number(data.minContractMonths) : room.minContractMonths,
                    ownerName: data.ownerName || room.ownerName,
                    ownerPhone: data.ownerPhone || room.ownerPhone,
                },
                { new: true },
            )
            .populate('categoryId', 'nameCategory');

        return updatedRoom;
    }

    async deleteRoom(id) {
        const room = await modelRoom.findByIdAndDelete(id);

        if (!room) {
            throw new Error('Không tìm thấy phòng');
        }

        return room;
    }

    async getAllRoomsAdmin() {
        const rooms = await modelRoom.find().populate('categoryId', 'nameCategory');

        return rooms;
    }
}

module.exports = new RoomService();
