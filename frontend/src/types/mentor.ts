export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Availability {
  day: string;
  slots: string[];
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  biography: string;
  avgRating: number;
  totalRatings: number;
  skills: string[];
  pricePerHour: number;
  currency: string;
  experience: string;
  languages: string[];
  timezone: string;
  responseTime: string;
  completedSessions: number;
  availability: Availability[];
  reviews: Review[];
}

export interface MentorCard {
    id: string;
    name: string;
    avatar: string;
    biography: string;
    avgRating: number;
    totalRatings: number;
    skills: string[];
    pricePerHour: number;
}