import AdminLayout from "@/layouts/admin.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import { requireRole } from "@/utils/route-guards";
import { USER_ROLES } from "@/types/user";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
  beforeLoad: async () => {
    await requireRole(USER_ROLES.ADMIN);
  },
});

const userManagementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/user-management",
  head: () => ({
    meta: [{ title: "MentorX - Quản lý người dùng" }],
  }),
}).lazy(() => import("@/pages/admin/user-management").then((d) => d.Route));

const adminRouteTree = adminLayoutRoute.addChildren([userManagementRoute]);

export { adminRouteTree };
