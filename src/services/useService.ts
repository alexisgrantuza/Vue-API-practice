import apiClient from './api';
import type { User } from '@/types/user';
import dayjs from 'dayjs';

export class UserService {
  static async getUser(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return {
        ...response.data,
        createdAt: dayjs().subtract(Math.floor(Math.random() * 365), 'days').toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response.data.map(user => ({
        ...user,
        createdAt: dayjs().subtract(Math.floor(Math.random() * 365), 'days').toISOString()
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  static async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', user);
      return {
        ...response.data,
        createdAt: dayjs().toISOString()
      };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  static async updateUser(id: number, user: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, user);
      return {
        ...response.data,
        createdAt: user.createdAt || dayjs().toISOString()
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }
}