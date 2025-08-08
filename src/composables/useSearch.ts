import { ref, computed } from 'vue';
import type { User } from '@/types/user';
import type { Ref } from 'vue';

export function useSearch(users: Ref<User[]>) {
  const searchQuery = ref('');
  const searchFields = ref<('name' | 'username' | 'email')[]>(['name', 'username', 'email']);

  const filteredUsers = computed(() => {
    if (!searchQuery.value.trim()) {
      return users.value;
    }

    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user => {
      return searchFields.value.some(field => {
        const value = user[field]?.toLowerCase() || '';
        return value.includes(query);
      });
    });
  });

  const clearSearch = () => {
    searchQuery.value = '';
  };

  return {
    searchQuery,
    searchFields,
    filteredUsers,
    clearSearch,
  };
}