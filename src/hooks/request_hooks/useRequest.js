import { getAllRequests, getRequestDetails, getRequestFilters } from "@/services/RequestService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useRequest = () => {

    const isFirstLoad = useRef(true);

    const [requests, setRequest] = useState([]);

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
        direction: '',
        pageCount: 1,
        pageSize: 10,
    })

    const [filterOptions, setFilterOptions] = useState([]);

    const REQUEST_FILTER_SCHEMA = [
        { key: "requestStatus", label: "Filter: Status", allLabel: "All Statuses" },
    ]

    const fetchRequests = useCallback(() => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllRequests(filter)
            .then(data => {
                isFirstLoad.current = false;
                setRequest(data.data);

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

    const fetchRequestFilters = useCallback(async () => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getRequestFilters();
            setFilterOptions(buildFilterOptions(data, REQUEST_FILTER_SCHEMA));
            return data;
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchRequestFilters();
    }, [fetchRequestFilters]);

    return { 
        requests, 
        asyncState, 
        pagination, 
        filter,
        fetchRequests, 
        updateFilter,
        filterOptions,
        fetchRequestDetails,
        fetchRequestFilters
    }
}