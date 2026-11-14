import { request } from './request';
import { apiClient } from './axiosClient';

const apiPreviewProduct = '/api/feedback';

export const requestCreatePreviewProduct = async (data) => {
    const res = await apiClient.post(`${apiPreviewProduct}/create`, data);
    return res.data;
};

export const requestGetAllPreviewProduct = async () => {
    const res = await request.get(`${apiPreviewProduct}/getAll`);
    return res.data;
};
