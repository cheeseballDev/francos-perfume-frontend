import { Skeleton } from "@/components/ui/skeleton";

const DiscountTableSkeleton = ({ rowCount = 5 }) => {
  // Enforces 5 columns mapping exactly to: Prefix, Discount Name, Type, Value, Status
  const gridLayout = "grid grid-cols-[15%_35%_20%_15%_15%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      {/* Table Header Row */}
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20 bg-muted-foreground/20" />
        ))}
      </div>

      {/* Table Data Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div 
            key={i} 
            className={`${gridLayout} border-b border-border last:border-0`}
          >
            <Skeleton className="h-4 w-12 bg-muted" /> {/* Prefix */}
            <Skeleton className="h-4 w-48 bg-muted" /> {/* Discount Name */}
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Type */}
            <Skeleton className="h-4 w-12 bg-muted" /> {/* Value */}
            <Skeleton className="h-4 w-20 bg-muted" /> {/* Status */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountTableSkeleton;