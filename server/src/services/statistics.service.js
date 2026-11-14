const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const Feedback = require('../models/feedback.model');

class StatisticsService {
    async getStatistics() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Room statistics
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
        const availableRooms = await Room.countDocuments({ status: 'available' });

        // Total tenants (approved bookings)
        const totalTenants = await Booking.countDocuments({ approveStatus: 'approved' });

        // Revenue calculations from paid bookings
        const paidBookings = await Booking.find({
            paymentStatus: 'paid',
        });

        // Calculate yearly revenue
        let yearlyRevenue = 0;
        let monthlyRevenue = 0;
        const monthlyRevenueData = Array(12).fill(0);

        paidBookings.forEach((booking) => {
            // Initial payment (deposit + first month)
            if (booking.createdAt.getFullYear() === currentYear) {
                yearlyRevenue += booking.initialPaymentAmount || 0;
                const bookingMonth = booking.createdAt.getMonth();
                monthlyRevenueData[bookingMonth] += booking.initialPaymentAmount || 0;

                if (booking.createdAt.getMonth() + 1 === currentMonth) {
                    monthlyRevenue += booking.initialPaymentAmount || 0;
                }
            }

            // Monthly schedule payments
            booking.monthlySchedule?.forEach((schedule) => {
                if (schedule.status === 'paid') {
                    const scheduleDate = new Date(schedule.dueDate);
                    if (scheduleDate.getFullYear() === currentYear) {
                        yearlyRevenue += schedule.amount || 0;
                        const scheduleMonth = scheduleDate.getMonth();
                        monthlyRevenueData[scheduleMonth] += schedule.amount || 0;

                        if (scheduleDate.getMonth() + 1 === currentMonth) {
                            monthlyRevenue += schedule.amount || 0;
                        }
                    }
                }
            });
        });

        // Rooms created per month (this year)
        const roomsPerMonth = await Room.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const newRoomsData = Array(12).fill(0);
        roomsPerMonth.forEach((item) => {
            newRoomsData[item._id - 1] = item.count;
        });

        // Recent feedbacks
        const recentFeedbacks = await Feedback.find()
            .populate('userId', 'fullName avatar')
            .populate('roomId', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        return {
            // Summary stats
            totalRooms,
            occupiedRooms,
            availableRooms,
            totalTenants,
            yearlyRevenue,
            monthlyRevenue,

            // Chart data
            monthlyRevenueData: monthlyRevenueData.map((value, index) => ({
                month: `T${index + 1}`,
                revenue: value,
            })),

            roomStatusData: [
                { name: 'Đang thuê', value: occupiedRooms, color: '#f97316' },
                { name: 'Còn trống', value: availableRooms, color: '#22c55e' },
            ],

            newRoomsData: newRoomsData.map((value, index) => ({
                month: `T${index + 1}`,
                count: value,
            })),

            recentFeedbacks,
        };
    }
}

module.exports = new StatisticsService();
