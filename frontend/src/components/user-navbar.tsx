import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ModeToggle } from './mode-toggle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLogout } from '@/api/auth';
import { toast } from 'sonner';
import { setUser } from '@/store/auth.slice';
import {useQueryClient} from "@tanstack/react-query";

// Simple logo component
const Logo = () => (
  <svg width='32' height='32' viewBox='0 0 324 323' fill='currentColor'>
    <rect
      x='88.1023'
      y='144.792'
      width='151.802'
      height='36.5788'
      rx='18.2894'
      transform='rotate(-38.5799 88.1023 144.792)'
    />
    <rect
      x='85.3459'
      y='244.537'
      width='151.802'
      height='36.5788'
      rx='18.2894'
      transform='rotate(-38.5799 85.3459 244.537)'
    />
  </svg>
);

// Hamburger icon
const HamburgerIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};


export default function SimpleNavbar() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logoutMutation.mutate(undefined,
      {
        onSuccess: (data) => {
          navigate({ to: '/login' });
          toast.success(data.message);
          dispatch(setUser(null));
          queryClient.removeQueries({queryKey : ["current-user"]})
        },
        onError: (err) => {
          toast.error(`Đăng xuất thất bại: ${err.response?.data.message || err.message}`);
        }
      });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
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
                    to="/"
                    className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full [&.active]:bg-accent [&.active]:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-full [&.active]:bg-accent [&.active]:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo />
            <span className="font-bold text-xl hidden sm:block">Brand</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Trang chủ
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              Đội ngũ
            </Link>
          </nav>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          {isLoading ?
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            :
            (user == null ?
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to="/login">Đăng nhập</Link>

                </Button>
                <Button
                  size="sm"
                  onClick={() => console.log('Get Started clicked')}
                >
                  Bắt đầu
                </Button>
              </>
              :
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                      Tài khoản của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          }
        </div>
      </div>
    </header>
  );
}