export const WeekDayEnum = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;

export type WeekDayEnum = (typeof WeekDayEnum)[keyof typeof WeekDayEnum];

export interface Availability {
  dayOfWeek: WeekDayEnum;
  startTime: string; // "09:00"
  endTime: string; // "17:30"
  isActive: boolean;
}
