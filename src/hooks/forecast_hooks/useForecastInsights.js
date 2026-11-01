import { postForecastInsights } from "@/services/ForecastService";
import { getAPIError } from "@/utils/apiErrorUtils";
import { useCallback, useRef, useState } from "react";

export const useForecastInsights = () => {
    const [result, setResult] = useState(null);
    const [params, setParams] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const latestRequest = useRef(0);

    const fetchInsights = useCallback(async ({ year, month, productId, branchId }, { refresh = false } = {}) => {
        const request = {
            year: Number(year),
            month: Number(month),
            productId: Number(productId),
            branchId: Number(branchId),
        };
        const requestId = ++latestRequest.current;

        setIsLoading(true);
        setError(null);
        setParams(request);

        try {
            const data = await postForecastInsights({ ...request, refresh });
            if (requestId !== latestRequest.current) return;
            setResult(data);
        } catch (err) {
            if (requestId !== latestRequest.current) return;
            setResult(null);
            setError(getAPIError(err, "Couldn't load AI insights right now."));
        } finally {
            if (requestId === latestRequest.current) setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        latestRequest.current++;
        setResult(null);
        setParams(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        result,
        params,
        isLoading,
        error,
        fetchInsights,
        refresh: () => params && fetchInsights(params, { refresh: true }),
        reset,
    };
};
