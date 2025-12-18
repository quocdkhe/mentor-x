import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import PublicLayout from "@/layouts/public.layout";

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
}).lazy(() => import("@/pages/public/landing").then((d) => d.Route));

const forumListingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/forum",
}).lazy(() => import("@/pages/public/forum-listing").then((d) => d.Route))

const publicRouteTree = publicLayoutRoute.addChildren([
  landingRoute,
  forumListingRoute
]);

export { publicRouteTree };
