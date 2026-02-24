import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "./theme-toggle";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLogout } from "@/api/auth";
import { toast } from "sonner";
import { setUser } from "@/store/auth.slice";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

// Hamburger icon
const HamburgerIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function SimpleNavbar() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () => {
      const height = headerRef.current?.getBoundingClientRect().height;
      if (height) {
        document.documentElement.style.setProperty(
          "--navbar-height",
          `${height}px`,
        );
      }
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(headerRef.current);

    updateHeight();

    return () => resizeObserver.disconnect();
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: (data) => {
        navigate({ to: "/login" });
        toast.success(data.message);
        dispatch(setUser(null));
        queryClient.removeQueries({ queryKey: ["current-user"] });
      },
      onError: (err) => {
        toast.error(
          `Đăng xuất thất bại: ${err.response?.data.message || err.message}`,
        );
      },
    });
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo and Nav */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-2">
                <div className="flex flex-col gap-1">
                  <Link
                    to="/user/mentors"
                    className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full [&.active]:bg-accent [&.active]:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tìm mentor
                  </Link>
                  <Link
                    to="/user/schedules"
                    className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full [&.active]:bg-accent [&.active]:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Lịch học
                  </Link>
                  <Link
                    to="/user/forum"
                    className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full [&.active]:bg-accent [&.active]:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Diễn đàn
                  </Link>
                  <Link
                    to="/user/profile"
                    className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full [&.active]:bg-accent [&.active]:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tài khoản của tôi
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Logo */}
          <Link to="/user" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-bold">Mentor-X</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/user/mentors"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Tìm mentor
            </Link>
            <Link
              activeOptions={{ exact: true }}
              to="/user/schedules"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Lịch học
            </Link>
            <Link
              to="/user/forum"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Diễn đàn
            </Link>
            <Link
              to="/user/profile"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Tài khoản của tôi
            </Link>
          </nav>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : user == null ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button
                size="sm"
                onClick={() => console.log("Get Started clicked")}
              >
                Bắt đầu
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-10 px-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Đăng xuất
                    <LogOut className="ml-auto h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
