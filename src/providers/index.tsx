import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import AuthProvider from './AuthProvider'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

export { default as AuthProvider } from './AuthProvider'
export * from './AuthProvider'
