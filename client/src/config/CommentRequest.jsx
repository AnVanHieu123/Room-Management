import { apiClient } from './axiosClient';

const apiComment = '/api/comment';

export const requestCreateComment = async (data) => {
    const res = await apiClient.post(`${apiComment}/create`, data);
    return res.data;
};

export const requestGetCommentsByHouseId = async (houseId) => {
    const res = await apiClient.get(`${apiComment}/house/${houseId}`);
    return res.data;
};
