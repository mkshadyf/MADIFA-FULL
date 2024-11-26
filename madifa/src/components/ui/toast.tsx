import React from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  onClose?: () => void
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      )}
    </div>
  )
} 