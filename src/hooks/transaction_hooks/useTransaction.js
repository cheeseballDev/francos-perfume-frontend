import { getAllTransactions, getTransactionDetails } from "@/services/TransactionService";
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


    const { filter, updateFilter, resetFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        processedBy: '',
        pageCount: 1,
        pageSize: 10,
    })

    const fetchTransactions = useCallback(() => {
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
      const timer = setTimeout(() => {
        fetchTransactions();
      }, 0);
      return () => clearTimeout(timer);
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

    return { 
        transactions, 
        asyncState, 
        pagination, 
        filter,
        fetchTransactions, 
        updateFilter,
        fetchTransactionDetails,
    }
}