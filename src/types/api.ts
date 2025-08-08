import type { User as UserType } from "./user";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export type ViewMode = 'grid' | 'table';

export interface SearchFilters {
  query: string;
  fields: ('name' | 'username' | 'email')[];
}

type TagType = 'info' | 'warning' | 'success' | 'primary' | 'danger';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  type: TagType;
}

export interface Props {
  user?: UserType | null;
  users?: UserType[];
  visible?: boolean;
  loading?: boolean;
  viewMode?: ViewMode;
  detailed?: boolean;
  showActions?: boolean;
  modelValue?: string;
  fields?: ('name' | 'username' | 'email')[];
}

export interface Emits {
  view: [user: UserType];
  edit: [user: UserType];
  delete: [user: UserType];
  refresh: [];
}