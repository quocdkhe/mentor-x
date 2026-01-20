import { Footer } from '@/components/landing/footer'
import SimpleNavbar from '@/components/user-navbar'
import { Outlet } from '@tanstack/react-router'

const UserLayout = () => {
  return (
    <>
      <SimpleNavbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default UserLayout