import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./ApiClient";

const PATH = "/pos";

export const getAllProductsPOS = async (filter) => {
  const cleanedFilter = cleanFilters(filter);
  // FIXED: Appended the specific endpoint name required by the backend
  const response = await apiClient.get(`${PATH}/displayProductsPOS`, {
    params: cleanedFilter,
  });
  return response.data;
};

export const checkout = async (checkoutData) => {
  const response = await apiClient.post(`${PATH}/checkout`, checkoutData);
  return response.data;
};