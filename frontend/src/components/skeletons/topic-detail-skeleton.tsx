import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function ForumPostSkeletonList() {
  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-6">
        {/* Badge + Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Badge skeleton */}
            <Skeleton className="h-6 w-20 rounded-full shrink-0" />

            {/* Title skeleton */}
            <Skeleton className="h-9 w-2/3" />
          </div>

          {/* Date */}
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-6">
                {/* Left Side: User Info */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <Skeleton className="h-20 w-20 rounded-full" />

                  <div className="text-center space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                </div>

                <Separator orientation="vertical" className="h-auto" />

                {/* Right Side: Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-10" />
                  </div>

                  {/* Body */}
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  <Separator className="mb-4 mt-auto" />

                  {/* Footer */}
                  <div className="space-y-3">
                    {/* Likes summary */}
                    <Skeleton className="h-4 w-40" />

                    {/* Action buttons */}
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>

  );
}
