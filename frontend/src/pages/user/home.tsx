import { createLazyRoute } from "@tanstack/react-router"

export const Route = createLazyRoute('/user/')({
  component: HomePage,
})

function HomePage() {
  return (
    <h3>Welcome Home!</h3>
  )
}



export default HomePage