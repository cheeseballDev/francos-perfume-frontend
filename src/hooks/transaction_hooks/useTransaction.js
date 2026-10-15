import { supabase } from "@/lib/SupabaseClient";
import { getAllTransactions, getTransactionDetails, getTransactionFilters } from "@/services/TransactionService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";


export const useTransaction = () => {
    const isFirstLoad = useRef(true);

    const [transactions, setTransaction] = useState([]);

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
        branches: [],
        employees: [],
        paymentMethods: [],
    });

    const TRANSACTION_FILTER_SCHEMA = [
        { key: "branches", label: "Filter: Branches", allLabel: "All Branches" },
        { key: "employees", label: "Filter: Processed By", allLabel: "All Employees" },
        { key: "paymentMethods", label: "Filter: Payment Method", allLabel: "All Payment Methods" },
    ]


    const { filter, updateFilter, resetFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        branches: '',
        employees: '',
        paymentMethods: '',
        pageCount: 1,
        pageSize: 10,
    })



    const fetchTransactions = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllTransactions(filter)
            .then(data => {
                isFirstLoad.current = false;
                setTransaction(data.data);

                setPagination({
                    totalPages: data.totalTransactionPages || 0,
                    totalEntries: data.totalTransactions || 0,
                })
            })
        .catch((err) => {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        })
        .finally(() => {
            setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
        });
    }, [filter])

    useEffect(() => {
        const channel = supabase
            .channel("public:sales_order")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "sales_order" }, 
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTransactions]);

    const fetchTransactionDetails = useCallback(async (transactionId) => {
        try {
            const data = await getTransactionDetails(transactionId);
            return data;
        } catch (err) {
            setAsyncState({ error: err });
            throw err;
        }
    }, []) 

    const fetchTransactionFilters = useCallback(async () => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getTransactionFilters();
            setFilterOptions(buildFilterOptions(data, TRANSACTION_FILTER_SCHEMA));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchTransactionFilters();
    }, [fetchTransactionFilters]);

    return { 
        transactions, 
        asyncState, 
        pagination, 
        filter,
        filterOptions,
        fetchTransactions, 
        updateFilter,
        fetchTransactionDetails,
    }
}