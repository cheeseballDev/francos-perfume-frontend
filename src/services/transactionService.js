import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

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

export const getExcel = async () => {
    const response = await apiClient.get(`${PATH}/excel`, {
        responseType: "blob",
    });
    return response;
}

export const getPdf = async () => {
    const response = await apiClient.get(`${PATH}/pdf`, {
        responseType: "blob",
    });
    return response;
}