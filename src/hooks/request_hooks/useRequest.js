import { supabase } from "@/lib/SupabaseClient";
import { getAllRequests, getRequestDetails, getRequestFilters } from "@/services/RequestService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

const REQUEST_FILTER_SCHEMA = [
    { key: "fromBranches", label: "Filter: From Branch", allLabel: "All 'From Branch'", multiple: false },
    { key: "toBranches", label: "Filter: To Branch", allLabel: "All 'To Branch'", multiple: false },
    { key: "requestStatus", label: "Filter: Status", allLabel: "All Statuses" },
    { key: "requestStages", label: "Filter: Stage", allLabel: "All Stages" },
]

export const useRequest = () => {

    const isFirstLoad = useRef(true);

    const [requests, setRequest] = useState([]);
    const [requestCounts, setRequestCounts] = useState({
        pending: 0,
        pendingInbound: 0,
        pendingOutbound: 0,
        pendingDispatch: 0,
        pendingDispatchInbound: 0,
        pendingDispatchOutbound: 0,
        completed: 0,
    });
    const [branchOptions, setBranchOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
   
    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalEntries: 0,
    });

    const { filter, updateFilter, resetFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        requestStatus: '',
        fromBranches: '',
        toBranches: '',
        requestStages: '',
        direction: '',
        pageCount: 1,
        pageSize: 10,
    })

    const [filterOptions, setFilterOptions] = useState({
        fromBranches: [],
        toBranches: [],
        requestStatus: [],
        requestStages: [],
    });

    const fetchRequests = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllRequests(filter)
            .then(data => {
                isFirstLoad.current = false;
                setRequest(data.data);
                setRequestCounts({
                    pending: data.pendingRequestsCount || 0,
                    pendingInbound: data.pendingInboundRequestsCount || 0,
                    pendingOutbound: data.pendingOutboundRequestsCount || 0,
                    pendingDispatch: data.pendingDispatchRequestsCount || 0,
                    pendingDispatchInbound: data.pendingInboundDispatchRequestsCount || 0,
                    pendingDispatchOutbound: data.pendingOutboundDispatchRequestsCount || 0,
                    completed: data.completedRequestCount || 0,
                });

                setPagination({
                    totalPages: data.totalRequestPages || 0,
                    totalEntries: data.totalRequests || 0,
                })
            })
        .catch((err) => {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        })
        .finally(() => {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
        });
    }, [filter]);

    const fetchRequestDetails = useCallback(async (requestId) => {
        try {
            const data = await getRequestDetails(requestId);
            return data;
        } catch (err) {
            setAsyncState({ error: err });
            throw err;
        }
    }, [])

    useEffect(() => {
      const timer = setTimeout(() => {
        fetchRequests();
      }, 0);
      return () => clearTimeout(timer);
    }, [fetchRequests]);

    useEffect(() => {
        const channel = supabase
            .channel("public:request")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "request" }, 
                () => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchRequests]);

    // FIXED: Removed asyncState overrides
    const fetchRequestFilters = useCallback(async () => {
        try {
            const data = await getRequestFilters();
            setFilterOptions(buildFilterOptions(data, REQUEST_FILTER_SCHEMA));
            return data;
        } catch (err) {
            console.error("Filter load error:", err);
        }
    }, []);

    useEffect(() => {
        fetchRequestFilters();
    }, [fetchRequestFilters]);

    const fetchBranches = useCallback(async () => {
        try {
            const raw = await getRequestFilters();
            if (!raw) return;
            setBranchOptions((raw.branches || []).map(branch => ({
                value: branch.branchId,
                label: branch.branchLocation,
            })));
        } catch (err) {
            console.error("Failed to fetch branches", err);
        }
    }, []);

    const fetchProductsByBranch = useCallback(async (branchId) => {
        if (!branchId) {
            setProductOptions([]);
            return;
        }
        try {
            const raw = await getRequestFilters(branchId);
            if (!raw) return;
            setProductOptions((raw.products || []).map(p => ({
                value: p.productId,
                label: p.productName,
                availableQty: p.productQty || 0,
            })));
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    }, []);

    return { 
        requests, 
        requestCounts,
        asyncState, 
        pagination, 
        filter,
        fetchRequests, 
        updateFilter,
        filterOptions,
        fetchRequestDetails,
        fetchRequestFilters,
        branchOptions,
        productOptions,
        fetchBranches,
        fetchProductsByBranch,
    }
}