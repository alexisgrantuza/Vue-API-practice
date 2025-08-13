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
                  <el-descriptions-item label="Phone">
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
                  <el-descriptions-item label="Suite">{{
                    user.address.suite
                  }}</el-descriptions-item>
                  <el-descriptions-item label="City">{{ user.address.city }}</el-descriptions-item>
                  <el-descriptions-item label="Zipcode">{{
                    user.address.zipcode
                  }}</el-descriptions-item>
                </el-descriptions>

                <el-divider content-position="left">Company</el-divider>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="Name">{{ user.company.name }}</el-descriptions-item>
                  <el-descriptions-item label="Catch Phrase">
                    <el-text type="info">{{ user.company.catchPhrase }}</el-text>
                  </el-descriptions-item>
                  <el-descriptions-item label="BS" v-if="user.company.bs">
                    <el-tag type="info" size="small">{{ user.company.bs }}</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div v-else class="empty-state">
                <el-empty description="User not found" />
              </div>

              <template #footer>
                <div class="card-footer">
                  <el-button type="warning" @click="showEditForm" :loading="loading">
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

            <!-- Comments Section - Inline -->
            <div v-if="loadingComments" class="comments-loading">
              <el-card>
                <el-skeleton :rows="5" animated />
              </el-card>
            </div>

            <CommentComponent 
              v-else
              :comments="userComments" 
              :loading="loadingComments"
            />
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <!-- User Form Dialog for Editing -->
    <UserForm
      v-if="user"
      :user="user"
      :visible="editFormVisible"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { EditPen, Back } from '@element-plus/icons-vue'
import type { User } from '@/types/user'
import type { CommentType } from '@/types/api'
import { useLifecycleLogger } from '@/composables/useLifecycleLogger'
import { useUsers } from '@/composables/useUsers'
import UserForm from '@/components/UserProfile/UserForm.vue'
import CommentComponent from '@/components/CommentCard.vue'
import { ElNotification } from 'element-plus'
import { CommentService } from '@/services/useComment'

useLifecycleLogger('UserProfileView')

const route = useRoute()
const id = ref<number | null>(null)
const editFormVisible = ref(false)
const editingUser = ref<User | null>(null)
const { currentUser: user, loading, fetchUser, updateUser, createUser } = useUsers()
const allComments = ref<CommentType[]>([])
const loadingComments = ref(false)

// Computed property to filter comments based on user's posts
const userComments = computed(() => {
  if (!user.value) return []
  
  return allComments.value.filter(comment => comment.postId === user.value?.id)
})

const showEditForm = () => {
  editFormVisible.value = true
}

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
  editFormVisible.value = false;
  editingUser.value = null;
};

// Fetch comments based on user's posts
const fetchUserComments = async (userId: number) => {
  try {
    loadingComments.value = true
    
    const comments = await CommentService.getCommentsByPostId(userId)
    allComments.value = comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    ElNotification({
      title: 'Error',
      message: 'Failed to load comments',
      type: 'error',
      duration: 3000,
    })
    allComments.value = []
  } finally {
    loadingComments.value = false
  }
}

onMounted(async () => {
  id.value = Number(route.params.id)
  if (id.value) {
    await fetchUser(id.value)
    if (user.value) {
      await fetchUserComments(user.value.id)
    }
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