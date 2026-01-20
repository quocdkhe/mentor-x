import { ArrowRight, Users, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            Được tin dùng bởi hơn 10,000 người hướng dẫn và học viên
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Kết nối với người hướng dẫn
            <span className="block">định hình tương lai của bạn</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            Mentor-X kết nối các chuyên gia ngành nghề với những người đam mê phát triển sự nghiệp.
            Tìm người hướng dẫn hoàn hảo và thúc đẩy sự nghiệp của bạn ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="gap-2" onClick={() => navigate({ to: "/mentors" })}>
              Tìm người hướng dẫn
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Trở thành người hướng dẫn
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t w-full max-w-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">5,000+</span>
              <span className="text-sm text-muted-foreground">
                Người hướng dẫn
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary">
                <Target className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">50,000+</span>
              <span className="text-sm text-muted-foreground">
                Buổi học hoàn thành
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">95%</span>
              <span className="text-sm text-muted-foreground">
                Mức độ hài lòng
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
