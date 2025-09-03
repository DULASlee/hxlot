# Vue项目集成指南

## 📦 已集成的包

### 新安装的包
- ✅ **axios** (v1.7.9) - HTTP客户端库
- ✅ **pinia** (v2.3.0) - Vue 3官方状态管理库

### 已有的包
- ✅ **vue-router@4** (v4.5.1) - Vue路由管理
- ✅ **element-plus** (v2.8.8) - UI组件库
- ✅ **@element-plus/icons-vue** (v2.3.1) - Element Plus图标库

## 🏗️ 项目结构变化

```
src/
├── stores/                 # Pinia状态管理
│   ├── index.ts           # 统一导出
│   ├── auth.ts            # 认证状态管理
│   └── theme.ts           # 主题状态管理
├── utils/
│   ├── api.ts             # 重构的API服务 (使用axios)
│   └── auth.ts            # 重构的认证服务
└── components/
    └── AuthExample.vue    # 示例组件
```

## 🚀 主要功能

### 1. 状态管理 (Pinia)

#### 认证状态管理 (`useAuthStore`)
```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 状态
authStore.isAuthenticated  // 是否已认证
authStore.userInfo        // 用户信息
authStore.isLoading       // 加载状态

// 方法
authStore.setToken(token, refreshToken)  // 设置Token
authStore.setUserInfo(userInfo)          // 设置用户信息
authStore.clearAuth()                    // 清除认证信息
authStore.getAuthHeader()                // 获取认证头
```

#### 主题状态管理 (`useThemeStore`)
```typescript
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 状态
themeStore.currentTheme   // 当前主题 ('light' | 'dark' | 'auto')
themeStore.isDark         // 是否为深色主题
themeStore.themeClass     // 主题CSS类名

// 方法
themeStore.setTheme('dark')    // 设置主题
themeStore.toggleTheme()       // 切换主题
themeStore.initTheme()         // 初始化主题
```

### 2. HTTP请求 (Axios)

#### API服务 (`ApiService`)
```typescript
import { api } from '@/utils/api'

// GET请求
const data = await api.get('/api/users')

// POST请求
const result = await api.post('/api/users', userData)

// PUT请求
const updated = await api.put('/api/users/1', userData)

// DELETE请求
await api.delete('/api/users/1')

// 文件上传
const uploadResult = await api.upload('/api/upload', file)
```

#### 特性
- ✅ 自动添加认证头
- ✅ 自动处理Token刷新
- ✅ 统一错误处理
- ✅ 请求/响应拦截器
- ✅ TypeScript支持

### 3. 认证服务 (`AuthService`)

```typescript
import { authService } from '@/utils/auth'

// 用户登录
await authService.login({ username, password })

// 用户登出
await authService.logout()

// 获取用户信息
const userInfo = await authService.getUserInfo()

// 权限检查
const hasPermission = authService.hasPermission('user.create')
const hasRole = authService.hasRole('admin')
```

## 🔧 配置说明

### 1. 路径别名
已在 `vite.config.ts` 中配置了 `@` 别名指向 `src` 目录：

```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src')
  }
}
```

### 2. 主应用初始化
在 `main.ts` 中已自动初始化：
- Pinia状态管理
- 主题系统
- 认证状态

### 3. 环境变量
API基础URL通过环境变量配置：
```bash
VITE_API_BASE_URL=https://localhost:44397
```

## 📝 使用示例

### 在组件中使用认证状态
```vue
<template>
  <div v-if="authStore.isAuthenticated">
    <p>欢迎，{{ authStore.userInfo?.username }}！</p>
    <button @click="handleLogout">登出</button>
  </div>
  <div v-else>
    <button @click="showLogin">登录</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/utils/auth'

const authStore = useAuthStore()

const handleLogout = async () => {
  await authService.logout()
}
</script>
```

### 在组件中使用API服务
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

const users = ref([])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await api.get('/api/users')
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
```

### 主题切换
```vue
<template>
  <div>
    <button @click="themeStore.toggleTheme()">
      切换到{{ themeStore.isDark ? '浅色' : '深色' }}主题
    </button>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>
```

## 🎯 下一步建议

1. **路由守卫**: 在 `router/index.ts` 中添加认证路由守卫
2. **错误处理**: 创建全局错误处理组件
3. **加载状态**: 创建全局加载状态组件
4. **权限指令**: 创建v-permission指令用于权限控制
5. **API接口**: 根据后端API创建具体的接口服务

## 🔍 测试

项目中包含了一个示例组件 `AuthExample.vue`，展示了：
- 用户登录/登出
- 主题切换
- API测试
- 状态管理使用

可以在路由中添加该组件进行测试。

## 📚 相关文档

- [Pinia官方文档](https://pinia.vuejs.org/)
- [Axios官方文档](https://axios-http.com/)
- [Vue Router官方文档](https://router.vuejs.org/)
- [Element Plus官方文档](https://element-plus.org/)