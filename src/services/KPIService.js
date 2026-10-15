import apiClient from "./APIClient";

const PATH = "/KPI";
export const getLowStockKPI = async () => {
    const response = await apiClient.get(`${PATH}/inventory/low-stock`);
    return response.data;
};
