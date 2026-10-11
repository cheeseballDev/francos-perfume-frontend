import { Skeleton } from "@/components/ui/skeleton";

const ProductGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col p-4 border border-border rounded-xl bg-card shadow-sm gap-4"
        >
          {/* Top Row: Barcode ID and Price */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted" />
          </div>
          
          {/* Large Image Placeholder */}
          <Skeleton className="w-full h-48 rounded-md bg-muted/50" />
          
          {/* Text Rows */}
          <div className="flex flex-col gap-2">
            {/* Title and Product ID */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32 bg-muted font-bold" />
              <Skeleton className="h-4 w-24 bg-muted" />
            </div>
            
            {/* Category/Gender and Date */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28 bg-muted" />
              <Skeleton className="h-4 w-20 bg-muted" />
            </div>
            
            {/* Brand/Description */}
            <Skeleton className="h-4 w-40 bg-muted mt-1" />
          </div>

          {/* Edit Details Button */}
          <Skeleton className="h-10 w-full rounded-md bg-muted mt-2" />
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;