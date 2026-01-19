import UserLayout from "@/layouts/user.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import { requireRole } from "@/utils/route-guards";
import { USER_ROLES } from "@/types/user";

const userLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "user",
  component: UserLayout,
  beforeLoad: async () => {
    await requireRole(USER_ROLES.USER);
  },
});

const homeRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/",
}).lazy(() => import("@/pages/user/home").then((d) => d.Route));

const schedulesRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/schedules",
}).lazy(() => import("@/pages/user/shedules").then((d) => d.Route));

const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
}).lazy(() => import("@/pages/user/edit-profile").then((d) => d.Route));

const forumRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/forum",
}).lazy(() => import("@/pages/public/forum/forum").then((d) => d.UserRoute));

const topicDetailRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/forum/topic/$topicId",
}).lazy(() =>
  import("@/pages/public/forum/topic-detail").then((d) => d.UserRoute),
);

const mentorsRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/mentors",
}).lazy(() =>
  import("@/pages/public/mentors-listing").then((d) => d.UserRoute),
);

const userRouteTree = userLayoutRoute.addChildren([
  homeRoute,
  schedulesRoute,
  profileRoute,
  forumRoute,
  topicDetailRoute,
  mentorsRoute,
]);

export { userRouteTree };
