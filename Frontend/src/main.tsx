import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/react'
import './App.css'
import './pages/AppTheme.css'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is missing from .env");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/sign-in">
      <App />
    </ClerkProvider>
  </StrictMode>,
)
