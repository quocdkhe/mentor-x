import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import PublicLayout from "@/layouts/public.layout";
import { redirectIfAuthenticated } from "@/utils/route-guards";

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  beforeLoad: async () => {
    await redirectIfAuthenticated();
  },
  head: () => ({
    meta: [{ title: "MentorX - Kết nối Mentors với Mentees" }],
  }),
}).lazy(() => import("@/pages/public/landing").then((d) => d.Route));

const mentorListingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/mentors",
  head: () => ({
    meta: [{ title: "MentorX - Danh sách Mentors" }],
  }),
}).lazy(() => import("@/pages/public/mentors-listing").then((d) => d.Route));

const mentorProfileRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/mentors/$mentorId",
  head: () => ({
    meta: [{ title: "MentorX - Hồ sơ Mentor" }],
  }),
}).lazy(() => import("@/pages/public/mentor-profile").then((d) => d.Route));

const forumListingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/forum",
  head: () => ({
    meta: [{ title: "MentorX - Diễn đàn" }],
  }),
}).lazy(() => import("@/pages/public/forum/forum").then((d) => d.Route));

const topicDetailRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/forum/topic/$topicId",
  head: () => ({
    meta: [{ title: "MentorX - Chi tiết chủ đề" }],
  }),
}).lazy(() => import("@/pages/public/forum/topic-detail").then((d) => d.Route));

const unauthorizedRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/unauthorized",
  head: () => ({
    meta: [{ title: "MentorX - Không có quyền truy cập" }],
  }),
}).lazy(() => import("@/components/errors/unauthorized").then((d) => d.Route));

const publicRouteTree = publicLayoutRoute.addChildren([
  landingRoute,
  forumListingRoute,
  mentorListingRoute,
  mentorProfileRoute,
  topicDetailRoute,
  unauthorizedRoute,
]);

export { publicRouteTree };
