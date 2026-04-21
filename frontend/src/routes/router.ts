import {
  createRootRoute,
  createRouter,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { userRouteTree } from "./user.router";
import App from "@/App";
import { adminRouteTree } from "./admin.router";
import { publicRouteTree } from "./public.router";
import { mentorRouteTree } from "./mentor.router";
import { redirectIfAuthenticated } from "@/utils/route-guards";
import { Error404 } from "@/components/errors";

export const rootRoute = createRootRoute({
  component: App,
});

// login route — redirect to home (login is now a modal)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  beforeLoad: async () => {
    await redirectIfAuthenticated();
    throw redirect({ to: "/" });
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
  beforeLoad: async () => {
    await redirectIfAuthenticated();
    throw redirect({ to: "/" });
  },
});

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
  defaultNotFoundComponent: Error404,
});

// Track route changes for Google Analytics (production only)
// Track route changes for Google Analytics (production only)
if (import.meta.env.PROD) {
  router.subscribe("onLoad", ({ toLocation }) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-F9PXCSV1E3", {
        page_path: toLocation.pathname, // path name only
      });
    }
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
