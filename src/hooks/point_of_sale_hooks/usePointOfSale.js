import { supabase } from "@/lib/SupabaseClient";
import { getAllPOSProducts, getPOSFilters } from "@/services/PointOfSaleService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const usePointOfSale = () => {
    const [products, setProducts] = useState([]);
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

    const [filterOptions, setFilterOptions] = useState({
        productType: [],
        productGender: [],
    });

    const PRODUCT_FILTER_SCHEMA = [
        { key: "productType", label: "Filter: Type", allLabel: "All Types" },
        { key: "productGender", label: "Filter: Gender", allLabel: "All Gender" },
    ]


    const { filter, updateFilter, resetFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        productType: '',
        productGender: '',
        pageCount: 1,
        pageSize: 10,
    });

    const fetchAllPOSProducts = useCallback(async () => {
        if (isFirstLoad.current) {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
      } else {
        setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
      }

      getAllPOSProducts(filter)
        .then(data => {
            isFirstLoad.current = false;
            
            setProducts(data.data);
            setPagination({
                totalPages: data.totalProductsPages || 0,
                totalEntries: data.totalProducts || 0,
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
            fetchAllPOSProducts();
        }, 300); 

        return () => clearTimeout(timer);
    }, [fetchAllPOSProducts]);

    useEffect(() => {
        const channel = supabase
            .channel("public:pos-inventory-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory" }, 
                () => {
                    fetchAllPOSProducts();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inventory_batch_items" }, 
                () => {
                    fetchAllPOSProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAllPOSProducts]);

    const fetchProductFilters = useCallback(async () => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getPOSFilters();
            setFilterOptions(buildFilterOptions(data, PRODUCT_FILTER_SCHEMA));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchProductFilters();
    }, [fetchProductFilters]);

    return { 
        products, 
        asyncState,
        pagination,
        filter, 
        updateFilter,
        filterOptions,
        fetchAllPOSProducts 
    }; 
}