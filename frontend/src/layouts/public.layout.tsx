import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Outlet } from "@tanstack/react-router";
import { LoginModal } from "@/components/auth/login-modal";
import { RegisterModal } from "@/components/auth/register-modal";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <LoginModal />
      <RegisterModal />
    </div>
  );
}

export default PublicLayout;

