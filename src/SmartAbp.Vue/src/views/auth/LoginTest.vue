<template>
  <div class="login-test-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>SmartAbp 登录功能测试</h2>
          <el-tag :type="connectionStatus.type as any">{{ connectionStatus.text }}</el-tag>
        </div>
      </template>

      <!-- API 连接测试 -->
      <el-divider content-position="left">API 连接测试</el-divider>
      <div class="test-section">
        <el-button @click="testApiConnection" :loading="testing.api" type="primary">
          🔗 测试 API 连接
        </el-button>
        <div v-if="apiTestResult" class="test-result">
          <el-alert
            :title="apiTestResult.success ? 'API 连接成功' : 'API 连接失败'"
            :type="apiTestResult.success ? 'success' : 'error'"
            :description="apiTestResult.message"
            show-icon
          />
        </div>
      </div>

      <!-- 用户登录测试 -->
      <el-divider content-position="left">用户登录测试</el-divider>
      <div class="login-section">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="authStore.isLoading"
              style="width: 100%"
            >
              👤 {{ authStore.isLoading ? '登录中...' : '登录测试' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 快速测试按钮 -->
        <div class="quick-test-buttons">
          <el-button @click="fillTestData('admin')" size="small">
            填入管理员测试数据
          </el-button>
          <el-button @click="fillTestData('user')" size="small">
            填入普通用户测试数据
          </el-button>
          <el-button @click="fillTestData('invalid')" size="small" type="warning">
            填入无效测试数据
          </el-button>
        </div>
      </div>

      <!-- 认证状态显示 -->
      <el-divider content-position="left">认证状态</el-divider>
      <div class="auth-status">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="认证状态">
            <el-tag :type="authStore.isAuthenticated ? 'success' : 'danger'">
              {{ authStore.isAuthenticated ? '已认证' : '未认证' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Token">
            <el-text class="token-display" truncated>
              {{ authStore.token || '无' }}
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ authStore.userInfo?.id || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ authStore.userInfo?.username || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ authStore.userInfo?.email || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag
              v-for="role in authStore.userInfo?.roles || []"
              :key="role"
              size="small"
              style="margin-right: 4px"
            >
              {{ role }}
            </el-tag>
            <span v-if="!authStore.userInfo?.roles?.length">无</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="authStore.isAuthenticated" class="auth-actions">
          <el-button @click="testUserInfo" :loading="testing.userInfo" type="info">
            🔄 刷新用户信息
          </el-button>
          <el-button @click="handleLogout" type="danger">
            🚪 登出测试
          </el-button>
        </div>
      </div>

      <!-- 测试日志 -->
      <el-divider content-position="left">测试日志</el-divider>
      <div class="test-logs">
        <el-button @click="clearLogs" size="small" type="warning">
          🗑️ 清空日志
        </el-button>
        <div class="logs-container">
          <div
            v-for="(log, index) in testLogs"
            :key="index"
            :class="['log-item', `log-${log.type}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="testLogs.length === 0" class="no-logs">
            暂无测试日志
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/utils/auth'
import { api } from '@/utils/api'
import dayjs from 'dayjs'



// 使用 stores
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' }
  ]
}

// 测试状态
const testing = reactive({
  api: false,
  userInfo: false
})

// API 测试结果
const apiTestResult = ref<{
  success: boolean
  message: string
} | null>(null)

// 连接状态
const connectionStatus = computed(() => {
  if (apiTestResult.value === null) {
    return { type: 'info', text: '未测试' }
  }
  return apiTestResult.value.success
    ? { type: 'success', text: '连接正常' }
    : { type: 'danger', text: '连接异常' }
})

// 测试日志
const testLogs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}>>([])

// 添加日志
const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
  testLogs.value.unshift({
    time: dayjs().format('HH:mm:ss'),
    type,
    message
  })
  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 清空日志
const clearLogs = () => {
  testLogs.value = []
  addLog('info', '日志已清空')
}

// 测试 API 连接
const testApiConnection = async () => {
  testing.api = true
  addLog('info', '开始测试 API 连接...')

  try {
    // API健康检查
    await api.get('/health-status')
    apiTestResult.value = {
      success: true,
      message: `连接成功！响应时间: ${Date.now() % 1000}ms`
    }
    addLog('success', 'API 连接测试成功')
    ElMessage.success('API 连接正常')
  } catch (error: any) {
    apiTestResult.value = {
      success: false,
      message: `连接失败: ${error.message || '未知错误'}`
    }
    addLog('error', `API 连接失败: ${error.message}`)
    ElMessage.error('API 连接失败')
  } finally {
    testing.api = false
  }
}

// 填充测试数据
const fillTestData = (type: 'admin' | 'user' | 'invalid') => {
  const testData = {
    admin: { username: 'admin', password: '1q2w3E*' },
    user: { username: 'testuser', password: 'Test123!' },
    invalid: { username: 'invalid', password: 'wrongpass' }
  }

  const data = testData[type]
  loginForm.username = data.username
  loginForm.password = data.password

  addLog('info', `已填入${type === 'admin' ? '管理员' : type === 'user' ? '普通用户' : '无效'}测试数据`)
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    addLog('info', `开始登录测试，用户名: ${loginForm.username}`)

    const success = await authService.login({
      username: loginForm.username,
      password: loginForm.password
    })

    if (success) {
      addLog('success', '登录成功！')
      ElMessage.success('登录成功！')

      // 自动获取用户信息
      await testUserInfo()
    }
  } catch (error: any) {
    const errorMsg = error.message || '登录失败'
    addLog('error', `登录失败: ${errorMsg}`)
    ElMessage.error(errorMsg)
  }
}

// 测试获取用户信息
const testUserInfo = async () => {
  testing.userInfo = true
  addLog('info', '开始获取用户信息...')

  try {
    const userInfo = await authService.fetchUserInfo()
    if (userInfo) {
      addLog('success', `用户信息获取成功: ${userInfo.userName}`)
      ElMessage.success('用户信息获取成功')
    } else {
      addLog('warning', '用户信息获取失败')
      ElMessage.warning('用户信息获取失败')
    }
  } catch (error: any) {
    addLog('error', `用户信息获取失败: ${error.message}`)
    ElMessage.error('用户信息获取失败')
  } finally {
    testing.userInfo = false
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要登出吗？', '确认登出', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    addLog('info', '开始登出测试...')
    await authService.logout()
    addLog('success', '登出成功！')
    ElMessage.success('登出成功！')
  } catch (error: any) {
    if (error !== 'cancel') {
      addLog('error', `登出失败: ${error.message}`)
      ElMessage.error('登出失败')
    }
  }
}

// 组件挂载时自动测试 API 连接
onMounted(() => {
  addLog('info', 'SmartAbp 登录功能测试页面已加载')
  testApiConnection()
})
</script>

<style scoped>
.login-test-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.login-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #409eff;
}

.test-section {
  margin-bottom: 20px;
}

.test-result {
  margin-top: 15px;
}

.login-section {
  margin-bottom: 20px;
}

.quick-test-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.auth-status {
  margin-bottom: 20px;
}

.token-display {
  max-width: 200px;
  font-family: monospace;
  font-size: 12px;
}

.auth-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.test-logs {
  margin-bottom: 20px;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: 10px;
  background-color: #fafafa;
}

.log-item {
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  font-family: monospace;
  font-size: 12px;
  display: flex;
  gap: 10px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #909399;
  min-width: 60px;
}

.log-message {
  flex: 1;
}

.log-success {
  background-color: #f0f9ff;
  color: #67c23a;
}

.log-error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.log-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.log-info {
  background-color: #f4f4f5;
  color: #606266;
}

.no-logs {
  padding: 20px;
  text-align: center;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-test-container {
    margin: 10px;
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .quick-test-buttons {
    flex-direction: column;
  }

  .auth-actions {
    flex-direction: column;
  }
}
</style>
