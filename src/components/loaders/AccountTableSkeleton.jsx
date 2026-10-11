import { Skeleton } from "@/components/ui/skeleton";

const AccountTableSkeleton = ({ rowCount = 10 }) => {
  // Enforces 7 columns mapping exactly to: Employee ID, Email, Name, Branch, Role, Shift, Status
  const gridLayout = "grid grid-cols-[13%_25%_17%_15%_10%_10%_10%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      {/* Table Header Row */}
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full max-w-[80px] bg-muted-foreground/20" />
        ))}
      </div>

      {/* Table Data Rows */}
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div 
            key={i} 
            className={`${gridLayout} border-b border-border last:border-0`}
          >
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Employee ID */}
            <Skeleton className="h-4 w-48 bg-muted" /> {/* Email */}
            <Skeleton className="h-4 w-32 bg-muted" /> {/* Name */}
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Branch */}
            <Skeleton className="h-4 w-16 bg-muted" /> {/* Role */}
            <Skeleton className="h-4 w-16 bg-muted" /> {/* Shift */}
            <Skeleton className="h-4 w-12 bg-muted" /> {/* Status */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountTableSkeleton;