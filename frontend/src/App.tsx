import { Outlet } from '@tanstack/react-router'
import { ThemeProvider } from "@/components/theme-provider"

const App = () => {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
      </ThemeProvider>
    </>
  )
}

export default App