const { OK } = require('../core/success.response');
const bookingService = require('../services/booking.service');

class bookingController {
    async createBooking(req, res) {
        const { roomId, startDate, rentMonths } = req.body;
        const { id: userId } = req.user;

        const data = await bookingService.createBooking({ roomId, startDate, rentMonths, userId });

        return new OK({
            message: 'Create booking successfully',
            metadata: data,
        }).send(res);
    }

    async getAllBookings(req, res) {
        const data = await bookingService.getAllBookings();

        return new OK({
            message: 'Get all bookings successfully',
            metadata: data,
        }).send(res);
    }

    async approveBooking(req, res) {
        const { id } = req.params;
        const data = await bookingService.approveBooking(id);

        return new OK({
            message: 'Booking approved successfully',
            metadata: data,
        }).send(res);
    }

    async rejectBooking(req, res) {
        const { id } = req.params;
        const data = await bookingService.rejectBooking(id);

        return new OK({
            message: 'Booking rejected successfully',
            metadata: data,
        }).send(res);
    }

    async getMyBookings(req, res) {
        const { id: userId } = req.user;
        const data = await bookingService.getMyBookings(userId);

        return new OK({
            message: 'Get my bookings successfully',
            metadata: data,
        }).send(res);
    }

    async payment(req, res) {
        const { paymentMethod, bookingId, month } = req.body;
        const data = await bookingService.payment({ paymentMethod, bookingId, month });

        return new OK({
            message: 'Payment successfully',
            metadata: data,
        }).send(res);
    }

    async paymentMonth(req, res) {
        const { paymentMethod, bookingId, monthId } = req.body;
        const data = await bookingService.paymentMonth({ paymentMethod, bookingId, monthId });

        return new OK({
            message: 'Payment month successfully',
            metadata: data,
        }).send(res);
    }

    async momoCallBack(req, res) {
        const { orderInfo } = req.query;

        await bookingService.momoCallBack(orderInfo);

        return res.redirect('http://localhost:5173/user/bookings');
    }

    async vnpayCallBack(req, res) {
        const { vnp_OrderInfo } = req.query;
        const id = vnp_OrderInfo.split(' ')[4];

        await bookingService.vnpayCallBack(id);

        return res.redirect('http://localhost:5173/user/bookings');
    }

    async momoMonthCallBack(req, res) {
        const { orderInfo } = req.query;
        await bookingService.momoMonthCallBack(orderInfo);

        return res.redirect('http://localhost:5173/user/bookings');
    }

    async vnpayCallBackMonth(req, res) {
        const { vnp_OrderInfo } = req.query;
        await bookingService.vnpayCallBackMonth(vnp_OrderInfo);

        return res.redirect('http://localhost:5173/user/bookings');
    }
}

module.exports = new bookingController();
