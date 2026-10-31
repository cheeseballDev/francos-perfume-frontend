import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the report tables (Top/Bottom 10 by units or revenue):
// #, Product, Units Sold, Revenue. The number columns are right-aligned like the real table.
const gridLayout = "grid grid-cols-[3rem_1fr_7rem_8rem] items-center gap-4 px-4 py-3";

// Varied widths so the rows don't look like identical stripes
const PRODUCT_WIDTHS = ["w-48", "w-36", "w-56", "w-40", "w-32", "w-44", "w-52", "w-28", "w-40", "w-36"];

const ReportTableSkeleton = ({ rowCount = 10, showTitle = true }) => {
  return (
    <div className="w-full border border-border rounded-lg bg-card overflow-hidden shadow-sm">
      {/* Card title, e.g. "Top 10 by Revenue" */}
      {showTitle && (
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Skeleton className="h-5 w-40 bg-muted-foreground/20" />
          <Skeleton className="h-4 w-20 bg-muted" />
        </div>
      )}

      {/* Table header row */}
      <div className={`${gridLayout} border-b border-border bg-muted/50`}>
        <Skeleton className="h-4 w-4 bg-muted-foreground/20" />                {/* # */}
        <Skeleton className="h-4 w-20 bg-muted-foreground/20" />               {/* Product */}
        <Skeleton className="h-4 w-16 ml-auto bg-muted-foreground/20" />       {/* Units Sold */}
        <Skeleton className="h-4 w-16 ml-auto bg-muted-foreground/20" />       {/* Revenue */}
      </div>

      {/* Data rows */}
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className={`${gridLayout} border-b border-border last:border-0`}>
            <Skeleton className="h-4 w-5 bg-muted" />                                        {/* Rank */}
            <Skeleton className={`h-4 ${PRODUCT_WIDTHS[i % PRODUCT_WIDTHS.length]} max-w-full bg-muted`} /> {/* Product */}
            <Skeleton className="h-4 w-12 ml-auto bg-muted" />                               {/* Units */}
            <Skeleton className="h-4 w-20 ml-auto bg-muted" />                               {/* Revenue */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTableSkeleton;
