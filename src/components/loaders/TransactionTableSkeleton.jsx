import { Skeleton } from "@/components/ui/skeleton";

const TransactionTableSkeleton = ({ rowCount = 10 }) => {
  // Enforces 6 columns mapping to: Date, Sales Order ID, Perfume Sold, Amount, Processed By, Payment Method
  const gridLayout = "grid grid-cols-[15%_15%_25%_10%_20%_15%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      {/* Table Header Row */}
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 bg-muted-foreground/20" />
        ))}
      </div>

      {/* Table Data Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div 
            key={i} 
            className={`${gridLayout} border-b border-border last:border-0`}
          >
            <Skeleton className="h-4 w-32 bg-muted" /> {/* Date */}
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Order ID */}
            <Skeleton className="h-4 w-48 bg-muted" /> {/* Perfume Sold */}
            <Skeleton className="h-4 w-12 bg-muted" /> {/* Amount */}
            <Skeleton className="h-4 w-32 bg-muted" /> {/* Processed By */}
            <Skeleton className="h-4 w-16 bg-muted" /> {/* Payment Method */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTableSkeleton;