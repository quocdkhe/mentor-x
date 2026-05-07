import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./router";
import { requireAuth } from "@/utils/route-guards";

const callRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "call/$sessionId",
  head: () => ({
    meta: [{ title: "MentorX - Cuộc gọi" }],
  }),
  beforeLoad: async () => {
    await requireAuth();
  },
}).lazy(() =>
  import("@/pages/user/call-room").then((d) => d.Route),
);

export { callRoute };
