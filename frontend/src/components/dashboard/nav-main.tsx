import {type LucideIcon} from "lucide-react"
import {Link, type LinkProps} from "@tanstack/react-router" // 1. Import LinkProps

import {
  Collapsible,
} from "@/components/ui/collapsible.tsx"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx"

export function NavMain({
  items,
}: {
  items: {
    title: string
    // 2. This sets the type to the exact union of all valid routes in your app
    url: LinkProps['to']
    icon?: LucideIcon
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Trang quản trị</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="cursor-pointer"
              >
                {/* 3. TypeScript now knows 'item.url' is a valid route */}
                <Link
                  to={item.url}
                  activeProps={{
                    "data-active": true,
                    className: "bg-primary/10 text-primary"
                  }}
                >
                  {item.icon && <item.icon/>}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}