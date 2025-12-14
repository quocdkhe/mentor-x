import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Kỹ sư phần mềm tại Google",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    initials: "SC",
    content:
      "Mentor-X đã thay đổi hoàn toàn quỹ đạo sự nghiệp của tôi. Người hướng dẫn đã giúp tôi định hướng trong ngành công nghệ và có được công việc mơ ước. Nền tảng giúp kết nối và đặt lịch vô cùng dễ dàng.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Quản lý sản phẩm tại Stripe",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    initials: "MJ",
    content:
      "Là người chuyển từ kỹ thuật sang quản lý sản phẩm, tìm đúng người hướng dẫn rất quan trọng. Thuật toán ghép đôi của Mentor-X đã tìm cho tôi một lãnh đạo PM hiểu rõ nền tảng của tôi.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Nhà sáng lập Startup",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    initials: "ER",
    content:
      "Những người hướng dẫn trên nền tảng này thật xuất sắc. Tôi đã tìm được cố vấn giúp tôi hoàn thiện mô hình kinh doanh và huy động vốn. Đáng giá từng xu.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Nhà thiết kế UX tại Airbnb",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    initials: "DP",
    content:
      "Tính năng theo dõi tiến độ thật tuyệt vời. Tôi có thể thấy mình đã tiến xa đến đâu trong sự nghiệp thiết kế nhờ sự hướng dẫn. Phản hồi từ người hướng dẫn luôn mang tính xây dựng và thực tế.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Nhà khoa học dữ liệu tại Netflix",
    avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
    initials: "AP",
    content:
      "Bước chân vào khoa học dữ liệu cảm giác như điều bất khả thi cho đến khi tìm được người hướng dẫn qua Mentor-X. Sự hướng dẫn cá nhân hóa đã tạo nên sự khác biệt trong tìm kiếm việc làm.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Quản lý kỹ thuật tại Meta",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
    initials: "JW",
    content:
      "Tôi bắt đầu là học viên và giờ là người hướng dẫn trên nền tảng. Thật ý nghĩa khi giúp đỡ người khác định hướng sự nghiệp. Nền tảng tạo điều kiện cho những kết nối có ý nghĩa.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Được yêu thích bởi hàng nghìn người
          </h2>
          <p className="text-lg text-muted-foreground">
            Xem cộng đồng của chúng tôi nói gì về trải nghiệm cố vấn
            trên Mentor-X.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border bg-card">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
