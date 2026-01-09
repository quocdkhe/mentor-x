import { useRef, useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/types/mentor";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          const Icon = getIcon(skill.icon);
          const isSelected = skill.id === selectedSkillId;

          return (
            <button
              key={skill.id}
              onClick={() => onSkillChange(skill.id)}
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
