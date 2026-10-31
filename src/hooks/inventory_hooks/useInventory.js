import { supabase } from "@/lib/SupabaseClient";
import { getAllInventory, getInventoryBatches, getInventoryFilters, patchUpdateBatch } from "@/services/InventoryService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useInventory = () => {
    const [inventory, setInventory] = useState([]);
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
        branch: '',
        productType: '',
        productGender: '',
        pageCount: 1,
        pageSize: 10,
        stockStatus: 'GOOD'
    });

    const [filterOptions, setFilterOptions] = useState({
        productType: [],
        productGender: [],
        branch: [],
        stockStatus: []
    });

    const INVENTORY_FILTER_SCHEMA = [
      { key: "productType", label: "Filter: Product Type", allLabel: "All Product Types" },
      { key: "productGender", label: "Filter: Product Gender", allLabel: "All Product Genders" },
      { key: "branch", label: "Filter: Branch", allLabel: "All Branches" },
    ]

    const STOCK_FILTER_SCHEMA = {
        key: "stockStatus",
        label: "Filter: Stock Level",
        options: [
            { label: "All Stock Levels", value: ""},
            { label: "Good", value: "GOOD" },
            { label: "Low", value: "LOW" }
        ]
    }

    const fetchInventory = useCallback(async () => {
      if (isFirstLoad.current) {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
      } else {
        setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
      }

      try {
        const data = await getAllInventory(filter);
        isFirstLoad.current = false;
        setInventory(data.data);
        console.log(data.data);
        setPagination({
            totalPages: data.totalInventoriesPages || 0,
            totalEntries: data.totalInventories || 0,
        });
      } catch (err) {
        setAsyncState((prev) => ({ ...prev, error: err }));
      } finally {
        setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
      }
    }, [filter]);

    useEffect(() => {
      const timer = setTimeout(() => {
        fetchInventory();
      }, 300);
      return () => clearTimeout(timer);
    }, [fetchInventory]);

    useEffect(() => {
        const channel = supabase
            .channel("public:inventory")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory" }, 
                () => {
                    fetchInventory();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory_batch_items" }, 
                () => {
                    fetchInventory();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "products" }, 
                () => {
                    fetchInventory();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchInventory]);

    const saveBatchEdit = async (batchId, dto) => {
        try {
            await patchUpdateBatch(batchId, dto);
            await new Promise((resolve) => setTimeout(resolve, 200));
            await fetchInventory();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        }
    }

    const fetchBatchesForProduct = async (productId, branchId) => {
      try {
        const data = await getInventoryBatches(productId, branchId);
        return data.batches;
      } catch (err) {
        setAsyncState((prev) => ({ ...prev, error: err }));;
        throw err;
      }
    };

    // FIXED: Stripped asyncState to prevent Skeleton removal
    const fetchFilters = useCallback(async () => {
        try {
            const data = await getInventoryFilters();
            setFilterOptions([
                ...buildFilterOptions(data, INVENTORY_FILTER_SCHEMA),
                STOCK_FILTER_SCHEMA,
        ]);
        } catch (err) {
            console.error("Filter load error:", err);
        }
    }, []);

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);

    return { 
      inventory, 
      asyncState,
      pagination,
      filter, 
      filterOptions,
      fetchBatchesForProduct, 
      saveBatchEdit, 
      updateFilter
    };
};