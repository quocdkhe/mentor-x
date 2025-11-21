import { Outlet } from '@tanstack/react-router'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'
import { useAppDispatch } from './store/hooks';
import { useEffect } from 'react';
import { fetchCurrentUser } from './store/auth.slice';

const App = () => {
  // Fetch user data on app load
  const dispatch = useAppDispatch();
  useEffect(() => {
    // Fetch user on app load
    dispatch(fetchCurrentUser());
  }, [dispatch]);


  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </>
  )
}

export default App