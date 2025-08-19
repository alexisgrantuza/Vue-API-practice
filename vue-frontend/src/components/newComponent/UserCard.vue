<template>
  <el-card class="user-card" :class="[`layout-${layout}`, { 'card-hover': !disabled }]">
    <div class="card-content">
      <!-- User Avatar and Basic Info -->
      <div class="user-header">
        <el-avatar
          :size="layout === 'vertical' ? 64 : 48"
          :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff&size=128`"
          class="user-avatar"
        />

        <div class="user-info">
          <h3 class="user-name">{{ user.name }}</h3>
          <p class="username">@{{ user.username }}</p>
        </div>
      </div>

      <!-- User Details -->
      <div class="user-details">
        <div class="detail-item">
          <el-icon class="detail-icon"><Message /></el-icon>
          <a :href="`mailto:${user.email}`" class="detail-text email-link">
            {{ user.email }}
          </a>
        </div>

        <div class="detail-item" v-if="user.phone">
          <el-icon class="detail-icon"><Phone /></el-icon>
          <span class="detail-text">{{ user.phone }}</span>
        </div>

        <div class="detail-item">
          <el-icon class="detail-icon"><Location /></el-icon>
          <span class="detail-text">{{ fullAddress }}</span>
        </div>

        <div class="detail-item" v-if="user.company?.name">
          <el-icon class="detail-icon"><OfficeBuilding /></el-icon>
          <span class="detail-text">{{ user.company.name }}</span>
        </div>

        <div class="detail-item" v-if="user.website">
          <el-icon class="detail-icon"><Link /></el-icon>
          <a :href="websiteUrl" target="_blank" class="detail-text website-link">
            {{ user.website }}
          </a>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-section">
        <el-button-group class="action-buttons">
          <el-tooltip content="View Details" placement="top">
            <el-button size="small" @click="$emit('view')" :icon="View">
              <span v-if="layout === 'horizontal'">View</span>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Edit User" placement="top">
            <el-button size="small" type="primary" @click="$emit('edit')" :icon="Edit">
              <span v-if="layout === 'horizontal'">Edit</span>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Delete User" placement="top">
            <el-button size="small" type="danger" @click="$emit('delete')" :icon="Delete">
              <span v-if="layout === 'horizontal'">Delete</span>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Message,
  Phone,
  Location,
  Link,
  Calendar,
  View,
  Edit,
  Delete,
  OfficeBuilding,
} from '@element-plus/icons-vue'
import type { User } from '@/types/user.types'

// Props
interface Props {
  user: User
  layout?: 'horizontal' | 'vertical'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  disabled: false,
})

// Emits
interface Emits {
  view: []
  edit: []
  delete: []
}

defineEmits<Emits>()

// Computed properties
const fullAddress = computed(() => {
  const { street, city, zipcode } = props.user.address
  return zipcode ? `${street}, ${city} ${zipcode}` : `${street}, ${city}`
})

const websiteUrl = computed(() => {
  const website = props.user.website
  if (!website) return ''

  if (website.startsWith('http://') || website.startsWith('https://')) {
    return website
  }
  return `https://${website}`
})
</script>

<style scoped>
.user-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

/* Layout: Vertical (Grid View) */
.layout-vertical .card-content {
  text-align: center;
}

.layout-vertical .user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.layout-vertical .user-details {
  text-align: left;
}

/* Layout: Horizontal (List View) */
.layout-horizontal .card-content {
  text-align: left;
}

.layout-horizontal .user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.layout-horizontal .action-buttons {
  margin-left: auto;
}

/* User Header */
.user-avatar {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.username {
  margin: 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

/* User Details */
.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.detail-icon {
  color: #909399;
  font-size: 16px;
  flex-shrink: 0;
}

.detail-text {
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-link,
.website-link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.2s;
}

.email-link:hover,
.website-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

/* Meta Information */
.meta-info {
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.created-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.meta-icon {
  font-size: 14px;
}

.meta-text {
  font-weight: 500;
}

/* Action Section */
.action-section {
  margin-top: auto;
  padding-top: 12px;
}

.action-buttons {
  width: 100%;
}

.layout-horizontal .action-section {
  margin-top: 0;
  margin-left: auto;
  padding-top: 0;
}

.layout-horizontal .action-buttons {
  width: auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .layout-horizontal .user-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .layout-horizontal .action-section {
    margin-left: 0;
    margin-top: 12px;
  }

  .user-name {
    font-size: 16px;
  }

  .detail-item {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .card-content {
    gap: 12px;
  }

  .user-name {
    font-size: 15px;
  }

  .action-buttons :deep(.el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
