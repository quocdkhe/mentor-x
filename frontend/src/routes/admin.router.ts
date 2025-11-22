import AdminLayout from "@/layouts/admin.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
}).lazy(() => import("@/layouts/admin.layout").then((d) => d.Route));

const adminRouteTree = adminLayoutRoute.addChildren([
  // Add admin child routes here
]);

export { adminRouteTree };
