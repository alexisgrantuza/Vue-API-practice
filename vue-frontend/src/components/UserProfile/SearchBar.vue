<template>
  <div class="search-bar-container">
      <div class="search-header">
        <div class="search-input-section">
          <el-input
            v-model="searchQuery"
            placeholder="Search users by name, username, or email..."
            size="large"
            clearable
            class="search-input"
            @input="handleSearch"
            @clear="handleClear"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="search-actions">
          <el-tooltip content="Clear all filters" placement="top">
            <el-button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              size="large"
              :icon="CloseBold"
              circle
            />
          </el-tooltip>
          
          <el-dropdown trigger="click" @command="handleQuickFilter">
            <el-button size="large" :icon="Operation" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="recent">
                  <el-icon><Clock /></el-icon>
                  Recently Added
                </el-dropdown-item>
                <el-dropdown-item command="alphabetical">
                  <el-icon><Sort /></el-icon>
                  Alphabetical
                </el-dropdown-item>
                <el-dropdown-item command="by-company">
                  <el-icon><OfficeBuilding /></el-icon>
                  Group by Company
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Search Statistics -->
      <div v-if="searchQuery || hasActiveFilters" class="search-stats">
        <el-text size="small" type="info">
          <el-icon><DataAnalysis /></el-icon>
          {{ searchStats }}
        </el-text>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  Search, 
  Operation,
  Clock,
  Sort,
  OfficeBuilding,
  DataAnalysis,
  CloseBold
} from '@element-plus/icons-vue';
import type { User as UserType } from '@/types/user';

interface Props {
  users?: UserType[];
  modelValue?: string;
  fields?: ('name' | 'username' | 'email')[];
}

interface Emits {
  'update:modelValue': [value: string];
  'update:fields': [fields: ('name' | 'username' | 'email')[]];
  'filter-change': [filters: any];
  clear: [];
  quickFilter: [type: string];
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  modelValue: '',
  fields: () => ['name', 'username', 'email'],
});

const emit = defineEmits<Emits>();

// Reactive state
const searchQuery = ref(props.modelValue);
const selectedFields = ref<('name' | 'username' | 'email')[]>([...props.fields]);

// Filter states
const domainFilter = ref('');
const cityFilter = ref('');
const companyFilter = ref('');
const dateRange = ref<[string, string] | null>(null);

// Computed properties
const activeFilters = computed(() => {
  const filters = [];
  
  if (domainFilter.value) {
    filters.push({
      key: 'domain',
      label: 'Email Domain',
      value: domainFilter.value,
      type: 'info'
    });
  }
  
  if (cityFilter.value) {
    filters.push({
      key: 'city',
      label: 'City',
      value: cityFilter.value,
      type: 'warning'
    });
  }
  
  if (companyFilter.value) {
    filters.push({
      key: 'company',
      label: 'Company',
      value: companyFilter.value,
      type: 'success'
    });
  }
  
  if (dateRange.value) {
    filters.push({
      key: 'dateRange',
      label: 'Date Range',
      value: `${dateRange.value[0]} to ${dateRange.value[1]}`,
      type: 'primary'
    });
  }
  
  return filters;
});

const activeFiltersCount = computed(() => activeFilters.value.length);

const hasActiveFilters = computed(() => {
  return searchQuery.value || domainFilter.value || cityFilter.value || companyFilter.value || dateRange.value;
});

const searchStats = computed(() => {
  const totalUsers = props.users.length;
  const searchText = searchQuery.value ? `"${searchQuery.value}"` : '';
  const filtersText = activeFiltersCount.value > 0 ? 
    `with ${activeFiltersCount.value} filter${activeFiltersCount.value > 1 ? 's' : ''}` : '';
  
  if (searchText && filtersText) {
    return `Searching for ${searchText} ${filtersText} in ${totalUsers} users`;
  } else if (searchText) {
    return `Searching for ${searchText} in ${totalUsers} users`;
  } else if (filtersText) {
    return `Filtering ${filtersText} from ${totalUsers} users`;
  }
  
  return `Showing all ${totalUsers} users`;
});

// Methods
const handleSearch = (value: string) => {
  emit('update:modelValue', value);
  emitFilterChange();
};

const handleClear = () => {
  searchQuery.value = '';
  emit('update:modelValue', '');
  emit('clear');
  emitFilterChange();
};

const clearAllFilters = () => {
  searchQuery.value = '';
  domainFilter.value = '';
  cityFilter.value = '';
  companyFilter.value = '';
  dateRange.value = null;
  selectedFields.value = ['name', 'username', 'email'];
  
  emit('update:modelValue', '');
  emit('update:fields', ['name', 'username', 'email']);
  emit('clear');
  emitFilterChange();
};

const handleQuickFilter = (command: string) => {
  emit('quickFilter', command);
};

const emitFilterChange = () => {
  const filters = {
    query: searchQuery.value,
    fields: selectedFields.value,
    domain: domainFilter.value,
    city: cityFilter.value,
    company: companyFilter.value,
    dateRange: dateRange.value,
  };
  
  emit('filter-change', filters);
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue;
});

watch(() => props.fields, (newFields) => {
  selectedFields.value = [...newFields];
});
</script>

<style scoped>
.search-bar-container {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input-section {
  flex: 1;
}

.search-input {
  --el-input-border-radius: 24px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.12);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset, 0 2px 16px 0 rgba(64, 158, 255, 0.12);
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-badge :deep(.el-badge__content) {
  background-color: #409eff;
}

.search-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f4;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-stats :deep(.el-text) {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-input {
    --el-input-border-radius: 16px;
  }
  
  .search-input :deep(.el-input__wrapper) {
    border-radius: 16px;
  }
}

/* Hover effects */
.search-actions .el-button:hover {
  transform: translateY(-1px);
  transition: transform 0.2s;
}

/* Badge styling */
.filter-badge {
  margin-right: 4px;
}
</style>