export const API_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,
} as const;

export const VIEW_MODES = {
  GRID: 'grid',
  TABLE: 'table',
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
} as const;

export const SEARCH_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'username', label: 'Username' },
  { value: 'email', label: 'Email' },
] as const;