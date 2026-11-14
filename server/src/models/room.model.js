const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        area: {
            type: Number, // diện tích m²
            required: true,
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category',
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        images: [
            {
                type: String,
                required: true,
            },
        ],

        status: {
            type: String,
            enum: ['available', 'occupied'], // còn phòng / hết phòng
            default: 'available',
        },

        utilities: {
            type: [String], // tiện ích trong phòng
            default: [],
        },

        buildingAmenities: {
            type: [String], // tiện ích tòa nhà
            default: [],
        },

        pricesDetail: {
            electricity: { type: Number, default: 3800 }, // VNĐ/kWh
            water: { type: Number, default: 25000 }, // VNĐ/m³
            internet: { type: Number, default: 100000 },
            parking: { type: Number, default: 0 },
        },

        deposit: {
            type: Number,
            default: 0, // tiền cọc 1 tháng
        },

        minContractMonths: {
            type: Number,
            default: 6,
        },

        ownerName: {
            type: String,
            required: true,
        },

        ownerPhone: {
            type: String,
            required: true,
        },

        ratings: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                rating: { type: Number, min: 1, max: 5 },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],

        averageRating: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('room', roomSchema);
