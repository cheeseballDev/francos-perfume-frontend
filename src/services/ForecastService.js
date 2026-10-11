import apiClient from "./ApiClient";

const PATH = "/Forecasting";

/**
 * Stock forecast for a product over a given horizon.
 *
 * @param {StockForecastRequestDTO} dto payload sent to the backend
 *   (e.g. { year, month, productId, branchId })
 */
export const forecastStocks = async (dto) => {
    const response = await apiClient.post(`${PATH}/stocks`, dto);
    return response.data;
};

/**
 * Revenue forecast for a branch / product over a given horizon.
 *
 * @param {RevenueForecastRequestDTO} dto payload sent to the backend
 *   (e.g. { year, month, branchId, ... })
 */
export const forecastRevenue = async (dto) => {
    const response = await apiClient.post(`${PATH}/revenue`, dto);
    return response.data;
};

/**
 * AI-powered stock forecast.
 *
 * @param {StockForecastRequestDTO} dto same shape as forecastStocks
 */
export const forecastStocksAI = async (dto) => {
    const response = await apiClient.post(`${PATH}/ai`, dto);
    return response.data;
};