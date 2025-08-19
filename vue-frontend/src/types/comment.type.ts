export interface Comment {
  id: number
  postId: number
  name: string
  email: string
  body: string
  userId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateCommentRequest {
  postId: number
  name: string
  email: string
  body: string
  userId?: number | null
}
