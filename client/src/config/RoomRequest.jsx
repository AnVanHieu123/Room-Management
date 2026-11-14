import { request } from './request';
import { apiClient } from './axiosClient';

const apiRoom = '/api/rooms';

export const createRoom = async (data) => {
    const res = await apiClient.post(`${apiRoom}/create`, data);
    return res.data;
};

export const getAllRoomUser = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minArea) params.append('minArea', filters.minArea);
    if (filters.maxArea) params.append('maxArea', filters.maxArea);
    if (filters.location) params.append('location', filters.location);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const res = await request.get(`${apiRoom}${queryString ? `?${queryString}` : ''}`);
    return res.data;
};

export const getFilterOptions = async () => {
    const res = await request.get(`${apiRoom}/filter-options`);
    return res.data;
};

export const getAllRoom = async () => {
    const res = await request.get(`${apiRoom}/admin`);
    return res.data;
};

export const updateRoom = async (id, data) => {
    const res = await apiClient.put(`${apiRoom}/update/${id}`, data);
    return res.data;
};

export const deleteRoom = async (id) => {
    const res = await apiClient.delete(`${apiRoom}/delete/${id}`);
    return res.data;
};

export const requestDetailRoom = async (id) => {
    const res = await request.get(`${apiRoom}/${id}`);
    return res.data;
};

// Booking API
export const createBooking = async (data) => {
    const res = await apiClient.post('/api/booking/create', data);
    return res.data;
};
