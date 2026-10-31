import { getBranchComparison } from "@/services/TransactionService";
import { DEFAULT_PERIOD, getPeriodRange } from "@/utils/periodUtils";
import { useCallback, useEffect, useMemo, useState } from "react";

// branchMetrics items: { branchId, branchName, totalRevenue, totalTransactions, totalUnitsSold }
export const useBranchComparison = ({ enabled = true, initialFilter = {}, initialPeriod = DEFAULT_PERIOD } = {}) => {
    const [branchMetrics, setBranchMetrics] = useState([]);
    const [period, setPeriod] = useState(initialPeriod);
    const [branchIds, setBranchIds] = useState(initialFilter.branchIds ?? []);
    const filter = useMemo(() => ({ ...getPeriodRange(period), branchIds }), [period, branchIds]);
    const [asyncState, setAsyncState] = useState({ isLoading: enabled, error: null });

    const fetchComparison = useCallback(async () => {
        if (!enabled) return;
        setAsyncState({ isLoading: true, error: null });
        try {
            const data = await getBranchComparison(filter);
            setBranchMetrics(data?.branchMetrics ?? []);
            setAsyncState({ isLoading: false, error: null });
        } catch (err) {
            setAsyncState({ isLoading: false, error: err });
        }
    }, [enabled, filter]);

    useEffect(() => {
        fetchComparison();
    }, [fetchComparison]);

    const updateFilter = (key, value) => {
        if (key === "branchIds") setBranchIds(value);
    };

    return { branchMetrics, filter, updateFilter, period, setPeriod, asyncState, refetch: fetchComparison };
};