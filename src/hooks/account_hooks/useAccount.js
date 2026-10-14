import { getAccountFilters, getAllAccounts, getOneAccountDetails, patchResetAccountPassword, patchToggleAccountStatus, patchUpdateAccountDetails, postAddNewAccount } from "@/services/AccountService";
import { patchArchiveAccount } from "@/services/ArchiveService";
import { buildFilterOptions } from "@/utils/formattingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFilter } from "../useFilter";

export const useAccount = () => {
    const [accounts, setAccounts] = useState([]);
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

    const { filter, updateFilter, resetFilter, setFilter } = useFilter({
        search: '',
        fromDate: '',
        toDate: '',
        branchLocation: '',
        accountStatus: '',
        employeeRole: '',
        employeeShift: '',
        pageCount: 1,
        pageSize: 10,
    });

    const [filterOptions, setFilterOptions] = useState({
        accountStatus: [],
        employeeRole: [],
        employeeShift: [],
        branchLocation: [],
    });

    const ACCOUNT_FILTER_SCHEMA = [
        { key: "employeeRole", label: "Filter: Role", allLabel: "All Roles" },
        { key: "accountStatus", label: "Filter: Status", allLabel: "All Statuses" },
        { key: "branchLocation", label: "Filter: Branch", allLabel: "All Branches" },
        { key: "employeeShift", label: "Filter: Shift", allLabel: "All Shifts" },
    ]

    const fetchAllAccounts = useCallback(async () => {
        if (isFirstLoad.current) {
            setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        } else {
            setAsyncState((prev) => ({ ...prev, isFetching: true, error: null }));
        }

        getAllAccounts(filter)
            .then(data => {
                isFirstLoad.current = false;
                setAccounts(data.data);
                setPagination({
                    totalPages: data.totalEmployeesPages || 0,
                    totalEntries: data.totalEmployees || 0,
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
        const timer = setTimeout(async () => {
        await fetchAllAccounts();
        }, 0);
        return () => clearTimeout(timer); 
    }, [fetchAllAccounts])

    const fetchAccountDetails = useCallback(async (employeeId) => {
        try {
            const data = await getOneAccountDetails(employeeId);
            return data;
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [])

    const updateAccount = async (accountId, dto) => {
        try {
            await patchUpdateAccountDetails(accountId, dto);
            await fetchAllAccounts();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const createAccount = async (dto) => {
        try {
            const data = await postAddNewAccount(dto);
            await fetchAllAccounts();
            return data;
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const updatePassword = async (accountId) => {
        // TO BE ADDED
    };

    const updateAuth = (accountId) => {
        // TO BE ADDED
    };


    const resetPassword = useCallback(async (accountId) => {
        try {
            await patchResetAccountPassword(accountId);
            await fetchAllAccounts();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [fetchAllAccounts]);

    const toggleAccountStatus = useCallback(async (accountId) => {
        try {
            await patchToggleAccountStatus(accountId);
            await fetchAllAccounts();
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [fetchAllAccounts]);

    const archiveAccount = useCallback(async (accountId) => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await patchArchiveAccount(accountId);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchAllAccounts();
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: null }));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, isLoading: false, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [fetchAllAccounts]);

    const fetchAccountFilters = useCallback(async () => {
        setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await getAccountFilters();
            setFilterOptions(buildFilterOptions(data, ACCOUNT_FILTER_SCHEMA));
        } catch (err) {
            setAsyncState((prev) => ({ ...prev, error: err }));
            throw err;
        } finally {
            setAsyncState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchAccountFilters();
    }, [fetchAccountFilters]);

    return { 
        accounts, 
        asyncState,
        pagination,
        filter,
        updateFilter,
        fetchAccount: fetchAccountDetails,
        archive: archiveAccount,
        toggleStatus: toggleAccountStatus,
        resetPassword,
        filterOptions,
        updateAccount,
        createAccount,
        fetchAllAccounts,
    };
}