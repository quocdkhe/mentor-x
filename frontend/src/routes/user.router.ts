import UserLayout from "@/layouts/user.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";

const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "user",
  component: UserLayout,
});

const aboutRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/about",
}).lazy(() => import("@/pages/user/about").then((d) => d.Route));

const schedulesRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/schedules",
}).lazy(() => import("@/pages/user/shedules").then((d) => d.Route));

const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
}).lazy(() => import("@/pages/user/edit-profile").then((d) => d.Route));

const userRouteTree = userLayoutRoute.addChildren([
  schedulesRoute,
  aboutRoute,
  profileRoute,
]);

export { userRouteTree };
