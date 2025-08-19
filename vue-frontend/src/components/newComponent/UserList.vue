<template>
  <div class="user-list">
    <transition-group name="list" tag="div" class="list-container">
      <div v-for="user in users" :key="user.id" class="user-item">
        <UserCard
          :user="user"
          layout="horizontal"
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
  componentName: 'UserList',
})

logCustomEvent('list-view-rendered', { userCount: props.users?.length })
</script>

<style scoped>
.user-list {
  width: 100%;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  width: 100%;
}

/* List animations */
.list-enter-active {
  transition: all 0.3s ease;
}

.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .list-container {
    gap: 12px;
  }
}
</style>
