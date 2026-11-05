import { supabase } from "@/lib/SupabaseClient";
import { getAllReplacements, getReplacementFilters } from "@/services/ReplacementService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

const REPLACEMENT_FILTER_SCHEMA = [
    { key: "reasons", label: "Filter: Reason", allLabel: "All Reasons", multiple: false },
    { key: "returnedItemActions", label: "Filter: Returned Item", allLabel: "All Returned Items", multiple: false },
    { key: "branches", label: "Filter: Branches", allLabel: "All Branches", multiple: false },
];

export const useReplacement = () => {
    const isFirstLoad = useRef(true);

    const [replacements, setReplacements] = useState([]);

    const [asyncState, setAsyncState] = useState({
        isLoading: true,
        isFetching: false,
        error: null,
    });

    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalEntries: 0,
    });

    const [filterOptions, setFilterOptions] = useState([]);

    const { filter, updateFilter } = useFilter({
        search: '',
        reasons: '',
        returnedItemActions: '',
        branches: '',
        pageCount: 1,
        pageSize: 10,
    });

    const fetchReplacements = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        try {
            const data = await getAllReplacements(filter);
            isFirstLoad.current = false;
            setReplacements(data?.data ?? []);
            setPagination({
                totalPages: data?.totalReplacementPages || 0,
                totalEntries: data?.totalReplacements || 0,
            });
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false }));
        }
    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReplacements();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchReplacements]);

    useEffect(() => {
        const channel = supabase
            .channel("public:product_replacement")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "product_replacement" },
                () => {
                    fetchReplacements();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchReplacements]);

    const fetchReplacementFilters = useCallback(async () => {
        try {
            const data = await getReplacementFilters();
            setFilterOptions(
                buildFilterOptions(data, REPLACEMENT_FILTER_SCHEMA)
                    .filter((option) => option.options.length > 1)
            );
        } catch {
            setFilterOptions([]);
        }
    }, []);

    useEffect(() => {
        fetchReplacementFilters();
    }, [fetchReplacementFilters]);

    return {
        replacements,
        asyncState,
        pagination,
        filter,
        filterOptions,
        updateFilter,
        fetchReplacements,
    };
};
