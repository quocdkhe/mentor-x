import { useState, useMemo } from "react";
import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import { MentorCard } from "@/components/mentors/MentorCard";
import {
  MentorFilters,
  type Filters,
} from "@/components/mentors/MentorFilters";
import { type Mentor } from "@/types/mentor";
import { Users, Sparkles } from "lucide-react";

const defaultFilters: Filters = {
  search: "",
  skill: "",
  minRating: 0,
  priceRange: [0, 250],
};

export const mentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    biography:
      "Senior Software Engineer at Google with 10+ years of experience in full-stack development and system design. I've helped hundreds of engineers level up their skills and land their dream jobs at top tech companies.",
    avgRating: 4.9,
    totalRatings: 156,
    skills: ["React", "Node.js", "System Design", "TypeScript"],
    pricePerHour: 120,
    currency: "USD",
    experience: "10+ years",
    languages: ["English", "Mandarin"],
    timezone: "PST (UTC-8)",
    responseTime: "Usually within 2 hours",
    completedSessions: 342,
    availability: [
      { day: "Monday", slots: ["9:00 AM", "2:00 PM", "5:00 PM"] },
      { day: "Wednesday", slots: ["10:00 AM", "3:00 PM"] },
      { day: "Friday", slots: ["9:00 AM", "1:00 PM", "4:00 PM"] },
    ],
    reviews: [
      {
        id: "r1",
        userId: "u1",
        userName: "John D.",
        userAvatar:
          "https://images.unsplash.com/photo-1599566150163-29194dcabd56?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "Sarah is an amazing mentor! Her system design explanations are crystal clear.",
        date: "2024-01-15",
      },
      {
        id: "r2",
        userId: "u2",
        userName: "Maria S.",
        userAvatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "Helped me prepare for my Google interview. Highly recommended!",
        date: "2024-01-10",
      },
      {
        id: "r3",
        userId: "u3",
        userName: "Alex K.",
        userAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
        rating: 4,
        comment:
          "Great insights on React best practices and code architecture.",
        date: "2024-01-05",
      },
    ],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    biography:
      "Product Manager at Meta helping teams ship impactful products. Expert in user research and roadmap planning. Previously at Uber and Microsoft.",
    avgRating: 4.8,
    totalRatings: 98,
    skills: ["Product Management", "Agile", "User Research", "Strategy"],
    pricePerHour: 150,
    currency: "USD",
    experience: "8 years",
    languages: ["English", "Spanish"],
    timezone: "EST (UTC-5)",
    responseTime: "Usually within 4 hours",
    completedSessions: 215,
    availability: [
      { day: "Tuesday", slots: ["10:00 AM", "2:00 PM"] },
      { day: "Thursday", slots: ["11:00 AM", "4:00 PM"] },
      { day: "Saturday", slots: ["9:00 AM", "12:00 PM"] },
    ],
    reviews: [
      {
        id: "r4",
        userId: "u4",
        userName: "Emma W.",
        userAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "Marcus helped me transition into PM role. His advice was invaluable!",
        date: "2024-01-12",
      },
      {
        id: "r5",
        userId: "u5",
        userName: "David L.",
        userAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "Great session on product strategy and stakeholder management.",
        date: "2024-01-08",
      },
    ],
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    biography:
      "UX Design Lead specializing in creating intuitive interfaces. Former designer at Airbnb and Spotify. Passionate about mentoring the next generation of designers.",
    avgRating: 4.7,
    totalRatings: 203,
    skills: ["UX Design", "Figma", "User Testing", "Design Systems"],
    pricePerHour: 100,
    currency: "USD",
    experience: "7 years",
    languages: ["English", "Portuguese"],
    timezone: "CST (UTC-6)",
    responseTime: "Usually within 3 hours",
    completedSessions: 428,
    availability: [
      { day: "Monday", slots: ["11:00 AM", "3:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "2:00 PM", "6:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "4:00 PM"] },
    ],
    reviews: [
      {
        id: "r6",
        userId: "u6",
        userName: "Sophie M.",
        userAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "Emily's portfolio review was incredibly helpful. She has a great eye for design!",
        date: "2024-01-14",
      },
      {
        id: "r7",
        userId: "u7",
        userName: "Chris P.",
        userAvatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
        rating: 4,
        comment: "Good insights on design systems and component libraries.",
        date: "2024-01-09",
      },
    ],
  },
  {
    id: "4",
    name: "David Kim",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    biography:
      "Data Science Lead with expertise in ML and AI. Published researcher and conference speaker. Love helping aspiring data scientists break into the field.",
    avgRating: 4.9,
    totalRatings: 87,
    skills: ["Python", "Machine Learning", "Data Analysis", "TensorFlow"],
    pricePerHour: 180,
    currency: "USD",
    experience: "9 years",
    languages: ["English", "Korean"],
    timezone: "PST (UTC-8)",
    responseTime: "Usually within 6 hours",
    completedSessions: 178,
    availability: [
      { day: "Tuesday", slots: ["9:00 AM", "1:00 PM"] },
      { day: "Thursday", slots: ["10:00 AM", "3:00 PM", "6:00 PM"] },
    ],
    reviews: [
      {
        id: "r8",
        userId: "u8",
        userName: "Rachel T.",
        userAvatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "David's ML course recommendations and project guidance were spot on!",
        date: "2024-01-13",
      },
    ],
  },
  {
    id: "5",
    name: "Lisa Thompson",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    biography:
      "Startup founder and angel investor. Built and sold two SaaS companies. Love helping founders scale their businesses and navigate the startup journey.",
    avgRating: 4.6,
    totalRatings: 142,
    skills: ["Entrepreneurship", "Fundraising", "Leadership", "SaaS"],
    pricePerHour: 200,
    currency: "USD",
    experience: "12 years",
    languages: ["English"],
    timezone: "EST (UTC-5)",
    responseTime: "Usually within 8 hours",
    completedSessions: 287,
    availability: [
      { day: "Monday", slots: ["2:00 PM", "5:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "3:00 PM"] },
    ],
    reviews: [
      {
        id: "r9",
        userId: "u9",
        userName: "Tom H.",
        userAvatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment: "Lisa's fundraising advice helped us close our seed round!",
        date: "2024-01-11",
      },
      {
        id: "r10",
        userId: "u10",
        userName: "Nina B.",
        userAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
        rating: 4,
        comment: "Great perspective on scaling teams and company culture.",
        date: "2024-01-06",
      },
    ],
  },
  {
    id: "6",
    name: "James Wilson",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    biography:
      "DevOps Engineer at AWS with deep expertise in cloud infrastructure and container orchestration. Helping engineers master cloud technologies.",
    avgRating: 4.8,
    totalRatings: 76,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    pricePerHour: 130,
    currency: "USD",
    experience: "6 years",
    languages: ["English", "French"],
    timezone: "GMT (UTC+0)",
    responseTime: "Usually within 3 hours",
    completedSessions: 156,
    availability: [
      { day: "Monday", slots: ["8:00 AM", "12:00 PM", "4:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "2:00 PM"] },
      { day: "Thursday", slots: ["10:00 AM", "5:00 PM"] },
    ],
    reviews: [
      {
        id: "r11",
        userId: "u11",
        userName: "Mike R.",
        userAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment: "James helped me get AWS certified. Excellent teacher!",
        date: "2024-01-14",
      },
    ],
  },
  {
    id: "7",
    name: "Priya Patel",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    biography:
      "Mobile Development Lead creating cross-platform apps. Expert in React Native and Flutter. Passionate about building beautiful mobile experiences.",
    avgRating: 4.7,
    totalRatings: 112,
    skills: ["React Native", "Flutter", "iOS", "Android"],
    pricePerHour: 110,
    currency: "USD",
    experience: "5 years",
    languages: ["English", "Hindi"],
    timezone: "IST (UTC+5:30)",
    responseTime: "Usually within 4 hours",
    completedSessions: 234,
    availability: [
      { day: "Tuesday", slots: ["7:00 AM", "11:00 AM", "3:00 PM"] },
      { day: "Thursday", slots: ["8:00 AM", "12:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "2:00 PM"] },
    ],
    reviews: [
      {
        id: "r12",
        userId: "u12",
        userName: "Jason L.",
        userAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment: "Priya's React Native tips saved me weeks of debugging!",
        date: "2024-01-10",
      },
      {
        id: "r13",
        userId: "u13",
        userName: "Amy C.",
        userAvatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
        rating: 4,
        comment: "Great session on mobile app architecture.",
        date: "2024-01-07",
      },
    ],
  },
  {
    id: "8",
    name: "Alex Turner",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    biography:
      "Cybersecurity specialist helping companies protect their digital assets. Certified ethical hacker with experience at major financial institutions.",
    avgRating: 4.9,
    totalRatings: 64,
    skills: ["Security", "Penetration Testing", "Network Security", "OWASP"],
    pricePerHour: 170,
    currency: "USD",
    experience: "8 years",
    languages: ["English", "German"],
    timezone: "CET (UTC+1)",
    responseTime: "Usually within 5 hours",
    completedSessions: 132,
    availability: [
      { day: "Monday", slots: ["10:00 AM", "3:00 PM"] },
      { day: "Wednesday", slots: ["11:00 AM", "4:00 PM"] },
      { day: "Friday", slots: ["9:00 AM", "2:00 PM", "6:00 PM"] },
    ],
    reviews: [
      {
        id: "r14",
        userId: "u14",
        userName: "Kevin Z.",
        userAvatar:
          "https://images.unsplash.com/photo-1599566150163-29194dcabd56?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment:
          "Alex found vulnerabilities in our app that we completely missed!",
        date: "2024-01-12",
      },
      {
        id: "r15",
        userId: "u15",
        userName: "Laura M.",
        userAvatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop&crop=face",
        rating: 5,
        comment: "Great mentor for anyone looking to break into cybersecurity.",
        date: "2024-01-08",
      },
    ],
  },
];

const MentorListing = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const navigate = useNavigate();

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      // Search filter
      if (
        filters.search &&
        !mentor.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Skill filter
      if (filters.skill && !mentor.skills.includes(filters.skill)) {
        return false;
      }

      // Rating filter
      if (mentor.avgRating < filters.minRating) {
        return false;
      }

      // Price filter
      if (
        mentor.pricePerHour < filters.priceRange[0] ||
        mentor.pricePerHour > filters.priceRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleViewMentor = (mentor: Mentor) => {
    console.log("Viewing mentor:", mentor);
    // navigate(`/mentor/${mentor.id}`);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Find Your Expert
            </span>
          </div>
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
              {filteredMentors.length}
            </span>{" "}
            {filteredMentors.length === 1 ? "mentor" : "mentors"}
          </p>
        </div>

        {/* Mentor Grid */}
        {filteredMentors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMentors.map((mentor, index) => (
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
