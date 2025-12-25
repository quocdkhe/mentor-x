import { useState } from "react";
import { useForm } from "react-hook-form";
import { usePostUser } from "@/api/user";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AdminCreateUser, type UserRole, USER_ROLES } from "@/types/user";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const createUser = usePostUser();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdminCreateUser>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: USER_ROLES.USER,
    },
  });

  const role = watch("role");

  const onSubmit = (data: AdminCreateUser) => {
    const userData: AdminCreateUser = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim(),
      role: data.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        data.name.trim().replace(/\s+/g, "")
      )}`,
    };

    createUser.mutate(userData, {
      onSuccess: (responseData) => {
        toast.success(responseData.message || "User created successfully");
        reset();
        queryClient.invalidateQueries({ queryKey: ["user-list"] });
        setOpen(false);
      },
      onError: (err) => {
        const backendMessage =
          err.response?.data.message || "Đã xảy ra lỗi, vui lòng thử lại.";
        toast.error(`Đăng ký thất bại: ${backendMessage}`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" {...register("phone")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={(value: UserRole) => setValue("role", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(USER_ROLES).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? <Spinner /> : null}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
