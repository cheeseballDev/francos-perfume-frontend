import { Skeleton } from "@/components/ui/skeleton";

const AuditLogTableSkeleton = ({ rowCount = 10 }) => {
  // Enforces 6 columns mapping exactly to: Log ID, Employee ID, Branch, Module, Action, Timestamp
  const gridLayout = "grid grid-cols-[12%_15%_15%_15%_28%_15%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      {/* Table Header Row */}
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        {Array.from({ length: 6 }).map((_, i) => (
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
            <Skeleton className="h-4 w-20 bg-muted" /> {/* Log ID */}
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Employee ID */}
            <Skeleton className="h-4 w-20 bg-muted" /> {/* Branch */}
            <Skeleton className="h-4 w-28 bg-muted" /> {/* Module */}
            <Skeleton className="h-4 w-48 bg-muted" /> {/* Action */}
            <Skeleton className="h-4 w-32 bg-muted" /> {/* Timestamp */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogTableSkeleton;