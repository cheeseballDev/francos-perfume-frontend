import { postForecastRevenue, postForecastStocks } from "@/services/ForecastService";
import { getRequestFilters } from "@/services/RequestService";
import { useCallback, useEffect, useRef, useState } from "react";

const buildStockRequest = ({ year, month, productId, branchId }) => ({
    year,
    month,
    productId: Number(productId),
    branchId: Number(branchId)
});

const buildRevenueRequest = ({ year, month, discountPercent = 0, discountAmount = 0, hasDiscount = false, isPercentageDiscount = false, branchId }) => ({
    year,
    month,
    discountPercent,
    discountAmount,
    hasDiscount,
    isPercentageDiscount,
    branchId: Number(branchId)
});

// Backend failures come back as 400 { message }, network errors have no response
const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (typeof data === "string" && data.trim()) return data;
    return err?.message || "Something went wrong while generating the forecast.";
};

export const useForecast = () => {
    const [asyncState, setAsyncState] = useState({
        isLoading: true,   // loading the branch/product dropdowns
        isFetching: false, // a forecast request is running
        error: null,       // string
    });

    const [forecastData, setForecastData] = useState({
        stocks: null,
        revenue: null,
    });

    const [branchOptions, setBranchOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    const latestRequest = useRef(0);

    useEffect(() => {
        getRequestFilters()
            .then((data) => {
                if (!data) return;
                setBranchOptions((data.branches || [])
                    .filter((b) => b.branchId !== 1)
                    .map((b) => ({ value: b.branchId, label: b.branchLocation })));
                setProductOptions((data.products || [])
                    .map((p) => ({ value: p.productId, label: p.productName })));
            })
            .catch((err) => setAsyncState((prev) => ({ ...prev, error: getErrorMessage(err) })))
            .finally(() => setAsyncState((prev) => ({ ...prev, isLoading: false })));
    }, []);

    /**
     * Runs the ML.NET stock forecast and the revenue forecast.
     * One failing does not throw away the other.
     *
     * @returns {{ ok: boolean, stocksOk: boolean, error: string | null }}
     */
    const fetchForecast = useCallback(async (dto) => {
        if (!dto.branchId || !dto.productId) {
            return { ok: false, stocksOk: false, error: "Select a branch and a product first." };
        }

        const requestId = ++latestRequest.current;

        setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));

        const [stockResult, revenueResult] = await Promise.allSettled([
            postForecastStocks(buildStockRequest(dto)),
            postForecastRevenue(buildRevenueRequest(dto)),
        ]);

        if (requestId !== latestRequest.current) {
            return { ok: false, stocksOk: false, error: null };
        }

        setForecastData({
            stocks: stockResult.status === "fulfilled" ? stockResult.value : null,
            revenue: revenueResult.status === "fulfilled" ? revenueResult.value : null,
        });

        const errors = [];
        if (stockResult.status === "rejected") {
            errors.push(`Stock forecast: ${getErrorMessage(stockResult.reason)}`);
        }
        if (revenueResult.status === "rejected") {
            errors.push(`Revenue forecast: ${getErrorMessage(revenueResult.reason)}`);
        }

        const error = errors.length ? errors.join(" | ") : null;
        setAsyncState((prev) => ({ ...prev, isFetching: false, error }));

        return { ok: !error, stocksOk: stockResult.status === "fulfilled", error };
    }, []);

    return {
        forecastData,
        asyncState,
        fetchForecast,
        branchOptions,
        productOptions
    };
};
