import { ref } from 'vue';
import { UserService } from '@/services/useService';
import type { User } from '@/types/user';
import { useNotifications } from './useNotification';

export function useUsers() {
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const { showSuccess, showError } = useNotifications();

  const fetchUser = async (id: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      currentUser.value = await UserService.getUser(id);
      showSuccess('Success', 'User data loaded successfully');
    } catch (err: any) {
      error.value = err.message;
      showError('Error', 'Failed to load user data');
    } finally {
      loading.value = false;
    }
  };

  const fetchAllUsers = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      users.value = await UserService.getAllUsers();
      showSuccess('Success', 'Users loaded successfully');
    } catch (err: any) {
      error.value = err.message;
      showError('Error', 'Failed to load users');
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newUser = await UserService.createUser(userData);
      users.value.push(newUser);
      showSuccess('Success', 'User created successfully');
      return newUser;
    } catch (err: any) {
      error.value = err.message;
      showError('Error', 'Failed to create user');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedUser = await UserService.updateUser(id, userData);
      const index = users.value.findIndex(u => u.id === id);
      if (index > -1) {
        users.value[index] = updatedUser;
      }
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser;
      }
      showSuccess('Success', 'User updated successfully');
      return updatedUser;
    } catch (err: any) {
      error.value = err.message;
      showError('Error', 'Failed to update user');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      await UserService.deleteUser(id);
      users.value = users.value.filter(u => u.id !== id);
      if (currentUser.value?.id === id) {
        currentUser.value = null;
      }
      showSuccess('Success', 'User deleted successfully');
    } catch (err: any) {
      error.value = err.message;
      showError('Error', 'Failed to delete user');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshUser = async (id: number) => {
    await fetchUser(id);
  };

  return {
    users,
    currentUser,
    loading,
    error,
    fetchUser,
    fetchAllUsers,
    createUser,
    updateUser,
    deleteUser,
    refreshUser,
  };
}
