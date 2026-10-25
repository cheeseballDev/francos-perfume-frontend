import { supabase } from "@/lib/SupabaseClient";
import { getInventoryStockCount, getLowStockKPI, getPendingApprovals, getRecentTransactions, getTotalRevenue, getUpcomingDeliveries } from "@/services/KPIService";
import { useCallback, useEffect, useRef, useState } from "react";

export const useKPI = () => {
    const isFirstLoad = useRef(true);

    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const [kpiData, setKpiData] = useState({
        lowStock: null,
        inventoryStock: null,
        // not used
        pendingRequest: null,
        pendingApprovals: null,
        upcomingDeliveries: null,
        totalRevenue: null,
        totalTransactions: null,
    });

    const fetchAllKPIs = useCallback(async (isBackground = false) => {
        if (!isBackground && isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        try {
            const [
                lowStock,
                inventoryStock,
                pendingApprovals,
                upcomingDeliveries,
                totalRevenue,
                totalTransactions,
            ] = await Promise.all([
                getLowStockKPI(),
                getInventoryStockCount(),
                getPendingApprovals(),
                getUpcomingDeliveries(),
                getTotalRevenue(),
                getRecentTransactions(),
            ]);

            setKpiData({
                lowStock,
                inventoryStock,
                pendingApprovals,
                upcomingDeliveries,
                totalRevenue,
                totalTransactions,
            });

            isFirstLoad.current = false;
            
        } catch (err) {
            console.error("Failed to load KPIs:", err);
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false }));
        }
    }, []);

    const debounceTimer = useRef(null);

    useEffect(() => {
        fetchAllKPIs();
        
        const scheduleRefresh = () => {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => fetchAllKPIs(true), 2000);
        };

        const tables = [
            "inventory_batch_items",
            "inventory",
            "sales_order",
            "request",
            "request_approval",
            "delivery",
        ]

        let channel = supabase.channel("public:kpi-updates");
        tables.forEach((table) => {
            channel = channel.on(
                "postgres_changes",
                { event: "*", schema: "public", table},
                scheduleRefresh
            );;
        });

        channel.subscribe();
        
        return () => {
            clearTimeout(debounceTimer.current);
            supabase.removeChannel(channel);
        };

    }, [fetchAllKPIs]);

    return {
        ...kpiData,
        asyncState,
        refetchKPIs: () => fetchAllKPIs(true),
    };
};
