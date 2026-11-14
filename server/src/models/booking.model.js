const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'room',
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },

        // Ngày user muốn bắt đầu vào ở
        startDate: {
            type: Date,
            required: true,
        },

        // Thuê bao nhiêu tháng
        rentMonths: {
            type: Number,
            required: true,
        },

        // Giá trị lấy từ phòng tại thời điểm đặt
        pricePerMonth: Number,
        depositAmount: Number,

        // Tổng tiền cần trả ban đầu = deposit + firstMonth
        initialPaymentAmount: Number,

        // Lịch thanh toán các tháng tiếp theo
        monthlySchedule: [
            {
                month: Number, // 2 → tháng 2
                dueDate: Date,
                amount: Number,
                status: {
                    type: String,
                    enum: ['pending', 'paid', 'late'],
                    default: 'pending',
                },
            },
        ],

        // Trạng thái duyệt của admin
        approveStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },

        // Trạng thái thanh toán
        paymentStatus: {
            type: String,
            enum: ['waiting_payment', 'paid'],
            default: 'waiting_payment',
        },

        // Trạng thái booking
        status: {
            type: String,
            enum: ['pending', 'waiting_payment', 'active', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Booking', BookingSchema);
