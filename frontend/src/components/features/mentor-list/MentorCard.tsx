import { Briefcase, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MentorInfo } from '@/types/mentor';
import { Link } from '@tanstack/react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { USER_ROLES } from '@/types/user';

interface MentorCardProps {
  mentor: MentorInfo;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Link
      to={user?.role === USER_ROLES.USER ? "/user/mentors/$mentorId" : "/mentors/$mentorId"}
      params={{ mentorId: mentor.userId }}
      className="block h-full"
    >
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group p-0 rounded-2xl">
        {/* Avatar Section */}
        <div className="relative">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="p-4 pt-3">
          {/* Name */}
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
            {mentor.name}
          </h3>

          {/* Position at Company */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
            <Briefcase className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">
              <strong>{mentor.position}</strong> tại <strong>{mentor.company}</strong>
            </span>
          </div>

          {/* Skills */}
          {mentor.skills && mentor.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {mentor.skills.slice(0, 3).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {skill}
                </Badge>
              ))}
              {mentor.skills.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground"
                >
                  +{mentor.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Rating Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Star className="w-4 h-4 shrink-0 fill-amber-400 text-amber-400" />
            <span>
              {mentor.avgRating.toFixed(1)} ({mentor.totalRatings} {mentor.totalRatings === 1 ? 'đánh giá' : 'đánh giá'})
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Kinh nghiệm</div>
              <div className="font-bold text-base">{mentor.yearsOfExperience} năm</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Giá TB/ giờ</div>
              <div className="font-bold text-base">{mentor.pricePerHour.toLocaleString('vi-VN')}đ</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
