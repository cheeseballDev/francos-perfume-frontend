import PaginationBar from "@/components/shared/PaginationBar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, PackageOpen } from "lucide-react"; // Added PackageOpen

const DataTable = ({
        columns = [],
        data = [],
        keyField = "id",
        asyncState = { isLoading: false, isFetching: false, error: null },
        pagination = null,
        filter = null, 
        updateFilter = null,
        selectedItem = null,
        onRowClick = null,
        onRowDoubleClick = null,
        emptyMessage = "No records found.",
    }) => {
        const isBusy = asyncState?.isLoading || asyncState?.isFetching;
        const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col mb-4 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key || col.accessorKey || idx}
                  // Inherits column-hiding classes like 'hidden md:table-cell'
                  className={`font-semibold text-muted-foreground ${col.className || ""} ${col.headerClassName || ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isBusy ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <span className="text-sm font-medium tracking-wide">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !hasData ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-16 text-muted-foreground font-medium animate-in fade-in duration-300"
                >
                  {/* ACTIONABLE EMPTY STATE */}
                  <div className="flex flex-col items-center justify-center">
                      <PackageOpen className="h-12 w-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
                      <p className="text-base text-foreground mb-1">No items found</p>
                      <p className="text-sm font-normal text-muted-foreground mb-4">{emptyMessage}</p>
                      {updateFilter && (
                         <button 
                            onClick={() => updateFilter('search', '')} 
                            className="text-primary hover:underline text-sm font-bold"
                         >
                            Clear search filters
                         </button>
                      )}
                  </div>
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
                      className={`animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors ${
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
                        className={`text-foreground ${col.className || ""} ${col.cellClassName || ""}`}
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
      
      {hasData && !isBusy && pagination && filter && updateFilter && (
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