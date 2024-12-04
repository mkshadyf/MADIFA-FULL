import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'
import Providers from '@/providers'
import router from '@/routes'
import Toast from '@/components/ui/toast'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Providers>
        <RouterProvider router={router} />
        <Toast />
      </Providers>
    </QueryClientProvider>
  )
}
