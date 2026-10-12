import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./ApiClient";

const PATH = "/Transaction";

export const getAllTransactions = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {
        params: cleanedFilter,
    });
    return response.data;
};

export const getTransactionDetails = async (salesOrderId) => {
    const response = await apiClient.get(`${PATH}/${salesOrderId}`);
    return response.data;
}

export const getExcel = async (dateFrom, dateTo) => {
    // cleanFilters removes undefined/empty strings so it only sends dates if they exist
    const params = cleanFilters({ dateFrom, dateTo }); 
    const response = await apiClient.get(`${PATH}/excel`, {
        params,
        responseType: "blob",
    });
    return response;
}

export const getPdf = async (dateFrom, dateTo) => {
    const params = cleanFilters({ dateFrom, dateTo });
    const response = await apiClient.get(`${PATH}/pdf`, {
        params,
        responseType: "blob",
    });
    return response;
}