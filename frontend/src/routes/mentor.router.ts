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
}).lazy(() => import("@/pages/mentor/edit-form").then((d) => d.Route));

const mentorRouteTree = mentorLayoutRoute.addChildren([
    editProfileRoute,
]);

export { mentorRouteTree };
