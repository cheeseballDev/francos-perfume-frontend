import { getAllDeliveries, getDeliveryDetails, getDeliveryFilters } from "@/services/DeliveryService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

const DELIVERY_FILTER_SCHEMA = [
    { key: "fromBranches", label: "Filter: From Branch", allLabel: "All 'From Branch'" },
    { key: "toBranches", label: "Filter: To Branch", allLabel: "All 'To Branch'" },
    { key: "status", label: "Filter: Status", allLabel: "All Status" },
];

export const useDelivery = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [pendingDispatchCount, setPendingDispatchCount] = useState(0);
    const [pendingDispatchInboundCount, setPendingDispatchInboundCount] = useState(0);
    const [pendingDispatchOutboundCount, setPendingDispatchOutboundCount] = useState(0);
    const [incompleteOutboundDeliveriesCount, setIncompleteOutboundDeliveriesCount] = useState(0);
    const [incompleteInboundDeliveriesCount, setIncompleteInboundDeliveriesCount] = useState(0);
    const [inboundDeliveriesCount, setInboundDeliveriesCount] = useState(0);
    const [outboundDeliveriesCount, setOutboundDeliveriesCount] = useState(0);
    const [completedInboundDeliveriesCount, setCompletedInboundDeliveriesCount] = useState(0);
    const [completedOutboundDeliveriesCount, setCompletedOutboundDeliveriesCount] = useState(0);

    const isFirstLoad = useRef(true);

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
        fromBranches: '',
        toBranches: '',
        status: '',
        direction: '',
        pageCount: 1,
        pageSize: 10,
    });

    const [filterOptions, setFilterOptions] = useState({
        fromBranches: [],
        toBranches: [],
        status: [],
    });

    const fetchDeliveries = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllDeliveries(filter)
            .then(data => {
                isFirstLoad.current = false;
                setDeliveries(data.data);
                setPagination({
                    totalPages: data.totalDeliveryPages || 0,
                    totalEntries: data.totalDeliveries || 0,
                });

                setPendingDispatchCount(data.pendingDispatchCount || 0);
                setPendingDispatchInboundCount(data.pendingDispatchInboundCount || 0);
                setPendingDispatchOutboundCount(data.pendingDispatchOutboundCount || 0);
                setIncompleteOutboundDeliveriesCount(data.incompleteOutboundDeliveriesCount || 0);
                setIncompleteInboundDeliveriesCount(data.incompleteInboundDeliveriesCount || 0);
                setInboundDeliveriesCount(data.inboundDeliveriesCount || 0);
                setOutboundDeliveriesCount(data.outboundDeliveriesCount || 0);
                setCompletedInboundDeliveriesCount(data.completedInboundDeliveriesCount || 0);
                setCompletedOutboundDeliveriesCount(data.completedOutboundDeliveriesCount || 0);

            })
            .catch((err) => {
                setAsyncState((prev) => ({ ...prev, error: err }));
                throw err;
            })
            .finally(() => {
                setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
            });

    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDeliveries();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchDeliveries])

    const fetchDeliveryDetails = useCallback(async (deliveryId) => {
        try {
            const data = await getDeliveryDetails(deliveryId);
            return data;
        } catch (err) {
            setAsyncState({ error: err });
            throw err;
        }
    }, []);

    // FIXED: Removed asyncState overrides
    const fetchDeliveryFilters = useCallback(async () => {
        try {
            const data = await getDeliveryFilters();
            setFilterOptions(buildFilterOptions(data, DELIVERY_FILTER_SCHEMA));
            return data;
        } catch (err) {
            console.error("Filter load error:", err);
        }
    }, []);

    useEffect(() => {
        fetchDeliveryFilters();
    }, [fetchDeliveryFilters]);

    return {
        deliveries,
        pendingDispatchCount,
        pendingDispatchInboundCount,
        pendingDispatchOutboundCount,
        incompleteOutboundDeliveriesCount,
        incompleteInboundDeliveriesCount,
        inboundDeliveriesCount,
        outboundDeliveriesCount,
        completedInboundDeliveriesCount,
        completedOutboundDeliveriesCount,
        asyncState,
        pagination,
        filter,
        updateFilter,
        resetFilter,
        filterOptions,
        fetchDeliveries,
        fetchDeliveryDetails,
        fetchDeliveryFilters
    };
}