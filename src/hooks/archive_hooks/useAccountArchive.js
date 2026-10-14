import { getAllArchivedAccounts, getOneArchivedAccount, patchRestoreArchivedAccount } from "@/services/ArchiveService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useAccountArchive = () => {
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

    const fetchAllArchivedAccounts = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllArchivedAccounts(filter)
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
    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllArchivedAccounts();
        }, 0);
        return () => clearTimeout(timer); 
    }, [fetchAllArchivedAccounts])

    const fetchArchivedAccount = useCallback(async (archiveId) => {
        try {
            const data = await getOneArchivedAccount(archiveId);
            return data;
        } catch (err) {
            setAsyncState({ error: err });
            throw err;
        }
    }, [])

    const restoreArchivedAccount = useCallback(async (archiveId) => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await patchRestoreArchivedAccount(archiveId);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchAllArchivedAccounts();
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: null }));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [fetchAllArchivedAccounts])



    return { 
        archivedAccounts,
        asyncState, 
        pagination, 
        filter,
        updateFilter,
        fetchArchivedAccount,
        restoreArchivedAccount,
    };
}
