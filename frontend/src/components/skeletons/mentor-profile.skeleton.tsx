import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MentorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Profile Header Card Skeleton */}
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar Skeleton */}
                  <div className="shrink-0 relative mx-auto sm:mx-0">
                    <Skeleton className="h-32 w-32 rounded-full" />
                  </div>

                  {/* Profile Info Skeleton */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    {/* Name */}
                    <Skeleton className="h-9 w-48 mx-auto sm:mx-0" />
                    {/* Position */}
                    <Skeleton className="h-6 w-64 mx-auto sm:mx-0" />
                    {/* Company Badge */}
                    <Skeleton className="h-5 w-32 mx-auto sm:mx-0" />

                    {/* Experience and Response Time */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-6 pt-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-36" />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <div className="space-y-6">
              {/* Tab List */}
              <div className="flex gap-2 border-b">
                <Skeleton className="h-11 w-32 rounded-md" />
                <Skeleton className="h-11 w-32 rounded-md" />
              </div>

              {/* Tab Content Card */}
              <Card className="rounded-2xl shadow-sm border">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Section Title */}
                  <Skeleton className="h-7 w-24" />

                  {/* Biography */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  <div className="border-t pt-6 space-y-8">
                    {/* Skills Section */}
                    <div>
                      <Skeleton className="h-6 w-24 mb-4" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <Skeleton key={`skill-${idx}`} className="h-8 w-24 rounded-lg" />
                        ))}
                      </div>
                    </div>

                    {/* Availability Schedule Section */}
                    <div>
                      <Skeleton className="h-6 w-24 mb-4" />
                      <div className="space-y-2 max-w-md">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Booking Card Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Pricing and Booking Card */}
              <Card className="rounded-2xl shadow-lg border">
                <CardContent className="p-6 sm:p-8">
                  {/* Price Skeleton */}
                  <div className="text-center mb-8 space-y-2">
                    <Skeleton className="h-9 w-32 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="space-y-3 mb-6">
                    <Skeleton className="h-11 w-full rounded-md" />
                    <Skeleton className="h-11 w-full rounded-md" />
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border my-6"></div>

                  {/* Features List Skeleton */}
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`feature-${idx}`} className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Info Alert Skeleton */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-md shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
