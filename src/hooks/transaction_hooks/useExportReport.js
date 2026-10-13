import { useCallback, useState } from "react";
import { getExcel, getPdf } from "../../services/TransactionService";

export const useExportReport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isError, setIsError] = useState(false);

    const getFilename = (response, defaultName) => {
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                return filenameMatch[1].replace(/['"]/g, "").trim();
            }
        }
        return defaultName;
    }

    const triggerDownload = (blob, filename) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    };


    const exportExcel = useCallback(async () => {
        setIsExporting(true);
        setIsError(null);
        try {
            const response = await getExcel();
            const filename = getFilename(response, "Transaction_List.xlsx");
            triggerDownload(response.data, filename);
        } catch (err) {
            setIsError(err)
            throw err;
        } finally {
            setIsExporting(false);
        }
    }, []);

    const exportPdf = useCallback(async () => {
        setIsExporting(true);
        setIsError(null);
        try {
            const response = await getPdf();
            const filename = getFilename(response, "Transaction_List.pdf");
        triggerDownload(response.data, filename);
        } catch (err) {
            setIsError(err);
            throw err;
        } finally {
        setIsExporting(false);
        }
    }, []);

    return { exportExcel, exportPdf, isExporting, isError };
};