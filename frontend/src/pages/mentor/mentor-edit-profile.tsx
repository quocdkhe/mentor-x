import { createLazyRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Check,
  ChevronsUpDown,
  X,
  Search,
  Upload,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { type MentorProfile } from "@/types/mentor";
import { toast } from "sonner";
import { useUpdateFile, useUploadFile } from "@/api/file";
import { Spinner } from "@/components/ui/spinner";
import ProfileTextEditor, {
  type ProfileTextEditorHandle,
} from "@/components/features/edit-profile/text-editor";
import {
  useGetSkills,
  useGetCurrentMentorProfile,
  usePatchUpdateMentorProfile,
} from "@/api/mentor";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { fetchCurrentUser } from '@/store/auth.slice';

const formSchema = z.object({
  user: z
    .object({
      name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
      phone: z.string().min(10, "Số điện thoại là bắt buộc"),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
      avatar: z.string().url("Phải là URL hợp lệ"),
    })
    .refine(
      (data) => {
        if (data.password && data.password.length > 0) {
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        message: "Mật khẩu không khớp",
        path: ["confirmPassword"],
      }
    ),
  biography: z.string().min(10, "Tiểu sử phải có ít nhất 10 ký tự"),
  pricePerHour: z.coerce
    .number()
    .min(1000, "Giá phải ít nhất 1.000₫")
    .max(1000000, "Giá phải nhỏ hơn 1.000.000₫"),
  skills: z.array(z.string()).min(1, "Chọn ít nhất một kỹ năng"),
  position: z.string().min(2, "Vị trí là bắt buộc"),
  company: z.string().min(2, "Tên công ty là bắt buộc"),
  yearsOfExperience: z.coerce
    .number()
    .min(0, "Số năm kinh nghiệm phải từ 0 trở lên")
    .max(50, "Số năm kinh nghiệm phải nhỏ hơn 50"),
  bankName: z.string().min(2, "Tên ngân hàng là bắt buộc"),
  bankAccountNumber: z.string().min(5, "Số tài khoản là bắt buộc"),
});

function ProfileEdit() {
  const [open, setOpen] = useState(false);
  const updateFileMutation = useUpdateFile();
  const uploadFileMutation = useUploadFile();
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const { data: availableSkills = [] } = useGetSkills();
  const updateProfileMutation = usePatchUpdateMentorProfile();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError,
  } = useGetCurrentMentorProfile();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const textEditorRef = useRef<ProfileTextEditorHandle>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      user: {
        name: "",
        phone: "",
        avatar: "",
        password: "",
        confirmPassword: "",
      },
      biography: "",
      pricePerHour: 0,
      skills: [],
      position: "",
      company: "",
      yearsOfExperience: 0,
      bankName: "",
      bankAccountNumber: "",
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset({
        ...profileData,
        skills: profileData.skills || [],
        user: {
          ...profileData.user,
          password: "",
          confirmPassword: "",
        },
      });
      if (profileData.user?.avatar) {
        setUploadedAvatar(profileData.user.avatar);
      }
    }
  }, [profileData, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Use uploaded avatar if available, otherwise use form value
    const submitValues = {
      ...values,
      user: {
        ...values.user,
        avatar: uploadedAvatar || values.user.avatar,
      },
    };

    updateProfileMutation.mutate(submitValues as MentorProfile, {
      onSuccess: () => {
        toast.success("Cập nhật hồ sơ thành công!", {
          description: "Các thay đổi của bạn đã được lưu.",
        });
        queryClient.invalidateQueries({
          queryKey: ["current-mentor-profile"],
        });
        dispatch(fetchCurrentUser());
      },
      onError: (error) => {
        toast.error("Không thể cập nhật hồ sơ", {
          description: error.response?.data?.message || error.message,
        });
      },
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <p className="text-destructive font-semibold">
          Không thể tải thông tin hồ sơ mentor.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const selectedSkills = form.watch("skills");
  const formAvatarUrl = form.watch("user.avatar");
  // Show uploaded avatar or fall back to form value
  const avatarUrl = uploadedAvatar || formAvatarUrl;

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarUrl == null) {
      uploadFileMutation.mutate(file, {
        onSuccess: (data) => {
          toast.success("Tải lên thành công!");
          form.setValue("user.avatar", data.message);
          setUploadedAvatar(data.message);
        },
        onError: (err) => {
          toast.error(`Lỗi: ${err.response?.data.message || err.message}`);
        },
      });
    } else {
      updateFileMutation.mutate(
        { fileUrl: avatarUrl, file },
        {
          onSuccess: (data) => {
            toast.success("Tải lên thành công!");
            setUploadedAvatar(data.message);
          },
          onError: (err) => {
            toast.error(`Lỗi: ${err.response?.data.message || err.message}`);
          },
        }
      );
    }
  };

  const toggleSkill = (skillId: string) => {
    const currentSkills = form.getValues("skills");
    if (currentSkills.includes(skillId)) {
      form.setValue(
        "skills",
        currentSkills.filter((id) => id !== skillId),
        { shouldValidate: true }
      );
    } else {
      form.setValue("skills", [...currentSkills, skillId], {
        shouldValidate: true,
      });
    }
  };

  const removeSkill = (skillId: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((id) => id !== skillId),
      { shouldValidate: true }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container max-w-7xl mx-auto py-12 px-4 md:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Single Card with All Content */}
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-12 space-y-8">
              {/* Avatar and First 4 Inputs */}
              <div>
                <h2 className="font-semibold text-foreground mb-6 text-xl">
                  Thông tin cá nhân
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Avatar Section */}
                  <div className="lg:col-span-4">
                    <div className="flex flex-col items-center gap-6">
                      <Avatar className="h-50 w-50 border-4 border-border shadow-xl rounded-full">
                        <AvatarImage
                          src={avatarUrl || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-5xl bg-muted">
                          <User className="h-24 w-24" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center gap-3 w-full">
                        <button
                          disabled={
                            updateFileMutation.isPending ||
                            uploadFileMutation.isPending
                          }
                          type="button"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-card border-2 border-border rounded-lg hover:bg-accent transition-all shadow-sm w-full"
                        >
                          {updateFileMutation.isPending ||
                            uploadFileMutation.isPending ? (
                            <Spinner className="h-5 w-5" />
                          ) : (
                            <Upload className="h-5 w-5" />
                          )}
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
                          JPG, PNG hoặc GIF
                          <br />
                          Kích thước tối đa: 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* First 4 Form Inputs */}
                  <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="user.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Họ và Tên
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nguyễn Văn A"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="user.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Số Điện Thoại
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+84 123 456 789"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pricePerHour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Giá Theo Giờ
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="100.000"
                                  className="pr-8"
                                  value={field.value ? new Intl.NumberFormat('vi-VN').format(field.value) : ''}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value ? parseInt(value) : 0);
                                  }}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                  ₫
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Mức giá của bạn tính bằng VND/giờ
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Kinh Nghiệm
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="7"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Số năm kinh nghiệm trong nghề
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Position and Company */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 text-xl">
                  Thông tin công việc
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vị Trí</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Senior Developer"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Vị trí hiện tại của bạn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Công Ty</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Công ty công nghệ ABC"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Công ty hoặc tổ chức</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Payment Info */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 text-xl">
                  Thông tin thanh toán
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Ngân Hàng</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ví dụ: Vietcombank, Techcombank..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ngân hàng để nhận tiền thanh toán
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số Tài Khoản</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0123456789"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Số tài khoản ngân hàng của bạn</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Biography */}
              <div>
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiểu Sử</FormLabel>
                      <FormControl>
                        <ProfileTextEditor
                          ref={textEditorRef}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Viết mô tả chi tiết về nền tảng chuyên môn của bạn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Technical Skills */}
              <div>
                <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-xl">
                  Kĩ năng
                </h2>
                <p className="text-muted-foreground mb-6">
                  Chọn tất cả các kỹ năng và công nghệ mà bạn thành thạo
                </p>

                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <div className="space-y-4">
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                              >
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Search className="h-4 w-4" />
                                  Tìm kiếm và thêm kĩ năng...
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[600px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Tìm kiếm kỹ năng..."
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Không tìm thấy kĩ năng.
                                </CommandEmpty>
                                <CommandGroup>
                                  {availableSkills.map((skill) => (
                                    <CommandItem
                                      key={skill.id}
                                      value={skill.name}
                                      onSelect={() => {
                                        toggleSkill(skill.id);
                                      }}
                                      className="flex items-center gap-3"
                                    >
                                      <div
                                        className={cn(
                                          "flex items-center justify-center h-4 w-4 rounded border-2 transition-all",
                                          selectedSkills.includes(skill.id)
                                            ? "bg-primary border-primary"
                                            : "border-input"
                                        )}
                                      >
                                        <Check
                                          className={cn(
                                            "h-3 w-3 text-primary-foreground",
                                            selectedSkills.includes(skill.id)
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </div>
                                      <span>
                                        {skill.name}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {selectedSkills.length > 0 && (
                          <div className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-foreground">
                                Kĩ Năng Đã Chọn ({selectedSkills.length})
                              </span>
                              {selectedSkills.length > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    form.setValue("skills", [], {
                                      shouldValidate: true,
                                    })
                                  }
                                  className="h-7 text-xs"
                                >
                                  Xóa tất cả
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {/* selectedSkills contains IDs, we map to Names for display */}
                              {selectedSkills.map((skillId) => {
                                const skill = availableSkills.find(
                                  (s) => s.id === skillId
                                );
                                if (!skill) return null;
                                return (
                                  <Badge
                                    key={skillId}
                                    className="px-3 py-1.5 text-sm font-medium border bg-primary/10 text-primary border-primary/20"
                                  >
                                    {skill.name}
                                    <button
                                      type="button"
                                      className="ml-2 hover:opacity-70 transition-opacity"
                                      onClick={() => removeSkill(skillId)} // Remove by ID
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Fields */}
              <div>
                <h2 className="font-semibold text-foreground mb-4 text-xl">
                  Đổi mật khẩu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="user.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mật Khẩu Mới
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Để trống nếu không muốn đổi"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Tùy chọn: Nhập mật khẩu mới để cập nhật
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user.confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Xác Nhận Mật Khẩu
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Xác nhận mật khẩu mới của bạn"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Phải khớp với mật khẩu mới ở trên
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-2">
                <Button disabled={updateProfileMutation.isPending} type="submit" >
                  {updateProfileMutation.isPending && <Spinner />}
                  Lưu Thay Đổi
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export const Route = createLazyRoute("/mentor/edit-form")({
  component: ProfileEdit,
});
