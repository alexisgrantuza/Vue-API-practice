<template>
  <div class="comments-section" v-if="comments.length > 0">
    <div class="comments-header">
      <h3 class="comments-title">
        Comments 
        <el-tag type="warning" size="small" round>{{ comments.length }}</el-tag>
      </h3>
    </div>
    
    <div class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item"
      >
        <div class="comment-avatar">
          <el-avatar 
            :size="40"
            :src="getAvatarUrl(comment.email)"
            :alt="comment.name"
          >
            {{ comment.name.charAt(0).toUpperCase() }}
          </el-avatar>
        </div>
        
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.name }}</span>
            <span class="comment-time">{{ getTimeAgo(comment.id) }}</span>
          </div>
          
          <div class="comment-body">
            {{ comment.body }}
          </div>
          
          <div class="comment-actions">
            <el-button 
              text 
              size="small" 
              class="action-btn"
              @click="replyToComment(comment.id)"
            >
              Reply
            </el-button>
            <el-button 
              text 
              size="small" 
              class="action-btn like-btn"
              @click="toggleLike(comment.id)"
              :class="{ 'liked': isLiked(comment.id) }"
            >
              {{ isLiked(comment.id) ? 'You Like' : 'Like' }}
            </el-button>
            <div class="like-count">
              <el-icon 
                class="heart-icon" 
                :class="{ 'liked': isLiked(comment.id) }"
              >
                <StarFilled v-if="isLiked(comment.id)" />
                <Star v-else />
              </el-icon>
              {{ getLikeCount(comment.id) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star, StarFilled } from '@element-plus/icons-vue'
import type { CommentType } from '@/types/api'

const props = defineProps<{
  comments: CommentType[]
  loading?: boolean
}>()

// Track liked comments
const likedComments = ref<Set<number>>(new Set())

const getAvatarUrl = (email: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
}

const getTimeAgo = (id: number) => {
  const times = ['5 min ago', '15 min ago', '25 min ago', '45 min ago', '1 hour ago', '2 hours ago']
  return times[id % times.length]
}
const isLiked = (commentId: number) => {
  return likedComments.value.has(commentId)
}

// Get like count for comment
const getLikeCount = (commentId: number) => {
  const baseLikes = Math.floor(Math.random() * 50) + 1
  return isLiked(commentId) ? baseLikes + 1 : baseLikes
}

const replyToComment = (commentId: number) => {
  console.log('Reply to comment:', commentId)
}

const toggleLike = (commentId: number) => {
  if (likedComments.value.has(commentId)) {
    likedComments.value.delete(commentId)
  } else {
    likedComments.value.add(commentId)
  }
}
</script>

<style scoped>
.comments-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px 0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.comments-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comments-list {
  max-height: none;
}

.comment-item {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  gap: 12px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.comment-time {
  color: #666;
  font-size: 12px;
}

.comment-body {
  color: #555;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  word-wrap: break-word;
  white-space: pre-line;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  color: #666;
  font-size: 12px;
  padding: 0;
  height: auto;
  font-weight: 500;
}

.action-btn:hover {
  color: #409eff;
}

.like-btn.liked {
  color: #f56c6c;
  font-weight: 600;
}

.like-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  margin-left: auto;
}

.heart-icon {
  font-size: 14px;
  color: #ccc;
}

.heart-icon.liked {
  color: #f56c6c;
}

/* Responsive design */
@media (max-width: 768px) {
  .comment-item {
    padding: 12px 16px;
  }
  
  .comments-header {
    padding: 12px 16px;
  }
}
</style>