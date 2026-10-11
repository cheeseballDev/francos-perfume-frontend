import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./ApiClient";

const PATH = "/request";

export const getAllRequests = async (filter = {}) => {
  const cleanedFilter = cleanFilters(filter);
  const response = await apiClient.get(PATH, { params: cleanedFilter });
  return response.data;
};

export const getRequestDetails = async (id) => {
  const response = await apiClient.get(`${PATH}/${id}`);
  return response.data;
};

export const createRequest = async (payload) => {
  const response = await apiClient.post(PATH, payload);
  return response.data;
};

export const approveRequest = async (requestId, payload) => {
  const response = await apiClient.patch(`${PATH}/${requestId}/approve`, payload);
  return response.data;
};

export const rejectRequest = async (requestId, remarks) => {
  const response = await apiClient.patch(`${PATH}/${requestId}/reject`, { remarks });
  return response.data;
};

// FIXED: Now accepts branchId and sends it to the C# backend
export const getRequestFilters = async (branchId = null) => {
  const url = branchId ? `${PATH}/filters?branchId=${branchId}` : `${PATH}/filters`;
  const response = await apiClient.get(url);
  return response.data;
};

export const cancelRequest = async (requestId) => {
  const response = await apiClient.patch(`${PATH}/${requestId}/cancel`);
  return response.data;
};