import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MentorCard } from "@/types/mentor";
import { Eye, Star } from "lucide-react";

interface MentorCardProps {
  mentor: MentorCard;
  onView: (mentor: MentorCard) => void;
}

function StarRating({
  rating,
  maxRating = 5,
  size = 16,
}: {
  rating: number;
  maxRating?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
        return (
          <div
            key={i}
            className="relative"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className="absolute text-star-empty"
              fill="currentColor"
            />
            <div
              className="absolute overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star size={size} className="text-star" fill="currentColor" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MentorCard({ mentor, onView }: MentorCardProps) {
  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Header with Avatar and Price */}
        <div className="flex items-start justify-between mb-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
            <AvatarImage src={mentor.avatar} alt={mentor.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">
              ${mentor.pricePerHour}
            </span>
            <p className="text-xs text-muted-foreground">/session</p>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {mentor.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={mentor.avgRating} />
          <span className="text-sm font-medium text-foreground">
            {mentor.avgRating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({mentor.totalRatings} reviews)
          </span>
        </div>

        {/* Biography */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
          {mentor.biography}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5 min-h-[56px]">
          {mentor.skills.slice(0, 3).map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="text-xs font-medium px-2.5 py-0.5"
            >
              {skill}
            </Badge>
          ))}
          {mentor.skills.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs font-medium px-2.5 py-0.5 text-muted-foreground"
            >
              +{mentor.skills.length - 3}
            </Badge>
          )}
        </div>

        {/* View Button */}
        <Button
          onClick={() => onView(mentor)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 group-hover:shadow-glow"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
