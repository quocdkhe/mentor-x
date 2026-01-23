import { createLazyRoute, getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useGetMentorProfile } from "@/api/mentor";
import { useGetMentorReviews, useToggleUpvote } from "@/api/review";
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
import { BookingDialog } from "@/components/features/booking/booking-dialog";
import { ApiPagination } from "@/components/api-pagination";
import { MentorProfileSkeleton } from "@/components/skeletons/mentor-profile.skeleton";
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
  ArrowLeft,
  LogIn,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { USER_ROLES } from "@/types/user";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { useGetAvailability } from "@/api/availability";

const MentorProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const route = user?.role === USER_ROLES.USER ? getRouteApi('/user/mentors/$mentorId') : getRouteApi('/public/mentors/$mentorId');
  const { mentorId } = route.useParams();
  const { data: mentor, isLoading, error } = useGetMentorProfile(mentorId);
  // const { data: availabilites, isLoading: isLoadingAvailabilities } = useGetAvailability(mentorId);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetMentorReviews(mentorId, reviewPage, 5);
  const { mutate: toggleUpvote } = useToggleUpvote();
  const queryClient = useQueryClient();
  const navigator = useNavigate();

  const handleToggleUpvote = (reviewId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }
    toggleUpvote(reviewId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mentor-reviews", mentorId] });
      },
      onError: (err: AxiosError<{ message?: string }>) => {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra");
      }
    });
  };

  if (isLoading) {
    return <MentorProfileSkeleton />
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
            <Link to={user?.role === USER_ROLES.USER ? "/user/mentors" : "/mentors"}>
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
                        {user && mentor.meetingHours > 0 && (
                          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary shadow-sm">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-sm">Bạn đã học {mentor.meetingHours.toFixed(1)} giờ cùng Mentor này</span>
                          </div>
                        )}
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
                    <div
                      className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-8"
                      dangerouslySetInnerHTML={{ __html: mentor.biography }}
                    />

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
                        {/* <ul className="space-y-2 text-sm text-muted-foreground max-w-md">
                          {availabilites && availabilites.filter((a) => a.isActive).length > 0 ? (
                            availabilites
                              ?.filter((availability) => availability.isActive)
                              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                              .map((availability, index) => {
                                // Map day numbers to Vietnamese names (0=Sunday, 1=Monday, etc.)
                                const dayNameVi = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

                                // Trim seconds from time format (13:00:00 -> 13:00)
                                const formatTime = (time: string) => time.substring(0, 5);

                                return (
                                  <li key={index} className="flex justify-between items-center">
                                    <span className="font-medium text-foreground">{dayNameVi[availability.dayOfWeek]}</span>
                                    <span className="text-muted-foreground">{formatTime(availability.startTime)} - {formatTime(availability.endTime)}</span>
                                  </li>
                                );
                              })
                          ) : (
                            <li className="text-muted-foreground italic">Chưa có lịch rảnh</li>
                          )}
                        </ul> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab Content */}
              <TabsContent value="reviews" className="mt-6">
                <Card className="rounded-2xl shadow-sm border">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6">Đánh giá</h2>

                    {isLoadingReviews ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="animate-pulse border rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 bg-muted rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="h-3 bg-muted rounded w-1/3" />
                                <div className="h-16 bg-muted rounded w-full mt-2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !reviewsData || reviewsData.items.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Chưa có đánh giá nào.</p>
                    ) : (
                      <div className="space-y-4">
                        {reviewsData.items.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-4">
                              {/* User Avatar */}
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={review.menteeAvatar || undefined} alt={review.menteeName} />
                                <AvatarFallback>{review.menteeName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                {/* User Info and Date */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <h4 className="font-semibold text-sm">{review.menteeName}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      Đã học: {" "}
                                      {format(new Date(review.appointmentStartAt), "dd/MM/yyyy · HH:mm", { locale: vi })}
                                      {" - "}
                                      {format(new Date(review.appointmentEndAt), "HH:mm", { locale: vi })}
                                    </p>
                                  </div>

                                  {/* Stars */}
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                      <Star
                                        key={idx}
                                        className={`h-4 w-4 ${idx < review.rating
                                          ? "fill-orange-400 text-orange-400"
                                          : "text-gray-300"
                                          }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Comment */}
                                {review.comment && (
                                  <p className="text-sm text-foreground leading-relaxed mb-3">
                                    {review.comment}
                                  </p>
                                )}

                                {/* Upvote Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`gap-2 h-8 px-3 text-muted-foreground hover:text-primary ${review.isUpvotedByCurrentUser ? 'bg-primary/10' : ''}`}
                                  onClick={() => handleToggleUpvote(review.id)}
                                >
                                  <ThumbsUp className={`h-4 w-4 ${review.isUpvotedByCurrentUser ? 'fill-primary text-primary' : ''}`} />
                                  <span className={`text-xs ${review.isUpvotedByCurrentUser ? 'text-primary font-medium' : ''}`}>
                                    Hữu ích {review.upvoteCount > 0 && `(${review.upvoteCount})`}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <ApiPagination
                          pagination={reviewsData}
                          onPageChange={setReviewPage}
                        />
                      </div>
                    )}
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
                  {user ? (
                    user.role === USER_ROLES.USER && (<div className="space-y-3">
                      <Button className="w-full gap-2" onClick={() => setIsBookingOpen(true)}>
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
                    </div>)
                  ) : (<div className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      onClick={() => navigator({ to: '/login' })}
                    >
                      <LogIn className="w-5 h-5" />
                      Đăng nhập để đặt lịch
                    </Button>
                  </div>)}


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
      {
        mentor && (
          <BookingDialog
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            mentor={mentor}
          />
        )
      }
    </div>
  );
};

export const Route = createLazyRoute("/public/mentors/$mentorId")({
  component: MentorProfilePage,
});

export const UserRoute = createLazyRoute("/user/mentors/$mentorId")({
  component: MentorProfilePage,
});
