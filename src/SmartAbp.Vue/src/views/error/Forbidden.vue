<template>
  <div class="forbidden-container">
    <div class="error-content">
      <div class="error-icon">
        <el-icon
          :size="120"
          color="#f56c6c"
        >
          <WarningFilled />
        </el-icon>
      </div>
      
      <h1 class="error-code">
        403
      </h1>
      <h2 class="error-title">
        权限不足
      </h2>
      <p class="error-message">
        抱歉，您的权限不足，无法访问此页面。
      </p>
      
      <div
        v-if="userRoles.length > 0"
        class="error-info"
      >
        <p class="role-info">
          <strong>您的角色:</strong> 
          <el-tag
            v-for="role in userRoles"
            :key="role"
            :type="getRoleTagType(role)"
            size="large"
            class="role-tag"
          >
            {{ getRoleDisplayName(role) }}
          </el-tag>
        </p>
        <p
          v-if="requiredRoles.length > 0"
          class="required-info"
        >
          <strong>所需角色:</strong> 
          <el-tag
            v-for="role in requiredRoles"
            :key="role"
            type="warning"
            size="large"
            class="role-tag"
          >
            {{ getRoleDisplayName(role) }}
          </el-tag>
        </p>
      </div>

      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          @click="goBack"
        >
          <el-icon class="mr-1">
            <Back />
          </el-icon>
          返回上一页
        </el-button>
        <el-button
          size="large"
          @click="goHome"
        >
          <el-icon class="mr-1">
            <HomeFilled />
          </el-icon>
          返回首页
        </el-button>
        <el-button
          size="large"
          @click="contactAdmin"
        >
          <el-icon class="mr-1">
            <Service />
          </el-icon>
          联系管理员
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { WarningFilled, Back, HomeFilled, Service } from '@element-plus/icons-vue'
import { getRoleDisplayName } from '@/utils/roleHierarchy'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 用户角色
const userRoles = computed(() => authStore.userInfo?.roles || [])

// 所需角色（从路由 meta 中获取）
const requiredRoles = computed(() => {
  const fromQuery = route.query.requiredRoles
  if (Array.isArray(fromQuery)) {
    return fromQuery as string[]
  } else if (typeof fromQuery === 'string') {
    return fromQuery.split(',')
  }
  return []
})

// 获取角色标签类型
const getRoleTagType = (role: string): 'success' | 'info' | 'warning' | 'danger' => {
  const roleTypeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    admin: 'danger',
    manager: 'warning',
    user: 'success',
    guest: 'info'
  }
  return roleTypeMap[role.toLowerCase()] || 'info'
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 返回首页
const goHome = () => {
  router.push({ name: 'Dashboard' })
}

// 联系管理员
const contactAdmin = () => {
  ElMessage.info({
    message: '请联系系统管理员申请相应权限',
    duration: 3000,
    showClose: true
  })
}
</script>

<style scoped lang="scss">
.forbidden-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  margin-bottom: 30px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.error-code {
  font-size: 80px;
  font-weight: bold;
  color: #f56c6c;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.error-info {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.role-info,
.required-info {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
  line-height: 2;
  
  strong {
    color: #303133;
    margin-right: 10px;
  }
}

.role-tag {
  margin-right: 8px;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.mr-1 {
  margin-right: 4px;
}

@media (max-width: 768px) {
  .error-content {
    padding: 40px 20px;
  }
  
  .error-code {
    font-size: 60px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>

