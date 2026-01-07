import * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
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
import {AppTitle} from "@/components/dashboard/app-title.tsx";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "EditProfile",
      url: "/mentor/edit-form" as const,
      icon: User,
    },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: Bot,
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    // },
  ]
}

export function MentorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
