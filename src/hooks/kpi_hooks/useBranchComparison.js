import { getBranchComparison } from "@/services/TransactionService";
import { useCallback, useEffect, useState } from "react";

// branchMetrics items: { branchId, branchName, totalRevenue, totalTransactions, totalUnitsSold }
export const useBranchComparison = ({ enabled = true, initialFilter = {} } = {}) => {
    const [branchMetrics, setBranchMetrics] = useState([]);
    const [filter, setFilter] = useState({ fromDate: "", toDate: "", branchIds: [], ...initialFilter });
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

    const updateFilter = (key, value) => setFilter((prev) => ({ ...prev, [key]: value }));

    return { branchMetrics, filter, updateFilter, asyncState, refetch: fetchComparison };
};