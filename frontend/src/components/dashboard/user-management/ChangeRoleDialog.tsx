import { useState } from "react";
import { usePatchUser } from "@/api/user";
import {
  type UserResponseDTO,
  USER_ROLES,
  type UserRole,
} from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ChangeRoleDialogProps {
  user: UserResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const updateRole = usePatchUser();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedRole) return;

    updateRole.mutate({ id: user.id, role: selectedRole }, {
      onSuccess: (responseData) => {
        toast.success(responseData.message || "User created successfully");
        queryClient.invalidateQueries({ queryKey: ["user-list"] });
        onOpenChange(false);
      },
      onError: (err) => {
        const backendMessage =
          err.response?.data.message || "Đã xảy ra lỗi, vui lòng thử lại.";
        toast.error(`Thất bại: ${backendMessage}`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for{" "}
              <span className="font-medium">{user?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                New Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value: UserRole) => setSelectedRole(value)}
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
              onClick={() => onOpenChange(false)}
              disabled={updateRole.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRole.isPending}>
              {updateRole.isPending ? <Spinner /> : null}
              {updateRole.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
