<template>
  <div class="view-toggle-container">
    <el-segmented 
      v-model="currentView" 
      :options="viewOptions"
      size="default"
      @change="handleViewChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Grid, List } from '@element-plus/icons-vue';
import type { ViewMode } from '@/types/api';

interface Props {
  modelValue: ViewMode;
}

interface Emits {
  'update:modelValue': [value: ViewMode];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const currentView = ref<ViewMode>(props.modelValue);

// View options configuration
const viewOptions = [
  {
    label: 'Grid View',
    value: 'grid',
    icon: Grid,
  },
  {
    label: 'Table View', 
    value: 'table',
    icon: List,
  }
];

// Methods
const handleViewChange = (value: ViewMode) => {
  emit('update:modelValue', value);
};

</script>

<style scoped>
.view-toggle-container {
  display: flex;
  align-items: center;
}

:deep(.el-segmented) {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
}

:deep(.el-segmented__item) {
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

:deep(.el-segmented__item:hover) {
  background-color: #e4e7ed;
}

:deep(.el-segmented__item-selected) {
  background: #000000;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

:deep(.el-segmented__item-label) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 12px;
}


@media (max-width: 480px) {
  :deep(.el-segmented__item-label) {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>