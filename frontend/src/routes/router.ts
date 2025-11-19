import { Outlet, createRootRoute, createRouter } from "@tanstack/react-router";
import { userRouteTree } from "./user.router";

export const rootRoute = createRootRoute({
  component: Outlet,
});

const routeTree = rootRoute.addChildren([userRouteTree]);

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
