import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Outlet } from "@tanstack/react-router";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout;

