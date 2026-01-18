import { ShieldX, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export const Error403 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* 403 with Lock Icon */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center">
            <span className="text-[200px] md:text-[280px] font-bold text-muted-foreground/20 select-none leading-none">
              4
            </span>
            <div className="relative mx-4 md:mx-8">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldX className="w-20 h-20 md:w-24 md:h-24 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <span className="text-[200px] md:text-[280px] font-bold text-muted-foreground/20 select-none leading-none">
              3
            </span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Truy cập bị từ chối
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc quay về trang chủ.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate({ to: "/" })}
            className="gap-2"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Button>
          <Button
            onClick={() => window.location.href = "mailto:support@mentorplatform.com"}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <HelpCircle className="w-4 h-4" />
            Hỗ trợ
          </Button>
        </div>

        {/* Related Links */}
        <div className="mt-16">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4 text-center">
            CÁC LIÊN KẾT HỮU ÍCH
          </p>
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <button
              onClick={() => navigate({ to: "/user/profile" })}
              className="text-primary hover:underline"
            >
              Hỗ sơ của tôi
            </button>
            <button
              onClick={() => navigate({ to: "/mentors" })}
              className="text-primary hover:underline"
            >
              Tìm kiếm mentor
            </button>
            <button
              onClick={() => navigate({ to: "/forum" })}
              className="text-primary hover:underline"
            >
              Câu hỏi thường gặp
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex gap-6">
              <button className="hover:text-foreground transition-colors">
                Điều khoản
              </button>
              <button className="hover:text-foreground transition-colors">
                Bảo mật
              </button>
              <button className="hover:text-foreground transition-colors">
                Trợ giúp
              </button>
            </div>
            <p>© 2024 MentorPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
