import { Briefcase, Bell, Calendar, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Mentor, MentorInfo } from '@/types/mentor';

interface MentorCardProps {
  mentor: MentorInfo;
}

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group p-0">
      <div className="relative">
    <img
      src={mentor.avatar}
      alt={mentor.name}
      className="w-full h-80 object-cover block"
    />

    <Badge className="absolute top-4 left-4 bg-white text-slate-900 font-semibold px-4 py-1.5">
      Top rated
    </Badge>

    <div className="absolute top-4 right-4 bg-amber-500/90 p-3 rounded-lg">
      <Award className="w-6 h-6 text-white" />
    </div>

    <Badge className="absolute bottom-4 left-4 bg-amber-500 text-slate-900 font-semibold px-4 py-2 text-sm">
      <Calendar className="w-4 h-4 mr-2" />
      expert
    </Badge>
  </div>

      <div className="p-5">
        <h3 className="font-bold text-xl mb-1">
          {mentor.name} <span className="text-muted-foreground font-normal text-sm">SE</span>
        </h3>

        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
          <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {/* {mentor.job_title} at {mentor.company} */}
            title at company
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Bell className="w-4 h-4 flex-shrink-0" />
          <span>
            {mentor.totalRatings} sessions <span className="text-muted-foreground/70">({mentor.avgRating} reviews)</span>
          </span>
        </div>

        <div className="-mx-5 -mb-5 px-5 py-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Experience</div>
            <div className="font-bold text-lg">{mentor.pricePerHour} years</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Avg. Attendance</div>
            <div className="font-bold text-lg">{mentor.pricePerHour}%</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
