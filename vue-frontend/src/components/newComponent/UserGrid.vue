<template>
  <div class="user-grid">
    <transition-group name="grid" tag="div" class="grid-container">
      <div v-for="user in users" :key="user.id" class="grid-item">
        <UserCard
          :user="user"
          layout="vertical"
          @edit="$emit('edit', user)"
          @delete="$emit('delete', user)"
          @view="$emit('view', user)"
        />
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { useLifecycleLogger } from '@/composables/useLifecycleLogger'
import type { User } from '@/types/user.types'
import UserCard from './UserCard.vue'

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

defineEmits<Emits>()

// Lifecycle logging
const { logCustomEvent } = useLifecycleLogger({
  componentName: 'UserGrid',
})

logCustomEvent('grid-view-rendered', { userCount: props.users?.length })
</script>

<style scoped>
.user-grid {
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 4px;
}

.grid-item {
  display: flex;
  height: 100%;
}

/* Grid animations */
.grid-enter-active {
  transition: all 0.4s ease;
}

.grid-leave-active {
  transition: all 0.4s ease;
}

.grid-enter-from {
  opacity: 0;
  transform: scale(0.8) rotateY(-15deg);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.8) rotateY(15deg);
}

.grid-move {
  transition: transform 0.4s ease;
}

/* Responsive design */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
