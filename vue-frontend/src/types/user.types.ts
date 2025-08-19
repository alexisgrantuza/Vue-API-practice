export interface User {
  id: string
  name: string
  username: string
  email: string
  address: {
    street: string
    city: string
    zipcode?: string
  }
  phone?: string
  website?: string
  company?: {
    name: string
  }
  createdAt: string
  updatedAt?: string
}

export interface CreateUserRequest {
  name: string
  username: string
  email: string
  address: {
    street: string
    city: string
    zipcode?: string
  }
  phone?: string
  website?: string
  company?: {
    name: string
  }
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  total?: number
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export type ViewMode = 'list' | 'grid' | 'table'

export interface UserFormData {
  name: string
  username: string
  email: string
  street: string
  city: string
  zipcode: string
  phone: string
  website: string
  companyName: string
}

export interface LifecycleLoggerOptions {
  componentName?: string
  logMountTime?: boolean
}

export interface NotificationConfig {
  title?: string
  message: string
  duration?: number
  showClose?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}
