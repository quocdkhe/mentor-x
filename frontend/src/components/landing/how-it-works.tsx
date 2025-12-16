import { UserPlus, Search, CalendarCheck, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Tạo hồ sơ của bạn",
    description:
      "Đăng ký và cho chúng tôi biết về mục tiêu, sở thích của bạn và những gì bạn muốn đạt được thông qua việc cố vấn.",
  },
  {
    icon: Search,
    step: "02",
    title: "Tìm người phù hợp",
    description:
      "Duyệt qua danh sách người hướng dẫn được tuyển chọn hoặc để hệ thống ghép đôi thông minh tìm người phù hợp nhất cho bạn.",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Đặt lịch buổi học",
    description:
      "Lên lịch cho buổi gặp đầu tiên vào thời gian phù hợp cho cả hai. Bắt đầu với cuộc gọi giới thiệu miễn phí.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Cùng nhau phát triển",
    description:
      "Tham gia các buổi học thường xuyên, theo dõi tiến độ của bạn và đạt được các mục tiêu cá nhân và nghề nghiệp.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mentor-X hoạt động như thế nào
          </h2>
          <p className="text-lg text-muted-foreground">
            Bắt đầu rất đơn giản. Làm theo bốn bước này để bắt đầu
            hành trình cố vấn của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-[2px] bg-border" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex items-center justify-center h-24 w-24 rounded-full bg-secondary mb-6">
                    <item.icon className="h-10 w-10" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
