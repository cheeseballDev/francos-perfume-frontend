import { useAuth } from "@/auth/UseAuth";
import { getAllArchivedProducts } from "@/services/ArchiveService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useProductArchive = () => {
    const { user } = useAuth();
    const [archivedProducts, setArchivedProducts] = useState([]);
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
        pageCount: 1,
        pageSize: 10,
    })

    const fetchArchivedProducts = useCallback(() => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllArchivedProducts(filter, user?.accessToken)
            .then(data => {
                isFirstLoad.current = false;
                setArchivedProducts(data.data);

                setPagination({
                    totalPages: data.totalProductsPages || 0,
                    totalEntries: data.totalProducts || 0,
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
            fetchArchivedProducts();
        }, 0);
        return () => clearTimeout(timer); 
    }, [fetchArchivedProducts, user?.accessToken])


    return { 
        archivedProducts, 
        asyncState, 
        pagination, 
        filter,
        updateFilter,
        fetchArchivedProducts, 
    };
}
