import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// import { useSkills } from "@/hooks/useSkills";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface Filters {
  search: string;
  skill: string;
  minRating: number;
  priceRange: [number, number];
}

// data
export const skills: string[] = [
  "Agile",
  "Android",
  "AWS",
  "CI/CD",
  "Data Analysis",
  "Design Systems",
  "Docker",
  "Entrepreneurship",
  "Figma",
  "Flutter",
  "Fundraising",
  "iOS",
  "Kubernetes",
  "Leadership",
  "Machine Learning",
  "Network Security",
  "Node.js",
  "OWASP",
  "Penetration Testing",
  "Product Management",
  "Python",
  "React",
  "React Native",
  "SaaS",
  "Security",
  "Strategy",
  "System Design",
  "TensorFlow",
  "TypeScript",
  "User Research",
  "User Testing",
  "UX Design",
];

interface MentorFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

export function MentorFilters({
  filters,
  onFiltersChange,
  onReset,
}: MentorFiltersProps) {
  //   const { data: skills = [], isLoading: skillsLoading } = useSkills();

  const hasActiveFilters =
    filters.search ||
    filters.skill ||
    filters.minRating > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 250;

  return (
    <div className="bg-card rounded-xl shadow-card p-6 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Find Your Mentor
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-10 bg-background border-border"
          />
        </div>

        {/* Skill Filter */}
        <Select
          value={filters.skill}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, skill: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="All Skills" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Skills</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select
          value={filters.minRating.toString()}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, minRating: parseFloat(value) })
          }
        >
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="0">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
            <SelectItem value="4.8">4.8+ Stars</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price Range</span>
            <span className="font-medium text-foreground">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </span>
          </div>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                priceRange: value as [number, number],
              })
            }
            max={250}
            min={0}
            step={10}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
        </div>
      </div>

      {/* Active Filters & Reset */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, search: "" })}
                />
              </Badge>
            )}
            {filters.skill && (
              <Badge variant="secondary" className="gap-1">
                {filters.skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, skill: "" })}
                />
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge variant="secondary" className="gap-1">
                {filters.minRating}+ Stars
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, minRating: 0 })}
                />
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            Reset All
          </Button>
        </div>
      )}
    </div>
  );
}
