export interface ToastState {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
  showToast: (message: string, type: ToastType) => void
}

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
  position?: 'top' | 'bottom'
  dismissible?: boolean
}

export interface ToastOptions {
  duration?: number
  position?: 'top' | 'bottom'
  dismissible?: boolean
}

export interface ToastContextValue {
  toasts: ToastMessage[]
  addToast: (message: string, type: ToastType, options?: ToastOptions) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}
