<template>
  <div class="search-bar-container">
    <el-card shadow="never" class="search-card">
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
            <template #suffix>
              <el-badge 
                v-if="activeFiltersCount > 0" 
                :value="activeFiltersCount" 
                class="filter-badge"
              >
                <el-button
                  text
                  size="small"
                  @click="showAdvancedSearch = !showAdvancedSearch"
                  :type="showAdvancedSearch ? 'primary' : 'default'"
                >
                  <el-icon><Filter /></el-icon>
                </el-button>
              </el-badge>
              <el-button
                v-else
                text
                size="small"
                @click="showAdvancedSearch = !showAdvancedSearch"
                :type="showAdvancedSearch ? 'primary' : 'default'"
              >
                <el-icon><Filter /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="search-actions">
          <el-tooltip content="Clear all filters" placement="top">
            <el-button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              size="large"
              :icon="RefreshLeft"
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

      <!-- Advanced Search Panel -->
      <el-collapse-transition>
        <div v-show="showAdvancedSearch" class="advanced-search-panel">
          <el-divider content-position="left">
            <el-icon><Setting /></el-icon>
            Advanced Search Options
          </el-divider>

          <div class="filter-sections">
            <div class="filter-section">
              <h4 class="filter-title">Search In:</h4>
              <el-checkbox-group v-model="selectedFields" @change="handleFieldsChange">
                <el-checkbox 
                  v-for="field in availableFields" 
                  :key="field.value" 
                  :label="field.value"
                  :value="field.value"
                >
                  <el-icon>{{ field.icon }}</el-icon>
                  {{ field.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <div class="filter-section">
              <h4 class="filter-title">Filters:</h4>
              <div class="filter-controls">
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-select
                      v-model="domainFilter"
                      placeholder="Email Domain"
                      clearable
                      filterable
                      @change="handleDomainChange"
                    >
                      <el-option
                        v-for="domain in emailDomains"
                        :key="domain"
                        :label="domain"
                        :value="domain"
                      >
                        <span>{{ domain }}</span>
                        <span class="domain-count">({{ getDomainCount(domain) }})</span>
                      </el-option>
                    </el-select>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-select
                      v-model="cityFilter"
                      placeholder="City"
                      clearable
                      filterable
                      @change="handleCityChange"
                    >
                      <el-option
                        v-for="city in cities"
                        :key="city"
                        :label="city"
                        :value="city"
                      />
                    </el-select>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-select
                      v-model="companyFilter"
                      placeholder="Company"
                      clearable
                      filterable
                      @change="handleCompanyChange"
                    >
                      <el-option
                        v-for="company in companies"
                        :key="company"
                        :label="company"
                        :value="company"
                      />
                    </el-select>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- Date Range Filter -->
            <div class="filter-section">
              <h4 class="filter-title">Created Date Range:</h4>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleDateRangeChange"
                clearable
              />
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="activeFilters.length > 0" class="active-filters">
            <h4 class="filter-title">Active Filters:</h4>
            <div class="filter-tags">
              <el-tag
                v-for="filter in activeFilters"
                :key="filter.key"
                closable
                :type="filter.type"
                @close="removeFilter(filter.key)"
              >
                {{ filter.label }}: {{ filter.value }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-collapse-transition>

      <div v-if="searchQuery || hasActiveFilters" class="search-stats">
        <el-text size="small" type="info">
          <el-icon><DataAnalysis /></el-icon>
          {{ searchStats }}
        </el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  Search, 
  Filter, 
  RefreshLeft, 
  Operation,
  Clock,
  Sort,
  OfficeBuilding,
  Setting,
  User,
  Message,
  Avatar,
  DataAnalysis
} from '@element-plus/icons-vue';
import type { CheckboxValueType } from 'element-plus';
import type { ActiveFilter } from '@/types/api';
import type { Props } from '@/types/api';


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
const showAdvancedSearch = ref(false);
const selectedFields = ref<('name' | 'username' | 'email')[]>([...props.fields]);

// Filter states
const domainFilter = ref('');
const cityFilter = ref('');
const companyFilter = ref('');
const dateRange = ref<[string, string] | null>(null);

// Available search fields configuration
const availableFields = [
  { value: 'name', label: 'Name', icon: User },
  { value: 'username', label: 'Username', icon: Avatar },
  { value: 'email', label: 'Email', icon: Message },
];

// Computed properties
const emailDomains = computed(() => {
  const domains = new Set<string>();
  props.users.forEach(user => {
    if (user.email) {
      const domain = user.email.split('@')[1];
      if (domain) domains.add(domain);
    }
  });
  return Array.from(domains).sort();
});

const cities = computed(() => {
  const citySet = new Set<string>();
  props.users.forEach(user => {
    if (user.address?.city) {
      citySet.add(user.address.city);
    }
  });
  return Array.from(citySet).sort();
});

const companies = computed(() => {
  const companySet = new Set<string>();
  props.users.forEach(user => {
    if (user.company?.name) {
      companySet.add(user.company.name);
    }
  });
  return Array.from(companySet).sort();
});

const activeFilters = computed<ActiveFilter[]>(() => {
  const filters: ActiveFilter[] = [];
  
  if (domainFilter.value) {
    filters.push({
      key: 'domain',
      label: 'Email Domain',
      value: domainFilter.value,
      type: 'info'
    });
  }
  
  return filters;
});

const activeFiltersCount = computed(() => activeFilters.value.length);

const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         domainFilter.value || 
         cityFilter.value || 
         companyFilter.value || 
         dateRange.value;
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

const handleFieldsChange = (val: CheckboxValueType[]) => {
  const validFields = val.filter((field): field is 'name' | 'username' | 'email' => 
    ['name', 'username', 'email'].includes(field as string)
  );
  emit('update:fields', validFields);
  emitFilterChange();
};

const handleClear = () => {
  searchQuery.value = '';
  emit('update:modelValue', '');
  emit('clear');
  emitFilterChange();
};

const handleDomainChange = () => {
  emitFilterChange();
};

const handleCityChange = () => {
  emitFilterChange();
};

const handleCompanyChange = () => {
  emitFilterChange();
};

const handleDateRangeChange = () => {
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

const removeFilter = (filterKey: string) => {
  switch (filterKey) {
    case 'domain':
      domainFilter.value = '';
      break;
    case 'city':
      cityFilter.value = '';
      break;
    case 'company':
      companyFilter.value = '';
      break;
    case 'dateRange':
      dateRange.value = null;
      break;
  }
  emitFilterChange();
};

const handleQuickFilter = (command: string) => {
  emit('quickFilter', command);
};

const getDomainCount = (domain: string): number => {
  return props.users.filter(user => 
    user.email && user.email.endsWith(`@${domain}`)
  ).length;
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

.search-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
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

/* Advanced Search Panel */
.advanced-search-panel {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-controls .el-row {
  width: 100%;
}

/* Checkbox styling */
.filter-section :deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-section :deep(.el-checkbox) {
  margin-right: 0;
  white-space: nowrap;
}

.filter-section :deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* Active Filters */
.active-filters {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

/* Search Stats */
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

/* Select dropdown styling */
.domain-count {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.filter-controls :deep(.el-select) {
  width: 100%;
}

/* Date picker styling */
.filter-section :deep(.el-date-editor) {
  width: 100%;
  max-width: 300px;
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
  
  .advanced-search-panel {
    padding: 16px;
  }
  
  .filter-controls .el-col {
    margin-bottom: 12px;
  }
  
  .filter-section :deep(.el-checkbox-group) {
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-tags {
    gap: 6px;
  }
  
  .filter-section :deep(.el-date-editor) {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .search-input {
    --el-input-border-radius: 16px;
  }
  
  .search-input :deep(.el-input__wrapper) {
    border-radius: 16px;
  }
  
  .filter-controls .el-row .el-col {
    width: 100% !important;
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
  
  .active-filters {
    margin-top: 16px;
  }
  
  .filter-tags {
    justify-content: center;
  }
}

/* Animation for advanced search panel */
.el-collapse-transition {
  transition: all 0.3s ease-in-out;
}

/* Custom divider styling */
.advanced-search-panel :deep(.el-divider__text) {
  background-color: #f8f9fa;
  color: #409eff;
  font-weight: 600;
  padding: 0 16px;
}

/* Hover effects */
.search-actions .el-button:hover {
  transform: translateY(-1px);
  transition: transform 0.2s;
}

.filter-tags .el-tag {
  transition: all 0.2s;
}

.filter-tags .el-tag:hover {
  transform: translateY(-1px);
}

/* Focus states */
.filter-controls :deep(.el-select:focus-within),
.filter-section :deep(.el-date-editor:focus-within) {
  box-shadow: 0 0 0 1px #409eff inset;
  border-radius: 4px;
}

/* Loading states */
.search-input :deep(.el-input__wrapper.is-loading) {
  cursor: wait;
}

/* Custom scrollbar for dropdown */
.filter-controls :deep(.el-select-dropdown__wrap) {
  max-height: 200px;
}

/* Badge styling */
.filter-badge {
  margin-right: 4px;
}

/* Custom styling for specific filter types */
.filter-tags .el-tag--info {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.filter-tags .el-tag--warning {
  background-color: #fdf6ec;
  border-color: #f5dab1;
  color: #e6a23c;
}

.filter-tags .el-tag--success {
  background-color: #f0f9ff;
  border-color: #b3e19d;
  color: #67c23a;
}

.filter-tags .el-tag--primary {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .advanced-search-panel {
    background-color: #2d2f33;
    border-color: #414243;
  }
  
  .search-stats {
    border-top-color: #414243;
  }
  
  .advanced-search-panel :deep(.el-divider__text) {
    background-color: #2d2f33;
  }
}
</style>