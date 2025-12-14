import { GraduationCap, Twitter, Linkedin, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  product: {
    title: "Sản phẩm",
    links: [
      { label: "Tính năng", href: "#features" },
      { label: "Cách hoạt động", href: "#how-it-works" },
      { label: "Bảng giá", href: "#" },
      { label: "Câu hỏi thường gặp", href: "#" },
    ],
  },
  company: {
    title: "Công ty",
    links: [
      { label: "Về chúng tôi", href: "#" },
      { label: "Tuyển dụng", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Báo chí", href: "#" },
    ],
  },
  resources: {
    title: "Tài nguyên",
    links: [
      { label: "Trung tâm trợ giúp", href: "#" },
      { label: "Cộng đồng", href: "#" },
      { label: "Hội thảo trực tuyến", href: "#" },
      { label: "Câu chuyện thành công", href: "#" },
    ],
  },
  legal: {
    title: "Pháp lý",
    links: [
      { label: "Chính sách bảo mật", href: "#" },
      { label: "Điều khoản dịch vụ", href: "#" },
      { label: "Chính sách Cookie", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">Mentor-X</span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Kết nối các chuyên gia đầy tham vọng với những người hướng dẫn đẳng cấp thế giới để
              khai phá hết tiềm năng của họ.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            2024 Mentor-X. Bảo lưu mọi quyền.
          </p>
          <p className="text-sm text-muted-foreground">
            Được tạo ra với tâm huyết cho cộng đồng cố vấn
          </p>
        </div>
      </div>
    </footer>
  );
}
