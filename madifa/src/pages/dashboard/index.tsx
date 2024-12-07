import React from 'react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/vimeo"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Video Management</h2>
          <p className="text-gray-600">Upload and manage your Vimeo videos</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600">View detailed analytics and insights</p>
        </Link>

        <Link
          to="/settings"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <p className="text-gray-600">Configure your account settings</p>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage; 