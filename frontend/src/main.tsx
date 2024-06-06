import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from '@mui/material'
import { theme } from './theme'
import { AuthProvider } from './hooks/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// TODO: we can configure this as need be later...
// we can also nest providers with configs
// configs for each route (dashboard vs login, etc)
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
