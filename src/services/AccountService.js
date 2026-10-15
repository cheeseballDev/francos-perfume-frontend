
import { cleanFilters } from "@/utils/formattingUtils.jsx";

import apiClient from "./APIClient";

const PATH = "/Account";

export const getAllAccounts = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {params: cleanedFilter });
    return response.data;
};

export const getOneAccountDetails = async (accountId) => {
    const response = await apiClient.get(`${PATH}/${accountId}`);
    return response.data;
};

export const postAddNewAccount = async (dto) => {
    const response = await apiClient.post(`${PATH}`, dto);
    return response.data;
};

export const patchUpdateAccountDetails = async (accountId, dto) => {
    const response = await apiClient.patch(`${PATH}/update/${accountId}`, dto);
    return response.data;
};

export const patchUpdateAccountPassword = async (accountId, dto) => {
    const response = await apiClient.patch(`${PATH}/update/password/${accountId}`, dto);
    return response.data;
};

export const patchResetAccountPassword = async (accountId) => {
    const response = await apiClient.patch(`${PATH}/reset/password/${accountId}`);
    return response.data;
};

export const patchUpdateAccountAuth = async (accountId, dto) => {
    const response = await apiClient.patch(`${PATH}/update/auth/${accountId}`, dto);
    return response.data;
};

export const patchToggleAccountStatus = async (accountId) => {
    const response = await apiClient.patch(`${PATH}/status/${accountId}`);
    return response.data;
};

export const getAccountFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
};