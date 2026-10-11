import { Skeleton } from "@/components/ui/skeleton";

export const AccountArchiveSkeleton = ({ rowCount = 3 }) => {
  // Enforces 6 columns: Employee ID, Branch, Email, Role, Date Archived, Archived By
  const gridLayout = "grid grid-cols-[15%_15%_25%_10%_20%_15%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20 bg-muted-foreground/20" />
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className={`${gridLayout} border-b border-border last:border-0`}>
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Employee ID */}
            <Skeleton className="h-4 w-20 bg-muted" /> {/* Branch */}
            <Skeleton className="h-4 w-40 bg-muted" /> {/* Email */}
            <Skeleton className="h-4 w-12 bg-muted" /> {/* Role */}
            <Skeleton className="h-4 w-32 bg-muted" /> {/* Date Archived */}
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Archived By */}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductArchiveSkeleton = ({ rowCount = 3 }) => {
  // Enforces 4 columns: Product ID, Product Name, Date Archived, Archived By
  const gridLayout = "grid grid-cols-[20%_35%_25%_20%] items-center px-4 py-3";

  return (
    <div className="w-full border border-border rounded-md bg-card overflow-hidden">
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24 bg-muted-foreground/20" />
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className={`${gridLayout} border-b border-border last:border-0`}>
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Product ID */}
            <Skeleton className="h-4 w-48 bg-muted" /> {/* Product Name */}
            <Skeleton className="h-4 w-32 bg-muted" /> {/* Date Archived */}
            <Skeleton className="h-4 w-24 bg-muted" /> {/* Archived By */}
          </div>
        ))}
      </div>
    </div>
  );
};