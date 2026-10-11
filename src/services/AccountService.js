
import { cleanFilters } from "@/utils/formattingUtils.jsx";

import apiClient from "./ApiClient";

const PATH = "/Account";

export const getAllAccounts = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {params: cleanedFilter });
    return response.data;
};

export const getAccountDetails = async (id) => {
    const response = await apiClient.get(`${PATH}/${id}`);
    return response.data;
};

export const addNewAccount = async (dto) => {
    const response = await apiClient.post(`${PATH}`, dto);
    return response.data;
};

export const updateAccountDetails = async (id, dto) => {
    const response = await apiClient.patch(`${PATH}/update/${id}`, dto);
    return response.data;
};

export const updateAccountPassword = async (id, dto) => {
    const response = await apiClient.patch(`${PATH}/update/password/${id}`, dto);
    return response.data;
};

export const resetAccountPassword = async (id) => {
    const response = await apiClient.patch(`${PATH}/reset/password/${id}`);
    return response.data;
};

export const updateAccountAuth = async (id, dto) => {
    const response = await apiClient.patch(`${PATH}/update/auth/${id}`, dto);
    return response.data;
};

export const toggleAccountStatus = async (id) => {
    const response = await apiClient.patch(`${PATH}/status/${id}`);
    return response.data;
};

export const getAccountFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
};