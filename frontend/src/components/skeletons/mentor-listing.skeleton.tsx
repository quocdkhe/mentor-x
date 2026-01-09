import { Skeleton } from "@/components/ui/skeleton";
import MentorCardsSkeleton from "./mentor-cards-skeleton";

export function MentorListingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10">
        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <div className="relative flex items-center gap-3">
            <Skeleton className="flex-1 h-12 rounded-md" />
            <Skeleton className="h-12 w-40 rounded-md" />
          </div>
        </div>

        {/* Skill Tabs Skeleton */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-hidden px-12">
            {Array.from({ length: 20 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-24 rounded-lg shrink-0" />
            ))}
          </div>
        </div>

        {/* Mentor Cards Grid Skeleton */}
        <MentorCardsSkeleton />
      </main>
    </div>
  );
}
