import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { LoadingPage } from '@/components/loading-page'
import { useEffect, useRef } from 'react'
import { USER_ROLES } from '@/types/user'

const App = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const routerState = useRouterState()
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    // Only redirect once when auth loading completes
    if (!isLoading && !hasRedirectedRef.current && user) {
      hasRedirectedRef.current = true

      // Only redirect if we're on the root path
      const currentPath = routerState.location.pathname

      // Don't redirect if already on a valid route for the user's role
      if (currentPath === '/' || currentPath === '') {
        // Redirect to role-specific home page
        switch (user.role) {
          case USER_ROLES.ADMIN:
            navigate({ to: '/admin/user-management' })
            break
          case USER_ROLES.MENTOR:
            navigate({ to: '/mentor/schedules' })
            break
          case USER_ROLES.USER:
            navigate({ to: '/user/schedules' })
            break
          default:
            // Stay on current page
            break
        }
      }
    }
  }, [isLoading, user, navigate, routerState.location.pathname])

  // Show loading page while auth is initializing
  if (isLoading) {
    return (
      <ThemeProvider storageKey="vite-ui-theme">
        <LoadingPage />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    )
  }

  return (
    <>
      <ThemeProvider storageKey="vite-ui-theme">
        <Outlet />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </>
  )
}

export default App