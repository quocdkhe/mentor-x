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
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Trang chủ" },
    ],
  }),
}).lazy(() => import("@/pages/user/home").then((d) => d.Route));

const schedulesRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/schedules",
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Lịch học" },
    ],
  }),
}).lazy(() => import("@/pages/user/schedules").then((d) => d.Route));

const profileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/profile",
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Hồ sơ cá nhân" },
    ],
  }),
}).lazy(() => import("@/pages/user/edit-profile").then((d) => d.Route));

const forumRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/forum",
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Diễn đàn" },
    ],
  }),
}).lazy(() => import("@/pages/public/forum/forum").then((d) => d.UserRoute));

const topicDetailRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/forum/topic/$topicId",
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Diễn đàn" },
    ],
  }),
}).lazy(() =>
  import("@/pages/public/forum/topic-detail").then((d) => d.UserRoute),
);

const mentorsRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/mentors",
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Danh sách mentor" },
    ],
  }),
}).lazy(() =>
  import("@/pages/public/mentors-listing").then((d) => d.UserRoute),
);

const mentorProfileRoute = createRoute({
  getParentRoute: () => userLayoutRoute,
  path: "/mentors/$mentorId",
  head: () => ({
    meta: [
      // title here becomes <title>Home — MyApp</title>
      { title: "MentorX - Diễn đàn" },
    ],
  }),
}).lazy(() => import("@/pages/public/mentor-profile").then((d) => d.UserRoute));

const userRouteTree = userLayoutRoute.addChildren([
  homeRoute,
  schedulesRoute,
  profileRoute,
  forumRoute,
  topicDetailRoute,
  mentorsRoute,
  mentorProfileRoute,
]);

export { userRouteTree };
