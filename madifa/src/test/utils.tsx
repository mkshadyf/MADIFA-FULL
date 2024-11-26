import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/providers/AuthProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/' } = {}
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

export * from '@testing-library/react' 