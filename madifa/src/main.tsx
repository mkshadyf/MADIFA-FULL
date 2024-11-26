import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './routes'
import App from './App'
import './styles/globals.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(container)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
