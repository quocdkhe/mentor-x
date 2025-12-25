import { createLazyRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateUserDialog } from "@/components/features/user-management/CreateUserDialog";
import { ChangeRoleDialog } from "@/components/features/user-management/ChangeRoleDialog";
import {
  type UserResponseDTO,
} from "@/types/user";
import { useGetUserList } from "@/api/user";
// import { useToast } from "@/hooks/use-toast";
import { Users, UserCog } from "lucide-react";
import DefaultSkeleton from "@/components/skeletons/default.skeleton";

export default function UserManagement() {

  const { data: users, isLoading } = useGetUserList();
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get badge variant based on role
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Mentor":
        return "default";
      case "User":
        return "secondary";
      default:
        return "outline";
    }
  };


  const handleChangeRoleClick = (user: UserResponseDTO) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <DefaultSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-5">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lí người dùng
              </h1>
              <p className="text-muted-foreground">
                Quản lý người dùng và vai trò của họ trong hệ thống
              </p>
            </div>
          </div>
          <CreateUserDialog />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ảnh đại diện</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không tìm thấy người dùng
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role || "No Role"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeRoleClick(user)}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Đổi vai trò
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ChangeRoleDialog
          user={selectedUser}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        <div className="mt-4 text-sm text-muted-foreground">
          Tổng số: {users ? users.length : 0}
        </div>
      </div>
    </div>
  );
}

export const Route = createLazyRoute("/admin/user-management")({
  component: UserManagement,
});
