import PaginationBar from "@/components/shared/PaginationBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react"; // ADDED: Import for the loading spinner

const DataTable = ({
        columns = [],
        data = [],
        keyField = "id",
        asyncState = { isLoading: false, error: null },
        pagination = null,
        filter = null, 
        updateFilter = null,
        selectedItem = null,
        onRowClick = null,
        onRowDoubleClick = null,
        emptyMessage = "No records found.",
    }) => {
        const isLoading = asyncState?.isLoading;
        const hasData = Array.isArray(data) && data.length > 0;

  return (
    // FIXED: Replaced bg-white and border-gray-200 with semantic bg-card and border-border
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col mb-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="">
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key || col.accessorKey || idx}
                  className={`font-semibold ${col.headerClassName || ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                {/* FIXED: Replaced text-custom-gray and added flex container for the spinner */}
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !hasData ? (
              <TableRow>
                {/* FIXED: Replaced text-custom-gray with text-muted-foreground */}
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-muted-foreground font-medium"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
                (data || []).map((row) => {
                  const isSelected = selectedItem && row[keyField] === selectedItem[keyField];
                  return (
                    <TableRow
                      key={row[keyField]}
                      onClick={() => onRowClick && onRowClick(row)}
                      onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                      // FIXED: Replaced hardcoded hover:bg-slate-50 and bg-blue-200 with semantic hover:bg-muted and bg-primary/20
                      className={`transition-colors ${
                        onRowClick || onRowDoubleClick ? "hover:cursor-pointer" : ""
                      } 
                      ${
                        isSelected
                          ? "bg-primary/20 hover:bg-primary/30"
                          : "hover:bg-muted"
                      }`}
                    >
                    {columns.map((col, idx) => (
                      <TableCell
                        key={col.key || col.accessorKey || idx}
                        // FIXED: Replaced text-custom-gray with text-muted-foreground
                        className={col.className || "text-muted-foreground"}
                      >
                        {col.render ? col.render(row) : row[col.accessorKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {hasData && !isLoading && pagination && filter && updateFilter && (
        <PaginationBar
          pageCount={filter.pageCount}
          pageSize={filter.pageSize}
          totalPages={pagination.totalPages}
          totalEntries={pagination.totalEntries}
          updateFilter={updateFilter}
        />
      )}
    </div>
  );
};

export default DataTable;