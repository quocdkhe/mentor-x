import { useMemo, useState } from "react";
import { createLazyRoute } from "@tanstack/react-router";
import { MentorCard } from "@/components/features/mentor-list/MentorCard";
import {
  FilterBar,
} from "@/components/features/mentor-list/MentorFilters";
import { Users } from "lucide-react";
import { useGetMentorCard } from "@/api/mentor";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";


const MentorListing = () => {
  const { data: mentors = [], isLoading } = useGetMentorCard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const availableSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    mentors.forEach((mentor) => {
      mentor.skills.forEach((skill) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [mentors]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch =
        searchQuery === '' ||
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.biography.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSkill =
        selectedSkill === 'all' || mentor.skills.includes(selectedSkill);

      return matchesSearch && matchesSkill;
    });
  }, [mentors, searchQuery, selectedSkill]);

  if (isLoading) { 
    return <DefaultSkeleton/>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-600" />
              <h1 className="text-4xl font-bold text-foreground">Tìm kiếm mentor</h1>
            </div>
            <p className="text-lg text-muted-foreground">
            Kết nối với các chuyên gia có kinh nghiệm để thúc đẩy sự phát triển của bạn
          </p>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {/* Filters */}

        <FilterBar
          searchQuery={searchQuery}
          selectedSkill={selectedSkill}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onSkillChange={setSelectedSkill}
          onCategoryChange={setSelectedCategory}
          availableSkills={availableSkills}
        />

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground">
            Hiển thị{" "}
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
