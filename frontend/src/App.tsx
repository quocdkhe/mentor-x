import { Outlet } from '@tanstack/react-router'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'

const App = () => {
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