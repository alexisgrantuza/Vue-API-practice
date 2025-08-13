import apiClient from './api';
import type { CommentType } from '@/types/api';

export class CommentService {
  static async getAllComments(): Promise<CommentType[]> {
    try {
      const response = await apiClient.get<CommentType[]>(`/comments`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      throw error;
    }
  }

  static async getCommentsByPostId(postId: number): Promise<CommentType[]> {
    try {
      const response = await apiClient.get<CommentType[]>(`/comments?postId=${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      throw error;
    }
  }
}

