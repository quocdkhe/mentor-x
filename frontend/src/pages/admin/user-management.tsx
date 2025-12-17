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
import { CreateUserDialog } from "@/components/dashboard/user-management/CreateUserDialog";
import { ChangeRoleDialog } from "@/components/dashboard/user-management/ChangeRoleDialog";
import {
  type UserResponseDTO,
  type AdminCreateUser,
  type UserRole,
  USER_ROLES,
} from "@/types/user";
// import { useToast } from "@/hooks/use-toast";
import { Users, UserCog } from "lucide-react";

const initialUsers: UserResponseDTO[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "John Doe",
    phone: "+1 234 567 8901",
    email: "john.doe@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "Admin",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Jane Smith",
    phone: "+1 234 567 8902",
    email: "jane.smith@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    role: "User",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    role: "User",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Alice Brown",
    phone: "+1 234 567 8904",
    email: "alice.brown@example.com",
    role: "Mentor",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Charlie Davis",
    phone: "+1 234 567 8905",
    email: "charlie.davis@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    role: "User",
  },
];

function getRoleBadgeVariant(
  role?: UserRole
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "destructive";
    case USER_ROLES.MENTOR:
      return "default";
    case USER_ROLES.USER:
      return "secondary";
    default:
      return "outline";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserResponseDTO[]>(
    initialUsers as UserResponseDTO[]
  );
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  // const { toast } = useToast();

  const handleCreateUser = (userData: AdminCreateUser) => {
    const newUser: UserResponseDTO = {
      ...userData,
      id: crypto.randomUUID(),
    };
    // setUsers((prev) => [...prev, newUser]);
    console.log("Created User:", newUser);
    // toast({
    //   title: "User Created",
    //   description: `${newUser.name} has been added successfully.`,
    // });
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    const user = users.find((u) => u.id === userId);
    // toast({
    //   title: "Role Updated",
    //   description: `${user?.name}'s role has been changed to ${newRole}.`,
    // });
  };

  const handleChangeRoleClick = (user: UserResponseDTO) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage users and their roles in the system
              </p>
            </div>
          </div>
          <CreateUserDialog onCreateUser={handleCreateUser} />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
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
                        Change Role
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
          onChangeRole={handleChangeRole}
        />

        <div className="mt-4 text-sm text-muted-foreground">
          Total users: {users.length}
        </div>
      </div>
    </div>
  );
}

export const Route = createLazyRoute("/admin/user-management")({
  component: UserManagement,
});
