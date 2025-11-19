import { createLazyRoute } from "@tanstack/react-router"

export const Route = createLazyRoute('/user/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}



export default HomePage