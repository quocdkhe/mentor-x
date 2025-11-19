import { ModeToggle } from '@/components/mode-toggle'
import { Link, Outlet } from '@tanstack/react-router'

const UserLayout = () => {
  return (
    <>
      <div className="p-2 flex gap-2">
        <Link to='/' className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <ModeToggle />
      </div>
      <hr />
      <Outlet />
    </>
  )
}


export default UserLayout