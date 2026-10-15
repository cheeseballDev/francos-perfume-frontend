import { cleanFilters } from "@/utils/formattingUtils.jsx";

import apiClient from "./APIClient";

const PATH = "/Discount";

export const getAllDiscounts = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, cleanedFilter);
    return response.data;
};

export const getDiscountDetails = async (id) => {
    const response = await apiClient.get(`${PATH}/${id}`);
    return response.data;
}

export const patchUpdateDiscountDetails = async (id, dto) => {
    const response = await apiClient.patch(`${PATH}/${id}`, dto);
    return response.data;
}

export const postAddNewDiscount = async (dto) => {
    const response = await apiClient.post(`${PATH}`, dto);
    return response.data;
}


export const patchToggleDiscountStatus = async (id) => {
    const response = await apiClient.patch(`${PATH}/status/${id}`);
    return response.data;
}

export const deleteDiscount = async (id) => {
    const response = await apiClient.delete(`${PATH}/${id}`);
    return response.data;
}

export const getDiscountFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
}

