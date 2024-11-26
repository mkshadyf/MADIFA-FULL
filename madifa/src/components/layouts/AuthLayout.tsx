import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main>
        <Outlet />
      </main>
    </div>
  )
} 