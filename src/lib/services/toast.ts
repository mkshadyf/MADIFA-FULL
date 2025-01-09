import type { ToastState, ToastType } from '@/types/toast'

export class ToastService implements ToastState {
  private static instance: ToastService
  private currentId: string = ''
  private currentType: ToastType = 'info'
  private currentMessage: string = ''

  private constructor() {
    this.success = this.success.bind(this)
    this.error = this.error.bind(this)
    this.info = this.info.bind(this)
    this.warning = this.warning.bind(this)
    this.showToast = this.showToast.bind(this)
  }

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService()
    }
    return ToastService.instance
  }

  success(message: string): void {
    this.show('success', message)
  }

  error(message: string): void {
    this.show('error', message)
  }

  info(message: string): void {
    this.show('info', message)
  }

  warning(message: string): void {
    this.show('warning', message)
  }

  showToast(message: string, type: ToastType): void {
    this.show(type, message)
  }

  private show(type: ToastType, message: string): void {
    this.currentId = crypto.randomUUID()
    this.currentType = type
    this.currentMessage = message
  }

  clear(): void {
    this.currentId = ''
    this.currentType = 'info'
    this.currentMessage = ''
  }
}
