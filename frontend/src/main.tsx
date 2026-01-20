import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { router } from './routes/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { fetchCurrentUser } from './store/auth.slice'
import './index.css'
import Clarity from '@microsoft/clarity';

const queryClient = new QueryClient()
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Initialize analytics only in production
if (import.meta.env.PROD) {
  Clarity.init("v4e3q4muga");
}

// Initialize Google Analytics only in production
if (import.meta.env.PROD) {
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-F9PXCSV1E3';
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-F9PXCSV1E3');
  `;
  document.head.appendChild(script2);
}


// Dispatch fetchCurrentUser BEFORE rendering to avoid race condition with route guards
store.dispatch(fetchCurrentUser())

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