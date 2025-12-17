import AdminLayout from "@/layouts/admin.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

const userManagementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/user-management",
}).lazy(() => import("@/pages/admin/user-management").then((d) => d.Route));

const adminRouteTree = adminLayoutRoute.addChildren([
  userManagementRoute,
]);

export { adminRouteTree };
