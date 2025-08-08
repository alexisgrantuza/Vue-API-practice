<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? 'Edit User' : 'Add New User'"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
      @submit.prevent="handleSubmit"
    >
      <el-divider content-position="left">
        <el-icon><User /></el-icon>
        Personal Information
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Full Name" prop="name" required>
            <el-input
              v-model="formData.name "
              placeholder="Enter full name"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Username" prop="username" required>
            <el-input
              v-model="formData.username"
              placeholder="Enter username"
              :prefix-icon="Avatar"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">
        <el-icon><Message /></el-icon>
        Contact Information
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Email" prop="email" required>
            <el-input
              v-model="formData.email"
              placeholder="Enter email address"
              :prefix-icon="Message"
              type="email"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Phone" prop="phone" required>
            <el-input
              v-model="formData.phone"
              placeholder="Enter phone number"
              :prefix-icon="Phone"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Website" prop="website">
        <el-input
          v-model="formData.website"
          placeholder="Enter website URL"
          :prefix-icon="Link"
          clearable
        >
          <template #prepend>https://</template>
        </el-input>
      </el-form-item>

      <el-divider content-position="left">
        <el-icon><Location /></el-icon>
        Address Information
      </el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Street" prop="address.street" required>
            <el-input
              v-model="formData.address.street"
              placeholder="Enter street address"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Suite" prop="address.suite">
            <el-input
              v-model="formData.address.suite"
              placeholder="Suite/Apt number"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="City" prop="address.city" required>
            <el-input
              v-model="formData.address.city"
              placeholder="Enter city"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Zipcode" prop="address.zipcode" required>
            <el-input
              v-model="formData.address.zipcode"
              placeholder="Enter zipcode"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">
        <el-icon><OfficeBuilding /></el-icon>
        Company Information
      </el-divider>

      <el-form-item label="Company Name" prop="company.name" required>
        <el-input
          v-model="formData.company.name"
          placeholder="Enter company name"
          :prefix-icon="OfficeBuilding"
          clearable
        />
      </el-form-item>

      <el-form-item label="Catch Phrase" prop="company.catchPhrase">
        <el-input
          v-model="formData.company.catchPhrase"
          placeholder="Enter company catch phrase"
          type="textarea"
          :rows="2"
          clearable
        />
      </el-form-item>

      <el-form-item label="Business" prop="company.bs">
        <el-input
          v-model="formData.company.bs"
          placeholder="Enter business description"
          type="textarea"
          :rows="2"
          clearable
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">
          Cancel
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  User, 
  Avatar, 
  Message, 
  Phone, 
  Link, 
  Location, 
  OfficeBuilding 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { User as UserType } from '@/types/user';
import type { Props, Emits } from '@/types/api';


const props = withDefaults(defineProps<Props>(), {
  user: null,
  visible: false,
});

const emit = defineEmits<{
  (e: 'save', userData: Omit<UserType, 'id' | 'createdAt'> | UserType): void;
  (e: 'cancel'): void;
}>();


// Refs
const formRef = ref<FormInstance>();
const loading = ref(false);

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit('cancel');
    }
  }
});

const isEditing = computed(() => !!props.user);

// Form data with reactive structure
const formData = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  website: '',
  address: {
    street: '',
    suite: '',
    city: '',
    zipcode: '',
    geo: {
      lat: '',
      lng: ''
    }
  },
  company: {
    name: '',
    catchPhrase: '',
    bs: ''
  }
});

// Form validation rules
const formRules: FormRules = {
  name: [
    { required: true, message: 'Please enter full name', trigger: 'blur' },
    { min: 2, max: 50, message: 'Name should be 2-50 characters', trigger: 'blur' }
  ],
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, max: 20, message: 'Username should be 3-20 characters', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email address', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Please enter a valid phone number', trigger: 'blur' }
  ],
  website: [
    { pattern: /^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$/, message: 'Please enter a valid website URL', trigger: 'blur' }
  ],
  'address.street': [
    { required: true, message: 'Please enter street address', trigger: 'blur' }
  ],
  'address.city': [
    { required: true, message: 'Please enter city', trigger: 'blur' }
  ],
  'address.zipcode': [
    { required: true, message: 'Please enter zipcode', trigger: 'blur' },
    { pattern: /^[\d\-]+$/, message: 'Please enter a valid zipcode', trigger: 'blur' }
  ],
  'company.name': [
    { required: true, message: 'Please enter company name', trigger: 'blur' }
  ]
};

// Form validation state
const isFormValid = computed(() => {
  return formData.name && 
         formData.username && 
         formData.email && 
         formData.phone && 
         formData.address?.street && 
         formData.address?.city && 
         formData.address?.zipcode && 
         formData.company?.name;
});

// Methods
const initializeForm = () => {
  if (props.user) {
    // Edit mode - populate form with user data
    Object.assign(formData, {
      name: props.user.name || '',
      username: props.user.username || '',
      email: props.user.email || '',
      phone: props.user.phone || '',
      website: props.user.website || '',
      address: {
        street: props.user.address?.street || '',
        suite: props.user.address?.suite || '',
        city: props.user.address?.city || '',
        zipcode: props.user.address?.zipcode || '',
      },
      company: {
        name: props.user.company?.name || '',
        catchPhrase: props.user.company?.catchPhrase || '',
        bs: props.user.company?.bs || ''
      }
    });
  } else {
    // Add mode - reset form
    resetForm();
  }
};

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    username: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      suite: '',
      city: '',
      zipcode: '',
      geo: {
        lat: '',
        lng: ''
      }
    },
    company: {
      name: '',
      catchPhrase: '',
      bs: ''
    }
  });
  
  // Clear form validation
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    loading.value = true;
    
    const submitData: Partial<UserType> = {
      ...formData,
      ...(isEditing.value && props.user ? { id: props.user.id } : {})
    };
    
    // Clean up empty optional fields
    if (!submitData.website) {
      delete submitData.website;
    }

    if(submitData.address) {
      if (!submitData.address.suite) {
        submitData.address.suite = '';
      }
    }

    if(submitData.company) {
      if (!submitData.company.catchPhrase) {
        submitData.company.catchPhrase = '';
      }
      if (!submitData.company.bs) {
        submitData.company.bs = '';
      }
    }    
    emit('save', submitData as UserType);
    
  } catch (error) {
    console.error('Form validation failed:', error);
    ElMessage.error('Please correct the form errors before submitting');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

// Watch for prop changes
watch(() => props.user, () => {
  initializeForm();
}, { immediate: true, deep: true });

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    initializeForm();
  }
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-input-group__prepend) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #909399;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  :deep(.el-form--label-left .el-form-item__label) {
    text-align: left;
    justify-content: flex-start;
  }
  
  .el-row .el-col {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  :deep(.el-form) {
    .el-row .el-col {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }
  }
  
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
  
  :deep(.el-form-item__label) {
    line-height: 32px;
    margin-bottom: 6px;
  }
}

:deep(.el-button.is-loading) {
  pointer-events: none;
}
.el-divider {
  margin: 24px 0 16px 0;
}

.el-divider:first-of-type {
  margin-top: 0;
}

:deep(.el-input__wrapper) {
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>