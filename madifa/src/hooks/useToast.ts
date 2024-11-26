import { useCallback, useState } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false
  })

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, duration)
  }, [duration])

  return { toast, showToast }
} 