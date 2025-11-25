import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import { createLazyRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useGetCurrentUser } from '@/api/auth';
import DefaultSkeleton from '@/components/skeletons/default.skeleton';
import { useUpdateFile, useUploadFile } from '@/api/file';
import { Spinner } from '@/components/ui/spinner';

type UserUpdateProfile = {
  name: string;
  phone: string;
  password?: string;
};

const profileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string(),
  email: z.string(),
  newPassword: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.newPassword || data.confirmPassword) {
    if (!data.newPassword || data.newPassword.length < 6) {
      return false;
    }
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Mật khẩu không khớp hoặc mật khẩu phải có ít nhất 6 ký tự",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileEditPage() {
  const { data, isLoading } = useGetCurrentUser(); // run on initial load
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const avatarUrl = uploadedAvatar || data?.avatar; // derived state
  const uploadFileMutation = useUploadFile();
  const updateFileMutation = useUpdateFile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
    // Auto-fill form when user data is loaded
    values: {
      name: data?.name || '',
      phone: data?.phone || '',
      email: data?.email || '',
    }
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (uploadedAvatar == null) {
      uploadFileMutation.mutate(file, {
        onSuccess: (data) => {
          toast.success("Tải lên thành công!");
          setUploadedAvatar(data.message);
        },
        onError: (err) => {
          toast.error(`Lỗi: ${err.response?.data.message || err.message}`);
        }
      });
    } else {
      updateFileMutation.mutate({ fileUrl: avatarUrl!, file }, {
        onSuccess: (data) => {
          toast.success("Tải lên thành công!");
          setUploadedAvatar(data.message);
        },
        onError: (err) => {
          toast.error(`Lỗi: ${err.response?.data.message || err.message}`);
        }
      });
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    const updateData: UserUpdateProfile = {
      name: data.name,
      phone: data.phone,
    };

    if (data.newPassword) {
      updateData.password = data.newPassword;
    }

    console.log('Form submitted:', updateData);
  };

  if (isLoading) {
    return <DefaultSkeleton />;
  }

  return (
    <div className="container mx-auto pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 items-start">
        <div className="flex flex-col items-center gap-6">
          <Avatar className="h-40 w-40 border-4 border-border shadow-xl">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-4xl bg-muted">
              <User className="h-20 w-20" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              disabled={updateFileMutation.isPending || uploadFileMutation.isPending}
              type="button"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-card border-2 border-border rounded-lg hover:bg-accent transition-all shadow-sm w-full"
            >
              {updateFileMutation.isPending || uploadFileMutation.isPending ? (
                <Spinner className="h-5 w-5" />
              ) : <Upload className="h-5 w-5" />}
              <span className="font-medium">Tải ảnh lên</span>
            </button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <p className="text-sm text-muted-foreground text-center">
              JPG, PNG hoặc GIF<br />Kích thước tối đa: 2MB
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t">
                <h3 className="text-base font-semibold mb-4">Đổi mật khẩu</h3>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            {...field}
                          />
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
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full">
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}


export const Route = createLazyRoute('/user/profile')({
  component: ProfileEditPage,
})