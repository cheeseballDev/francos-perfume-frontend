import { cleanFilters } from "@/utils/formattingUtils.jsx";
import apiClient from "./APIClient";

const PATH = "/Transaction";

export const getAllTransactions = async (filter) => {
    const cleanedFilter = cleanFilters(filter);
    const response = await apiClient.get(`${PATH}`, {
        params: cleanedFilter,
    });
    return response.data;
};

export const getTransactionDetails = async (salesOrderId) => {
    const response = await apiClient.get(`${PATH}/${salesOrderId}`);
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

export const getTransactionFilters = async () => {
    const response = await apiClient.get(`${PATH}/filters`)
    return response.data;
}

export const getPdf = async (dateFrom, dateTo) => {
    const params = cleanFilters({ dateFrom, dateTo });
    const response = await apiClient.get(`${PATH}/pdf`, {
        params,
        responseType: "blob",
    });
    return response;
}

export const postUploadExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file); 
    const response = await apiClient.post(`${PATH}/excel`, formData);
    return response.data;
};

export const getBranchComparison = async (filter) => {
    const params = new URLSearchParams();

    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);

    if (filter.branchIds && Array.isArray(filter.branchIds)) {
        filter.branchIds.forEach(id => params.append('branchIds', id));
    }

    const response = await apiClient.get(`${PATH}/compare-branches`, { 
        params
    })
    return response.data;
}

export const getSalesReport = async (filter) => {
    const params = new URLSearchParams();

    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);

    if (filter.branchIds && Array.isArray(filter.branchIds)) {
        filter.branchIds.forEach(id => params.append('branchIds', id));
    }

    const response = await apiClient.get(`${PATH}/sales-report`, { params });
    return response.data;
}

export const getSalesReportExcel = async (filter) => {
    const params = new URLSearchParams();

    if (filter.fromDate) params.append('fromDate', filter.fromDate);
    if (filter.toDate) params.append('toDate', filter.toDate);

    if (filter.branchIds && Array.isArray(filter.branchIds)) {
        filter.branchIds.forEach(id => params.append('branchIds', id));
    }

    const response = await apiClient.get(`${PATH}/sales-report-export-xslx`, {
        params,
        responseType: "blob",
    });
    return response;
}