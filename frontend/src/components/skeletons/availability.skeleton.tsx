import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function AvailabilitySkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="grow flex flex-col items-center py-8 px-4 sm:px-10 lg:px-40">
        <div className="flex flex-col w-full max-w-[960px] gap-6">
          {/* Header Skeleton */}
          <div className="flex flex-wrap justify-between items-end gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>

          {/* Day Cards Skeleton */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Card key={idx} className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-top gap-4">
                  {/* Day Toggle */}
                  <div className="flex items-center justify-between w-full sm:w-48 shrink-0 pt-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-11 rounded-full" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>

                  {/* Slots Skeleton */}
                  <div className="flex-1 flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3 w-full p-2 rounded-lg">
                        <Skeleton className="h-6 w-11 rounded-full" />
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                      </div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="hidden sm:block pt-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer Skeleton */}
          <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border p-4 mt-4 flex justify-end gap-3 rounded-t-xl z-10">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvailabilitySkeleton;
