import { request } from './request';
import { apiClient } from './axiosClient';

const apiCategory = '/api/categories';

export const requestCreateCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/create`, data);
    return res.data;
};

export const requestGetAllCategory = async () => {
    const res = await request.get(`${apiCategory}/list`);
    return res.data;
};

export const requestUpdateCategory = async (id, data) => {
    const res = await apiClient.put(`${apiCategory}/update/${id}`, data);
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await apiClient.delete(`${apiCategory}/delete/${id}`);
    return res.data;
};

export const requestGetHousesByCategory = async () => {
    const res = await request.get(`${apiCategory}/houses`);
    return res.data;
};
