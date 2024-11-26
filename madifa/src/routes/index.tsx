import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import MainLayout from '@/components/layouts/MainLayout'
import AdminLayout from '@/components/layouts/AdminLayout'
import AuthLayout from '@/components/layouts/AuthLayout'

// Main pages
import HomePage from '@/pages/home'
import BrowsePage from '@/pages/browse'
import SearchPage from '@/pages/search'
import WatchPage from '@/pages/watch/[id]'
import ProfilePage from '@/pages/profile'
import FavoritesPage from '@/pages/favorites'

// Admin pages
import AdminDashboard from '@/pages/admin/dashboard'
import AdminVimeo from '@/pages/admin/vimeo'

// Auth pages
import SignIn from '@/pages/auth/signin'
import SignUp from '@/pages/auth/signup'

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/auth/signin" replace />
  
  return <>{children}</>
}

// Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user || profile?.role !== 'admin') return <Navigate to="/auth/signin" replace />
  
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: 'browse',
        element: <ProtectedRoute><BrowsePage /></ProtectedRoute>
      },
      { 
        path: 'search',
        element: <ProtectedRoute><SearchPage /></ProtectedRoute>
      },
      { 
        path: 'watch/:id',
        element: <ProtectedRoute><WatchPage /></ProtectedRoute>
      },
      { 
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      { 
        path: 'favorites',
        element: <ProtectedRoute><FavoritesPage /></ProtectedRoute>
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'vimeo/*', element: <AdminVimeo /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]) 
