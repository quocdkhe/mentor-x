import { useState } from 'react';
import { useForm, type SubmitHandler, type UseFormReturn, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Check, ChevronsUpDown, X, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '../components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type MentorProfile, type Skill } from '@/types/mentor';
import { toast } from 'sonner';
import { createLazyRoute } from '@tanstack/react-router';

const formSchema = z.object({
  biography: z.string().min(10, 'Biography must be at least 10 characters'),
  pricePerHours: z.coerce.number().min(1, 'Price must be at least $1').max(1000, 'Price must be less than $1000'),
  skill: z.array(z.string()).min(1, 'Select at least one skill'),
  employer: z.string().min(2, 'Employer name is required'),
  company: z.string().min(2, 'Company name is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be 0 or more').max(50, 'Years of experience must be less than 50'),
});

type FormValues = z.infer<typeof formSchema>;

export const availableSkills: Skill[] = [
  { id: 'skill-1', name: 'React', icon: 'Frontend' },
  { id: 'skill-2', name: 'TypeScript', icon: 'Language' },
  { id: 'skill-3', name: 'JavaScript', icon: 'Language' },
  { id: 'skill-4', name: 'Node.js', icon: 'Backend' },
  { id: 'skill-5', name: 'Python', icon: 'Language' },
  { id: 'skill-6', name: 'Java', icon: 'Language' },
  { id: 'skill-7', name: 'Go', icon: 'Language' },
  { id: 'skill-8', name: 'Docker', icon: 'DevOps' },
  { id: 'skill-9', name: 'Kubernetes', icon: 'DevOps' },
  { id: 'skill-10', name: 'AWS', icon: 'Cloud' },
  { id: 'skill-11', name: 'Azure', icon: 'Cloud' },
  { id: 'skill-12', name: 'PostgreSQL', icon: 'Database' },
  { id: 'skill-13', name: 'MongoDB', icon: 'Database' },
  { id: 'skill-14', name: 'GraphQL', icon: 'API' },
  { id: 'skill-15', name: 'REST API', icon: 'API' },
  { id: 'skill-16', name: 'Vue.js', icon: 'Frontend' },
  { id: 'skill-17', name: 'Angular', icon: 'Frontend' },
  { id: 'skill-18', name: 'Tailwind CSS', icon: 'Frontend' },
  { id: 'skill-19', name: 'Machine Learning', icon: 'AI' },
  { id: 'skill-20', name: 'Data Science', icon: 'AI' },
];

const mockUserProfile: MentorProfile = {
  biography: 'Experienced full-stack developer with a passion for building scalable web applications. Specialized in React ecosystem and cloud-native solutions. Love solving complex problems and mentoring junior developers.',
  pricePerHours: 85,
  skill: ['skill-1', 'skill-2', 'skill-4', 'skill-8', 'skill-10'],
  employer: 'NTT Data',
  company: 'Tech Solutions Inc.',
  yearsOfExperience: 7,
};

function ProfileEdit() {
  const [userProfile, setUserProfile] = useState<MentorProfile>(mockUserProfile);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: userProfile,
  }) as unknown as UseFormReturn<FormValues>;

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    setUserProfile(values as MentorProfile);
    toast.success('Profile updated successfully!', {
      description: 'Your changes have been saved.',
    });
    console.log('Updated profile:', values);
  };

  const selectedSkills = form.watch('skill');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container max-w-6xl mx-auto py-12 px-4 md:px-8">
        <div className="mb-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Edit Profile
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Update your professional information and skills
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">About You</h2>
                  <FormField
                    control={form.control}
                    name="biography"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Biography</FormLabel>
                        <FormControl>
                            <input
                                type="text"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                          Write a compelling description of your professional background
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Professional Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Tech Solutions Inc." className="text-base h-11" {...field} />
                          </FormControl>
                          <FormDescription>Company or organization you work for</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                                      className="px-3 py-1.5 text-sm font-medium border bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
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

                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="w-full justify-between h-12 text-base border-2 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
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
                                              ? 'bg-blue-600 border-blue-600'
                                              : 'border-slate-300'
                                          )}
                                        >
                                          <Check
                                            className={cn(
                                              'h-3.5 w-3.5 text-white',
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
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-4 pt-2">
                <Button type="button" variant="outline" size="lg" className="px-8">
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/mentor/edit-form')({
  component: ProfileEdit,
})  