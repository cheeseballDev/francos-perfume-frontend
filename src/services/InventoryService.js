
import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/Inventory";

export const getAllInventory = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {
        params: cleanedFilter,
    });
    
    return response.data;
};

export const getInventoryItemDetails = async (productId) => {
    const response = await apiClient.get(`${PATH}/${productId}`);
    return response.data;
};

export const getInventoryBatches = async (productId, branchId) => {
    const response = await apiClient.get(`${PATH}/batch`, {
        params: { branchId, productId },
    });
    return response.data;
};

export const updateBatch = async (batchId, dto) => {
    const response = await apiClient.patch(`${PATH}/batch/${batchId}`, dto);
    return response.data;
};

export const getInventoryFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
};


export const addInventoryItem = async () => {
    
};