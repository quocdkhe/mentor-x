import { useForm, useFieldArray } from "react-hook-form";
import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegisterMentor } from "@/api/mentor";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { Plus, Trash } from "lucide-react"; 
import { SkillSelector } from "@/components/mentors/SkillSelector"; 

const formSchema = z.object({
  biography: z.string().min(10, "Tiểu sử phải có ít nhất 10 ký tự"),
  pricePerHour: z.coerce.number().min(0, "Giá mỗi giờ phải lớn hơn hoặc bằng 0"),
  skills: z.array(z.object({ value: z.string().min(1, "Kỹ năng không được để trống") }))
    .min(1, "Phải có ít nhất 1 kỹ năng")
    .max(3, "Tối đa 3 kỹ năng")
});

type FormValues = z.infer<typeof formSchema>;

function BecomeMentorPage() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const registerMutation = useRegisterMentor();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      biography: "",
      pricePerHour: 0,
      skills: [{ value: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills"
  });

  useEffect(() => {
    if (user?.role === 'Mentor') {
         toast.info("Bạn đã là mentor rồi!");
         navigate({ to: '/user' }); 
    }
  }, [user, navigate]);

  const onSubmit = (data: FormValues) => {
    registerMutation.mutate({
      biography: data.biography,
      pricePerHour: data.pricePerHour,
      skills: data.skills.map(s => s.value)
    }, {
      onSuccess: () => {
        toast.success("Đăng ký thành công!");
        navigate({ to: '/user' });
      },
      onError: (err) => {
        toast.error(`Đăng ký thất bại: ${err.message}`);
      }
    });
  };

  if (isLoading) return <div className="flex justify-center p-10"><Spinner /></div>;

  return (
    <div className="container mx-auto py-10 px-4">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">Đăng ký trở thành Mentor</CardTitle>
            <CardDescription className="text-center">Chia sẻ kiến thức và kiếm thu nhập</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiểu sử & Giới thiệu</FormLabel>
                      <FormControl>
                        <textarea 
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Giới thiệu về bản thân, kinh nghiệm..."
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
                      <FormLabel>Giá thuê theo giờ (VND)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                        <FormLabel>Kỹ năng (Tối đa 3)</FormLabel>
                        {fields.length < 3 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                <Plus className="w-4 h-4 mr-1" /> Thêm kỹ năng
                            </Button>
                        )}
                   </div>
                   {fields.map((field, index) => (
                       <FormField
                         key={field.id}
                         control={form.control}
                         name={`skills.${index}.value`}
                         render={({ field: inputField }) => (
                           <FormItem>
                             <div className="flex gap-2">
                               <SkillSelector 
                                 placeholder="Nhập kỹ năng (ví dụ: React, .NET)" 
                                 {...inputField} 
                               />
                               {fields.length > 1 && (
                                   <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                     <Trash className="w-4 h-4" />
                                   </Button>
                               )}
                             </div>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                   ))}
                    {form.formState.errors.skills?.message && (
                        <p className="text-sm font-medium text-destructive">
                             {form.formState.errors.skills?.message}
                        </p>
                    )}
                     {form.formState.errors.skills?.root?.message && (
                        <p className="text-sm font-medium text-destructive">
                             {form.formState.errors.skills?.root?.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending && <Spinner className="mr-2" />}
                  Đăng ký ngay
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
    </div>
  );
}

export const Route = createLazyRoute('/user/become-mentor')({
  component: BecomeMentorPage,
});

export default BecomeMentorPage;
