import { MessageSquare, Users, CalendarClock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const mainFeatures = [
  {
    icon: MessageSquare,
    title: "Trò chuyện với người hướng dẫn",
    description:
      "Kết nối ngay lập tức với người hướng dẫn qua tin nhắn thời gian thực. Chia sẻ tài liệu, đặt câu hỏi và nhận hướng dẫn bất cứ khi nào bạn cần.",
  },
  {
    icon: Users,
    title: "Diễn đàn",
    description:
      "Tham gia diễn đàn cộng đồng sôi động của chúng tôi. Tham gia thảo luận, chia sẻ kinh nghiệm và học hỏi từ người hướng dẫn và học viên từ nhiều ngành nghề.",
  },
  {
    icon: CalendarClock,
    title: "Đồng bộ lịch với Google Calendar",
    description:
      "Tích hợp liền mạch các buổi học với Google Calendar. Không bao giờ bỏ lỡ cuộc họp với tính năng đồng bộ tự động và nhắc nhở.",
  },
];

export function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tính năng chính
          </h2>
          <p className="text-lg text-muted-foreground">
            Mọi thứ bạn cần để làm cho hành trình cố vấn của bạn trôi chảy và
            hiệu quả.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mainFeatures.map((feature) => (
            <Card
              key={feature.title}
              className="border bg-card hover:shadow-lg transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mx-auto mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
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
