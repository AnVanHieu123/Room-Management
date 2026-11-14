const bookingModel = require('../models/booking.model');
const roomModel = require('../models/room.model');
const notificationModel = require('../models/notication.model');
const modelUser = require('../models/users.model');

const crypto = require('crypto');
const https = require('https');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const socketService = require('../utils/socket.service');

function generatePayID() {
    // Tạo ID thanh toán bao gồm cả giây để tránh trùng lặp
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

function createMonthlySchedule(startDate, rentMonths, pricePerMonth) {
    const schedule = [];
    const start = new Date(startDate);

    // Tháng đầu đã thanh toán → tạo từ tháng thứ 2
    for (let i = 1; i < rentMonths; i++) {
        const due = new Date(start);
        due.setMonth(start.getMonth() + i); // Tự nhảy tháng

        schedule.push({
            month: i + 1, // Tháng thứ mấy trong hợp đồng
            dueDate: due,
            amount: pricePerMonth,
            status: 'pending',
        });
    }

    return schedule;
}

class bookingService {
    async createBooking({ roomId, startDate, rentMonths, userId }) {
        // Get room info to store price at booking time
        const room = await roomModel.findById(roomId);
        if (!room) {
            throw new Error('Phòng không tồn tại');
        }

        const pricePerMonth = room.price;
        const depositAmount = room.deposit;
        const initialPaymentAmount = pricePerMonth + depositAmount;

        const booking = await bookingModel.create({
            roomId,
            startDate,
            rentMonths,
            userId,
            pricePerMonth,
            depositAmount,
            initialPaymentAmount,
        });

        return booking;
    }

    async getAllBookings() {
        const bookings = await bookingModel
            .find()
            .populate('roomId', 'title price address images deposit')
            .populate('userId', 'fullName email phone')
            .sort({ createdAt: -1 });

        return bookings;
    }

    async approveBooking(bookingId) {
        const booking = await bookingModel.findById(bookingId);
        const findAdmin = await modelUser.findOne({ role: 'admin' });
        if (!booking) {
            throw new Error('Đơn đặt phòng không tồn tại');
        }

        if (booking.approveStatus !== 'pending') {
            throw new Error('Đơn này đã được xử lý');
        }

        await roomModel.findById(booking.roomId);

        booking.approveStatus = 'approved';
        booking.status = 'waiting_payment';

        await notificationModel.create({
            userId: findAdmin._id,
            type: 'order',
            message: 'Đơn đặt phòng đã được chấp nhận',
            fromUser: booking.userId,
            toUser: findAdmin._id,
        });

        socketService.emitApproveBooking(booking.userId, 'approveBooking', booking);

        await booking.save();

        return booking;
    }

    async rejectBooking(bookingId) {
        const booking = await bookingModel.findById(bookingId);
        if (!booking) {
            throw new Error('Đơn đặt phòng không tồn tại');
        }

        if (booking.approveStatus !== 'pending') {
            throw new Error('Đơn này đã được xử lý');
        }

        booking.approveStatus = 'rejected';
        booking.status = 'cancelled';
        await booking.save();

        return booking;
    }

    async getMyBookings(userId) {
        const bookings = await bookingModel
            .find({ userId })
            .populate('roomId', 'title price address images deposit')
            .sort({ createdAt: -1 });

        return bookings;
    }

    async payment({ paymentMethod, bookingId }) {
        const booking = await bookingModel.findById(bookingId);
        if (!booking) {
            throw new Error('Đơn đặt phòng không tồn tại');
        }

        if (booking.status !== 'waiting_payment') {
            throw new Error('Đơn này đã được xử lý');
        }

        if (paymentMethod === 'momo') {
            return new Promise(async (resolve, reject) => {
                const accessKey = 'F8BBA842ECF85';
                const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                const partnerCode = 'MOMO';
                const orderId = partnerCode + new Date().getTime();
                const requestId = orderId;
                const orderInfo = `${booking._id}`;
                const redirectUrl = 'http://localhost:3000/api/booking/momo';
                const ipnUrl = 'http://localhost:3000/api/booking/momo';
                const requestType = 'payWithMethod';
                const amount = booking.initialPaymentAmount;
                const extraData = '';

                const rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;

                const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                const requestBody = JSON.stringify({
                    partnerCode,
                    partnerName: 'Test',
                    storeId: 'MomoTestStore',
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang: 'vi',
                    requestType,
                    autoCapture: true,
                    extraData,
                    orderGroupId: '',
                    signature,
                });

                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody),
                    },
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(requestBody);
                req.end();
            });
        } else if (paymentMethod === 'vnpay') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: booking.initialPaymentAmount, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${booking.userId} + ${generatePayID()}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `Thanh toan don hang ${booking._id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/booking/vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });

            return vnpayResponse;
        }
    }

    async paymentMonth({ monthId, bookingId, paymentMethod }) {
        if (!monthId || !bookingId || !paymentMethod) {
            throw new Error('Thiếu thông tin');
        }
        const booking = await bookingModel.findById(bookingId);

        if (paymentMethod === 'momo') {
            if (!booking) {
                throw new Error('Đơn đặt phòng không tồn tại');
            }

            if (booking.status !== 'waiting_payment') {
                throw new Error('Đơn này đã được xử lý');
            }

            return new Promise(async (resolve, reject) => {
                const accessKey = 'F8BBA842ECF85';
                const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
                const partnerCode = 'MOMO';
                const orderId = partnerCode + new Date().getTime();
                const requestId = orderId;
                const orderInfo = `${monthId} + ${bookingId}`;
                const redirectUrl = 'http://localhost:3000/api/booking/momo-month';
                const ipnUrl = 'http://localhost:3000/api/booking/momo-month';
                const requestType = 'payWithMethod';
                const amount = booking.pricePerMonth;
                const extraData = '';

                const rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;

                const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                const requestBody = JSON.stringify({
                    partnerCode,
                    partnerName: 'Test',
                    storeId: 'MomoTestStore',
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang: 'vi',
                    requestType,
                    autoCapture: true,
                    extraData,
                    orderGroupId: '',
                    signature,
                });

                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody),
                    },
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(requestBody);
                req.end();
            });
        } else if (paymentMethod === 'vnpay') {
            const vnpay = new VNPay({
                tmnCode: 'DH2F13SW',
                secureSecret: '7VJPG70RGPOWFO47VSBT29WPDYND0EJG',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: booking.pricePerMonth, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${monthId} + ${bookingId} + ${generatePayID()}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `Thanh toan don hang ${monthId} ${bookingId}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/booking/vnpay-month`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });

            return vnpayResponse;
        }
    }

    async momoCallBack(id) {
        const booking = await bookingModel.findById(id);
        const findRoom = await roomModel.findById(booking.roomId);
        booking.monthlySchedule = createMonthlySchedule(booking.startDate, booking.rentMonths, findRoom.pricePerMonth);

        booking.paymentStatus = 'paid';
        findRoom.status = 'occupied';
        await booking.save();
        await findRoom.save();
        return booking;
    }

    async vnpayCallBack(id) {
        const booking = await bookingModel.findById(id);

        const findRoom = await roomModel.findById(booking.roomId);
        booking.monthlySchedule = createMonthlySchedule(booking.startDate, booking.rentMonths, findRoom.pricePerMonth);
        booking.paymentStatus = 'paid';
        findRoom.status = 'occupied';
        await booking.save();
        await findRoom.save();
        return booking;
    }

    async momoMonthCallBack(id) {
        const bookingId = id.split(' + ')[1];
        const monthId = id.split(' + ')[0];

        const findBooking = await bookingModel.findById(bookingId);

        findBooking.monthlySchedule = findBooking.monthlySchedule.map((month) => {
            if (month._id.toString() === monthId) {
                month.status = 'paid';
            }
            return month;
        });

        await findBooking.save();

        return findBooking;
    }

    async vnpayCallBackMonth(id) {
        const monthId = id.split(' ')[4];
        const bookingId = id.split(' ')[5];

        const findBooking = await bookingModel.findById(bookingId);

        findBooking.monthlySchedule = findBooking.monthlySchedule.map((month) => {
            if (month._id.toString() === monthId) {
                month.status = 'paid';
            }
            return month;
        });

        await findBooking.save();

        return findBooking;
    }
}

module.exports = new bookingService();
