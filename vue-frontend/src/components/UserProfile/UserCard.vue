<template>
  <el-card 
    class="user-card" 
    :class="{ 'detailed': detailed, 'compact': !detailed }"
  >
    <div class="card-content">
      <div class="info-section">
        <div class="info-item">
          <el-icon class="info-icon"><Message /></el-icon>
          <div class="info-content">
            <span class="info-label">Email:</span>
            <el-link :href="`mailto:${user?.email}`" class="info-value email-link">
              {{ user?.email }}
            </el-link>
          </div>
        </div>

        <div class="info-item">
          <el-icon class="info-icon"><Phone /></el-icon>
          <div class="info-content">
            <span class="info-label">Phone:</span>
            <el-link :href="`tel:${user?.phone}`" class="info-value phone-link">
              {{ user?.phone }}
            </el-link>
          </div>
        </div>

        <div class="info-item">
          <el-icon class="info-icon"><Location /></el-icon>
          <div class="info-content">
            <span class="info-label">Address:</span>
            <el-text class="w-150px info-value" truncated>
              {{ fullAddress }}
            </el-text>
          </div>
        </div>

        <div v-if="user?.website" class="info-item">
          <el-icon class="info-icon"><Link /></el-icon>
          <div class="info-content">
            <span class="info-label ">Website:</span>
            <el-link 
              :href="websiteUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="info-value website-link"
            >
              {{ user?.website }}
              <el-icon><TopRight /></el-icon>
            </el-link>
          </div>
        </div>
      </div>

      <div v-if="detailed && user?.company" class="company-section">
        <el-divider content-position="left">
          <el-icon><OfficeBuilding /></el-icon>
          Company
        </el-divider>
        
        <div class="company-info">
          <h4 class="company-name">{{ user?.company?.name }}</h4>
          <p class="company-catchphrase">{{ user?.company?.catchPhrase }}</p>
          <p class="company-bs">{{ user?.company?.bs }}</p>
        </div>
      </div>

      <div v-if="detailed" class="details-section">
        <el-divider content-position="left">
          <el-icon><Document /></el-icon>
          Additional Details
        </el-divider>
        
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="User ID">
            <el-tag size="small">{{ user?.id }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Full Address">
            <el-text truncate>{{ fullAddressDetailed }}</el-text>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template v-if="showActions && !detailed" #footer>
      <div class="card-footer">
        <el-button-group size="small">
          <el-button @click="$emit('view', user)" type="primary" plain>
            <el-icon><View /></el-icon>
            View
          </el-button>
          <el-button @click="$emit('edit', user)" type="warning" plain>
            <el-icon><Edit /></el-icon>
            Edit
          </el-button>
          <el-button @click="$emit('delete', user)" type="danger" plain>
            <el-icon><Delete /></el-icon>
            Delete
          </el-button>
        </el-button-group>
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  View, 
  Edit, 
  Delete, 
  Message, 
  Phone, 
  Location, 
  Link, 
  TopRight,
  OfficeBuilding,
  Document
} from '@element-plus/icons-vue';
import type { Props } from '@/types/api';

const props = withDefaults(defineProps<Props>(), {
  detailed: false,
  showActions: true,
});

// Computed properties

const fullAddress = computed(() => {
  const { street, city } = props.user?.address || {};
  return `${street}, ${city}`;
});

const fullAddressDetailed = computed(() => {
  const { street, suite, city, zipcode } = props.user?.address || {};
  return `${street}, ${suite ? suite + ', ' : ''}${city} ${zipcode}`;
});

const websiteUrl = computed(() => {
  const website = props.user?.website;
  if (!website) return '';
  
  if (!website.startsWith('http://') && !website.startsWith('https://')) {
    return `https://${website}`;
  }
  return website;
});


</script>

<style scoped>
.user-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.user-card.compact {
  max-width: 350px;
}

.user-card.detailed {
  max-width: 600px;
}



.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.user-avatar {
  flex-shrink: 0;
}

.user-basic-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-username {
  margin: 0 0 8px 0;
  color: #909399;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.card-content {
  padding-top: 8px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.info-icon {
  color: #409eff;
  margin-top: 2px;
  font-size: 16px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  font-size: 13px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  word-break: break-word;
}

.email-link, .phone-link, .website-link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.2s;
}


.website-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.company-section {
  margin-top: 20px;
}

.company-info {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.company-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.company-catchphrase {
  margin: 0 0 4px 0;
  font-style: italic;
  color: #606266;
  font-size: 14px;
}

.company-bs {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.details-section {
  margin-top: 20px;
}

.card-footer {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .user-card.compact {
    max-width: 100%;
  }
  
  .user-card.detailed {
    max-width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
  }
  
  .card-actions {
    position: static;
    margin-top: 8px;
  }
  
  .user-name {
    font-size: 16px;
  }
  
  .info-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-icon {
    align-self: flex-start;
  }
}

</style>