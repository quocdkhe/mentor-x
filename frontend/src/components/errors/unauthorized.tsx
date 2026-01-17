import { createLazyRoute } from "@tanstack/react-router";

function Unauthorized() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Bạn không có quyền truy cập trang này</h1>
    </div>
  );
}

export default Unauthorized;
export const Route = createLazyRoute('/public/unauthorized')({
  component: Unauthorized,
})