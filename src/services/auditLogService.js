import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./ApiClient";

const PATH = "/AuditLog";

export const getAllAuditLogs = async (filter) => {
  const cleanedFilter = cleanFilters(filter);
  const response = await apiClient.get(`${PATH}`, {
    params: cleanedFilter,
  });
  return response.data;
};

// ADDED: Export endpoints with date filters
export const getExcel = async (dateFrom, dateTo) => {
    const params = cleanFilters({ dateFrom, dateTo }); 
    const response = await apiClient.get(`${PATH}/excel`, {
        params,
        responseType: "blob",
    });
    return response;
}

export const getPdf = async (dateFrom, dateTo) => {
    const params = cleanFilters({ dateFrom, dateTo });
    const response = await apiClient.get(`${PATH}/pdf`, {
        params,
        responseType: "blob",
    });
    return response;
}