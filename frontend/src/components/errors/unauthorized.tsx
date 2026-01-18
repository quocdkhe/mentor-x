import { createLazyRoute } from "@tanstack/react-router";
import { Error403 } from "./error-403";

function Unauthorized() {
  return <Error403 />;
}

export default Unauthorized;
export const Route = createLazyRoute('/public/unauthorized')({
  component: Unauthorized,
})