import { useAuth } from "@/auth/UseAuth";
import { getAllAuditLogs, getOneAuditLogDetails } from "@/services/AuditLogService";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useAuditLog = () => {
    const { user } = useAuth();
    const [auditLogs, setAuditLogs] = useState([]);
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
        module: '',
        pageCount: 1,
        pageSize: 10,
    })

    const fetchAuditLogs = useCallback(() => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }


        getAllAuditLogs(filter)
            .then(data => {
                isFirstLoad.current = false;
                setAuditLogs(data.data);

                setPagination({
                    totalPages: data.totalAuditPages || 0,
                    totalEntries: data.totalAuditLogs || 0,
                });
            })
            .catch((err) => {
                setAsyncState((prev) => ({ ...prev, error: err }));
            })
            .finally(() => {
                setAsyncState((prev) => ({ ...prev, isLoading: false, isFetching: false}));
            });

    }, [filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAuditLogs();
        }, 0);
        return () => clearTimeout(timer); 
    }, [fetchAuditLogs]);

    const fetchAuditLogDetails = useCallback(async (logId) => {
        try {
            const data = await getOneAuditLogDetails(logId);
            return data;
        } catch (err) {
            setAsyncState({ error: err });
            throw err;
        }
    }, []);

    return { 
        auditLogs, 
        asyncState, 
        pagination, 
        filter, 
        fetchAuditLogs, 
        updateFilter,
        fetchAuditLogDetails
    };

}
