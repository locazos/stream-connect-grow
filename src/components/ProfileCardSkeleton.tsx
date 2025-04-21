
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileCardSkeleton = () => (
  <div className="w-full bg-card shadow-lg rounded-xl overflow-hidden animate-pulse">
    <div className="h-56 sm:h-64 bg-muted flex items-center justify-center">
      <Skeleton className="h-32 w-32 rounded-full" />
    </div>
    <div className="p-4">
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="mb-4">
        <Skeleton className="h-3 w-16 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-16 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="p-4 border-t border-border flex gap-4 justify-center">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="h-14 w-14 rounded-full" />
    </div>
  </div>
);
