import { createLazyRoute } from "@tanstack/react-router";
import { useState, useRef } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, ChevronsUpDown, X, Search, Sparkles, Camera, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Upload, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Skill, type MentorProfile } from '@/types/mentor';
import { toast } from 'sonner';
import { useUpdateFile, useUploadFile } from "@/api/file";
import { Spinner } from "@/components/ui/spinner";

const availableSkills: Skill[] = [
  { id: 'skill-1', name: 'React', icon: 'react'  },
  { id: 'skill-2', name: 'TypeScript', icon: 'typescript'  },
  { id: 'skill-3', name: 'JavaScript', icon: 'javascript'  },
  { id: 'skill-4', name: 'Node.js', icon: 'nodejs'  },
  { id: 'skill-5', name: 'Python', icon: 'python'  },
  { id: 'skill-6', name: 'Java', icon: 'java'},
  { id: 'skill-7', name: 'Go', icon: 'go'  },
  { id: 'skill-8', name: 'Docker', icon: 'docker'  },
  { id: 'skill-9', name: 'Kubernetes', icon: 'kubernetes'  },
  { id: 'skill-10', name: 'AWS', icon: 'aws'  },
  { id: 'skill-11', name: 'Azure', icon: 'azure'  },
  { id: 'skill-12', name: 'PostgreSQL', icon: 'postgresql'  },
  { id: 'skill-13', name: 'MongoDB', icon: 'mongodb'  },
  { id: 'skill-14', name: 'GraphQL', icon: 'graphql' },
  { id: 'skill-15', name: 'REST API', icon: 'rest-api' },
  { id: 'skill-16', name: 'Vue.js', icon: 'vuejs' },
  { id: 'skill-17', name: 'Angular', icon: 'angular' },
  { id: 'skill-18', name: 'Tailwind CSS', icon: 'tailwindcss' },
  { id: 'skill-19', name: 'Machine Learning', icon: 'machine-learning' },
  { id: 'skill-20', name: 'Data Science', icon: 'data-science' },
];

const mockUserProfile: MentorProfile = {
  user: {
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    password: '',
    confirmPassword: '',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  biography: 'Experienced full-stack developer with a passion for building scalable web applications. Specialized in React ecosystem and cloud-native solutions. Love solving complex problems and mentoring junior developers.',
  pricePerHours: 85,
  skill: ['skill-1', 'skill-2', 'skill-4', 'skill-8', 'skill-10'],
  employer: 'NTT Data',
  company: 'Tech Solutions Inc.',
  yearsOfExperience: 7,
};

const formSchema = z.object({
  user: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number is required'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    avatar: z.string().url('Must be a valid URL'),
  }).refine((data) => {
    if (data.password && data.password.length > 0) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  biography: z.string().min(10, 'Biography must be at least 10 characters'),
  pricePerHours: z.coerce.number().min(1, 'Price must be at least $1').max(1000, 'Price must be less than $1000'),
  skill: z.array(z.string()).min(1, 'Select at least one skill'),
  employer: z.string().min(2, 'Employer name is required'),
  company: z.string().min(2, 'Company name is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be 0 or more').max(50, 'Years of experience must be less than 50'),
});

function ProfileEdit() {
  const [userProfile, setUserProfile] = useState<MentorProfile>(mockUserProfile);
  const [open, setOpen] = useState(false);
  const updateFileMutation = useUpdateFile();
  const uploadFileMutation = useUploadFile();
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: userProfile,
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setUserProfile(values as MentorProfile);
    toast.success('Profile updated successfully!', {
      description: 'Your changes have been saved.',
    });
    console.log('Updated profile:', values);
  };

  const selectedSkills = form.watch('skill');
  const avatarUrl = form.watch('user.avatar');
  const userName = form.watch('user.name');

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
        }
      });
    } else {
      updateFileMutation.mutate({ fileUrl: avatarUrl, file }, {
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

  const toggleSkill = (skillId: string) => {
    const currentSkills = form.getValues('skill');
    if (currentSkills.includes(skillId)) {
      form.setValue(
        'skill',
        currentSkills.filter((id) => id !== skillId),
        { shouldValidate: true }
      );
    } else {
      form.setValue('skill', [...currentSkills, skillId], { shouldValidate: true });
    }
  };

  const removeSkill = (skillId: string) => {
    const currentSkills = form.getValues('skill');
    form.setValue(
      'skill',
      currentSkills.filter((id) => id !== skillId),
      { shouldValidate: true }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container max-w-7xl mx-auto py-12 px-4 md:px-8">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
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
              </div>

              <div className="lg:col-span-9">
                <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-12 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="user.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-11" {...field} />
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
                            <FormLabel className="text-base">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" className="h-11" {...field} />
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
                            <FormLabel className="text-base">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Leave blank to keep current"
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
                              Optional: Enter a new password to update
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
                            <FormLabel className="text-base">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm your new password"
                                  className="h-11"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                              Must match the new password above
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">About You</h2>
                    <FormField
                      control={form.control}
                      name="biography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Biography</FormLabel>
                          <FormControl>
                            {/* <Textarea
                              placeholder="Tell us about yourself, your expertise, and what makes you unique..."
                              className="min-h-[140px] resize-none text-base"
                              {...field}
                            /> */}
                          </FormControl>
                          <FormDescription>
                            Write a compelling description of your professional background
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Professional Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pricePerHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Hourly Rate</FormLabel>
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
                            <FormDescription>Your rate in USD per hour</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Experience</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="7"
                                className="text-base h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Years in the industry</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Employer</FormLabel>
                            <FormControl>
                              <Input placeholder="NTT Data" className="text-base h-11" {...field} />
                            </FormControl>
                            <FormDescription>Current employer</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Tech Solutions Inc." className="text-base h-11" {...field} />
                            </FormControl>
                            <FormDescription>Company or organization</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                      Technical Skills
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Select all the skills and technologies you're proficient with
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
                                      Search and add skills...
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[600px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search skills..." className="h-12" />
                                  <CommandList>
                                    <CommandEmpty>No skill found.</CommandEmpty>
                                    <CommandGroup>
                                      {availableSkills.map((skill) => (
                                        <CommandItem
                                          key={skill.id}
                                          value={skill.name}
                                          onSelect={() => {
                                            toggleSkill(skill.id);
                                          }}
                                          className="flex items-center gap-3 py-3"
                                        >
                                          <div
                                            className={cn(
                                              'flex items-center justify-center h-5 w-5 rounded border-2 transition-all',
                                              selectedSkills.includes(skill.id)
                                                ? 'bg-primary border-primary'
                                                : 'border-input'
                                            )}
                                          >
                                            <Check
                                              className={cn(
                                                'h-3.5 w-3.5 text-primary-foreground',
                                                selectedSkills.includes(skill.id)
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                          </div>
                                          <span className="font-medium">{skill.name}</span>
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
                                    Selected Skills ({selectedSkills.length})
                                  </span>
                                  {selectedSkills.length > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => form.setValue('skill', [], { shouldValidate: true })}
                                      className="h-7 text-xs"
                                    >
                                      Clear all
                                    </Button>
                                  )}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {selectedSkills.map((skillId) => {
                                    const skill = availableSkills.find((s) => s.id === skillId);
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
                                          onClick={() => removeSkill(skillId)}
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

                  <div className="flex justify-end gap-4 pt-2">
                    <Button type="button" variant="outline" size="lg" className="px-8">
                      Cancel
                    </Button>
                    <Button type="submit" size="lg" className="px-8">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}


export const Route = createLazyRoute('/mentor/edit-form')({
  component: ProfileEdit,
})  