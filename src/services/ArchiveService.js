
import { cleanFilters } from "@/utils/formattingUtils.jsx";

import apiClient from "./APIClient";

const PATH = "/Archiving";

export const getAllArchivedAccounts = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}/account`, {
        params: cleanedFilter,
    });
    return response.data;
};

export const getAllArchivedProducts = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}/product`, {
        params: cleanedFilter,
    });
    return response.data;
};

export const patchArchiveAccount = async (archiveId) => {
    const response = await apiClient.patch(`${PATH}/account/archive/${archiveId}`);
    return response.data;
};

export const patchArchiveProduct = async (archiveId) => {
    const response = await apiClient.patch(`${PATH}/product/archive/${archiveId}`);
    return response.data;
};

export const patchRestoreArchivedAccount = async (archiveId) => {
    const response = await apiClient.patch(`${PATH}/account/restore/${archiveId}`)
    return response.data;
}

export const patchRestoreArchivedProduct = async (archiveId) => {
    const response = await apiClient.patch(`${PATH}/product/restore/${archiveId}`)
    return response.data;
}

export const getOneArchivedAccount = async (archiveId) => {
    const response = await apiClient.get(`${PATH}/account/${archiveId}`)
    return response.data;
}

export const getOneArchivedProduct = async (archiveId) => {
    const response = await apiClient.get(`${PATH}/product/${archiveId}`)
    return response.data;
}


