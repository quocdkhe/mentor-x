import { createLazyRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useGetMentorProfile } from "@/api/mentor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";
import {
  Calendar,
  MessageCircle,
  CheckCircle,
  Info,
  Star,
  StarHalf,
  Briefcase,
  Clock,
  Brain,
  CalendarClock,
  ArrowLeft
} from "lucide-react";

const route = getRouteApi('/public/mentors/$mentorId');

const MentorProfilePage = () => {
  const { mentorId } = route.useParams();
  const { data: mentor, isLoading, error } = useGetMentorProfile(mentorId);

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

  // Format price to Vietnamese currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 fill-orange-400 text-orange-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-5 h-5 fill-orange-400 text-orange-400" />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 hover:bg-muted">
            <Link to="/mentors">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Profile Header Card */}
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar with gradient border and online status */}
                  <div className="shrink-0 relative mx-auto sm:mx-0">
                    <div className="h-32 w-32 rounded-full p-1 bg-linear-to-tr from-primary to-purple-300">
                      <Avatar className="h-full w-full border-4 border-card">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} className="object-cover" />
                        <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-bold mb-1">{mentor.name}</h1>
                        <p className="text-lg text-muted-foreground font-medium">
                          {mentor.position} tại {mentor.company}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-muted-foreground text-sm">
                          <Briefcase className="w-4 h-4" />
                          <span>{mentor.company}</span>
                        </div>

                        {/* Study hours badge - using primary color */}
                        {/* <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary shadow-sm">
                          <History className="w-5 h-5" />
                          <span className="font-bold text-sm">Bạn đã học 4 giờ cùng Mentor này</span>
                        </div> */}
                      </div>
                    </div>

                    {/* Experience and Response Time */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-y-2 gap-x-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {mentor.yearsOfExperience} năm kinh nghiệm
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Phản hồi trong 2 giờ
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                      <div className="flex text-orange-400">
                        {renderStars(mentor.avgRating)}
                      </div>
                      <span className="font-bold text-lg">{mentor.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm underline cursor-pointer hover:text-primary">
                        ({mentor.totalRatings} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-11">
                <TabsTrigger value="about" className="w-full data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/20">
                  Về tôi
                </TabsTrigger>
                <TabsTrigger value="reviews" className="w-full data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/20">
                  Đánh giá
                </TabsTrigger>
              </TabsList>

              {/* About Tab Content */}
              <TabsContent value="about" className="mt-6">
                <Card className="rounded-2xl shadow-sm border">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-4">Về tôi</h2>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-8">
                      <p>{mentor.biography}</p>
                    </div>

                    <div className="space-y-8 pt-6 border-t">
                      {/* Skills */}
                      <div>
                        <div className="flex items-center gap-2 mb-4 text-primary">
                          <Brain className="w-5 h-5" />
                          <h3 className="font-bold">Kỹ năng</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills.map((skill, idx) => (
                            <Badge
                              key={idx}
                              className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Availability Schedule */}
                      <div>
                        <div className="flex items-center gap-2 mb-4 text-primary">
                          <CalendarClock className="w-5 h-5" />
                          <h3 className="font-bold">Lịch rảnh</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-muted-foreground max-w-md">
                          <li className="flex justify-between">
                            <span>Thứ 2 - Thứ 6</span>
                            <span className="font-medium text-foreground">19:00 - 22:00</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Cuối tuần</span>
                            <span className="font-medium text-foreground">09:00 - 18:00</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab Content */}
              <TabsContent value="reviews" className="mt-6">
                <Card className="rounded-2xl shadow-sm border">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-4">Đánh giá</h2>
                    <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Booking */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Pricing and Booking Card */}
              <Card className="rounded-2xl shadow-lg border">
                <CardContent className="p-6 sm:p-8">
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center text-primary font-bold">
                      <span className="text-3xl mr-1">{formatPrice(mentor.pricePerHour)}</span>
                      <span className="text-xl">VND</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1 font-medium">giá mỗi giờ</p>
                  </div>

                  {/* Action Buttons - using primary color */}
                  <div className="space-y-3">
                    <Button className="w-full gap-2">
                      <Calendar className="w-5 h-5" />
                      Đặt lịch
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Gửi tin nhắn
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="h-px bg-border my-6"></div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Xác nhận đặt lịch ngay lập tức</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Hủy lịch miễn phí trước 24 giờ</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Video call bảo mật và ổn định</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Info Alert */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-snug">
                  {mentor.name} thường phản hồi trong vòng vài giờ. Hãy đặt lịch sớm để giữ chỗ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createLazyRoute("/public/mentors/$mentorId")({
  component: MentorProfilePage,
});
