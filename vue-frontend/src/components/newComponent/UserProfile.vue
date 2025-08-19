<template>
  <div class="user-profile-container">
    <!-- Header Section -->
    <div class="profile-header">
      <div class="header-content">
        <h1 class="title">
          <el-icon><User /></el-icon>
          User Profile Manager
        </h1>
        <p class="subtitle">Manage user profiles with Vue 3 Composition API</p>
      </div>

      <!-- Action Controls -->
      <div class="header-actions">
        <el-button type="primary" @click="handleAddUser" :loading="userStore.isLoading">
          <el-icon><Plus /></el-icon>
          Add User
        </el-button>

        <el-button @click="handleRefreshUsers" :loading="userStore.isLoading">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </div>

    <!-- Search and View Controls -->
    <div class="controls-section">
      <div class="search-section">
        <el-input
          v-model="userStore.searchQuery"
          placeholder="Search by name, username, or email..."
          clearable
          @input="handleSearch"
          :prefix-icon="Search"
          size="large"
          style="width: 400px"
        />
      </div>

      <div class="view-controls">
        <span class="view-label">View:</span>
        <el-radio-group v-model="userStore.viewMode" @change="handleViewChange">
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
            List
          </el-radio-button>
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
            Grid
          </el-radio-button>
          <el-radio-button value="table">
            <el-icon><ReadingLamp /></el-icon>
            Table
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section" v-if="!userStore.isLoading">
      <el-card class="stats-card">
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">Total Users:</span>
            <span class="stat-value">{{ userStore.totalUsers }}</span>
          </div>
          <div class="stat-item" v-if="userStore.searchQuery">
            <span class="stat-label">Filtered Results:</span>
            <span class="stat-value">{{ userStore.userCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Current View:</span>
            <span class="stat-value">{{ capitalizeFirst(userStore.viewMode) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.isLoading" class="loading-section">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- Error State -->
    <el-alert
      v-if="userStore.hasError && !userStore.isLoading"
      :title="userStore.error || ''"
      type="error"
      show-icon
      :closable="false"
      class="error-alert"
    />

    <!-- Empty State -->
    <el-empty
      v-if="!userStore.isLoading && userStore.filteredUsers.length === 0 && !userStore.hasError"
      :description="
        userStore.searchQuery ? 'No users found matching your search' : 'No users available'
      "
      class="empty-state"
    >
      <el-button type="primary" @click="handleAddUser" v-if="!userStore.searchQuery">
        Add First User
      </el-button>
      <el-button @click="clearSearch" v-else> Clear Search </el-button>
    </el-empty>

    <!-- User Views -->
    <div v-if="!userStore.isLoading && userStore.filteredUsers.length > 0" class="users-section">
      <transition name="fade" mode="out-in">
        <!-- List View -->
        <UserList
          v-if="userStore.viewMode === 'list'"
          :users="userStore.filteredUsers"
          @edit="handleEditUser"
          @delete="handleDeleteUser"
          @view="handleViewUser"
        />

        <!-- Grid View -->
        <UserGrid
          v-else-if="userStore.viewMode === 'grid'"
          :users="userStore.filteredUsers"
          @edit="handleEditUser"
          @delete="handleDeleteUser"
          @view="handleViewUser"
        />

        <!-- Table View -->
        <UserTable
          v-else-if="userStore.viewMode === 'table'"
          :users="userStore.filteredUsers"
          @edit="handleEditUser"
          @delete="handleDeleteUser"
          @view="handleViewUser"
        />
      </transition>
    </div>

    <!-- User Form Modal -->
    <UserForm
      v-model:visible="showUserForm"
      :user="selectedUser"
      :mode="formMode"
      @save="handleSaveUser"
      @cancel="handleCancelForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Plus, Refresh, Search, List, Grid, ReadingLamp } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'
import { useLifecycleLogger } from '@/composables/useLifecycleLogger'
import { UserNotifications, showDeleteConfirm } from '@/composables/useNotification'
import type { User as UserType, CreateUserRequest, ViewMode } from '@/types/user.types'
import UserList from './UserList.vue'
import UserGrid from './UserGrid.vue'
import UserTable from './UserTable.vue'
import UserForm from './UserForm.vue'

// Composables
const router = useRouter()
const userStore = useUserStore()
const { logCustomEvent, logError, logPerformance } = useLifecycleLogger({
  componentName: 'UserProfile',
  logMountTime: true,
})

// Reactive state
const showUserForm = ref(false)
const selectedUser = ref<UserType | null>(null)
const formMode = ref<'create' | 'edit'>('create')

// Computed properties
const capitalizeFirst = computed(() => (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

// Event handlers
const handleAddUser = () => {
  logCustomEvent('add-user-clicked')
  selectedUser.value = null
  formMode.value = 'create'
  showUserForm.value = true
}

const handleEditUser = (user: UserType) => {
  logCustomEvent('edit-user-clicked', { userId: user.id, userName: user.name })
  selectedUser.value = user
  formMode.value = 'edit'
  showUserForm.value = true
}

const handleViewUser = (user: UserType) => {
  logCustomEvent('view-user-clicked', { userId: user.id, userName: user.name })
  userStore.setSelectedUser(user)
  console.log('Viewing user:', user)
  // Navigate to user profile page
  router.push({ name: 'user-profile', params: { id: user.id } })
}

const handleDeleteUser = async (user: UserType) => {
  logCustomEvent('delete-user-requested', { userId: user.id, userName: user.name })

  const confirmed = await showDeleteConfirm(user.name)
  if (!confirmed) {
    logCustomEvent('delete-user-cancelled', { userId: user.id })
    return
  }

  try {
    await userStore.deleteUser(user.id)
    UserNotifications.userDeleted(user.name)
    logCustomEvent('delete-user-success', { userId: user.id, userName: user.name })
  } catch (error: any) {
    logError(error, 'Failed to delete user')
    UserNotifications.operationFailed('delete user', error.message)
  }
}

const handleSaveUser = async (userData: CreateUserRequest) => {
  logCustomEvent('save-user-attempted', { mode: formMode.value })

  try {
    if (formMode.value === 'create') {
      const newUser = await userStore.createUser(userData)
      UserNotifications.userCreated(newUser.name)
      logCustomEvent('create-user-success', { userId: newUser.id, userName: newUser.name })
    } else if (selectedUser.value) {
      const updatedUser = await userStore.updateUser(selectedUser.value.id, userData)
      UserNotifications.userUpdated(updatedUser.name)
      logCustomEvent('update-user-success', { userId: updatedUser.id, userName: updatedUser.name })
    }

    showUserForm.value = false
    selectedUser.value = null
  } catch (error: any) {
    logError(error, `Failed to ${formMode.value} user`)
    UserNotifications.operationFailed(
      formMode.value === 'create' ? 'create user' : 'update user',
      error.message,
    )
  }
}

const handleCancelForm = () => {
  logCustomEvent('form-cancelled', { mode: formMode.value })
  showUserForm.value = false
  selectedUser.value = null
}

const handleRefreshUsers = logPerformance('refresh-users', async () => {
  try {
    await userStore.refreshUsers()
    UserNotifications.usersFetched(userStore.totalUsers)
    logCustomEvent('users-refreshed', { count: userStore.totalUsers })
  } catch (error: any) {
    logError(error, 'Failed to refresh users')
    UserNotifications.networkError()
  }
})

const handleSearch = (query: string) => {
  logCustomEvent('search-query-changed', { query, resultCount: userStore.userCount })
  userStore.setSearchQuery(query)
}

const handleViewChange = (newView: any) => {
  logCustomEvent('view-mode-changed', { from: userStore.viewMode, to: newView })
  userStore.setViewMode(newView as ViewMode)
}

const clearSearch = () => {
  logCustomEvent('search-cleared')
  userStore.setSearchQuery('')
}

// Lifecycle
onMounted(async () => {
  logCustomEvent('component-mounted', { initialLoad: true })

  if (userStore.users.length === 0) {
    await handleRefreshUsers()
  }
})
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  color: black;
  border-radius: 12px;
}

.header-content {
  flex: 1;
}

.title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-label {
  font-weight: 500;
  color: #666;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  gap: 30px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.loading-section {
  margin: 40px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-alert {
  margin-bottom: 20px;
}

.empty-state {
  margin: 40px 0;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.users-section {
  margin-top: 20px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .user-profile-container {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .controls-section {
    flex-direction: column;
    gap: 16px;
  }

  .stats-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .title {
    font-size: 24px;
  }
}
</style>
