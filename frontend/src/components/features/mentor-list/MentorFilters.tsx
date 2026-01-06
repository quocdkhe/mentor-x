import { Search, SlidersHorizontal, Zap, Award, Sparkles, Bot, Users, Palette, Package, Code, Megaphone, BarChart, Feather, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  hasNotification?: boolean;
}

const categories: Category[] = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'new', label: 'New', icon: Sparkles, hasNotification: true },
  { id: 'available-asap', label: 'Available ASAP', icon: Zap },
  { id: 'notable', label: 'Notable', icon: Award, hasNotification: true },
  { id: 'ai', label: 'AI', icon: Bot, hasNotification: true },
  { id: 'soft-skills', label: 'Soft Skills', icon: Users },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'product', label: 'Product', icon: Package },
  { id: 'engineering', label: 'Engineering', icon: Code },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'data-science', label: 'Data Science', icon: BarChart },
  { id: 'content-writing', label: 'Content Writing', icon: Feather },
  { id: 'no-low-code', label: 'No/Low Code', icon: Eye },
];

interface FilterBarProps {
  searchQuery: string;
  selectedSkill: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onSkillChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  availableSkills: string[];
}

export function FilterBar({
  searchQuery,
  selectedSkill,
  selectedCategory,
  onSearchChange,
  onSkillChange,
  onCategoryChange,
  availableSkills,
}: FilterBarProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border mb-8">
      <div className="p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search mentors by name, skills, or expertise..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex gap-3">
          <Select value={selectedSkill} onValueChange={onSkillChange}>
            <SelectTrigger className="w-[200px] h-12">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <SelectValue placeholder="All Skills" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {availableSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(searchQuery || selectedSkill !== 'all') && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Tìm kiếm: {searchQuery}
            </Badge>
          )}
          {selectedSkill !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Kỹ năng: {selectedSkill}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onSkillChange('all');
            }}
            className="ml-auto text-xs"
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      <div className="mt-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors min-w-fit",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent border-border hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" />
                    {category.hasNotification && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      </div>
    </div>
  );
}
