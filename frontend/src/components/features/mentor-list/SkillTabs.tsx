import { useRef, useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Skill {
  skillId: string;
  name: string;
  iconName: string; // Store icon name as string for database compatibility
}

// eslint-disable-next-line react-refresh/only-export-components
export const MOCK_SKILLS: Skill[] = [
  { skillId: "all", name: "Tất cả", iconName: "Users" },
  { skillId: "new", name: "Mới", iconName: "Zap" },
  { skillId: "available-asap", name: "Sẵn sàng ngay", iconName: "TrendingUp" },
  { skillId: "notable", name: "Nổi bật", iconName: "Star" },
  { skillId: "ai", name: "AI", iconName: "Bot" },
  { skillId: "soft-skills", name: "Kỹ năng mềm", iconName: "Briefcase" },
  { skillId: "design", name: "Thiết kế", iconName: "Palette" },
  { skillId: "product", name: "Sản phẩm", iconName: "Package" },
  { skillId: "engineering", name: "Kỹ thuật", iconName: "Code" },
  { skillId: "marketing", name: "Marketing", iconName: "TrendingUp" },
  { skillId: "data-science", name: "Khoa học dữ liệu", iconName: "BarChart" },
  { skillId: "content-writing", name: "Viết nội dung", iconName: "FileText" },
  { skillId: "no-low-code", name: "No/Low Code", iconName: "MonitorSmartphone" },
  { skillId: "soft-skills", name: "Kỹ năng mềm", iconName: "Briefcase" },
  { skillId: "design", name: "Thiết kế", iconName: "Palette" },
  { skillId: "product", name: "Sản phẩm", iconName: "Package" },
  { skillId: "engineering", name: "Kỹ thuật", iconName: "Code" },
  { skillId: "marketing", name: "Marketing", iconName: "TrendingUp" },
  { skillId: "data-science", name: "Khoa học dữ liệu", iconName: "BarChart" },
  { skillId: "content-writing", name: "Viết nội dung", iconName: "FileText" },
  { skillId: "no-low-code", name: "No/Low Code", iconName: "MonitorSmartphone" },
];

interface SkillTabsProps {
  skills: Skill[];
  selectedSkillId: string;
  onSkillChange: (skillId: string) => void;
}

export function SkillTabs({ skills, selectedSkillId, onSkillChange }: SkillTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // Helper function to get icon component from string name
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.HelpCircle; // Fallback to HelpCircle if icon not found
  };

  return (
    <div className="mb-8 relative">
      {/* Left Scroll Button */}
      {showLeftButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10 shadow-lg bg-background"
          onClick={() => scroll('left')}
        >
          <Icons.ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-12"
        onScroll={checkScroll}
      >
        {skills.map((skill) => {
          const Icon = getIcon(skill.iconName);
          const isSelected = skill.skillId === selectedSkillId;

          return (
            <button
              key={skill.skillId}
              onClick={() => onSkillChange(skill.skillId)}
              className={`flex flex-col items-center gap-2 px-4 py-3 hover:bg-accent transition-colors whitespace-nowrap shrink-0 relative ${isSelected ? "border-b-3 border-primary" : ""
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{skill.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      {showRightButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10 shadow-lg bg-background"
          onClick={() => scroll('right')}
        >
          <Icons.ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
