import { getAllArchivedProducts, getOneArchivedProduct, patchRestoreArchivedProduct } from "@/services/ArchiveService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useProductArchive = () => {
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

    const fetchAllArchivedProducts = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllArchivedProducts(filter)
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
    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllArchivedProducts();
        }, 0);
        return () => clearTimeout(timer); 
    }, [fetchAllArchivedProducts])

    const fetchArchivedProduct = useCallback(async (archiveId) => {
        try {
            const data = await getOneArchivedProduct(archiveId);
            return data;
        } catch (err) {
            setAsyncState({ error: err });
            throw err;
        }
    }, [])

    const restoreArchivedProduct = useCallback(async (archiveId) => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await patchRestoreArchivedProduct(archiveId);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchAllArchivedProducts();
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: null }));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [fetchAllArchivedProducts])


    return { 
        archivedProducts, 
        asyncState, 
        pagination, 
        filter,
        updateFilter,
        fetchArchivedProduct,
        restoreArchivedProduct
    };
}
