import { useState, useEffect } from "react";
import { usePatchUser } from "@/api/user";
import {
  type UserResponseDTO,
  type UpdateRole,
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

  // Set initial role when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedRole) return;

    try {
      await updateRole.mutateAsync({
        id: user.id,
        role: selectedRole as UserRole,
      });

      alert(`Success: Role updated to ${selectedRole} for ${user.name}`);
      onOpenChange(false);
    } catch (error) {
      alert("Error: Failed to update user role");
    }
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
              {updateRole.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
