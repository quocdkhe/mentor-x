import { createLazyRoute } from "@tanstack/react-router";

export const Route = createLazyRoute('/mentor/edit-form')({
  component: () => <div>edit-form</div>,
})  