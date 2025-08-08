<template>
  <div class="user-list-container">
    <div class="list-header">
      <div class="stats-info">
        <el-statistic title="Total Users" :value="users?.length ?? 0" />
        <el-statistic 
          v-if="users?.length !== filteredUsersCount" 
          title="Filtered Results" 
          :value="filteredUsersCount" 
        />
      </div>
      
      <div v-if="loading" class="loading-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>Refreshing data...</span>
      </div>
    </div>

    <el-empty 
      v-if="!users?.length && !loading" 
      description="No users found"
      :image-size="120"
    >
      <template #description>
        <p>No users available. Try refreshing the data.</p>
      </template>
      <el-button type="primary" @click="$emit('refresh')">
        <el-icon><Refresh /></el-icon>
        Refresh Data
      </el-button>
    </el-empty>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid-view">
      <el-row :gutter="20">
        <el-col 
          v-for="user in paginatedUsers" 
          :key="user.id"
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
          class="grid-item"
        >
          <UserCard
            :user="user"
            :detailed="false"
            :show-actions="true"
            @view="$emit('view', user)"
            @edit="$emit('edit', user)"
            @delete="$emit('delete', user)"
          />
        </el-col>
      </el-row>
    </div>

    <!-- Table View -->
    <div v-else-if="viewMode === 'table'" class="table-view">
      <el-table
        :data="paginatedUsers"
        stripe
        :default-sort="{ prop: 'name', order: 'ascending' }"
        empty-text="No matching users found"
        v-loading="loading"
        element-loading-text="Loading users..."
        height="600"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
      >
        <el-table-column label="Avatar" width="80" align="center">
          <template #default="{ row }">
            <el-avatar 
              :size="40" 
              :src="getAvatarUrl(row.name)"
              :alt="row.name"
            >
              {{ row.name.charAt(0).toUpperCase() }}
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column 
          prop="name" 
          label="Name" 
          sortable
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="name-cell">
              <span class="user-name">{{ row.name }}</span>
              <span class="user-username">@{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column 
          prop="email" 
          label="Email" 
          sortable
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <a :href="`mailto:${row.email}`" class="email-link">
              {{ row.email }}
            </a>
          </template>
        </el-table-column>

        <el-table-column 
          prop="phone" 
          label="Phone" 
          min-width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <a :href="`tel:${row.phone}`" class="phone-link">
              {{ row.phone }}
            </a>
          </template>
        </el-table-column>

        <el-table-column 
          label="Location" 
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="location-cell">
              <el-icon><Location /></el-icon>
              <span>{{ row.address.city }}, {{ row.address.street }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column 
          prop="company.name" 
          label="Company" 
          sortable
          min-width="150"
          show-overflow-tooltip
        />

        <el-table-column label="Actions" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button 
                type="primary" 
                size="small" 
                @click.stop="$emit('view', row)"
                :icon="View"
              />
              <el-button 
                type="warning" 
                size="small" 
                @click.stop="$emit('edit', row)"
                :icon="Edit"
              />
              <el-button 
                type="danger" 
                size="small" 
                @click.stop="$emit('delete', row)"
                :icon="Delete"
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="users?.length ?? 0 > pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="users?.length ?? 0"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Loading, 
  Refresh, 
  View, 
  Edit, 
  Delete, 
  Location 
} from '@element-plus/icons-vue';
import type { User } from '@/types/user';
import type { Props, Emits } from '@/types/api';
import UserCard from './UserCard.vue';


const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Pagination state
const currentPage = ref(1);
const pageSize = ref(20);

// Computed properties
const filteredUsersCount = computed(() => props.users?.length ?? 0);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.users?.slice(start, end);
});

// Methods
const getAvatarUrl = (name: string): string => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=random`;
};

const handleRowClick = (row: User) => {
  emit('view', row);
};

const handleSortChange = (sort: any) => {
  console.log('Sort changed:', sort);
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
};
</script>

<style scoped>
.user-list-container {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.stats-info {
  display: flex;
  gap: 40px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
}

.loading-indicator .el-icon {
  font-size: 16px;
}

:deep(.ascending .sort-caret.ascending) {
  border-bottom-color: black;
}

.grid-view {
  margin-bottom: 20px;
}

.grid-item {
  margin-bottom: 20px;
}

.table-view {
  margin-bottom: 20px;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #303133;
}

.user-username {
  font-size: 12px;
  color: #909399;
}

.email-link, .phone-link {
  color: #161616;
  text-decoration: none;
  transition: color 0.2s;
}

.email-link:hover, .phone-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.location-cell .el-icon {
  color: #909399;
  font-size: 14px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .stats-info {
    gap: 20px;
  }
  
  .grid-item {
    margin-bottom: 16px;
  }
  
  .table-view {
    overflow-x: auto;
  }
  
  .pagination-container {
    padding: 16px;
  }
  
  /* Hide some table columns on mobile */
  .table-view :deep(.el-table__column--phone),
  .table-view :deep(.el-table__column--company) {
    display: none;
  }
}

@media (max-width: 480px) {
  .stats-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination-container :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Loading states */
.el-table :deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
}

/* Table hover effects */
.el-table :deep(.el-table__row):hover {
  cursor: pointer;
}

/* Custom table styling */
.el-table :deep(.el-table__header) {
  background-color: #f5f7fa;
}

.el-table :deep(.el-table__row--striped) {
  background-color: #fafbfc;
}
</style>