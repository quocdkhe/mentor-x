import { Skeleton } from '../ui/skeleton'
import { Card } from '../ui/card'

const MentorCardsSkeleton = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, idx) => (
        <Card key={idx} className="overflow-hidden p-0">
          {/* Avatar Skeleton */}
          <Skeleton className="w-full h-64" />

          {/* Content Skeleton */}
          <div className="p-4 pt-3 space-y-3">
            {/* Name */}
            <Skeleton className="h-6 w-3/4" />

            {/* Position & Company */}
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 shrink-0 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 shrink-0 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default MentorCardsSkeleton