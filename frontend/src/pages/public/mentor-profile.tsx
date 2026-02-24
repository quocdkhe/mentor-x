import { createLazyRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useGetMentorProfile } from "@/api/mentor";
import { useGetMentorReviews, useToggleUpvote } from "@/api/review";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookingDrawer } from "@/components/features/booking/booking-drawer";
import { ApiPagination } from "@/components/api-pagination";
import { MentorProfileSkeleton } from "@/components/skeletons/mentor-profile.skeleton";
import {
  Calendar,
  CheckCircle,
  Info,
  Star,
  StarHalf,
  Briefcase,
  Clock,
  Brain,
  ArrowLeft,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { USER_ROLES } from "@/types/user";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetAvailability } from "@/api/availability";

const MentorProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const route =
    user?.role === USER_ROLES.USER
      ? getRouteApi("/user/mentors/$mentorId")
      : getRouteApi("/public/mentors/$mentorId");
  const { mentorId } = route.useParams();
  const { data: mentor, isLoading, error } = useGetMentorProfile(mentorId);
  const { data: availabilites, isLoading: isLoadingAvailabilities } =
    useGetAvailability(mentorId);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const { data: reviewsData, isLoading: isLoadingReviews } =
    useGetMentorReviews(mentorId, reviewPage, 5);
  const { mutate: toggleUpvote } = useToggleUpvote();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );

    const sections = ["about", "availability", "reviews"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeightStr = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--navbar-height");
      const navbarHeight = parseInt(navbarHeightStr) || 64;
      const tabNavHeight = 60;
      const offset = navbarHeight + tabNavHeight;
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleToggleUpvote = (reviewId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return;
    }
    toggleUpvote(reviewId, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["mentor-reviews", mentorId],
        });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Có lỗi xảy ra");
      },
    });
  };

  if (isLoading) {
    return <MentorProfileSkeleton />;
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-destructive font-medium">
          Không thể tải hồ sơ mentor
        </p>
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
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-5 h-5 fill-orange-400 text-orange-400"
        />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-5 h-5 fill-orange-400 text-orange-400"
        />,
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2 hover:bg-muted">
            <Link
              to={user?.role === USER_ROLES.USER ? "/user/mentors" : "/mentors"}
            >
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
                        <AvatarImage
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-4xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <div className="flex flex-row items-center gap-2">
                          <h1 className="text-3xl font-bold mb-1">
                            {mentor.name}
                          </h1>
                          {mentor.isVerified && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
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
                            <span className="font-bold text-sm">
                              Bạn đã học {mentor.meetingHours.toFixed(1)} giờ
                              cùng Mentor này
                            </span>
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

                    <div className="flex items-center gap-1.5 mt-4">
                      {mentor.isVerified && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 px-3 py-1 rounded-full"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            Được kiểm duyệt bởi MentorX
                          </span>
                        </Badge>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-4">
                      <div className="flex text-orange-400">
                        {renderStars(mentor.avgRating)}
                      </div>
                      <span className="font-bold text-lg">
                        {mentor.avgRating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-sm underline cursor-pointer hover:text-primary">
                        ({mentor.totalRatings} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div
              className="sticky z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-2 -mx-2 px-2"
              style={{ top: "var(--navbar-height, 64px)" }}
            >
              <div className="w-full grid grid-cols-3 h-11 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <button
                  onClick={() => scrollToSection("about")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full ${
                    activeSection === "about"
                      ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/20 border-primary/20"
                      : "hover:text-foreground text-muted-foreground"
                  }`}
                >
                  Về tôi
                </button>
                <button
                  onClick={() => scrollToSection("availability")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full ${
                    activeSection === "availability"
                      ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/20 border-primary/20"
                      : "hover:text-foreground text-muted-foreground"
                  }`}
                >
                  Lịch rảnh
                </button>
                <button
                  onClick={() => scrollToSection("reviews")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full ${
                    activeSection === "reviews"
                      ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/20 border-primary/20"
                      : "hover:text-foreground text-muted-foreground"
                  }`}
                >
                  Đánh giá
                </button>
              </div>
            </div>

            <div className="space-y-8 mt-6">
              {/* About Section */}
              <div id="about" className="scroll-mt-32">
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Availability Section */}
              <div id="availability" className="scroll-mt-32">
                <Card className="rounded-2xl shadow-sm border">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6">
                      Lịch rảnh trong tuần
                    </h2>
                    {isLoadingAvailabilities ? (
                      <div className="space-y-4">
                        {Array.from({ length: 7 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="animate-pulse flex items-center gap-4"
                          >
                            <div className="h-6 w-24 bg-muted rounded" />
                            <div className="flex gap-2 flex-1">
                              <div className="h-8 w-32 bg-muted rounded-full" />
                              <div className="h-8 w-32 bg-muted rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !availabilites ||
                      availabilites.filter((a) => a.isActive).length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Chưa có lịch rảnh.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* Map day numbers to Vietnamese names (0=Sunday, 1=Monday, etc.) */}
                        {(() => {
                          const dayNameVi = [
                            "Chủ Nhật",
                            "Thứ Hai",
                            "Thứ Ba",
                            "Thứ Tư",
                            "Thứ Năm",
                            "Thứ Sáu",
                            "Thứ Bảy",
                          ];

                          // Format time (13:00:00 -> 13:00)
                          const formatTime = (time: string) =>
                            time.substring(0, 5);

                          // Group availabilities by day
                          const availabilityByDay = new Map<
                            number,
                            typeof availabilites
                          >();
                          availabilites
                            .filter((a) => a.isActive)
                            .forEach((availability) => {
                              if (
                                !availabilityByDay.has(availability.dayOfWeek)
                              ) {
                                availabilityByDay.set(
                                  availability.dayOfWeek,
                                  [],
                                );
                              }
                              availabilityByDay
                                .get(availability.dayOfWeek)!
                                .push(availability);
                            });

                          // Sort days (Monday first)
                          const sortedDays = Array.from(
                            availabilityByDay.keys(),
                          ).sort((a, b) => {
                            // Convert Sunday (0) to 7 for proper sorting
                            const adjustedA = a === 0 ? 7 : a;
                            const adjustedB = b === 0 ? 7 : b;
                            return adjustedA - adjustedB;
                          });

                          return sortedDays.map((dayOfWeek) => (
                            <div
                              key={dayOfWeek}
                              className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 border-b last:border-b-0"
                            >
                              <div className="w-24 shrink-0">
                                <span className="font-medium text-foreground">
                                  {dayNameVi[dayOfWeek]}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {availabilityByDay
                                  .get(dayOfWeek)!
                                  .map((slot, idx) => (
                                    <Badge
                                      key={idx}
                                      className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium hover:bg-primary/20"
                                    >
                                      {formatTime(slot.startTime)} -{" "}
                                      {formatTime(slot.endTime)}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Section */}
              <div id="reviews" className="scroll-mt-32">
                <Card className="rounded-2xl shadow-sm border">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6">Đánh giá</h2>

                    {isLoadingReviews ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="animate-pulse border rounded-lg p-4"
                          >
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
                      <p className="text-muted-foreground text-center py-8">
                        Chưa có đánh giá nào.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {reviewsData.items.map((review) => (
                          <div
                            key={review.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              {/* User Avatar */}
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={review.menteeAvatar || undefined}
                                  alt={review.menteeName}
                                  className="object-cover"
                                />
                                <AvatarFallback>
                                  {review.menteeName
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                {/* User Info and Date */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <h4 className="font-semibold text-sm">
                                      {review.menteeName}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Đã học:{" "}
                                      {format(
                                        new Date(review.appointmentStartAt),
                                        "dd/MM/yyyy · HH:mm",
                                        { locale: vi },
                                      )}
                                      {" - "}
                                      {format(
                                        new Date(review.appointmentEndAt),
                                        "HH:mm",
                                        { locale: vi },
                                      )}
                                    </p>
                                  </div>

                                  {/* Stars */}
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                      <Star
                                        key={idx}
                                        className={`h-4 w-4 ${
                                          idx < review.rating
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
                                  className={`gap-2 h-8 px-3 text-muted-foreground hover:text-primary ${review.isUpvotedByCurrentUser ? "bg-primary/10" : ""}`}
                                  onClick={() => handleToggleUpvote(review.id)}
                                >
                                  <ThumbsUp
                                    className={`h-4 w-4 ${review.isUpvotedByCurrentUser ? "fill-primary text-primary" : ""}`}
                                  />
                                  <span
                                    className={`text-xs ${review.isUpvotedByCurrentUser ? "text-primary font-medium" : ""}`}
                                  >
                                    Hữu ích{" "}
                                    {review.upvoteCount > 0 &&
                                      `(${review.upvoteCount})`}
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
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking */}
          <div className="lg:col-span-3 space-y-6">
            <div
              className="sticky space-y-6"
              style={{ top: "calc(var(--navbar-height, 64px) + 1rem)" }}
            >
              {/* Pricing and Booking Card */}
              <Card className="rounded-2xl shadow-lg border">
                <CardContent className="p-6 sm:p-8">
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center text-primary font-bold">
                      <span className="text-3xl mr-1">
                        {formatPrice(mentor.pricePerHour)}
                      </span>
                      <span className="text-xl">VND</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1 font-medium">
                      giá mỗi giờ
                    </p>
                  </div>

                  {/* Action Buttons - using primary color */}
                  {(!user || user.role === USER_ROLES.USER) && (
                    <div className="space-y-3">
                      <Button
                        className="w-full gap-2"
                        onClick={() => setIsBookingOpen(true)}
                      >
                        <Calendar className="w-5 h-5" />
                        Đặt lịch
                      </Button>
                    </div>
                  )}

                  {/* Features */}
                  <div className="h-px bg-border my-6"></div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Xác nhận đặt lịch ngay lập tức
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Hủy lịch miễn phí trước 24 giờ
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        Video call bảo mật và ổn định
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Info Alert */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-snug">
                  {mentor.name} thường phản hồi trong vòng vài giờ. Hãy đặt lịch
                  sớm để giữ chỗ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {mentor && (
        <BookingDrawer
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          mentor={mentor}
        />
      )}
    </div>
  );
};

export const Route = createLazyRoute("/public/mentors/$mentorId")({
  component: MentorProfilePage,
});

export const UserRoute = createLazyRoute("/user/mentors/$mentorId")({
  component: MentorProfilePage,
});
