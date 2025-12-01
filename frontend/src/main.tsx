import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { router } from './routes/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

const queryClient = new QueryClient()
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
      <TanStackRouterDevtools router={router} />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  </Provider>
)