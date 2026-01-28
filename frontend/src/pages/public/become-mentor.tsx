import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronsUpDown, X, Search, Upload, User } from "lucide-react";
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
import { toast } from "sonner";
import { useUploadFile } from "@/api/file";
import { Spinner } from "@/components/ui/spinner";
import ProfileTextEditor, {
  type ProfileTextEditorHandle,
} from "@/components/features/edit-profile/text-editor";
import { useGetSkills, useRegisterMentor } from "@/api/mentor";
import { useAppSelector } from "@/store/hooks";

const formSchema = z.object({
  user: z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    phone: z.string().min(10, "Số điện thoại là bắt buộc"),
    avatar: z.string().url("Phải là URL hợp lệ"),
  }),
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
});

function BecomeMentor() {
  const [open, setOpen] = useState(false);
  const uploadFileMutation = useUploadFile();
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const { data: availableSkills = [] } = useGetSkills();
  const registerMentorMutation = useRegisterMentor();
  const navigate = useNavigate();

  // Get current user info to pre-fill
  const currentUser = useAppSelector((state) => state.auth.user);

  const textEditorRef = useRef<ProfileTextEditorHandle>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      user: {
        name: "",
        email: "",
        password: "",
        phone: "",
        avatar: "",
      },
      biography: "",
      pricePerHour: 0,
      skills: [],
      position: "",
      company: "",
      yearsOfExperience: 0,
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.setValue("user.name", currentUser.name || "");
      form.setValue("user.email", currentUser.email || "");
      form.setValue("user.phone", currentUser.phone || "");
      if (currentUser.avatar) {
        form.setValue("user.avatar", currentUser.avatar);
        setUploadedAvatar(currentUser.avatar);
      }
    }
  }, [currentUser, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Use uploaded avatar if available, otherwise use form value
    const submitValues = {
      ...values,
      user: {
        ...values.user,
        avatar: uploadedAvatar || values.user.avatar,
      },
    };

    registerMentorMutation.mutate(submitValues, {
      onSuccess: () => {
        toast.success("Đăng ký thành công!", {
          description: "Hồ sơ của bạn đang chờ duyệt.",
        });
        navigate({ to: "/" });
      },
      onError: (error) => {
        toast.error("Không thể đăng ký", {
          description: error.response?.data?.message || error.message,
        });
      },
    });
  };

  const selectedSkills = form.watch("skills");
  const formAvatarUrl = form.watch("user.avatar");
  const avatarUrl = uploadedAvatar || formAvatarUrl;

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
  };

  const toggleSkill = (skillId: string) => {
    const currentSkills = form.getValues("skills");
    if (currentSkills.includes(skillId)) {
      form.setValue(
        "skills",
        currentSkills.filter((id) => id !== skillId),
        { shouldValidate: true },
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
      { shouldValidate: true },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container max-w-7xl mx-auto py-12 px-4 md:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Single Card with All Content */}
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-12 space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  Trở thành Mentor
                </h1>
                <p className="text-muted-foreground mt-2">
                  Chia sẻ kiến thức và kiếm thêm thu nhập cùng MentorX
                </p>
              </div>

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
                          disabled={uploadFileMutation.isPending}
                          type="button"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-card border-2 border-border rounded-lg hover:bg-accent transition-all shadow-sm w-full"
                        >
                          {uploadFileMutation.isPending ? (
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
                        {form.formState.errors.user?.avatar && (
                          <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.user.avatar.message}
                          </p>
                        )}
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
                            <FormLabel>Họ và Tên</FormLabel>
                            <FormControl>
                              <Input placeholder="Nguyễn Văn A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="user.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="user.password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="******"
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
                            <FormLabel>Số Điện Thoại</FormLabel>
                            <FormControl>
                              <Input placeholder="0123456789" {...field} />
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
                            <FormLabel>Giá Theo Giờ</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="100.000"
                                  className="pr-8"
                                  value={
                                    field.value
                                      ? new Intl.NumberFormat("vi-VN").format(
                                          field.value,
                                        )
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
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
                            <FormLabel>Kinh Nghiệm</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="7" {...field} />
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
                          <Input placeholder="Senior Developer" {...field} />
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
                              <CommandInput placeholder="Tìm kiếm kỹ năng..." />
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
                                            : "border-input",
                                        )}
                                      >
                                        <Check
                                          className={cn(
                                            "h-3 w-3 text-primary-foreground",
                                            selectedSkills.includes(skill.id)
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                      </div>
                                      <span>{skill.name}</span>
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
                                  (s) => s.id === skillId,
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-2">
                <Button
                  disabled={registerMentorMutation.isPending}
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {registerMentorMutation.isPending && (
                    <Spinner className="mr-2" />
                  )}
                  Đăng Ký Mentor
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export const Route = createLazyRoute("/public/become-mentor")({
  component: BecomeMentor,
});
