import { useState } from "react";
import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import { MentorCard } from "@/components/features/mentor-list/MentorCard";
import {
  MentorFilters,
  type Filters,
} from "@/components/features/mentor-list/MentorFilters";
import { type MentorInfo } from "@/types/mentor";
import { Users } from "lucide-react";
import { useGetMentorCard } from "@/api/mentor";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";

const defaultFilters: Filters = {
  search: "",
  skill: "",
  minRating: 0,
  priceRange: [0, 250],
};

const mentors =  [
  {
    "id": "1",
    "name": "Sarah Chen",
    "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Full-stack developer with 10+ years experience in React, Node.js, and cloud architecture. Passionate about teaching clean code practices.",
    "skills": ["React", "Node.js", "TypeScript", "AWS"],
    "avgRating": 4.9,
    "totalRatings": 127,
    "pricePerHour": 85.00
  },
  {
    "id": "2",
    "name": "Marcus Johnson",
    "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Senior Product Designer specializing in UX/UI design and design systems. Former lead designer at major tech companies.",
    "skills": ["UI/UX Design", "Figma", "Design Systems"],
    "avgRating": 4.8,
    "totalRatings": 94,
    "pricePerHour": 75.00
  },
  {
    "id": "3",
    "name": "Elena Rodriguez",
    "avatar": "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Data scientist and ML engineer. Expert in Python, TensorFlow, and building production ML systems at scale.",
    "skills": ["Python", "Machine Learning", "Data Science", "TensorFlow"],
    "avgRating": 5.0,
    "totalRatings": 156,
    "pricePerHour": 120.00
  },
  {
    "id": "4",
    "name": "David Park",
    "avatar": "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Mobile development expert with deep knowledge in iOS, Android, and React Native. Published 20+ apps with millions of downloads.",
    "skills": ["React Native", "iOS", "Swift", "Android"],
    "avgRating": 4.7,
    "totalRatings": 83,
    "pricePerHour": 90.00
  },
  {
    "id": "5",
    "name": "Aisha Patel",
    "avatar": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "DevOps engineer and cloud architect. Specialized in Kubernetes, Docker, CI/CD pipelines, and infrastructure automation.",
    "skills": ["DevOps", "Kubernetes", "Docker", "AWS"],
    "avgRating": 4.9,
    "totalRatings": 112,
    "pricePerHour": 95.00
  },
  {
    "id": "6",
    "name": "James Wilson",
    "avatar": "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Backend engineer focused on scalable systems. Expert in Go, microservices architecture, and distributed systems.",
    "skills": ["Go", "Microservices", "PostgreSQL", "Redis"],
    "avgRating": 4.6,
    "totalRatings": 71,
    "pricePerHour": 80.00
  },
  {
    "id": "7",
    "name": "Sophie Martin",
    "avatar": "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Frontend specialist and accessibility advocate. Building beautiful, inclusive web experiences with modern frameworks.",
    "skills": ["React", "Vue.js", "CSS", "Accessibility"],
    "avgRating": 4.8,
    "totalRatings": 98,
    "pricePerHour": 70.00
  },
  {
    "id": "8",
    "name": "Raj Sharma",
    "avatar": "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    "biography": "Blockchain developer and smart contract auditor. Deep expertise in Solidity, Web3, and DeFi protocols.",
    "skills": ["Blockchain", "Solidity", "Web3", "Ethereum"],
    "avgRating": 4.9,
    "totalRatings": 89,
    "pricePerHour": 150.00
  }
] as MentorInfo[]


const MentorListing = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  // const { data: mentors = [], isLoading } = useGetMentorCard();
  const navigate = useNavigate();
  

  // const handleViewMentor = (mentor: Mentor | import("@/types/mentor").MentorCard) => {
  //   navigate({ to: "/mentors/$mentorId", params: { mentorId: mentor.id } });
  // };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // if (isLoading) { 
  //   return <DefaultSkeleton/>
  // }

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
                 <MentorCard mentor={mentor}/> 
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
