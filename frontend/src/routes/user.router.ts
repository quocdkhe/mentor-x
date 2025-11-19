import UserLayout from "@/layouts/user.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "user",
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

const userRouteTree = userLayoutRoute.addChildren([
  indexRoute,
  aboutRoute,
  loginRoute,
]);

export { userRouteTree };
