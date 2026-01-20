import { createLazyRoute, Link } from '@tanstack/react-router';
import { Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export function UserHomePage() {
  const user = useSelector((state: RootState) => state.auth.user);

  const firstName = user?.name?.split(' ')[0] || 'Bạn';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Chào mừng trở lại, {firstName}.
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Hành trình học tập của bạn đang đi đúng hướng. Sẵn sàng cho buổc tiếp theo hôm nay chưa?
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
        {/* Find Mentor Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Tìm kiếm Mentor</CardTitle>
            <CardDescription className="text-base pt-2">
              Kết nối với các chuyên gia hàng đầu để nhận lời khuyên và định hướng nghề nghiệp phù hợp với bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Button asChild className="group-hover:scale-105 transition-transform">
              <Link to="/mentors">
                Bắt đầu tìm kiếm <span className="ml-1">→</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* View Schedule Card */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Xem lịch học của tôi</CardTitle>
            <CardDescription className="text-base pt-2">
              Theo dõi các buổi mentoring sắp tới, xem lại lịch sử và chuẩn bị sẵn sàng cho buổi gặp tiếp theo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Button asChild className="group-hover:scale-105 transition-transform">
              <Link to="/user/schedules">
                Xem chi tiết <span className="ml-1">→</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Process Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Quy trình Mentor</h2>
          <p className="text-muted-foreground text-lg">
            Ba bước đơn giản để phát triển bản thân
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-center group">
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Tìm Mentor Phù Hợp</h3>
              <p className="text-muted-foreground">
                Duyệt qua hồ sơ các chuyên gia đưa ra lời khuyên về kỹ năng, kinh nghiệm và đánh giá từ cộng đồng.
              </p>
            </div>
            {/* Connector Line - Hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="text-center group">
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Đặt Lịch Hẹn</h3>
              <p className="text-muted-foreground">
                Chọn khung giờ phù hợp với lịch trình của bạn và mentor để bắt đầu buổi trao đổi.
              </p>
            </div>
            {/* Connector Line - Hidden on mobile */}
            <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          {/* Step 3 */}
          <div className="text-center group">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Học Hỏi & Phát Triển</h3>
            <p className="text-muted-foreground">
              Tham gia buổi session 1:1, nhận phản hồi và áp dụng vào công việc thực tế.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/user/')({
  component: UserHomePage,
});
