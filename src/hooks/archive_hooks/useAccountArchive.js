import { useAuth } from "@/auth/UseAuth";
import { getAllArchivedAccounts } from "@/services/ArchiveService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useAccountArchive = () => {
    const { user } = useAuth();
    const [archivedAccounts, setArchivedAccounts] = useState([]);
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

    const { filter, updateFilter, resetFilter }= useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        role: '',
        branch: '',
        pageCount: 1,
        pageSize: 10,
    });

    const fetchArchivedAccounts = useCallback(() => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllArchivedAccounts(filter, user?.accessToken)
            .then(data => {
                isFirstLoad.current = false;
                setArchivedAccounts(data.data);
                setPagination({
                    totalPages: data.totalAccountsPages || 0,
                    totalEntries: data.totalAccounts || 0,
                })
            })
            .catch((err) => {
                setAsyncState((prev) => ({ ...prev, error: err }));
                throw err;
            })
            .finally(() => {
                setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
            });
    }, [filter, user?.accessToken]);

    useEffect(() => {
        if (!user?.accessToken) {
            return;
        }
        const timer = setTimeout(() => {
            fetchArchivedAccounts();
        }, 0);
        return () => clearTimeout(timer); 
    }, [fetchArchivedAccounts, user?.accessToken])


    return { 
        archivedAccounts,
        asyncState, 
        pagination, 
        filter,
        updateFilter,
        fetchArchivedAccounts,     
    };
}
