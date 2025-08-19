import axios, { type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/user.types'
import type { Comment, CreateCommentRequest } from '@/types/comment.type'

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' },
})

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

export class CommentService {
  static async getComments(params?: {
    search?: string
    postId?: number
    userId?: number
    page?: number
    limit?: number
  }): Promise<Comment[]> {
    try {
      const response: AxiosResponse<ApiResponse<Comment[]>> = await apiClient.get('/comments', {
        params,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments')
    }
  }

  static async getCommentById(id: string): Promise<Comment> {
    try {
      const response: AxiosResponse<ApiResponse<Comment>> = await apiClient.get(`/comments/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comment')
    }
  }

  static async createComment(data: CreateCommentRequest): Promise<Comment> {
    try {
      const response: AxiosResponse<ApiResponse<Comment>> = await apiClient.post('/comments', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create comment')
    }
  }

  static async updateComment(id: string, data: Partial<CreateCommentRequest>): Promise<Comment> {
    try {
      const response: AxiosResponse<ApiResponse<Comment>> = await apiClient.put(
        `/comments/${id}`,
        data,
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update comment')
    }
  }

  static async deleteComment(id: string): Promise<void> {
    try {
      await apiClient.delete(`/comments/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete comment')
    }
  }
}

export default CommentService
