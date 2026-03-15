import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-1">
            Cộng đồng Mentor chuyên gia đầu ngành
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Tìm Mentor phù hợp,
            <span className="block text-primary mt-2">bứt phá sự nghiệp của bạn</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
            Mentor-X giúp bạn kết nối trực tiếp với các chuyên gia thực chiến.
            Nhận lời khuyên đúng lúc, học hỏi kinh nghiệm đúng chỗ để rút ngắn con đường đến thành công.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="h-12 px-8 text-base gap-2"
              onClick={() => navigate({ to: "/mentors" })}
            >
              Khám phá Mentor
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              onClick={() => navigate({ to: "/become-mentor" })}
            >
              Trở thành Mentor
            </Button>
          </div>
        </div>
      </div>

      {/* Một chút hiệu ứng nền cho bớt trống trải sau khi bỏ thống kê */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-10 blur-[100px] bg-primary rounded-full" />
    </section>
  );
}