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
}).lazy(() => import("@/pages/home").then((d) => d.Route));

const aboutRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/about",
}).lazy(() => import("@/pages/about").then((d) => d.Route));

const loginRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/login",
}).lazy(() => import("@/pages/login").then((d) => d.Route));

const registerRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/register",
}).lazy(() => import("@/pages/reigster").then((d) => d.Route));

const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
}).lazy(() => import("@/pages/user/edit-profile").then((d) => d.Route));

const userRouteTree = userLayoutRoute.addChildren([
  indexRoute,
  aboutRoute,
  loginRoute,
  registerRoute,
  profileRoute,
]);

export { userRouteTree };
