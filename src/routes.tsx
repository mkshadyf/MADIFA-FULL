import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts/AuthLayout';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Auth pages
const Login = lazy(() => import('@/pages/auth/login'));
const Register = lazy(() => import('@/pages/auth/register'));
const ResetPassword = lazy(() => import('@/pages/auth/reset-password'));
const AuthCallback = lazy(() => import('@/pages/auth/callback'));

// Main app pages
const Browse = lazy(() => import('@/pages/browse'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Profile = lazy(() => import('@/pages/profile'));
const Settings = lazy(() => import('@/pages/settings'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'));
const UserManagement = lazy(() => import('@/pages/admin/users'));
const ContentManagement = lazy(() => import('@/pages/admin/content'));

// Fallback component for lazy-loaded routes
const SuspenseFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <Register />
              </Suspense>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <ResetPassword />
              </Suspense>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <AuthCallback />
              </Suspense>
            }
          />
        </Route>

        {/* Main app routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/browse"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <Browse />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <Settings />
              </Suspense>
            }
          />
          
          {/* Admin routes */}
          <Route path="/admin">
            <Route
              index
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <UserManagement />
                </Suspense>
              }
            />
            <Route
              path="content"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ContentManagement />
                </Suspense>
              }
            />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
