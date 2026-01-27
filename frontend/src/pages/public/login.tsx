import { useForm } from "react-hook-form";
import { createLazyRoute, Link, useNavigate } from "@tanstack/react-router";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogin, useLoginWithGoogle } from "@/api/auth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/auth.slice";
import { useGoogleLogin } from "@react-oauth/google";
import { USER_ROLES, type UserRole } from "@/types/user.ts";

const formSchema = z.object({
  email: z.email("Vui lòng nhập địa chỉ email hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type FormValues = z.infer<typeof formSchema>;

function LoginPage() {
  const loginMutation = useLogin();
  const googleLoginMutation = useLoginWithGoogle();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigationBasedOnRole = (role: UserRole) => {
    if (role === USER_ROLES.ADMIN) {
      navigate({ to: "/admin/user-management" });
    } else if (role === USER_ROLES.MENTOR) {
      navigate({ to: "/mentor/schedules" });
    } else if (role === USER_ROLES.USER) {
      navigate({ to: "/user" });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile https://www.googleapis.com/auth/calendar",
    onSuccess: ({ code }) => {
      googleLoginMutation.mutate(
        { code },
        {
          onSuccess: (data) => {
            // Refetch redux
            dispatch(setUser(data));
            console.log("Logged in user data:", data);
            // check for role
            navigationBasedOnRole(data.role);
            toast.success("Đăng nhập thành công");
          },
          onError: (err) => {
            toast.error(
              `Đăng nhập thất bại: ${err.response?.data.message || err.message}`,
            );
          },
        },
      );
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  const onSubmit = async (data: FormValues) => {
    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (data) => {
          // Refetch redux
          dispatch(setUser(data));
          console.log("Logged in user data:", data);
          // check for role
          navigationBasedOnRole(data.role);
          toast.success("Đăng nhập thành công");
        },
        onError: (err) => {
          toast.error(
            `Đăng nhập thất bại: ${err.response?.data.message || err.message}`,
          );
        },
      },
    );
  };
  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Chào mừng trở lại</CardTitle>
            <CardDescription>
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ten@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Nhập mật khẩu của bạn"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending && <Spinner />}
                  Đăng nhập
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>
                {/* <GoogleLogin
                  ux_mode="popup"
                  theme="filled_blue"
                  onSuccess={(credentialResponse) => {
                    handleGoogleLogin(credentialResponse)
                  }}
                  onError={() => console.log('Login Failed')}
                /> */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => loginWithGoogle()}
                  disabled={googleLoginMutation.isPending}
                >
                  {googleLoginMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Đăng nhập với Google
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-medium text-primary">
                Đăng ký
              </Link>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <Link to="/" className="font-medium text-primary">
                Về trang chủ
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

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
              Kết nối với những người cố vấn giúp bạn phát triển nhanh chóng
            </h2>
            <p className="text-lg">
              Tham gia cùng hàng nghìn chuyên gia đang tìm kiếm sự hướng dẫn, mở
              rộng mạng lưới và khai phá tiềm năng thông qua các mối quan hệ cố
              vấn ý nghĩa.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm opacity-90">Cố vấn hoạt động</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm opacity-90">Câu chuyện thành công</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm opacity-90">Tỷ lệ hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
export const Route = createLazyRoute("/login")({
  component: LoginPage,
});
