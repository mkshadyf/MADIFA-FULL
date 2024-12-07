import React from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'
import { toast as hotToast } from 'react-hot-toast'

export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
        duration: 5000,
        style: {
          background: 'white',
          color: 'black',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: 'white',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
        },
      }}
    />
  )
}

interface Toast {
  success: (message: string) => void
  error: (message: string) => void
  loading: (message: string) => void
  dismiss: () => void
}

export const toast: Toast = {
  success: (message) => hotToast.success(message),
  error: (message) => hotToast.error(message),
  loading: (message) => hotToast.loading(message),
  dismiss: () => hotToast.dismiss(),
}

export default toast 