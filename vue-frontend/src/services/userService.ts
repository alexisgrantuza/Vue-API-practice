import axios, { type AxiosResponse } from 'axios'
import type { User, CreateUserRequest, ApiResponse } from '@/types/user.types'

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export class UserService {
  static async getUsers(searchQuery?: string): Promise<User[]> {
    try {
      const params = searchQuery ? { search: searchQuery } : {}
      const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.get('/users', { params })
      console.log('🔄 API Response2:', response.data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  }

  static async getUserById(id: string): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.get(`/users/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.post('/users', userData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  }

  static async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.put(
        `/users/${id}`,
        userData,
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  }
}

export default UserService
