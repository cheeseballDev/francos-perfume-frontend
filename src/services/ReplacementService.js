import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/Replacement";

export const getAllReplacements = async (filter) => {
    const response = await apiClient.get(`${PATH}`, {
        params: cleanFilters(filter),
    });
    return response.data;
};

export const getReplacementFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
};

export const getReplaceableSale = async (salesOrderId) => {
    const response = await apiClient.get(`${PATH}/sale/${encodeURIComponent(salesOrderId)}`);
    return response.data;
};

export const getReplacementProducts = async (branchId) => {
    const response = await apiClient.get(`${PATH}/products/${branchId}`);
    return response.data;
};

export const postReplacement = async (payload) => {
    const response = await apiClient.post(`${PATH}`, payload);
    return response.data;
};
