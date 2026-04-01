import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@/i18n/i18n.ts'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from './components/provider/ThemeProvider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
          <App />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
)
