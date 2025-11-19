import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './routes/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)