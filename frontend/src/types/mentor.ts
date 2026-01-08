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

export interface MentorInfo {
  id: string;
  name: string;
  avatar: string;
  biography: string;
  avgRating: number;
  totalRatings: number;
  skills: string[];
  pricePerHour: number;
}

export interface MentorProfile {
  user: {
    name: string;
    phone: string;
    password: string;
    confirmPassword: string;
    avatar: string;
  },
  biography: string;
  pricePerHours: number;
  skill: string[];
  employer: string;
  company: string;
  yearsOfExperience: number;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
}