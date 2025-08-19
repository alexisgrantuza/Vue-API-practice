<template>
  <div class="user-table">
    <el-table
      :data="users"
      stripe
      highlight-current-row
      @row-click="handleRowClick"
      :default-sort="{ prop: 'createdAt', order: 'descending' }"
      class="table-container"
      height="600"
    >
      <!-- Name Column -->
      <el-table-column prop="name" label="Name" sortable min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="name-cell">
            <el-avatar
              :size="32"
              :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=667eea&color=fff`"
              class="user-avatar"
            />
            <span class="user-name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- Username Column -->
      <el-table-column
        prop="username"
        label="Username"
        sortable
        min-width="120"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-tag type="info" size="small">@{{ row.username }}</el-tag>
        </template>
      </el-table-column>

      <!-- Email Column -->
      <el-table-column prop="email" label="Email" sortable min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <a :href="`mailto:${row.email}`" class="email-link">
            {{ row.email }}
          </a>
        </template>
      </el-table-column>

      <!-- Location Column -->
      <el-table-column label="Location" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="location-cell">
            <el-icon class="location-icon"><Location /></el-icon>
            {{ `${row.address.city}, ${row.address.street}` }}
          </div>
        </template>
      </el-table-column>

      <!-- Phone Column -->
      <el-table-column prop="phone" label="Phone" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.phone" class="phone-number">{{ row.phone }}</span>
          <span v-else class="no-data">-</span>
        </template>
      </el-table-column>

      <!-- Company Column -->
      <el-table-column label="Company" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.company?.name" class="company-name">{{ row.company.name }}</span>
          <span v-else class="no-data">-</span>
        </template>
      </el-table-column>

      <!-- Created Date Column -->
      <el-table-column prop="createdAt" label="Created" sortable min-width="120">
        <template #default="{ row }">
          <div class="date-cell">
            <el-icon class="date-icon"><Calendar /></el-icon>
            {{ formatDate(row.createdAt) }}
          </div>
        </template>
      </el-table-column>

      <!-- Actions Column -->
      <el-table-column label="Actions" fixed="right" width="120" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-tooltip content="View Details" placement="top">
              <el-button
                size="small"
                circle
                @click.stop="$emit('view', row)"
                :icon="View"
                type="info"
              />
            </el-tooltip>

            <el-tooltip content="Edit User" placement="top">
              <el-button
                size="small"
                circle
                @click.stop="$emit('edit', row)"
                :icon="Edit"
                type="primary"
              />
            </el-tooltip>

            <el-tooltip content="Delete User" placement="top">
              <el-button
                size="small"
                circle
                @click.stop="$emit('delete', row)"
                :icon="Delete"
                type="danger"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { Location, Calendar, View, Edit, Delete } from '@element-plus/icons-vue'
import { useLifecycleLogger } from '@/composables/useLifecycleLogger'
import type { User } from '@/types/user.types'
import dayjs from 'dayjs'

// Props
interface Props {
  users: User[]
}

const props = defineProps<Props>()

// Emits
interface Emits {
  edit: [user: User]
  delete: [user: User]
  view: [user: User]
}

const emit = defineEmits<Emits>()

// Lifecycle logging
const { logCustomEvent } = useLifecycleLogger({
  componentName: 'UserTable',
})

// Methods
const formatDate = (date: string) => {
  return dayjs(date).format('MMM DD, YYYY')
}

const handleRowClick = (row: User) => {
  logCustomEvent('table-row-clicked', { userId: row.id, userName: row.name })
  emit('view', row)
}

logCustomEvent('table-view-rendered', { userCount: props.users?.length })
</script>

<style scoped>
.user-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  width: 100%;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.email-link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.2s;
}

.email-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
}

.location-icon {
  color: #909399;
  font-size: 14px;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
}

.date-icon {
  color: #909399;
  font-size: 14px;
}

.phone-number {
  font-family: monospace;
  color: #666;
}

.company-name {
  color: #666;
  font-style: italic;
}

.no-data {
  color: #c0c4cc;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Table hover effects */
:deep(.el-table__row) {
  transition: background-color 0.2s;
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .user-table {
    border-radius: 4px;
  }

  :deep(.el-table) {
    font-size: 13px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
