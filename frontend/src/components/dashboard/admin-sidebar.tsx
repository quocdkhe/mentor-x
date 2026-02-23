import * as React from "react";
import { CheckCheckIcon, User, Users, VerifiedIcon } from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main.tsx";
import { NavUser } from "@/components/dashboard/nav-user.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { AppTitle } from "@/components/dashboard/app-title.tsx";

// This is sample data.
const navMain = [
  {
    title: "Quản lí người dùng ",
    url: "/admin/user-management" as const,
    icon: Users,
  },
  {
    title: "Duyệt Mentor",
    url: "/admin/pending-mentors" as const,
    icon: CheckCheckIcon,
  },
  {
    title: "Xác thực mentor",
    url: "/admin/verify-mentors" as const,
    icon: VerifiedIcon,
  },
  {
    title: "Tài khoản của tôi",
    url: "/admin/profile" as const,
    icon: User,
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
