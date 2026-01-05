import { useState, forwardRef } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useGetSkills } from "@/api/mentor";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export const SkillSelector = forwardRef<HTMLInputElement, SkillSelectorProps>(
  ({ value, onChange, onBlur, className, placeholder, id, disabled }, ref) => {
  const { data: skills = [] } = useGetSkills();
  const [open, setOpen] = useState(false);

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes((value || "").toLowerCase())
  );
  
  const hasExactMatch = skills.some(s => s.name.toLowerCase() === (value || "").toLowerCase());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (!open) setOpen(true);
  };

  const handleSelect = (skillName: string) => {
    onChange(skillName);
    setOpen(false);
  };

  const handleBlur = () => {
    if (value && value.length > 0) {
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
        if (capitalized !== value) {
            onChange(capitalized);
        }
    }
    setOpen(false);
    onBlur?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
             <Input
                ref={ref}
                id={id}
                value={value}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                    setTimeout(handleBlur, 200);
                }}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
                disabled={disabled}
              />
        </div>
      </PopoverAnchor>
      <PopoverContent 
        className="p-1 w-[200px]" 
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
      >
        <div className="max-h-[200px] overflow-y-auto">
            {filteredSkills.length > 0 && (
                filteredSkills.map((skill) => (
                    <div
                        key={skill.id}
                        className={cn(
                            "cursor-pointer px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between",
                            skill.name === value && "bg-accent text-accent-foreground"
                        )}
                        onMouseDown={(e) => {
                            e.preventDefault(); 
                            handleSelect(skill.name);
                        }}
                    >
                        {skill.name}
                        {skill.name === value && <Check className="w-4 h-4 ml-2" />}
                    </div>
                ))
            )}
            
            {value && !hasExactMatch && (
                <div 
                    className="cursor-pointer px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-muted-foreground"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const capped = value.charAt(0).toUpperCase() + value.slice(1);
                        handleSelect(capped);
                    }}
                >
                   <span>Tạo mới:</span> <span className="font-medium text-foreground">{value}</span>
                </div>
            )}
            
            {!value && filteredSkills.length === 0 && (
                 <div className="px-2 py-1.5 text-sm text-muted-foreground">Không có dữ liệu</div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
SkillSelector.displayName = "SkillSelector";
