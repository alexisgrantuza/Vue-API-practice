<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formTitle"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
      @submit.prevent="handleSubmit"
    >
      <!-- Basic Information -->
      <el-divider content-position="left">
        <el-icon><User /></el-icon>
        Basic Information
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Full Name" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="Enter full name"
              clearable
              :prefix-icon="User"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Username" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="Enter username"
              clearable
              :prefix-icon="UserFilled"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Email" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="Enter email address"
          type="email"
          clearable
          :prefix-icon="Message"
        />
      </el-form-item>

      <!-- Address Information -->
      <el-divider content-position="left">
        <el-icon><Location /></el-icon>
        Address Information
      </el-divider>

      <el-form-item label="Street" prop="street">
        <el-input v-model="formData.street" placeholder="Enter street address" clearable />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="City" prop="city">
            <el-input v-model="formData.city" placeholder="Enter city" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="ZIP Code" prop="zipcode">
            <el-input v-model="formData.zipcode" placeholder="ZIP code" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Contact Information -->
      <el-divider content-position="left">
        <el-icon><Phone /></el-icon>
        Contact Information
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Phone" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="Enter phone number"
              clearable
              :prefix-icon="Phone"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Website" prop="website">
            <el-input
              v-model="formData.website"
              placeholder="Enter website URL"
              clearable
              :prefix-icon="Link"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Company" prop="companyName">
        <el-input
          v-model="formData.companyName"
          placeholder="Enter company name"
          clearable
          :prefix-icon="OfficeBuilding"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading"> Cancel </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === 'create' ? 'Create User' : 'Update User' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  User,
  UserFilled,
  Message,
  Phone,
  Location,
  OfficeBuilding,
  Link,
} from '@element-plus/icons-vue'
import { useLifecycleLogger } from '@/composables/useLifecycleLogger'
import type { User as UserType, CreateUserRequest, UserFormData } from '@/types/user.types'

// Props
interface Props {
  visible: boolean
  user?: UserType | null
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  mode: 'create',
})

// Emits
interface Emits {
  'update:visible': [value: boolean]
  save: [userData: CreateUserRequest]
  cancel: []
}

const emit = defineEmits<Emits>()

// Composables
const { logCustomEvent, logError } = useLifecycleLogger({
  componentName: 'UserForm',
})

// Refs
const formRef = ref<FormInstance>()
const loading = ref(false)

// Reactive form data
const formData = reactive<UserFormData>({
  name: '',
  username: '',
  email: '',
  street: '',
  city: '',
  zipcode: '',
  phone: '',
  website: '',
  companyName: '',
})

// Computed properties
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

const formTitle = computed(() => {
  return props.mode === 'create' ? 'Add New User' : `Edit User: ${props.user?.name}`
})

// Form validation rules
const formRules: FormRules = {
  name: [
    { required: true, message: 'Please enter full name', trigger: 'blur' },
    { min: 2, max: 100, message: 'Name must be between 2 and 100 characters', trigger: 'blur' },
  ],
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, max: 50, message: 'Username must be between 3 and 50 characters', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Username can only contain letters, numbers, hyphens, and underscores',
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: 'Please enter email address', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' },
  ],
  street: [{ required: true, message: 'Please enter street address', trigger: 'blur' }],
  city: [{ required: true, message: 'Please enter city', trigger: 'blur' }],
  phone: [
    { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Please enter a valid phone number', trigger: 'blur' },
  ],
  website: [
    {
      pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message: 'Please enter a valid website URL',
      trigger: 'blur',
    },
  ],
}

// Methods
const initializeForm = () => {
  if (props.mode === 'edit' && props.user) {
    const user = props.user
    Object.assign(formData, {
      name: user.name,
      username: user.username,
      email: user.email,
      street: user.address.street,
      city: user.address.city,
      zipcode: user.address.zipcode || '',
      phone: user.phone || '',
      website: user.website || '',
      companyName: user.company?.name || '',
    })

    logCustomEvent('form-initialized-edit', { userId: user.id, userName: user.name })
  } else {
    // Reset form for create mode
    Object.assign(formData, {
      name: '',
      username: '',
      email: '',
      street: '',
      city: '',
      zipcode: '',
      phone: '',
      website: '',
      companyName: '',
    })

    logCustomEvent('form-initialized-create')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  logCustomEvent('form-submit-attempted', { mode: props.mode })

  try {
    const isValid = await formRef.value.validate()
    if (!isValid) {
      logCustomEvent('form-validation-failed')
      return
    }

    loading.value = true

    // Transform form data to API format
    const userData: CreateUserRequest = {
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        zipcode: formData.zipcode.trim() || undefined,
      },
      phone: formData.phone.trim() || undefined,
      website: formData.website.trim() || undefined,
      company: formData.companyName.trim() ? { name: formData.companyName.trim() } : undefined,
    }

    logCustomEvent('form-data-prepared', { mode: props.mode, userData })
    emit('save', userData)
  } catch (error: any) {
    logError(error, 'Form submission failed')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  logCustomEvent('form-cancelled', { mode: props.mode })
  emit('cancel')
}

const handleClose = () => {
  logCustomEvent('form-closed', { mode: props.mode })
  emit('cancel')
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    logCustomEvent('form-reset')
  }
}

// Watchers
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      nextTick(() => {
        initializeForm()
      })
    }
  },
)

watch(
  () => props.user,
  () => {
    if (props.visible) {
      nextTick(() => {
        initializeForm()
      })
    }
  },
)
</script>

<style scoped>
:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0;
  padding: 20px 24px;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
}

:deep(.el-dialog__body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  margin: 0 -24px -24px -24px;
}

:deep(.el-divider) {
  margin: 24px 0 16px 0;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-input__wrapper) {
  transition: box-shadow 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* Responsive design */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95vw !important;
    margin: 5vh auto;
  }

  :deep(.el-dialog__body) {
    padding: 16px;
    max-height: 60vh;
  }

  .dialog-footer {
    padding: 12px 16px;
    flex-direction: column-reverse;
  }

  .dialog-footer .el-button {
    width: 100%;
  }

  :deep(.el-form-item__label) {
    line-height: 32px;
  }

  :deep(.el-col) {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog) {
    width: 100vw !important;
    margin: 0;
    height: 100vh;
    border-radius: 0;
  }

  :deep(.el-dialog__body) {
    max-height: calc(100vh - 200px);
  }
}
</style>
