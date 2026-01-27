import * as Icons from "lucide-react";
import type { Skill } from "@/types/mentor";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SkillTabsProps {
  skills: Skill[];
  selectedSkillId: string;
  onSkillChange: (skillId: string) => void;
}

export function SkillTabs({
  skills,
  selectedSkillId,
  onSkillChange,
}: SkillTabsProps) {
  // Helper function to get icon component from string name
  const getIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.HelpCircle; // Fallback to HelpCircle if icon not found
  };

  return (
    <div className="mb-8">
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 3,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 px-12">
          {skills.map((skill) => {
            const Icon = getIcon(skill.icon);
            const isSelected = skill.id === selectedSkillId;

            return (
              <CarouselItem key={skill.id} className="pl-3 basis-auto">
                <button
                  onClick={() => onSkillChange(skill.id)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 hover:bg-accent transition-colors whitespace-nowrap rounded-lg ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "border-2 border-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{skill.name}</span>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
