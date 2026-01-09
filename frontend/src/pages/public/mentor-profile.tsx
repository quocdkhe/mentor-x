import { createLazyRoute, getRouteApi } from "@tanstack/react-router";
import { useGetMentorProfile } from "@/api/mentor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";
import { useState } from "react";

const route = getRouteApi('/public/mentors/$mentorId');

// Fake data for available sessions
const FAKE_DATES = [
  { day: "SAT", date: "10 Jan", slots: 36 },
  { day: "SUN", date: "11 Jan", slots: 94 },
  { day: "MON", date: "12 Jan", slots: 94 },
  { day: "TUE", date: "13 Jan", slots: 94 },
  { day: "WED", date: "14 Jan", slots: 94 },
];

const FAKE_TIME_SLOTS = [
  "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
  "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM",
  "5:00 PM", "5:15 PM", "5:30 PM"
];

const MentorProfilePage = () => {
  const { mentorId } = route.useParams();
  const { data: mentor, isLoading, error } = useGetMentorProfile(mentorId);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return <DefaultSkeleton />
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-destructive font-medium">Không thể tải hồ sơ mentor</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Thử lại
        </Button>
      </div>
    );
  }

  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "reviews", label: "Đánh giá", badge: mentor.totalRatings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Teal Header with Decorative Circles */}
      <div className="relative bg-linear-to-r from-teal-600 to-teal-700 overflow-hidden h-32">
        {/* Decorative circles */}
        <div className="absolute w-64 h-64 bg-green-500/30 rounded-full -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-teal-500/20 rounded-full top-10 right-20"></div>
        <div className="absolute w-48 h-48 bg-emerald-400/25 rounded-full -bottom-10 right-40"></div>
      </div>

      {/* Profile Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 -mt-16">
          <div className="flex items-start gap-6 pb-6">
            {/* Larger Avatar with White Background */}
            <Avatar className="h-40 w-40 border-4 border-white shadow-xl shrink-0 bg-white">
              <AvatarImage src={mentor.avatar} alt={mentor.name} />
              <AvatarFallback className="text-4xl bg-white text-foreground">{initials}</AvatarFallback>
            </Avatar>

            {/* Name and Position */}
            <div className="grow pt-20">
              <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                {mentor.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                <strong>{mentor.position}</strong> tại <strong>{mentor.company}</strong>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <Badge className="ml-2 bg-muted text-foreground hover:bg-muted/80 text-xs px-2">
                    {tab.badge}
                  </Badge>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Biography & Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Background Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Lý lịch</h2>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {mentor.biography}
              </p>
            </div>
          </div>

          {/* Right Sidebar - Availability */}
          <div className="space-y-6">
            {/* Available Sessions */}
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Đặt lịch tại đây</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Đặt các buổi 1:1 từ các tùy chọn dựa trên nhu cầu của bạn
                </p>

                {/* Date Selector */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {FAKE_DATES.map((date, idx) => (
                    <button
                      key={idx}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${idx === 0
                        ? "border-foreground bg-background"
                        : "border-border hover:border-foreground/50"
                        }`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">{date.day}</div>
                      <div className="font-semibold text-sm mb-1">{date.date}</div>
                      <div className="text-xs text-green-600 font-medium">{date.slots} chỗ</div>
                    </button>
                  ))}
                </div>

                {/* Available Time Slots */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Khung giờ có sẵn</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {FAKE_TIME_SLOTS.slice(0, 6).map((time, idx) => (
                      <button
                        key={idx}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${idx === 0
                          ? "border-foreground bg-background font-medium"
                          : "border-border text-muted-foreground hover:border-foreground/50"
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createLazyRoute("/public/mentors/$mentorId")({
  component: MentorProfilePage,
});
