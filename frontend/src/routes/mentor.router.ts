import MentorLayout from "@/layouts/mentor.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import { requireRole } from "@/utils/route-guards";
import { USER_ROLES } from "@/types/user";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const mentorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mentor",
  component: MentorLayout,
  beforeLoad: async () => {
    await requireRole(USER_ROLES.MENTOR);
  },
});

const editProfileRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/edit-form",
  head: () => ({
    meta: [{ title: "MentorX - Chỉnh sửa hồ sơ Mentor" }],
  }),
}).lazy(() =>
  import("@/pages/mentor/mentor-edit-profile").then((d) => d.Route),
);

const setAvailabilitiesRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/set-availabilities",
  head: () => ({
    meta: [{ title: "MentorX - Đặt lịch rảnh" }],
  }),
}).lazy(() => import("@/pages/mentor/set-availabilities").then((d) => d.Route));

const schedulesRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/schedules",
  head: () => ({
    meta: [{ title: "MentorX - Lịch hẹn Mentor" }],
  }),
}).lazy(() => import("@/pages/mentor/schedules").then((d) => d.Route));

const mentorPaymentStatusRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/payment-status",
  head: () => ({
    meta: [{ title: "MentorX - Lịch hẹn Mentor" }],
  }),
}).lazy(() => import("@/pages/mentor/mentor-payment-status").then((d) => d.Route));

const forumRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/forum",
  head: () => ({
    meta: [{ title: "MentorX - Diễn đàn" }],
  }),
}).lazy(() => import("@/pages/public/forum/forum").then((d) => d.MentorRoute));

const forumTopicDetailRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/forum/topic/$topicId",
  head: () => ({
    meta: [{ title: "MentorX - Chi tiết chủ đề" }],
  }),
}).lazy(() =>
  import("@/pages/public/forum/topic-detail").then((d) => d.MentorRoute),
);

const mentorRouteTree = mentorLayoutRoute.addChildren([
  editProfileRoute,
  setAvailabilitiesRoute,
  schedulesRoute,
  mentorPaymentStatusRoute,
  forumRoute,
  forumTopicDetailRoute,
]);
export { mentorRouteTree };
