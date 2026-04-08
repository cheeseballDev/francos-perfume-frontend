import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Use the local shadcn Button instead of the Radix UI themes one
// so variants (ghost, outline) and sizes (icon-sm) resolve correctly.
import { Button } from "@/components/ui/button";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   InventoryTable
   A self-contained table component that handles sorting AND pagination.

   Props:
     data     — filtered array of inventory items from InventoryPage
     columns  — TanStack column definition array from InventoryPage
     onIncrease / onDecrease — callbacks to mutate qty in parent state
     onEdit   — callback to open the edit modal in parent
   ───────────────────────────────────────────────────────────────────────── */
const InventoryTable = ({ data, columns, onIncrease, onDecrease, onEdit }) => {

  // --- Sorting state — default descending by ID so newest items appear first ---
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);

  // --- Pagination state — 0-based pageIndex, configurable pageSize ---
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  // When the parent changes the data (due to search / filter), reset to page 1
  // so the user is never left staring at an empty page.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [data]);

  const table = useReactTable({
    columns,
    data,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getPaginationRowModel slices the sorted rows down to the current page
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
  });

  // --- Compute "Showing X–Y of Z entries" values ---
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = data.length;
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow   = Math.min((pageIndex + 1) * pageSize, totalRows);

  // Helper: renders the correct sort-direction chevron for a column
  const SortIcon = ({ columnId }) =>
    table.getColumn(columnId)?.getIsSorted() === "asc"
      ? <ChevronUp size={14} className="inline ml-1" />
      : <ChevronDown size={14} className="inline ml-1" />;

  return (
    <div className="rounded-md border border-gray-200 bg-white flex flex-col flex-1 min-h-0">

      {/* ── Data Table ── */}
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>

              {/* Each header cell toggles sorting when clicked */}
              <TableHead
                className="w-20 cursor-pointer select-none"
                onClick={() => table.getColumn("id")?.toggleSorting()}
              >
                ID <SortIcon columnId="id" />
              </TableHead>

              <TableHead
                className="w-45 cursor-pointer select-none"
                onClick={() => table.getColumn("name")?.toggleSorting()}
              >
                Perfume Name <SortIcon columnId="name" />
              </TableHead>

              <TableHead
                className="w-25 cursor-pointer select-none"
                onClick={() => table.getColumn("type")?.toggleSorting()}
              >
                Type <SortIcon columnId="type" />
              </TableHead>

              <TableHead
                className="w-30 cursor-pointer select-none"
                onClick={() => table.getColumn("branch")?.toggleSorting()}
              >
                Branch <SortIcon columnId="branch" />
              </TableHead>

              <TableHead
                className="w-25 cursor-pointer select-none"
                onClick={() => table.getColumn("note")?.toggleSorting()}
              >
                Note <SortIcon columnId="note" />
              </TableHead>

              <TableHead
                className="w-25 cursor-pointer select-none"
                onClick={() => table.getColumn("gender")?.toggleSorting()}
              >
                Gender <SortIcon columnId="gender" />
              </TableHead>

              <TableHead
                className="w-30 cursor-pointer select-none"
                onClick={() => table.getColumn("date")?.toggleSorting()}
              >
                Date Created <SortIcon columnId="date" />
              </TableHead>

              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => table.getColumn("qty")?.toggleSorting()}
              >
                Quantity <SortIcon columnId="qty" />
              </TableHead>

              <TableHead className="text-center">Actions</TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const item = row.original;
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell>{item.note}</TableCell>
                  <TableCell>{item.gender}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="text-right font-bold">{item.qty}</TableCell>

                  {/* Action buttons: increase qty, decrease qty, edit */}
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onIncrease(item.id)}
                        className="bg-[#E3D7C6] hover:bg-[#D6C9B8] border-0"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onDecrease(item.id)}
                        className="bg-[#E3D7C6] hover:bg-[#D6C9B8] border-0"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(item.id)}
                        aria-label="Edit product"
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────────────────
           Shows the current row range and provides prev/next page navigation.
           Buttons are disabled when there is no previous/next page.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center text-sm text-gray-500 shrink-0">

        {/* Left: how many rows are visible */}
        <p>
          {totalRows === 0
            ? "No entries found"
            : `Showing ${startRow}–${endRow} of ${totalRows} entries`}
        </p>

        {/* Right: page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </Button>

          {/* Page indicator: "2 / 5" */}
          <span className="px-2 text-xs tabular-nums">
            {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default InventoryTable;
