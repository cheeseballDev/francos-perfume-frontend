import { postForecastRevenue, postForecastStocks, postForecastStocksAI } from "@/services/ForecastService";
import { getRequestFilters } from "@/services/RequestService";
import { useCallback, useEffect, useRef, useState } from "react";

const buildStockRequest = ({ year, month, productId, branchId }) => ({ 
    year, 
    month, 
    productId: Number(productId), 
    branchId: Number(branchId) 
});

const buildRevenueRequest = ({ year, month, discountPercent, discountAmount, hasDiscount, isPercentageDiscount, branchId }) => ({
    year,
    month,
    discountPercent,
    discountAmount,
    hasDiscount,
    isPercentageDiscount,
    branchId: Number(branchId)
});

export const useForecast = () => {
    const isFirstLoad = useRef(true);

    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const [forecastData, setForecastData] = useState({
        stocks: null,
        revenue: null,
        ai: null,
    });

    const [branchOptions, setBranchOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    useEffect(() => {
        getRequestFilters().then(data => {
            if (data) {
                setBranchOptions((data.branches || [])
                        .filter(b => b.branchId !== 1)
                        .map(b => ({
                            value: b.branchId,
                            label: b.branchLocation
                        }))
                );
                setProductOptions((data.products || []).map(p => ({
                    value: p.productId,
                    label: p.productName
                })));
            }
        }).catch(err => console.error("Failed to load options", err));
    }, []);

    const fetchForecast = useCallback(async (dto) => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        try {
            // Prevent AI API crash by only calling endpoints if required parameters exist
            const [stocks, revenue, ai] = await Promise.all([
                dto.productId && dto.branchId ? postForecastStocks(buildStockRequest(dto)) : Promise.resolve(null),
                dto.branchId ? postForecastRevenue(buildRevenueRequest(dto)) : Promise.resolve(null),
                dto.productId && dto.branchId ? postForecastStocksAI(buildStockRequest(dto)) : Promise.resolve(null),
            ]);

            isFirstLoad.current = false;
            setForecastData({ stocks, revenue, ai });
            return { stocks, revenue, ai };
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false }));
        }
    }, []);

    useEffect(() => {
        const now = new Date();
        fetchForecast({
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            productId: 0, 
            branchId: 0,
            discountPercent: 0,
            discountAmount: 0,
            hasDiscount: false,
            isPercentageDiscount: false,
        }).catch(() => { /* surfaced via asyncState.error */ });
    }, [fetchForecast]);

    return {
        forecastData,
        asyncState,
        fetchForecast,
        branchOptions,
        productOptions
    };
};