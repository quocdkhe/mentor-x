import UserLayout from "@/layouts/user.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";

const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "user",
  component: UserLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/",
}).lazy(() => import("@/pages/user/home").then((d) => d.Route));

const aboutRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/about",
}).lazy(() => import("@/pages/user/about").then((d) => d.Route));

const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
}).lazy(() => import("@/pages/user/edit-profile").then((d) => d.Route));

const userRouteTree = userLayoutRoute.addChildren([
  indexRoute,
  aboutRoute,
  profileRoute,
]);

export { userRouteTree };
