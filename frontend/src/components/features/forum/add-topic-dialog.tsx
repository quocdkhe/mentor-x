import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOPIC_TYPES } from "@/types/forum";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  type: z.enum(
    [
      TOPIC_TYPES.QUESTION_AND_ANSWER,
      TOPIC_TYPES.NEWS,
      TOPIC_TYPES.DISCUSSIOIN,
      TOPIC_TYPES.SUGGESTION,
    ],
    {
      message: "Vui lòng chọn thể loại",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTopicDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    console.log("Submitting topic:", values);
    // TODO: Implement actual create API call
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm chủ đề mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm chủ đề mới</DialogTitle>
          <DialogDescription>
            Tạo chủ đề để thảo luận hoặc đặt câu hỏi cho cộng đồng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Tiêu đề</FormLabel>
                  <FormControl className="col-span-3">
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className="col-start-2 col-span-3" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Thể loại</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thể loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TOPIC_TYPES.QUESTION_AND_ANSWER}>
                        Hỏi đáp
                      </SelectItem>
                      <SelectItem value={TOPIC_TYPES.DISCUSSIOIN}>
                        Thảo luận
                      </SelectItem>
                      <SelectItem value={TOPIC_TYPES.NEWS}>Tin tức</SelectItem>
                      <SelectItem value={TOPIC_TYPES.SUGGESTION}>
                        Đóng góp ý kiến
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-start-2 col-span-3" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Lưu lại</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
