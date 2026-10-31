import { useCallback, useRef, useState } from "react";

/**
 * The selected row of a DataTable, with its details loaded from the backend.
 *
 *   const { selected, setSelected, toggleRow, selectRow } =
 *       useRowSelection("employeeId", (id) => fetchAccountDetails(id));
 *
 *   <DataTable selectedItem={selected} onRowClick={toggleRow}
 *              onRowDoubleClick={(row) => { selectRow(row); setIsModalOpen(true); }} />
 *
 * - The row is selected right away; its details are merged in when they arrive.
 * - Details that arrive late (the user already picked another row, or deselected)
 *   are dropped instead of being merged into the wrong row.
 * - toggleRow: click → select, or deselect when the row is already selected.
 * - selectRow: always selects (used on double-click, which must never deselect).
 * - setSelected: the plain setter, e.g. setSelected(null) after archiving.
 */
export const useRowSelection = (keyField, fetchDetails = null) => {
    const [selected, setSelected] = useState(null);
    const latestKey = useRef(null);

    const loadRow = useCallback(async (row) => {
        const key = row?.[keyField];
        latestKey.current = key;
        setSelected(row);

        if (!fetchDetails || key === undefined || key === null) return;

        try {
            const details = await fetchDetails(key, row);
            // Only merge if this row is still the selected one
            if (details && latestKey.current === key) {
                setSelected((prev) => (prev && prev[keyField] === key ? { ...prev, ...details } : prev));
            }
        } catch {
            // the fetch hooks already record their own errors; the basic row data stays shown
        }
    }, [keyField, fetchDetails]);

    const toggleRow = useCallback((row) => {
        if (selected && selected[keyField] === row?.[keyField]) {
            latestKey.current = null;
            setSelected(null);
            return;
        }
        loadRow(row);
    }, [selected, keyField, loadRow]);

    const selectRow = useCallback((row) => {
        if (selected && selected[keyField] === row?.[keyField]) return; // already selected
        loadRow(row);
    }, [selected, keyField, loadRow]);

    return { selected, setSelected, toggleRow, selectRow };
};
