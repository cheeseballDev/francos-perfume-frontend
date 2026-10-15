import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/Deliveries";

export const getAllDeliveries = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, { params: cleanedFilter });
    return response.data;
};

export const getDeliveryDetails = async (deliveryId) => {
    const response = await apiClient.get(`${PATH}/${deliveryId}`);
    return response.data;
};


export const postDispatchDelivery = async (deliveryId) => {
    const response = await apiClient.post(`${PATH}/${deliveryId}/dispatch`);
    return response.data;
};

export const postReceiveDelivery = async (deliveryId, dto) => {
    const response = await apiClient.post(`${PATH}/${deliveryId}/receive`, dto);
    return response.data;
};

export const patchCloseDeliveryRequest = async (requestId) => {
    const response = await apiClient.patch(`${PATH}/${requestId}/close`);
    return response.data;
};

export const postCancelDelivery = async (deliveryId) => {
    const response = await apiClient.post(`${PATH}/${deliveryId}/cancel`);
    return response.data;
};

export const getDeliveryFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
};