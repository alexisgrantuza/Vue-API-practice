<template>
  <div class="user-profile-container">

    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><UserFilled /></el-icon>
            User Profile Manager
          </h1>
          <p class="page-subtitle">Manage and view user profiles with advanced search and filtering</p>
        </div>
        
        <div class="header-actions">
          <ViewToggle v-model="viewMode" />
          
          <el-button 
            @click="refreshData" 
            :loading="loading"
            type="primary"
            :icon="Refresh"
            size="default"
            style="background-color: white; color: black; border: none;"
          >
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </el-button>
          
          <el-button 
            @click="showCreateForm = true"
            type="success"
            :icon="Plus"
            size="default"
            style="background-color: white; color: black; border: none; margin-left: 0;"
          >
            Add User
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="loading && !users.length" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="error-alert"
    >
      <template #default>
        <p>Failed to load user data. Please try again.</p>
        <el-button @click="fetchAllUsers" type="primary" size="small" class="retry-btn">
          <el-icon><Refresh /></el-icon>
          Try Again
        </el-button>
      </template>
    </el-alert>

    <div v-else class="main-content">
      <UserList 
        :users="filteredUsers"
        :view-mode="viewMode"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @refresh="refreshData"
      />

      <el-drawer
        v-model="showUserDetails"
        :title="`${currentUser?.name || 'User'} Details`"
        direction="rtl"
        size="500px"
        :with-header="true"
      >
        <template #header="{ titleId, titleClass }">
          <div :id="titleId" :class="titleClass" class="drawer-header">
            <el-icon><UserFilled /></el-icon>
            <span>{{ currentUser?.name || 'User' }} Details</span>
          </div>
        </template>

        <div v-if="currentUser" class="user-details-content">
          <UserCard 
            :user="currentUser"
            :show-actions="true"
            :detailed="true"
            @edit="handleEdit"
            @delete="handleDelete"
            
          />
          
          <el-divider />
          
          <div class="user-actions">
            <el-button-group>
              <el-button @click="handleEdit(currentUser)" type="warning" :icon="Edit">
                Edit User
              </el-button>
              <el-button @click="handleDelete(currentUser)" type="danger" :icon="Delete">
                Delete User
              </el-button>
            </el-button-group>
          </div>
        </div>
      </el-drawer>
    </div>

    <UserForm
      v-model:visible="showCreateForm"
      :user="editingUser"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <el-dialog
      v-model="showDeleteDialog"
      class="custom-transition-dialog"
      title="Confirm Delete"
      width="400px"
      :close-on-click-modal="false"
      align-center
      :transition="transitionConfig"
    >
      <div class="delete-dialog-content">
        <el-icon class="delete-icon"><WarningFilled /></el-icon>
        <div class="delete-text">
          <h3>Delete User?</h3>
          <p v-if="userToDelete">
            Are you sure you want to delete <strong>{{ userToDelete.name }}</strong>? 
            This action cannot be undone.
          </p>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDeleteDialog = false">
          Cancel
        </el-button>
        <el-button 
          type="danger" 
          @click="confirmDelete"
          :loading="loading"
          :icon="Delete"
        >
          {{ loading ? 'Deleting...' : 'Delete User' }}
        </el-button>
      </template>
    </el-dialog>

    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  UserFilled, 
  Refresh, 
  Edit, 
  Delete, 
  WarningFilled,
  Plus,
} from '@element-plus/icons-vue';
import { ElMessage, ElNotification, type DialogTransition } from 'element-plus';
import { useUsers } from '@/composables/useUsers';
import { useSearch } from '@/composables/useSearch';
import type { User } from '@/types/user';
import type { ViewMode } from '@/types/api';
import { useLifecycleLogger } from '@/composables/useLifecycleLogger';
import ViewToggle from '@/components/Layout/ViewToggle.vue';


// Components
import UserList from './UserList.vue';
import UserCard from './UserCard.vue';
import UserForm from './UserForm.vue';
import router from '@/router';

// Lifecycle logging
useLifecycleLogger('UserProfile');

// Composables
const {
  users,
  currentUser,
  loading,
  error,
  fetchUser,
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
  refreshUser
} = useUsers();

const {
  filteredUsers,
} = useSearch(users);

const viewMode = ref<ViewMode>('grid');
const showCreateForm = ref(false);
const showUserDetails = ref(false);
const showDeleteDialog = ref(false);
const editingUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const currentAnimation = ref('bounce')
const isObjectConfig = ref(false)

// Animation configuration
const transitionConfig = computed<DialogTransition>(() => {
  if (isObjectConfig.value) {
    return {
      name: 'dialog-custom-object',
      appear: true,
      mode: 'out-in',
      duration: 500,
    }
  }
  return `dialog-${currentAnimation.value}`
})

// Methods
const refreshData = async () => {
  try {
    await fetchAllUsers();
    if (currentUser.value) {
      await refreshUser(currentUser.value.id);
    }
    ElMessage.success('Data refreshed successfully');
  } catch (error) {
    ElMessage.error('Failed to refresh data');
  }
};

const handleEdit = (user: User) => {
  editingUser.value = user;
  showCreateForm.value = true;
};

const handleDelete = (user: User) => {
  userToDelete.value = user;
  showDeleteDialog.value = true;
  
  
};

const handleView = async (user: User) => {
  try {
    await fetchUser(user.id);
    router.push(`user-profile/user/${user.id}`);
  } catch (error) {
    ElMessage.error('Failed to load user details');
  }
};

const handleSave = async (userData: Omit<User, 'id' | 'createdAt'> | User) => {
  try {
    if (editingUser.value) {
      // Update existing user
      await updateUser(editingUser.value.id, userData as User);
      ElNotification({
        title: 'Success',
        message: 'User updated successfully',
        type: 'success',
        duration: 3000,
      });
    } else {
      // Create new user
      await createUser(userData as Omit<User, 'id' | 'createdAt'>);
      ElNotification({
        title: 'Success',
        message: 'User created successfully',
        type: 'success',
        duration: 3000,
      });
    }
    handleCancel();
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: editingUser.value ? 'Failed to update user' : 'Failed to create user',
      type: 'error',
      duration: 4000,
    });
  }
};

const handleCancel = () => {
  showCreateForm.value = false;
  editingUser.value = null;
};

const confirmDelete = async () => {
  if (userToDelete.value) {
    try {
      await deleteUser(userToDelete.value.id);
      ElNotification({
        title: 'Success',
        message: 'User deleted successfully',
        type: 'success',
        duration: 3000,
      });
      showDeleteDialog.value = false;
      userToDelete.value = null;
      
      if (currentUser.value?.id === userToDelete.value) {
        showUserDetails.value = false;
      }
    } catch (error) {
      ElNotification({
        title: 'Error',
        message: 'Failed to delete user',
        type: 'error',
        duration: 4000,
      });
    }
  }
};

// Initialize data on mount
onMounted(async () => {
  try {
    await fetchAllUsers();
    if (users.value.length > 0) {
      await fetchUser(1);
    }
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
});
</script>

<style scoped>
.animation-controls {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.animation-controls .el-button-group {
  margin-left: 8px;
}

.animation-controls .el-button {
  margin: 0 2px;
}

code {
  background: var(--el-bg-color-page);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: block;
  margin-top: 8px;
}

.user-profile-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #ffffff;
}

.page-header {
  margin-bottom: 24px;
  background: black;
  border-radius: 16px;
  padding: 32px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  flex: 1;
  min-width: 300px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title .el-icon {
  font-size: 36px;
}

:deep(.info-icon) {
  color: black;
}

:deep(.el-link__inner) {
  color: black;
  text-decoration: none;
}

:deep(.el-link.is-hover-underline:hover:after) {
  display: none;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}


.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.error-alert {
  margin-bottom: 24px;
}

.retry-btn {
  margin-top: 12px;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-details-content {
  padding: 16px;
}

.user-actions {
  margin-top: 24px;
  padding-top: 16px;
  display: flex;
  justify-content: center;
}

.delete-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
}

.delete-icon {
  font-size: 48px;
  color: #f56c6c;
  flex-shrink: 0;
}

.delete-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.delete-text p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .user-profile-container {
    max-width: 100%;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .user-details-content {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .user-profile-container {
    padding: 12px;
  }
  
  .delete-dialog-content {
    flex-direction: column;
    text-align: center;
  }
  
  :deep(.el-drawer) {
    width: 100% !important;
  }
}

.main-content {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-backtop) {
  background-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-backtop:hover) {
  background-color: #66b1ff;
}
</style>