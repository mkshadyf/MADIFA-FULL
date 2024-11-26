import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav>{/* Add your admin navigation component here */}</nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
} 