import { Skeleton } from '@/components/ui/skeleton';

export function DefaultSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export default DefaultSkeleton;