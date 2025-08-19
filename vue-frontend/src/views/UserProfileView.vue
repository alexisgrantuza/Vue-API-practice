<template>
  <div class="user-profile">
    <el-container class="profile-container">
      <el-main>
        <el-row :gutter="20" justify="center">
          <el-col :xs="24" :sm="20" :md="18" :lg="16" :xl="14">
            <el-card class="profile-card">
              <template #header>
                <div class="card-header">
                  <h2>User Profile</h2>
                  <el-tag v-if="user" type="primary" size="large">ID: {{ user.id }}</el-tag>
                </div>
              </template>

              <div v-if="loading" class="loading-state">
                <el-skeleton :rows="10" animated />
              </div>

              <div v-else-if="user" class="profile-content">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="Name">
                    <el-tag type="info">{{ user.name }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="Username">
                    {{ user.username }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Email">
                    <el-link type="default" :href="`mailto:${user.email}`">
                      {{ user.email }}
                    </el-link>
                  </el-descriptions-item>
                  <el-descriptions-item label="Phone" v-if="user.phone">
                    <el-link type="default" :href="`tel:${user.phone}`">
                      {{ user.phone }}
                    </el-link>
                  </el-descriptions-item>
                  <el-descriptions-item label="Website" v-if="user.website">
                    <el-link type="default" :href="`https://${user.website}`" target="_blank">
                      {{ user.website }}
                    </el-link>
                  </el-descriptions-item>
                </el-descriptions>

                <el-divider content-position="left">Address</el-divider>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="Street">{{
                    user.address.street
                  }}</el-descriptions-item>
                  <el-descriptions-item label="City">{{ user.address.city }}</el-descriptions-item>
                  <el-descriptions-item label="Zipcode" v-if="user.address.zipcode">{{
                    user.address.zipcode
                  }}</el-descriptions-item>
                </el-descriptions>

                <el-divider content-position="left">Company</el-divider>
                <el-descriptions :column="1" border v-if="user.company">
                  <el-descriptions-item label="Name">{{ user.company.name }}</el-descriptions-item>
                </el-descriptions>
              </div>

              <div v-else class="empty-state">
                <el-empty description="User not found" />
              </div>

              <template #footer>
                <div class="card-footer">
                  <el-button type="warning" @click="handleEditForm" :loading="loading">
                    <el-icon><EditPen /></el-icon>
                    Edit
                  </el-button>
                  <el-button @click="$router.go(-1)">
                    <el-icon><Back /></el-icon>
                    Back
                  </el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <!-- User Form Dialog for Editing -->
    <UserForm
      v-if="user"
      :user="user"
      :visible="editFormVisible"
      mode="edit"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { EditPen, Back } from '@element-plus/icons-vue'
import type { User } from '@/types/user.types'
import { useLifecycleLogger } from '@/composables/useLifecycleLogger'
import { useUserStore } from '@/stores/userStore'
import { UserService } from '@/services/userService'
import UserForm from '@/components/newComponent/UserForm.vue'
import { ElNotification } from 'element-plus'

useLifecycleLogger({
  componentName: 'UserProfileView',
  logMountTime: true,
})

const route = useRoute()
const userStore = useUserStore()
const id = ref<string | null>(null)
const editFormVisible = ref(false)
const editingUser = ref<User | null>(null)
const user = ref<User | null>(null)
const loading = ref(false)

const handleEditForm = () => {
  editingUser.value = user.value
  editFormVisible.value = true
}

const handleSave = async (userData: Omit<User, 'id' | 'createdAt'> | User) => {
  try {
    if (editingUser.value) {
      // Update existing user
      await userStore.updateUser(editingUser.value.id, userData as Partial<User>)
      ElNotification({
        title: 'Success',
        message: 'User updated successfully',
        type: 'success',
        duration: 3000,
      })
    } else {
      // Create new user
      await userStore.createUser(userData as Omit<User, 'id' | 'createdAt'>)
      ElNotification({
        title: 'Success',
        message: 'User created successfully',
        type: 'success',
        duration: 3000,
      })
    }
    handleCancel()
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: editingUser.value ? 'Failed to update user' : 'Failed to create user',
      type: 'error',
      duration: 4000,
    })
  }
}

const handleCancel = () => {
  editFormVisible.value = false
  editingUser.value = null
}

// Fetch user data using UserService
const fetchUser = async (userId: string) => {
  try {
    loading.value = true
    const userData = await UserService.getUserById(userId)
    user.value = userData
  } catch (error) {
    console.error('Error fetching user:', error)
    ElNotification({
      title: 'Error',
      message: 'Failed to load user data',
      type: 'error',
      duration: 3000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  id.value = route.params.id as string
  console.log('UserProfileView mounted with ID:', id.value)

  if (id.value) {
    try {
      await fetchUser(id.value)
      console.log('User fetched:', user.value)

      if (!user.value) {
        console.error('No user data received')
      }
    } catch (error) {
      console.error('Error in UserProfileView onMounted:', error)
    }
  } else {
    console.error('No user ID provided in route params')
  }
})
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-card {
  margin: 20px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.profile-content {
  padding: 10px 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.loading-state {
  padding: 20px 0;
}

.comments-loading {
  margin: 20px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

:deep(.el-descriptions__label) {
  font-weight: bold;
  width: 120px;
}

:deep(.el-divider__text) {
  font-size: 1.1em;
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-footer {
    justify-content: center;
  }

  .profile-container {
    padding: 0 10px;
  }
}
</style>
