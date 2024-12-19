import React from 'react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          to="/admin/vimeo"
          className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Video Management</h2>
          <p className="text-gray-600">Upload and manage your Vimeo videos</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Analytics</h2>
          <p className="text-gray-600">View detailed analytics and insights</p>
        </Link>

        <Link
          to="/settings"
          className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <h2 className="mb-2 text-lg font-semibold">Settings</h2>
          <p className="text-gray-600">Configure your account settings</p>
        </Link>
      </div>
    </div>
  )
}

export default DashboardPage
