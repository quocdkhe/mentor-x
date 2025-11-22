import { createRootRoute, createRouter } from "@tanstack/react-router";
import { userRouteTree } from "./user.router";
import App from "@/App";
import { adminRouteTree } from "./admin.router";

export const rootRoute = createRootRoute({
  component: App,
});

const routeTree = rootRoute.addChildren([userRouteTree, adminRouteTree]);

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
