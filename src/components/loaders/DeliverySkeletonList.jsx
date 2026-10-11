import { Skeleton } from "@/components/ui/skeleton";

const DeliverySkeletonList = ({ rowCount = 4 }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col p-4 border border-border rounded-xl bg-card shadow-sm gap-4"
        >
          {/* Top Section: Icon, Details, and Unit Counts */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
            
            {/* Left Side: Icon and Text Details */}
            <div className="flex items-start gap-4">
              {/* Shopping Cart Icon Box */}
              <Skeleton className="h-12 w-12 rounded-lg bg-muted shrink-0" />
              
              {/* Stacked Text Info */}
              <div className="flex flex-col gap-2 mt-1">
                {/* Row 1: Delivery ID & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-28 bg-muted font-bold" />
                  <Skeleton className="h-5 w-20 rounded bg-muted" />
                  <Skeleton className="h-5 w-20 rounded bg-muted" />
                </div>
                
                {/* Row 2: REQ-ID */}
                <Skeleton className="h-3 w-24 bg-muted" />
                
                {/* Row 3: From -> To Path */}
                <Skeleton className="h-3 w-48 sm:w-64 bg-muted" />
              </div>
            </div>

            {/* Right Side: Product & Unit Counts */}
            <div className="flex flex-col sm:items-end gap-1 mt-1 sm:mt-0">
              <Skeleton className="h-5 w-20 bg-muted" />
              <Skeleton className="h-3 w-12 bg-muted" />
            </div>
          </div>

          {/* Bottom Section: View Details Button */}
          <div className="w-full sm:w-1/3">
            <Skeleton className="h-10 w-full rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliverySkeletonList;