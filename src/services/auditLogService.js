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