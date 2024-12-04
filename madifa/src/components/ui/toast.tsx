import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/hooks/useToast'

const toastTypeStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500'
}

export default function Toast() {
  const { toasts, removeToast } = useToastStore()

  // Auto-remove toasts after 3 seconds
  useEffect(() => {
    const timeouts = toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id)
      }, 3000)
    })

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [toasts, removeToast])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`
              ${toastTypeStyles[toast.type]}
              text-white px-6 py-3 rounded-lg shadow-lg mb-2
              flex items-center justify-between min-w-[300px]
            `}
          >
            <span className="mr-4">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 