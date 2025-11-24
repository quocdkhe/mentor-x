import { useTheme } from "next-themes"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [animating, setAnimating] = useState(false)

  const toggle = () => {
    setAnimating(true)
    setTheme(theme === "dark" ? "light" : "dark")

    setTimeout(() => {
      setAnimating(false)
    }, 500)
  }

  return (
    <button
      onClick={toggle}
      className="relative flex h-10 w-10 items-center justify-center rounded-full 
                 bg-muted hover:bg-accent transition-all"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}

      <AnimatePresence>
        {animating && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-yellow-400 dark:bg-blue-500 blur-xl"
          />
        )}
      </AnimatePresence>
    </button>
  )
}
