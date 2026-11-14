const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const bookingController = require('../controller/booking.controller');

// User routes
router.post('/create', authUser, asyncHandler(bookingController.createBooking));
router.get('/my-bookings', authUser, asyncHandler(bookingController.getMyBookings));
router.post('/payment', authUser, asyncHandler(bookingController.payment));
router.post('/payment-month', authUser, asyncHandler(bookingController.paymentMonth));
router.get('/vnpay', asyncHandler(bookingController.vnpayCallBack));
router.get('/momo', asyncHandler(bookingController.momoCallBack));
router.get('/momo-month', asyncHandler(bookingController.momoMonthCallBack));
router.get('/vnpay-month', asyncHandler(bookingController.vnpayCallBackMonth));

// Admin routes
router.get('/all', authAdmin, asyncHandler(bookingController.getAllBookings));
router.put('/approve/:id', authAdmin, asyncHandler(bookingController.approveBooking));
router.put('/reject/:id', authAdmin, asyncHandler(bookingController.rejectBooking));

module.exports = router;
