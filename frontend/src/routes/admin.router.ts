import AdminLayout from "@/layouts/admin.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import { requireRole } from "@/utils/route-guards";
import { USER_ROLES } from "@/types/user";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
  beforeLoad: async () => {
    await requireRole(USER_ROLES.ADMIN);
  },
});

const userManagementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/user-management",
  head: () => ({
    meta: [{ title: "MentorX - Quản lý người dùng" }],
  }),
}).lazy(() => import("@/pages/admin/user-management").then((d) => d.Route));

const profileRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/profile",
  head: () => ({
    meta: [{ title: "MentorX - Hồ sơ" }],
  }),
}).lazy(() => import("@/pages/user/edit-profile").then((d) => d.AdminRoute));

const pendingMentorsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/pending-mentors",
  head: () => ({
    meta: [{ title: "MentorX - Duyệt Mentor" }],
  }),
}).lazy(() => import("@/pages/admin/pending-mentors").then((d) => d.Route));

const verifyMentorsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/verify-mentors",
  head: () => ({
    meta: [{ title: "MentorX - Xác thực Mentor" }],
  }),
}).lazy(() => import("@/pages/admin/verify-mentor").then((d) => d.Route));

const paymentStatusRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/payment-status",
  head: () => ({
    meta: [{ title: "MentorX - Trạng thái thanh toán" }],
  }),
}).lazy(() => import("@/pages/admin/payment-status").then((d) => d.Route));

const adminRouteTree = adminLayoutRoute.addChildren([
  userManagementRoute,
  profileRoute,
  pendingMentorsRoute,
  verifyMentorsRoute,
  paymentStatusRoute,
]);

export { adminRouteTree };
