import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/AuditLog";

export const getAllAuditLogs = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {
        params: cleanedFilter,
    });
    return response.data;
    };

export const getOneAuditLogDetails = async (logId) => {
    const response = await apiClient.get(`${PATH}/${logId}`);
    return response.data;
}

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