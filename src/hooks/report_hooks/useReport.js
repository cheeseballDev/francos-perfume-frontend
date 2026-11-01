import { getSalesReport } from "@/services/TransactionService";
import { DEFAULT_PERIOD, getPeriodRange } from "@/utils/periodUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const REPORTS = {
    bestSellingByRevenue: [],
    bestSellingByUnitsSold: [],
    worstSellingByRevenue: [],
    worstSellingByUnitsSold: [],
};

const withRank = (items) => (items ?? []).map((item, index) => ({ ...item, rank: index + 1 }));

export const useReport = ({ initialPeriod = DEFAULT_PERIOD } = {}) => {
    const [reportData, setReportData] = useState(REPORTS);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [period, setPeriod] = useState(initialPeriod);

    const filter = useMemo(() => ({ ...getPeriodRange(period), branchIds: [] }), [period]);

    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const isFirstLoad = useRef(true);
    const latestRequest = useRef(0);

    const fetchReport = useCallback(async () => {
        const requestId = ++latestRequest.current;

        setAsyncState((prev) => ({
            ...prev,
            [isFirstLoad.current ? "isLoading" : "isFetching"]: true,
            error: null,
        }));

        try {
            const data = await getSalesReport(filter);
            if (requestId !== latestRequest.current) return;

            setReportData({
                bestSellingByRevenue: withRank(data?.top10ByRevenue),
                bestSellingByUnitsSold: withRank(data?.top10ByUnits),
                worstSellingByRevenue: withRank(data?.bottom10ByRevenue),
                worstSellingByUnitsSold: withRank(data?.bottom10ByUnits),
            });
            setTotalRevenue(data?.totalRevenue ?? 0);
        } catch (err) {
            if (requestId !== latestRequest.current) return;
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            if (requestId === latestRequest.current) {
                isFirstLoad.current = false;
                setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false }));
            }
        }
    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(fetchReport, 300);
        return () => clearTimeout(timer);
    }, [fetchReport]);

    return {
        ...reportData,
        totalRevenue,
        asyncState,
        refetch: fetchReport,
        filter,
        period,
        setPeriod,
    };
};
