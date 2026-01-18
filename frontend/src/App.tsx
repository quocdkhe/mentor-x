import { Outlet } from '@tanstack/react-router'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'

const App = () => {
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