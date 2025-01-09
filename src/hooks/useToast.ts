import type { ToastState, ToastType } from '@/types/toast'
import { useCallback } from 'react'

export function useToast(): ToastState {
  const showToast = useCallback((message: string, type: ToastType) => {
    switch (type) {
      case 'success':
        console.log('✅', message)
        break
      case 'error':
        console.error('❌', message)
        break
      case 'info':
        console.info('ℹ️', message)
        break
      case 'warning':
        console.warn('⚠️', message)
        break
    }
  }, [])

  return {
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
    warning: (message: string) => showToast(message, 'warning'),
    showToast,
  }
}
