import MentorLayout from "@/layouts/mentor.layout";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";

// Pathless routes, used for layouts or grouping, in Route, use /user/*
const mentorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mentor",
  component: MentorLayout,
});

const editProfileRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/edit-form",
}).lazy(() =>
  import("@/pages/mentor/mentor-edit-profile").then((d) => d.Route)
);

const setAvailabilitiesRoute = createRoute({
  getParentRoute: () => mentorLayoutRoute,
  path: "/set-availabilities",
}).lazy(() => import("@/pages/mentor/set-availabilities").then((d) => d.Route));

const mentorRouteTree = mentorLayoutRoute.addChildren([
  editProfileRoute,
  setAvailabilitiesRoute,
]);
export { mentorRouteTree };
