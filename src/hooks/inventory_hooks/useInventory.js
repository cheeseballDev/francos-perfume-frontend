import { getAllInventory, getInventoryBatches, getInventoryFilters, updateBatch } from "@/services/InventoryService";
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
    });

    const [filterOptions, setFilterOptions] = useState({
        productType: [],
        productGender: [],
        branch: [],
    });

    const INVENTORY_FILTER_SCHEMA = [
      { key: "productType", label: "Filter: Product Type", allLabel: "All Product Types" },
      { key: "productGender", label: "Filter: Product Gender", allLabel: "All Product Genders" },
      { key: "branch", label: "Filter: Branch", allLabel: "All Branches" },
    ]

    const fetchInventory = useCallback(() => {
      if (isFirstLoad.current) {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
      } else {
        setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
      }

      getAllInventory(filter)
        .then(data => {
          isFirstLoad.current = false;

          setInventory(data.data);

          setPagination({
              totalPages: data.totalInventoriesPages || 0,
              totalEntries: data.totalInventories || 0,
          });
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
        fetchInventory();
      }, 0);
      return () => clearTimeout(timer);
    }, [fetchInventory]);

    const saveBatchEdit = async (batchId, dto) => {
        try {
            await updateBatch(batchId, dto);
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

    const fetchFilters = useCallback(async () => {
      setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getInventoryFilters();
            setFilterOptions(buildFilterOptions(data, INVENTORY_FILTER_SCHEMA));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
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