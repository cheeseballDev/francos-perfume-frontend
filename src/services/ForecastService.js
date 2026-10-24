import apiClient from "./APIClient";

const PATH = "/Forecasting";

export const postForecastStocks = async (dto) => {
    const response = await apiClient.post(`${PATH}/stocks`, dto);
    return response.data;
};

export const postForecastRevenue = async (dto) => {
    const response = await apiClient.post(`${PATH}/revenue`, dto);
    return response.data;
};

export const postForecastStocksAI = async (dto) => {
    const response = await apiClient.post(`${PATH}/ai`, dto);
    return response.data;
};