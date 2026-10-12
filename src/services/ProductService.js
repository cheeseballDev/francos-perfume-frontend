import { cleanFilters } from "@/utils/formattingUtils.jsx";

import apiClient from "./APIClient";

const PATH = "/Products";

export const getAllProducts = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, { params: cleanedFilter });
    return response.data;
};

export const getProductDetails = async (id) => {
    const response = await apiClient.get(`${PATH}/${id}`);
    return response.data;
};

export const addNewProduct = async (dto) => {
    const response = await apiClient.post(`${PATH}`, dto);
    return response.data;
};

export const updateProductDetails = async (id, dto) => {
    const response = await apiClient.patch(`${PATH}/${id}`, dto);
    return response.data;
};

export const getProductFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`);
    return response.data;
};

export const getAllProductBarcodes = async () => {
    const response = await apiClient.get(`${PATH}/barcodes`);
    return response.data;
}

export const getOneProductBarcode = async (productId) => {
    const response = await apiClient.get(`${PATH}/${productId}/barcode`);
    return response.data;
}

export const getAllProductBarcodeDownload = async () => {
    const response = await apiClient.get(`${PATH}/barcodes/download`, {
        responseType: 'blob',
    });
    return response.data;
}

export const getOneProductBarcodeDownload = async (productId) => {
    const response = await apiClient.get(`${PATH}/${productId}/barcode/download`, {
        responseType: 'blob',
    });
    return response.data;
}