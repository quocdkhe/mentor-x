import SimpleNavbar from '@/components/user-navbar'
import { Outlet } from '@tanstack/react-router'

const UserLayout = () => {
  return (
    <>
      <SimpleNavbar />
      <Outlet />
    </>
  )
}

export default UserLayout