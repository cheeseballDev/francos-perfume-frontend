import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/pos";

export const getAllProductsPOS = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {
        params: cleanedFilter,
    });
    return response.data;
};

export const checkout = async (checkoutData) => {
    const response = await apiClient.post(`${PATH}/checkout`, checkoutData);
    return response.data;
};

export const getPOSFilters = async () => {
    
}