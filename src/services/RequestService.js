import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/Request";

export const getAllRequests = async (filter = {}) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(PATH, { params: cleanedFilter });
    return response.data;
};

export const getRequestDetails = async (id) => {
    const response = await apiClient.get(`${PATH}/${id}`);
    return response.data;
};

export const postCreateRequest = async (payload) => {
    const response = await apiClient.post(PATH, payload);
    return response.data;
};

export const patchApproveRequest = async (requestId, payload) => {
    const response = await apiClient.patch(`${PATH}/${requestId}/approve`, payload);
    return response.data;
};

export const patchRejectRequest = async (requestId, remarks) => {
    const response = await apiClient.patch(`${PATH}/${requestId}/reject`, { remarks });
    return response.data;
};

export const getRequestFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    console.log(response);
    return response.data;
};

export const patchCancelRequest = async (requestId) => {
    const response = await apiClient.patch(`${PATH}/${requestId}/cancel`);
    return response.data;
};