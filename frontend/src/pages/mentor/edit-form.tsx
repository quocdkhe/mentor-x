import { createLazyRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
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
import { useGetSkills, usePathUpdateMentorProfile } from "@/api/mentor";

const mockUserProfile: MentorProfile = {
  user: {
    name: "Vu Quang Minh k18",
    phone: "0357604680",
    password: "",
    confirmPassword: "",
    avatar:
      "https://lh3.googleusercontent.com/a/ACg8ocL4Xxe0cG3s1eN0lLIgTi6sA_RSK7YmWMjnGKzIzUO3d_eF=s96-c",
  },
  biography: "i'm newbie so do not come here",
  pricePerHours: 30,
  skill: ["React", "JavaScript"],
  position: "student",
  company: "FPT",
  yearsOfExperience: 1,
};

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
  pricePerHours: z.coerce
    .number()
    .min(1, "Giá phải ít nhất $1")
    .max(1000, "Giá phải nhỏ hơn $1000"),
  skill: z.array(z.string()).min(1, "Chọn ít nhất một kỹ năng"),
  position: z.string().min(2, "Vị trí là bắt buộc"),
  company: z.string().min(2, "Tên công ty là bắt buộc"),
  yearsOfExperience: z.coerce
    .number()
    .min(0, "Số năm kinh nghiệm phải từ 0 trở lên")
    .max(50, "Số năm kinh nghiệm phải nhỏ hơn 50"),
});

function ProfileEdit() {
  const [userProfile, setUserProfile] =
    useState<MentorProfile>(mockUserProfile);
  const [open, setOpen] = useState(false);
  const updateFileMutation = useUpdateFile();
  const uploadFileMutation = useUploadFile();
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const { data: availableSkills = [] } = useGetSkills();
  const updateProfileMutation = usePathUpdateMentorProfile();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const textEditorRef = useRef<ProfileTextEditorHandle>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: userProfile,
  });

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
        setUserProfile(submitValues as MentorProfile);
        toast.success("Cập nhật hồ sơ thành công!", {
          description: "Các thay đổi của bạn đã được lưu.",
        });
        console.log("Updated profile:", submitValues);
      },
      onError: (error) => {
        toast.error("Không thể cập nhật hồ sơ", {
          description: error.response?.data?.message || error.message,
        });
        console.error("Update failed:", error);
      },
    });
  };

  const selectedSkills = form.watch("skill");
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

  const toggleSkill = (skillName: string) => {
    const currentSkills = form.getValues("skill");
    if (currentSkills.includes(skillName)) {
      form.setValue(
        "skill",
        currentSkills.filter((name) => name !== skillName),
        { shouldValidate: true }
      );
    } else {
      form.setValue("skill", [...currentSkills, skillName], {
        shouldValidate: true,
      });
    }
  };

  const removeSkill = (skillName: string) => {
    const currentSkills = form.getValues("skill");
    form.setValue(
      "skill",
      currentSkills.filter((name) => name !== skillName),
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
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Thông Tin Cá Nhân
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
                            <FormLabel className="text-base">
                              Họ và Tên
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nguyễn Văn A"
                                className="h-11"
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
                            <FormLabel className="text-base">
                              Số Điện Thoại
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+84 123 456 789"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pricePerHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Giá Theo Giờ
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  placeholder="85"
                                  className="pl-8 text-base h-11"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Mức giá của bạn tính bằng USD/giờ
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
                            <FormLabel className="text-base">
                              Kinh Nghiệm
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="7"
                                className="text-base h-11"
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
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Thông Tin Công Việc
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Vị Trí</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Senior Developer"
                            className="text-base h-11"
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
                        <FormLabel className="text-base">Công Ty</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Công ty công nghệ ABC"
                            className="text-base h-11"
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

              {/* Biography */}
              <div>
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Tiểu Sử</FormLabel>
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
                <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                  Kỹ Năng Kỹ Thuật
                </h2>
                <p className="text-muted-foreground mb-6">
                  Chọn tất cả các kỹ năng và công nghệ mà bạn thành thạo
                </p>

                <FormField
                  control={form.control}
                  name="skill"
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
                                className="w-full justify-between h-12 text-base border-2 hover:border-primary hover:bg-primary/5 transition-colors"
                              >
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Search className="h-4 w-4" />
                                  Tìm kiếm và thêm kỹ năng...
                                </span>
                                <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
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
                                className="h-12"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Không tìm thấy kỹ năng.
                                </CommandEmpty>
                                <CommandGroup>
                                  {availableSkills.map((skill) => (
                                    <CommandItem
                                      key={skill.id}
                                      value={skill.name}
                                      onSelect={() => {
                                        toggleSkill(skill.name);
                                      }}
                                      className="flex items-center gap-3 py-3"
                                    >
                                      <div
                                        className={cn(
                                          "flex items-center justify-center h-5 w-5 rounded border-2 transition-all",
                                          selectedSkills.includes(skill.name)
                                            ? "bg-primary border-primary"
                                            : "border-input"
                                        )}
                                      >
                                        <Check
                                          className={cn(
                                            "h-3.5 w-3.5 text-primary-foreground",
                                            selectedSkills.includes(skill.name)
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </div>
                                      <span className="font-medium">
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
                                Kỹ Năng Đã Chọn ({selectedSkills.length})
                              </span>
                              {selectedSkills.length > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    form.setValue("skill", [], {
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
                              {selectedSkills.map((skillName) => {
                                return (
                                  <Badge
                                    key={skillName}
                                    className="px-3 py-1.5 text-sm font-medium border bg-primary/10 text-primary border-primary/20"
                                  >
                                    {skillName}
                                    <button
                                      type="button"
                                      className="ml-2 hover:opacity-70 transition-opacity"
                                      onClick={() => removeSkill(skillName)}
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
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Đổi Mật Khẩu
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="user.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Mật Khẩu Mới
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Để trống nếu không muốn đổi"
                              className="h-11"
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
                        <FormLabel className="text-base">
                          Xác Nhận Mật Khẩu
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Xác nhận mật khẩu mới của bạn"
                              className="h-11"
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
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Hủy
                </Button>
                <Button type="submit" size="lg" className="px-8">
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
