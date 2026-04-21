import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRegister, useLoginWithGoogle } from "@/api/auth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/auth.slice";
import { closeModal, openLoginModal } from "@/store/modal.slice";
import { useGoogleLogin } from "@react-oauth/google";
import { USER_ROLES, type UserRole } from "@/types/user";
import { useNavigate } from "@tanstack/react-router";

const formSchema = z
  .object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.email("Vui lòng nhập địa chỉ email hợp lệ"),
    phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 ký tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function RegisterModal() {
  const dispatch = useAppDispatch();
  const openModal = useAppSelector((state) => state.modal.openModal);
  const registerMutation = useRegister();
  const googleLoginMutation = useLoginWithGoogle();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const navigationBasedOnRole = (role: UserRole) => {
    dispatch(closeModal());
    if (role === USER_ROLES.ADMIN) navigate({ to: "/admin/user-management" });
    else if (role === USER_ROLES.MENTOR) navigate({ to: "/mentor/schedules" });
    else if (role === USER_ROLES.USER) navigate({ to: "/user" });
  };

  const registerWithGoogle = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile https://www.googleapis.com/auth/calendar",
    onSuccess: ({ code }) => {
      googleLoginMutation.mutate(
        { code },
        {
          onSuccess: (data) => {
            dispatch(setUser(data));
            navigationBasedOnRole(data.role);
            toast.success("Đăng ký thành công");
          },
          onError: (err) => {
            toast.error(`Đăng ký thất bại: ${err.response?.data.message || err.message}`);
          },
        },
      );
    },
    onError: () => toast.error("Google sign up failed"),
  });

  const onSubmit = (data: FormValues) => {
    registerMutation.mutate(
      { name: data.fullName, phone: data.phoneNumber, email: data.email, password: data.password },
      {
        onSuccess: () => {
          toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
          dispatch(openLoginModal());
        },
        onError: (err) => {
          toast.error(`Đăng ký thất bại: ${err.response?.data.message || "Đã xảy ra lỗi, vui lòng thử lại."}`);
        },
      },
    );
  };

  return (
    <Dialog open={openModal === "register"} onOpenChange={(open) => !open && dispatch(closeModal())}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tạo tài khoản</DialogTitle>
          <DialogDescription>Điền thông tin để tạo tài khoản mới</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ten@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="0123456789" {...field} />
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
                    <Input type="password" placeholder="Nhập mật khẩu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập lại mật khẩu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending && <Spinner />}
              Đăng ký
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-popover px-2 text-muted-foreground">Hoặc tiếp tục với</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => registerWithGoogle()}
              disabled={googleLoginMutation.isPending}
            >
              {googleLoginMutation.isPending ? (
                <Spinner />
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Tiếp tục với Google
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => dispatch(openLoginModal())}
          >
            Đăng nhập
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
