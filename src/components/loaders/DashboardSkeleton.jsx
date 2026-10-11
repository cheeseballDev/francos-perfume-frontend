import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = ({ cardCount = 3 }) => {
  return (
    <div className="flex flex-col w-full">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div 
            key={i} 
            className="flex flex-col p-6 border border-border rounded-xl bg-card shadow-sm gap-4 h-[140px] justify-between"
          >
            {/* Top Row: Title & Icon */}
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-32 bg-muted" />
              <Skeleton className="h-6 w-6 rounded-md bg-muted" />
            </div>
            
            {/* Middle Row: Main Value */}
            <div>
              <Skeleton className="h-8 w-20 bg-muted" />
            </div>
            
            {/* Bottom Row: Sub Text */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Dashboard Placeholder */}
      <Skeleton className="h-64 mt-8 w-full rounded-lg bg-card/50 border-2 border-dashed border-border" />
    </div>
  );
};

export default DashboardSkeleton;