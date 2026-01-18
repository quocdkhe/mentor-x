import { useState } from "react";
import { Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks";
import { Skeleton } from "../ui/skeleton";
import { USER_ROLES } from "@/types/user";



export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const navigationBasedOnRole = () => {
    if (user?.role === USER_ROLES.ADMIN) {
      navigate({ to: '/admin/user-management' });
    } else if (user?.role === USER_ROLES.MENTOR) {
      navigate({ to: '/mentor/schedules' });
    } else if (user?.role === USER_ROLES.USER) {
      navigate({ to: '/user' });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          <span className="text-xl font-bold">Mentor-X</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/forum"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Diễn đàn
          </Link>
          <Link
            to="/mentors"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Mentor
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isLoading ? (
            <Skeleton className="h-10 w-24 rounded-md" />
          ) : user ? (
            <Button onClick={navigationBasedOnRole}>
              Trang của tôi
            </Button>
          ) : (<>
            <Button variant="ghost">
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button>
              <Link to="/register">Bắt đấu</Link>
            </Button>
          </>)}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6">
              <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
              <div className="flex flex-col gap-6">
                <SheetClose asChild>
                  <Link
                    to="/forum"
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Diễn đàn
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/mentors"
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Mentor
                  </Link>
                </SheetClose>
                {isLoading ? <Skeleton className="h-10 w-full rounded-md" /> :
                  user == null ? (<div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" className="w-full">
                      Đăng nhập
                    </Button>
                    <Button className="w-full">Bắt đầu</Button>
                  </div>) : (
                    <Link to="/user" className="mt-4">
                      <Button className="w-full">Trang cá nhân</Button>
                    </Link>
                  )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}