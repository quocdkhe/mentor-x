import {
  createRootRoute,
  createRouter,
  createRoute,
} from "@tanstack/react-router";
import { userRouteTree } from "./user.router";
import App from "@/App";
import { adminRouteTree } from "./admin.router";
import { publicRouteTree } from "./public.router";
import { mentorRouteTree } from "./mentor.router";
import { redirectIfAuthenticated } from "@/utils/route-guards";

export const rootRoute = createRootRoute({
  component: App,
});

// login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  beforeLoad: async () => {
    await redirectIfAuthenticated();
  },
}).lazy(() => import("@/pages/public/login").then((d) => d.Route));

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
  beforeLoad: async () => {
    await redirectIfAuthenticated();
  },
}).lazy(() => import("@/pages/public/register.tsx").then((d) => d.Route));

const routeTree = rootRoute.addChildren([
  userRouteTree,
  adminRouteTree,
  publicRouteTree,
  loginRoute,
  registerRoute,
  mentorRouteTree,
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
