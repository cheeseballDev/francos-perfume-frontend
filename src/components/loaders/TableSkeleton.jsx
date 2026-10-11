import { Skeleton } from "@/components/ui/skeleton";

const TableSkeleton = ({ rowCount = 7 }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center justify-between p-4 border border-border rounded-lg bg-card shadow-sm"
        >
          {/* Left Side: Chevron, Logo, Title, and Badges */}
          <div className="flex items-center gap-4">
            {/* Chevron placeholder */}
            <Skeleton className="h-4 w-4 bg-muted" />
            
            {/* Square Logo placeholder */}
            <Skeleton className="h-10 w-10 rounded-sm bg-muted" />
            
            {/* Title and Badges grouping */}
            <div className="flex flex-col gap-2">
              {/* Product Title */}
              <Skeleton className="h-5 w-32 sm:w-48 bg-muted" />
              
              {/* Status Badges */}
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20 rounded bg-muted" />
                <Skeleton className="h-4 w-16 rounded bg-muted" />
                <Skeleton className="h-4 w-16 rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* Right Side: Units and Batches */}
          <div className="flex flex-col items-end gap-2">
            {/* Bold units count */}
            <Skeleton className="h-5 w-16 bg-muted" />
            {/* Smaller batches count */}
            <Skeleton className="h-3 w-12 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;