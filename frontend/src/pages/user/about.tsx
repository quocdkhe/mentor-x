import { createLazyRoute } from "@tanstack/react-router"

export const Route = createLazyRoute('/user/about')({
  component: AboutPage,
})

export default function AboutPage() {
  return <div>Hello from Minh!</div>
}

