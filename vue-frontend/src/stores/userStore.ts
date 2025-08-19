// stores/userStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, CreateUserRequest, ViewMode } from '@/types/user.types'
import { UserService } from '@/services/userService'

export const useUserStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const viewMode = ref<ViewMode>('list')
  const selectedUser = ref<User | null>(null)

  // Getters
  const filteredUsers = computed(() => {
    if (!searchQuery.value.trim()) {
      return users.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return users.value.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    )
  })

  const userCount = computed(() => filteredUsers.value.length)
  const totalUsers = computed(() => users.value.length)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
  }

  const setSelectedUser = (user: User | null) => {
    selectedUser.value = user
  }

  // Fetch all users from API

  const fetchUsers = async (search?: string) => {
    setLoading(true)
    clearError()

    try {
      const fetchedUsers = await UserService.getUsers(search)
      users.value = fetchedUsers
      console.log(`📥 Fetched ${fetchedUsers.length} users from API`)
    } catch (err: any) {
      setError(err.message)
      console.error('❌ Failed to fetch users:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new user

  const createUser = async (userData: CreateUserRequest): Promise<User> => {
    setLoading(true)
    clearError()

    try {
      const newUser = await UserService.createUser(userData)
      console.log('✅ User created successfully:', newUser.name)
      return newUser
    } catch (err: any) {
      setError(err.message)
      console.error('❌ Failed to create user:', err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update existing user

  const updateUser = async (id: string, userData: Partial<CreateUserRequest>): Promise<User> => {
    setLoading(true)
    clearError()

    try {
      const updatedUser = await UserService.updateUser(id, userData)
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      console.log('✅ User updated successfully:', updatedUser.name)
      return updatedUser
    } catch (err: any) {
      setError(err.message)
      console.error('❌ Failed to update user:', err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async (id: string): Promise<void> => {
    setLoading(true)
    clearError()

    try {
      await UserService.deleteUser(id)
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        const deletedUser = users.value[index]
        users.value.splice(index, 1)
        console.log('✅ User deleted successfully:', deletedUser.name)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('❌ Failed to delete user:', err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get user by ID
  const getUserById = (id: string): User | undefined => {
    return users.value.find((user) => user.id === id)
  }

  //Refresh users data
  const refreshUsers = async () => {
    console.log('🔄 Refreshing users data...')
    await fetchUsers(searchQuery.value || undefined)
  }

  // Reset store state

  const resetStore = () => {
    users.value = []
    loading.value = false
    error.value = null
    searchQuery.value = ''
    viewMode.value = 'list'
    selectedUser.value = null
    console.log('🔄 User store reset')
  }

  return {
    // State
    users,
    loading,
    error,
    searchQuery,
    viewMode,
    selectedUser,

    // Getters
    filteredUsers,
    userCount,
    totalUsers,
    isLoading,
    hasError,

    // Actions
    setLoading,
    setError,
    clearError,
    setSearchQuery,
    setViewMode,
    setSelectedUser,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    refreshUsers,
    resetStore,
  }
})
