import { Skeleton } from "@/components/ui/skeleton";

export function BookingSlotsSkeleton() {
  return (
    <div className="space-y-8">
      {/* First time block skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 rounded-md" />
          ))}
        </div>
      </div>

      {/* Second time block skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {Array.from({ length: 17 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookingSlotsSkeleton;
