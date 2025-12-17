import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type UserRole, type UserResponseDTO, USER_ROLES } from "@/types/user";
import { Label } from "@/components/ui/label";

interface ChangeRoleDialogProps {
  user: UserResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeRole: (userId: string, newRole: UserRole) => void;
}

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onChangeRole,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(
    user?.role
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && selectedRole) {
      onChangeRole(user.id, selectedRole);
      onOpenChange(false);
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
                onValueChange={(value) => setSelectedRole(value as UserRole)}
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
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
