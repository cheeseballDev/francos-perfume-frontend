import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeletonGrid = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col bg-zinc-900 border border-zinc-700 overflow-hidden rounded-sm h-[200px]">
          {/* Top Label / ID Area */}
          <div className="px-2 py-1 bg-white">
            <Skeleton className="h-4 w-16 bg-zinc-300" />
          </div>
          
          {/* Image Placeholder */}
          <div className="flex-1 w-full flex items-center justify-center p-2 bg-zinc-800">
             <Skeleton className="h-24 w-24 rounded-full bg-zinc-700" />
          </div>
          
          {/* Bottom Label Area */}
          <div className="px-2 py-2 bg-black border-t border-zinc-700">
            <Skeleton className="h-4 w-3/4 bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeletonGrid;