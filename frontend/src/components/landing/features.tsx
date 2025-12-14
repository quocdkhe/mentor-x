import {
  Search,
  Calendar,
  MessageSquare,
  BarChart3,
  Shield,
  Globe,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Ghép đôi thông minh",
    description:
      "Thuật toán AI của chúng tôi kết nối bạn với người hướng dẫn phù hợp với mục tiêu, ngành nghề và phong cách học tập của bạn.",
  },
  {
    icon: Calendar,
    title: "Lịch trình linh hoạt",
    description:
      "Đặt lịch phù hợp với thời gian của bạn. Dễ dàng thay đổi lịch và không bao giờ bỏ lỡ cơ hội học tập.",
  },
  {
    icon: MessageSquare,
    title: "Giao tiếp liền mạch",
    description:
      "Trò chuyện, gọi video hoặc chia sẻ tài liệu - tất cả trong nền tảng bảo mật được thiết kế cho các cuộc trò chuyện hiệu quả.",
  },
  {
    icon: BarChart3,
    title: "Theo dõi tiến độ",
    description:
      "Đặt mục tiêu, theo dõi các cột mốc và trực quan hóa hành trình phát triển của bạn với phân tích chi tiết.",
  },
  {
    icon: Shield,
    title: "Người hướng dẫn được xác minh",
    description:
      "Mỗi người hướng dẫn đều được kiểm tra về chuyên môn và tính chuyên nghiệp, đảm bảo bạn học từ những người giỏi nhất.",
  },
  {
    icon: Globe,
    title: "Mạng lưới toàn cầu",
    description:
      "Tiếp cận người hướng dẫn từ khắp nơi trên thế giới. Phá vỡ rào cản địa lý và có được nhiều góc nhìn đa dạng.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mọi thứ bạn cần để thành công
          </h2>
          <p className="text-lg text-muted-foreground">
            Các tính năng mạnh mẽ được thiết kế để làm cho việc cố vấn dễ tiếp cận, hiệu quả
            và mang tính chuyển đổi cho tất cả mọi người.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border bg-card hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
