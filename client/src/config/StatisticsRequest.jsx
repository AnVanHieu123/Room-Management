import { apiClient } from './axiosClient';

const apiStatistics = '/api/statistics';

export const requestGetStatistics = async () => {
    const res = await apiClient.get(apiStatistics);
    return res.data;
};
