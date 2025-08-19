import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import type { NotificationConfig } from '@/types/user.types'

export class NotificationService {
  // Show success notification
  static success(config: NotificationConfig | string) {
    const options =
      typeof config === 'string'
        ? { message: config, title: 'Success' }
        : { title: 'Success', ...config }

    ElNotification({
      type: 'success',
      title: options.title,
      message: options.message,
      duration: options.duration || 4000,
      showClose: options.showClose ?? true,
      position: options.position || 'top-right',
    })
  }

  // Show error notification
  static error(config: NotificationConfig | string) {
    const options =
      typeof config === 'string'
        ? { message: config, title: 'Error' }
        : { title: 'Error', ...config }

    ElNotification({
      type: 'error',
      title: options.title,
      message: options.message,
      duration: options.duration || 6000,
      showClose: options.showClose ?? true,
      position: options.position || 'top-right',
    })
  }

  // Show warning notification
  static warning(config: NotificationConfig | string) {
    const options =
      typeof config === 'string'
        ? { message: config, title: 'Warning' }
        : { title: 'Warning', ...config }

    ElNotification({
      type: 'warning',
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      showClose: options.showClose ?? true,
      position: options.position || 'top-right',
    })
  }

  // Show info notification
  static info(config: NotificationConfig | string) {
    const options =
      typeof config === 'string'
        ? { message: config, title: 'Information' }
        : { title: 'Information', ...config }

    ElNotification({
      type: 'info',
      title: options.title,
      message: options.message,
      duration: options.duration || 4000,
      showClose: options.showClose ?? true,
      position: options.position || 'top-right',
    })
  }

  // Show simple message
  static message = {
    success: (message: string) => ElMessage({ type: 'success', message }),
    error: (message: string) => ElMessage({ type: 'error', message }),
    warning: (message: string) => ElMessage({ type: 'warning', message }),
    info: (message: string) => ElMessage({ type: 'info', message }),
  }

  // Show confirmation dialog
  static async confirm(
    message: string,
    title = 'Confirmation',
    options: {
      confirmButtonText?: string
      cancelButtonText?: string
      type?: 'success' | 'info' | 'warning' | 'error'
    } = {},
  ): Promise<boolean> {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: options.confirmButtonText || 'Confirm',
        cancelButtonText: options.cancelButtonText || 'Cancel',
        type: options.type || 'warning',
      })
      return true
    } catch {
      return false
    }
  }

  // Show delete confirmation
  static async confirmDelete(itemName?: string): Promise<boolean> {
    const message = itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this item? This action cannot be undone.'

    return this.confirm(message, 'Delete Confirmation', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'error',
    })
  }

  // Show loading notification
  static loading(message = 'Loading...', duration = 0) {
    return ElNotification({
      type: 'info',
      title: 'Loading',
      message,
      duration,
      showClose: false,
    })
  }
}

// Convenience exports
export const showSuccess = NotificationService.success
export const showError = NotificationService.error
export const showWarning = NotificationService.warning
export const showInfo = NotificationService.info
export const showMessage = NotificationService.message
export const showConfirm = NotificationService.confirm
export const showDeleteConfirm = NotificationService.confirmDelete
export const showLoading = NotificationService.loading

// User operation specific notifications
export const UserNotifications = {
  userCreated: (userName: string) =>
    showSuccess({ message: `User "${userName}" created successfully!`, title: 'User Created' }),

  userUpdated: (userName: string) =>
    showSuccess({ message: `User "${userName}" updated successfully!`, title: 'User Updated' }),

  userDeleted: (userName: string) =>
    showSuccess({ message: `User "${userName}" deleted successfully!`, title: 'User Deleted' }),

  usersFetched: (count: number) =>
    showInfo({ message: `Loaded ${count} users`, title: 'Data Refreshed', duration: 2000 }),

  operationFailed: (operation: string, error: string) =>
    showError({ message: `Failed to ${operation}: ${error}`, title: 'Operation Failed' }),

  networkError: () =>
    showError({
      message: 'Network error occurred. Please check your connection and try again.',
      title: 'Connection Error',
    }),

  validationError: (message: string) => showWarning({ message, title: 'Validation Error' }),
}
