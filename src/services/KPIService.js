import apiClient from "./APIClient";

const PATH = "/KPI";
export const getLowStockKPI = async () => {
    const response = await apiClient.get(`${PATH}/inventory/low-stock`);
    return response.data;
};

export const getInventoryStockCount = async () => {
    const response = await apiClient.get(`${PATH}/inventory/stock-count`);
    return response.data;
}

export const getPendingRequests = async () => {
    const response = await apiClient.get(`${PATH}/request/pending/`);
    return response.data;
}

export const getPendingApprovals = async () => {
    const response = await apiClient.get(`${PATH}/request/pending/approval`);
    return response.data;
}

export const getUpcomingDeliveries = async () => {
    const response = await apiClient.get(`${PATH}/delivery/upcoming`);
    return response.data;
}

export const getTotalRevenue = async () => {
    const response = await apiClient.get(`${PATH}/revenue/total`);
    return response.data;
}

export const getTotalTransactions = async () => {
    const response = await apiClient.get(`${PATH}/transaction/total`);
    return response.data;
}