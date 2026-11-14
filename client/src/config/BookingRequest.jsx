import { apiClient } from './axiosClient';

const apiBooking = '/api/booking';

// Admin: Get all bookings
export const getAllBookings = async () => {
    const res = await apiClient.get(`${apiBooking}/all`);
    return res.data;
};

// Admin: Approve booking
export const approveBooking = async (id) => {
    const res = await apiClient.put(`${apiBooking}/approve/${id}`);
    return res.data;
};

// Admin: Reject booking
export const rejectBooking = async (id) => {
    const res = await apiClient.put(`${apiBooking}/reject/${id}`);
    return res.data;
};

// User: Get my bookings
export const getMyBookings = async () => {
    const res = await apiClient.get(`${apiBooking}/my-bookings`);
    return res.data;
};

export const CreatePayment = async (data) => {
    const res = await apiClient.post(`${apiBooking}/payment`, data);
    return res.data;
};

export const CreatePaymentMonth = async (data) => {
    const res = await apiClient.post(`${apiBooking}/payment-month`, data);
    return res.data;
};
