import { supabase } from "@/lib/SupabaseClient";
import { deleteDiscount, getAllDiscounts, getDiscountDetails, getDiscountFilters, patchToggleDiscountStatus, patchUpdateDiscountDetails, postAddNewDiscount } from "@/services/DiscountService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

const DISCOUNT_FILTER_SCHEMA = [
    { key: "discountStatus", label: "Filter: Status", allLabel: "All Status" },
    { key: "discountType", label: "Filter: Type", allLabel: "All Types" },
];

export const useDiscounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const isFirstLoad = useRef(true);
    const fetchRef = useRef(null);

    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalEntries: 0,
    });

    const [filterOptions, setFilterOptions] = useState({
        discountStatus: [],
        discountType: [],
    });

    const { filter, updateFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        discountStatus: '',
        discountType: '',
        pageCount: 1,
        pageSize: 10,
    });

    const fetchAllDiscounts = useCallback(async () => {
        setAsyncState((prev) => ({
            ...prev,
            [isFirstLoad.current ? "isLoading" : "isFetching"]: true,
            error: null,
        }));

        try {
            const data = await getAllDiscounts(filter);
            isFirstLoad.current = false;
            setDiscounts(data.data);
            setPagination({
                totalPages: data.totalDiscountPages || 0,
                totalEntries: data.totalDiscounts || 0,
            });
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false }));
        }
    }, [filter]);

    useEffect(() => {
        fetchRef.current = fetchAllDiscounts;
    }, [fetchAllDiscounts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllDiscounts();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchAllDiscounts]);

    useEffect(() => {
        let refreshTimer;

        const channel = supabase
            .channel(`discounts-changes-${Math.random().toString(36).slice(2)}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "discounts" },
                () => {
                    clearTimeout(refreshTimer);
                    refreshTimer = setTimeout(() => fetchRef.current?.(), 300);
                }
            )
            .subscribe();

        return () => {
            clearTimeout(refreshTimer);
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDiscount = async (id) => {
        try {
            return await getDiscountDetails(id);
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        }
    };

    const createDiscount = async (dto) => {
        const data = await postAddNewDiscount(dto);
        await fetchAllDiscounts();
        return data;
    };

    const updateDiscount = async (id, dto) => {
        try {
            const data = await patchUpdateDiscountDetails(id, dto);
            await fetchAllDiscounts();
            return data;
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        }
    };

    const removeDiscount = async (id) => {
        try {
            await deleteDiscount(id);
            await fetchAllDiscounts();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        }
    };

    const toggleStatus = useCallback(async (id) => {
        try {
            await patchToggleDiscountStatus(id);
            await fetchAllDiscounts();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        }
    }, [fetchAllDiscounts]);

    const fetchDiscountFilters = useCallback(async () => {
        try {
            const data = await getDiscountFilters();
            setFilterOptions(buildFilterOptions(data, DISCOUNT_FILTER_SCHEMA));
        } catch (err) {
            console.error("Filter load error:", err);
        }
    }, []);

    useEffect(() => {
        fetchDiscountFilters();
    }, [fetchDiscountFilters]);

    return {
        discounts,
        asyncState,
        pagination,
        filter,
        updateFilter,
        filterOptions,
        createDiscount,
        fetchDiscount,
        removeDiscount,
        toggleStatus,
        updateDiscount,
    };
};