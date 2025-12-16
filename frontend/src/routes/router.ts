import {
  createRootRoute,
  createRouter,
  createRoute,
} from "@tanstack/react-router";
import { userRouteTree } from "./user.router";
import App from "@/App";
import { adminRouteTree } from "./admin.router";
import { publicRouteTree } from "./public.router";

export const rootRoute = createRootRoute({
  component: App,
});

// login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
}).lazy(() => import("@/pages/public/login").then((d) => d.Route));

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
}).lazy(() => import("@/pages/public/reigster").then((d) => d.Route));

const routeTree = rootRoute.addChildren([
  userRouteTree,
  adminRouteTree,
  publicRouteTree,
  loginRoute,
  registerRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
