import type { ToastState } from '@/types'

class ToastService implements ToastState {
  private notify(type: 'success' | 'error' | 'info' | 'warning', message: string, options?: { duration?: number }): void {
    // In a real implementation, this would use a UI toast library like react-hot-toast
    const style = `
      color: ${type === 'error' ? 'red' : type === 'warning' ? 'orange' : type === 'success' ? 'green' : 'blue'};
      font-weight: bold;
    `
    console.log(`%c${type.toUpperCase()}: ${message}`, style)
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning', options?: { duration?: number }): void {
    this.notify(type, message, options)
  }

  success(message: string, options?: { duration?: number }): void {
    this.notify('success', message, options)
  }

  error(message: string, options?: { duration?: number }): void {
    this.notify('error', message, options)
  }

  info(message: string, options?: { duration?: number }): void {
    this.notify('info', message, options)
  }

  warning(message: string, options?: { duration?: number }): void {
    this.notify('warning', message, options)
  }
}

export const toast = new ToastService() 