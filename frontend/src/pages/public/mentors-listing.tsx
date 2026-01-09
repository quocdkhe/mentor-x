import { useState } from "react";
import { createLazyRoute } from "@tanstack/react-router";
import { MentorCard } from "@/components/features/mentor-list/MentorCard";
import { Users, Search, Sparkles } from "lucide-react";
import { useGetMentorCard } from "@/api/mentor";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SkillTabs, MOCK_SKILLS } from "@/components/features/mentor-list/SkillTabs";

const MentorListing = () => {
  const { data: mentors = [], isLoading } = useGetMentorCard();
  const [selectedSkillId, setSelectedSkillId] = useState("all");

  if (isLoading) {
    return <DefaultSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, công ty, vai trò"
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button variant="outline" className="h-12 gap-2">
              <Sparkles className="h-4 w-4" />
              Tìm kiếm bằng AI
            </Button>
          </div>
        </div>

        {/* Skill Category Tabs */}
        <SkillTabs
          skills={MOCK_SKILLS}
          selectedSkillId={selectedSkillId}
          onSkillChange={setSelectedSkillId}
        />

        {/* Mentor Grid */}
        {mentors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MentorCard mentor={mentor} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Không tìm thấy mentor
            </h3>
            <p className="text-muted-foreground mb-4">
              Thử điều chỉnh các bộ lọc của bạn để tìm thêm mentor.
            </p>
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
