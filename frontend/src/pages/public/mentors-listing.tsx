import { useState } from "react";
import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import { MentorCard } from "@/components/mentors/MentorCard";
import {
  MentorFilters,
  type Filters,
} from "@/components/mentors/MentorFilters";
import { type Mentor } from "@/types/mentor";
import { Users } from "lucide-react";
import { useGetMentorCard } from "@/api/mentor";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";

const defaultFilters: Filters = {
  search: "",
  skill: "",
  minRating: 0,
  priceRange: [0, 250],
};

const MentorListing = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const { data: mentors = [], isLoading } = useGetMentorCard();
  const navigate = useNavigate();

  const handleViewMentor = (mentor: Mentor | import("@/types/mentor").MentorCard) => {
    navigate({ to: "/mentors/$mentorId", params: { mentorId: mentor.id } });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  if (isLoading) { 
    return <DefaultSkeleton/>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Connect with World-Class
            <span className="text-gradient-primary"> Mentors</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Accelerate your career with personalized guidance from industry
            experts. Book 1-on-1 sessions and unlock your full potential.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {/* Filters */}
        <MentorFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {mentors.length}
            </span>{" "}
            {mentors.length === 1 ? "mentor" : "mentors"}
          </p>
        </div>

        {/* Mentor Grid */}
        {mentors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MentorCard mentor={mentor} onView={handleViewMentor} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No mentors found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to find more mentors.
            </p>
            <button
              onClick={handleResetFilters}
              className="text-primary hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorListing;

export const Route = createLazyRoute("/public/mentors")({
  component: MentorListing,
});
