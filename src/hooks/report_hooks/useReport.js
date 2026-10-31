import { useAuth } from "@/auth/UseAuth";
import { getSalesReport } from "@/services/TransactionService";
import { useCallback, useEffect, useRef, useState } from "react";

const REPORTS = {
    bestSellingByRevenue: [],
    bestSellingByUnitsSold: [],
    worstSellingByRevenue: [],
    worstSellingByUnitsSold: [],
};

const withRank = (items) => (items ?? []).map((item, index) => ({ ...item, rank: index + 1 }));

export const useReport = () => {
    const { user } = useAuth(); 
    const [reportData, setReportData] = useState(REPORTS);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const [filter, setFilter] = useState({
        fromDate: "",
        toDate: "",
        branchIds: [],
    });

    useEffect(() => {
        setFilter(prev => ({
            ...prev,
            branchIds: user.branchId,
        }));
    }, [user])

    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const isFirstLoad = useRef(true);

    const fetchReport = useCallback(async () => {

        setAsyncState((prev) => ({
            ...prev,
            [isFirstLoad.current ? "isLoading" : "isFetching"]: true,
            error: null,
        }));

        try {
            const data = await getSalesReport(filter);

            setReportData({
                bestSellingByRevenue: withRank(data?.top10ByRevenue),
                bestSellingByUnitsSold: withRank(data?.top10ByUnits),
                worstSellingByRevenue: withRank(data?.bottom10ByRevenue),
                worstSellingByUnitsSold: withRank(data?.bottom10ByUnits),
            });
            setTotalRevenue(data?.totalRevenue ?? 0);
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            isFirstLoad.current = false;
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false }));
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchReport, 300);
        return () => clearTimeout(timer);
    }, [fetchReport]);

    /*
        filter,
        updateFilter,
        resetFilter,
    */

    return {
        ...reportData,
        totalRevenue,
        asyncState,
        refetch: fetchReport,
        filter,
    };
};