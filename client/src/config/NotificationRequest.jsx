import { apiClient } from './axiosClient';

const apiNotification = '/api/notification';

export const requestCreateNotification = async (data) => {
    const res = await apiClient.post(`${apiNotification}/create`, data);
    return res.data;
};

export const requestGetNotificationByUserId = async () => {
    const res = await apiClient.get(`${apiNotification}/get`);
    return res.data;
};

export const requestReadAllNotification = async () => {
    const res = await apiClient.post(`${apiNotification}/read-all`);
    return res.data;
};
