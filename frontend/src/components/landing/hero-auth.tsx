export default function HeroAuth() {
  return (
    <div className="hidden md:flex w-1/2 relative items-center justify-center p-16">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1920)",
        }}
      />
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
      <div className="relative z-10 max-w-lg space-y-8 text-white">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold">
            Kết nối với mentor giúp bạn phát triển nhanh hơn
          </h2>
          <p className="text-lg">
            Gặp gỡ hàng nghìn chuyên gia, mở rộng mối quan hệ và khai phá tiềm
            năng của bạn thông qua mentoring.
          </p>
        </div>
      </div>
    </div>
  );
}
