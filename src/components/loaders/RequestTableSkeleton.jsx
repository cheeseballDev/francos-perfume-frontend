import { Skeleton } from "@/components/ui/skeleton";

const RequestTableSkeleton = ({ rowCount = 10 }) => {
  // Enforces strict column widths to match the actual table columns: 
  // [Request ID, From -> To, Status, Item Count, Stage]
  const gridLayout = "grid grid-cols-[15%_30%_20%_10%_25%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      {/* Table Header Row */}
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        <Skeleton className="h-4 w-20 bg-muted-foreground/20" />
        <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
        <Skeleton className="h-4 w-16 bg-muted-foreground/20" />
        <Skeleton className="h-4 w-20 bg-muted-foreground/20" />
        <Skeleton className="h-4 w-16 bg-muted-foreground/20" />
      </div>

      {/* Table Data Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div 
            key={i} 
            className={`${gridLayout} border-b border-border last:border-0`}
          >
            {/* Request ID */}
            <Skeleton className="h-4 w-24 bg-muted" />
            
            {/* From -> To Path */}
            <Skeleton className="h-4 w-48 bg-muted" />
            
            {/* Status (Pill Badge) */}
            <Skeleton className="h-6 w-20 rounded-full bg-muted" />
            
            {/* Item Count */}
            <Skeleton className="h-4 w-6 bg-muted" />
            
            {/* Stage (Pill Badge) */}
            <Skeleton className="h-6 w-24 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestTableSkeleton;