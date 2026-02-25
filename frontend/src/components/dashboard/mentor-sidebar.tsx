import * as React from "react"
import {
  Calendar,
  Clock,
  DollarSign,
  User,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main.tsx"
import { NavUser } from "@/components/dashboard/nav-user.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar.tsx"
import { AppTitle } from "@/components/dashboard/app-title.tsx";

// This is sample data.
const navMain = [
  {
    title: "Thanh toán",
    url: "/mentor/payment-status" as const,
    icon: DollarSign,
  },
  {
    title: "Quản lý lịch",
    url: "/mentor/schedules" as const,
    icon: Calendar,
  },
  {
    title: "Lên lịch khả dụng",
    url: "/mentor/set-availabilities" as const,
    icon: Clock,
  },
  {
    title: "Chỉnh sửa thông tin",
    url: "/mentor/edit-form" as const,
    icon: User,
  },

]

export function MentorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
  )
}
