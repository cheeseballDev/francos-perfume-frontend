
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
  const response = await apiClient.patch(`${PATH}/batch/${batchId}`, {
    product_id: dto.productId,
    quantity: dto.quantity,
    expiry_date: dto.targetDate,
    reason: dto.reason,
  });
  return response.data;
};

/*
 *  I don't know what is this for to be honest, but it's one of the controllers in the backend.
 */ 
export const addInventoryItem = async () => {
    
};