# Phase 3B: UniApp前端链路开发方案

**项目**: SmartAbp低代码引擎平台扩展
**阶段**: Phase 3B - UniApp移动端前端完整链路开发
**工期**: 1周（5个工作日）
**负责人**: 前端架构师 + 2名前端开发
**依赖**: Phase 3A（UniApp生成器）已完成，Phase 5（后端JWT认证、文件上传）已完成
**文档版本**: v1.0
**更新日期**: 2025-10-21

---

## 📋 一、项目背景和目标

### 1.1 与Phase 3A的区别

**Phase 3A（UniApp生成器开发）**：
- 开发UniAppGenerator.cs（生成器本身）
- 创建Handlebars模板（list-page.hbs、form-page.hbs等）
- 目标：**生成**UniApp代码

**Phase 3B（UniApp前端链路开发）**：
- 在UniApp项目中**实际编写**移动端前端代码
- 集成JWT认证、离线数据存储、文件上传、uni-ui组件库
- 目标：**实现**可用的UniApp移动端功能

### 1.2 核心目标

1. ✅ 实现JWT认证（登录、Token刷新、Token存储）
2. ✅ 实现离线数据存储（uni.setStorageSync）
3. ✅ 实现离线数据同步（冲突解决）
4. ✅ 实现文件上传（分片上传、断点续传）
5. ✅ 实现API客户端（uni.request封装）
6. ✅ 实现MES移动端（产线巡检、设备报修）
7. ✅ 实现智慧工地移动端（现场巡查、安全检查）

**成功标准**：
- JWT认证正常
- 离线数据同步正常
- 文件上传支持100MB+大文件
- 支持三端运行（iOS/Android/H5）
- 前端代码质量≥95分

---

## 🏗️ 二、技术架构设计

### 2.1 前端架构

```
┌──────────────────────────────────────────────────────┐
│         UniApp Pages（页面层）                          │
│  ┌────────────────────────────────────────────────┐  │
│  │  ProductionLineList.vue（产线列表）              │  │
│  │  EquipmentInspection.vue（设备巡检）             │  │
│  │  MaintenanceOrder.vue（报修工单）                │  │
│  │  SiteInspection.vue（现场巡查）                  │  │
│  │  SafetyCheck.vue（安全检查）                     │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 使用
┌──────────────────────────────────────────────────────┐
│         Composables（可组合函数）                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  useAuth.ts（JWT认证）                          │  │
│  │  useOfflineSync.ts（离线数据同步）               │  │
│  │  useFileUpload.ts（文件上传）                    │  │
│  │  useNetworkStatus.ts（网络状态检测）             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 使用
┌──────────────────────────────────────────────────────┐
│         Utils（工具函数）                               │
│  ┌────────────────────────────────────────────────┐  │
│  │  request.ts（uni.request封装）                  │  │
│  │  storage.ts（uni.storage封装）                  │  │
│  │  upload.ts（文件上传工具）                       │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 使用
┌──────────────────────────────────────────────────────┐
│         Stores（状态管理）                              │
│  ┌────────────────────────────────────────────────┐  │
│  │  authStore.ts（认证状态）                        │  │
│  │  productionLineStore.ts（产线数据）              │  │
│  │  maintenanceOrderStore.ts（报修工单数据）        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
[用户操作] → [离线检查] → [本地存储] → [网络恢复]
                               ↓              ↓
                         [立即使用]      [后台同步]
                                              ↓
                                    [冲突检测 & 解决]
                                              ↓
                                       [同步成功]
```

---

## 💻 三、核心组件实现

### 3.1 JWT认证（useAuth.ts）

```typescript
// src/composables/useAuth.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import request from '@/utils/request'

interface LoginCredentials {
  username: string
  password: string
  deviceId: string
  deviceInfo: DeviceInfo
}

interface DeviceInfo {
  deviceType: 'iOS' | 'Android' | 'H5'
  deviceModel: string
  osVersion: string
  appVersion: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export const useAuthStore = defineStore('auth', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const accessToken = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<any>(null)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isAuthenticated = computed(() => !!accessToken.value)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 操作
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 登录
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await request<AuthTokens>({
        url: '/api/mobile/auth/login',
        method: 'POST',
        data: credentials
      })
      
      // 保存Token到本地存储
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken
      
      uni.setStorageSync('accessToken', res.accessToken)
      uni.setStorageSync('refreshToken', res.refreshToken)
      
      // 获取用户信息
      await fetchUserInfo()
      
      return true
    } catch (error) {
      console.error('登录失败', error)
      throw error
    }
  }
  
  /**
   * 刷新Token
   */
  const refreshAccessToken = async () => {
    try {
      const res = await request<AuthTokens>({
        url: '/api/mobile/auth/refresh-token',
        method: 'POST',
        data: {
          refreshToken: refreshToken.value
        }
      })
      
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken
      
      uni.setStorageSync('accessToken', res.accessToken)
      uni.setStorageSync('refreshToken', res.refreshToken)
      
      return true
    } catch (error) {
      console.error('Token刷新失败', error)
      // Token刷新失败，清除登录状态
      logout()
      return false
    }
  }
  
  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    try {
      const res = await request({
        url: '/api/mobile/user/profile',
        method: 'GET'
      })
      
      userInfo.value = res
      uni.setStorageSync('userInfo', res)
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }
  
  /**
   * 登出
   */
  const logout = async () => {
    try {
      await request({
        url: '/api/mobile/auth/logout',
        method: 'POST'
      })
    } catch (error) {
      console.error('登出失败', error)
    } finally {
      // 清除本地存储
      accessToken.value = ''
      refreshToken.value = ''
      userInfo.value = null
      
      uni.removeStorageSync('accessToken')
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('userInfo')
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }
  }
  
  /**
   * 从本地存储恢复登录状态
   */
  const restoreAuth = () => {
    const storedAccessToken = uni.getStorageSync('accessToken')
    const storedRefreshToken = uni.getStorageSync('refreshToken')
    const storedUserInfo = uni.getStorageSync('userInfo')
    
    if (storedAccessToken && storedRefreshToken) {
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
      userInfo.value = storedUserInfo
    }
  }
  
  return {
    // 状态
    accessToken,
    refreshToken,
    userInfo,
    
    // 计算属性
    isAuthenticated,
    
    // 操作
    login,
    refreshAccessToken,
    fetchUserInfo,
    logout,
    restoreAuth
  }
})
```

### 3.2 API客户端（request.ts）

```typescript
// src/utils/request.ts
import { useAuthStore } from '@/stores/authStore'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  timeout?: number
  skipAuth?: boolean
}

interface RequestResponse<T = any> {
  code: number
  message: string
  data: T
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

/**
 * 请求拦截器
 */
function requestInterceptor(options: RequestOptions) {
  const authStore = useAuthStore()
  
  // 自动添加Token
  if (!options.skipAuth && authStore.accessToken) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${authStore.accessToken}`
    }
  }
  
  // 自动添加Content-Type
  if (!options.header?.['Content-Type']) {
    options.header = {
      ...options.header,
      'Content-Type': 'application/json'
    }
  }
  
  return options
}

/**
 * 响应拦截器
 */
function responseInterceptor(res: any) {
  const { statusCode, data } = res
  
  // HTTP状态码检查
  if (statusCode >= 200 && statusCode < 300) {
    // 业务状态码检查
    if (data.code === 0) {
      return data.data
    } else {
      // 业务错误
      throw new Error(data.message || '业务错误')
    }
  } else if (statusCode === 401) {
    // Token过期，尝试刷新
    return handleTokenExpired()
  } else {
    throw new Error(`请求失败: ${statusCode}`)
  }
}

/**
 * Token过期处理
 */
async function handleTokenExpired() {
  const authStore = useAuthStore()
  
  try {
    const success = await authStore.refreshAccessToken()
    
    if (success) {
      // Token刷新成功，重试原请求
      uni.showToast({
        title: 'Token已刷新，请重试',
        icon: 'none'
      })
    }
  } catch (error) {
    // Token刷新失败，跳转登录页
    authStore.logout()
  }
  
  throw new Error('Token已过期')
}

/**
 * 发送请求
 */
export default function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const interceptedOptions = requestInterceptor(options)
    
    uni.request({
      url: `${BASE_URL}${interceptedOptions.url}`,
      method: interceptedOptions.method || 'GET',
      data: interceptedOptions.data,
      header: interceptedOptions.header,
      timeout: interceptedOptions.timeout || 10000,
      success: (res) => {
        try {
          const data = responseInterceptor(res)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        console.error('请求失败', err)
        
        // 网络错误提示
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        
        reject(new Error('网络请求失败'))
      }
    })
  })
}
```

### 3.3 离线数据同步（useOfflineSync.ts）

```typescript
// src/composables/useOfflineSync.ts
import { ref } from 'vue'
import { useNetworkStatus } from './useNetworkStatus'
import request from '@/utils/request'

interface OfflineDataItem {
  id: string
  type: 'create' | 'update' | 'delete'
  entityType: string
  data: any
  timestamp: number
  version: number
}

interface SyncResult {
  successCount: number
  failedCount: number
  conflictCount: number
  conflicts: Conflict[]
}

interface Conflict {
  itemId: string
  clientVersion: number
  serverVersion: number
  clientData: any
  serverData: any
  conflictType: string
}

export function useOfflineSync() {
  const { isOnline } = useNetworkStatus()
  const isSyncing = ref(false)
  const syncProgress = ref(0)
  
  /**
   * 保存离线数据
   */
  const saveOfflineData = (item: OfflineDataItem) => {
    const offlineQueue = uni.getStorageSync('offlineQueue') || []
    offlineQueue.push(item)
    uni.setStorageSync('offlineQueue', offlineQueue)
    
    console.log('[OfflineSync] 保存离线数据', item)
    
    // 如果网络在线，立即尝试同步
    if (isOnline.value) {
      syncOfflineData()
    }
  }
  
  /**
   * 同步离线数据
   */
  const syncOfflineData = async () => {
    if (isSyncing.value || !isOnline.value) {
      return
    }
    
    isSyncing.value = true
    syncProgress.value = 0
    
    try {
      const offlineQueue: OfflineDataItem[] = uni.getStorageSync('offlineQueue') || []
      
      if (offlineQueue.length === 0) {
        console.log('[OfflineSync] 无离线数据需要同步')
        return
      }
      
      console.log(`[OfflineSync] 开始同步${offlineQueue.length}条离线数据`)
      
      // 批量同步
      const result = await request<SyncResult>({
        url: '/api/mobile/sync/data',
        method: 'POST',
        data: {
          items: offlineQueue
        }
      })
      
      console.log('[OfflineSync] 同步结果', result)
      
      // 处理冲突
      if (result.conflictCount > 0) {
        await handleConflicts(result.conflicts)
      }
      
      // 清空离线队列
      uni.removeStorageSync('offlineQueue')
      
      uni.showToast({
        title: `同步成功：${result.successCount}条`,
        icon: 'success'
      })
    } catch (error) {
      console.error('[OfflineSync] 同步失败', error)
      
      uni.showToast({
        title: '同步失败',
        icon: 'none'
      })
    } finally {
      isSyncing.value = false
      syncProgress.value = 100
    }
  }
  
  /**
   * 处理冲突
   */
  const handleConflicts = async (conflicts: Conflict[]) => {
    for (const conflict of conflicts) {
      // 显示冲突对话框，让用户选择解决策略
      const res = await uni.showModal({
        title: '数据冲突',
        content: `本地数据与服务器数据冲突，请选择保留哪个版本？`,
        confirmText: '保留本地',
        cancelText: '使用服务器'
      })
      
      const strategy = res.confirm ? 'ClientWins' : 'ServerWins'
      
      try {
        await request({
          url: '/api/mobile/sync/resolve-conflict',
          method: 'POST',
          data: {
            itemId: conflict.itemId,
            strategy,
            clientData: conflict.clientData
          }
        })
        
        console.log(`[OfflineSync] 冲突已解决：${conflict.itemId}`)
      } catch (error) {
        console.error('[OfflineSync] 冲突解决失败', error)
      }
    }
  }
  
  /**
   * 获取离线数据数量
   */
  const getOfflineDataCount = () => {
    const offlineQueue = uni.getStorageSync('offlineQueue') || []
    return offlineQueue.length
  }
  
  return {
    isSyncing,
    syncProgress,
    saveOfflineData,
    syncOfflineData,
    getOfflineDataCount
  }
}
```

### 3.4 文件上传（useFileUpload.ts）

```typescript
// src/composables/useFileUpload.ts
import { ref } from 'vue'
import request from '@/utils/request'

interface UploadOptions {
  filePath: string
  fileType: 'image' | 'video' | 'file'
  onProgress?: (progress: number) => void
}

interface ChunkUploadResult {
  isCompleted: boolean
  filePath?: string
  uploadedChunks?: number
  totalChunks?: number
}

const CHUNK_SIZE = 1024 * 1024 // 1MB

export function useFileUpload() {
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  
  /**
   * 上传文件（小文件<10MB，直接上传）
   */
  const uploadFile = async (options: UploadOptions) => {
    isUploading.value = true
    uploadProgress.value = 0
    
    try {
      const { filePath, fileType } = options
      
      // 获取文件信息
      const fileInfo = await uni.getFileInfo({ filePath })
      
      // 如果文件小于10MB，直接上传
      if (fileInfo.size < 10 * 1024 * 1024) {
        return await uploadSmallFile(filePath, fileType, options.onProgress)
      } else {
        // 大文件分片上传
        return await uploadLargeFile(filePath, fileType, options.onProgress)
      }
    } catch (error) {
      console.error('[FileUpload] 上传失败', error)
      throw error
    } finally {
      isUploading.value = false
    }
  }
  
  /**
   * 上传小文件
   */
  const uploadSmallFile = (filePath: string, fileType: string, onProgress?: (progress: number) => void) => {
    return new Promise<string>((resolve, reject) => {
      const uploadTask = uni.uploadFile({
        url: `${import.meta.env.VITE_API_BASE_URL}/api/mobile/file/upload`,
        filePath,
        name: 'file',
        formData: {
          fileType
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data)
            resolve(data.data.filePath)
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
      
      // 监听上传进度
      uploadTask.onProgressUpdate((progress) => {
        uploadProgress.value = progress.progress
        onProgress?.(progress.progress)
      })
    })
  }
  
  /**
   * 上传大文件（分片上传）
   */
  const uploadLargeFile = async (
    filePath: string,
    fileType: string,
    onProgress?: (progress: number) => void
  ) => {
    try {
      // 1. 获取文件信息
      const fileInfo = await uni.getFileInfo({ filePath })
      const totalChunks = Math.ceil(fileInfo.size / CHUNK_SIZE)
      
      // 2. 初始化分片上传
      const initResult = await request<{ uploadId: string; chunkSize: number }>({
        url: '/api/mobile/file/init-chunk-upload',
        method: 'POST',
        data: {
          fileName: filePath.split('/').pop(),
          fileSize: fileInfo.size,
          totalChunks
        }
      })
      
      const { uploadId } = initResult
      
      // 3. 读取文件为Base64
      const fileContent = await uni.getFileSystemManager().readFileSync(filePath, 'base64')
      
      // 4. 分片上传
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, fileInfo.size)
        const chunk = fileContent.substring(start, end)
        
        const result = await request<ChunkUploadResult>({
          url: '/api/mobile/file/upload-chunk',
          method: 'POST',
          data: {
            uploadId,
            chunkIndex: i,
            chunk
          }
        })
        
        // 更新进度
        const progress = ((i + 1) / totalChunks) * 100
        uploadProgress.value = progress
        onProgress?.(progress)
        
        // 检查是否完成
        if (result.isCompleted) {
          return result.filePath!
        }
      }
      
      throw new Error('分片上传失败')
    } catch (error) {
      console.error('[FileUpload] 分片上传失败', error)
      throw error
    }
  }
  
  return {
    uploadProgress,
    isUploading,
    uploadFile
  }
}
```

### 3.5 产线列表页（ProductionLineList.vue）

```vue
<!-- pages/production-line/list.vue -->
<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar
        v-model="searchKeyword"
        placeholder="请输入产线名称"
        @confirm="handleSearch"
        @clear="handleClear"
      />
    </view>
    
    <!-- 离线同步提示 -->
    <view v-if="offlineDataCount > 0" class="offline-tip" @click="handleSync">
      <uni-icons type="info" size="16" color="#ff9900" />
      <text>有 {{ offlineDataCount }} 条离线数据待同步</text>
      <uni-icons v-if="isSyncing" type="spinner-cycle" size="16" color="#ff9900" />
    </view>
    
    <!-- 列表 -->
    <scroll-view
      scroll-y
      class="scroll-view"
      @scrolltolower="handleLoadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <!-- 数据列表 -->
      <view
        v-for="item in list"
        :key="item.id"
        class="list-item"
        @click="handleDetail(item.id)"
      >
        <view class="item-header">
          <text class="item-title">{{ item.productionLineName }}</text>
          <uni-tag :text="getStatusLabel(item.status)" :type="getStatusType(item.status)" />
        </view>
        
        <view class="item-content">
          <view class="item-row">
            <text class="label">当前效率:</text>
            <text class="value">{{ item.currentEfficiency }}%</text>
          </view>
          <view class="item-row">
            <text class="label">设备利用率:</text>
            <text class="value">{{ item.equipmentUtilization }}%</text>
          </view>
        </view>
        
        <view class="item-footer">
          <text class="time">更新时间: {{ formatTime(item.lastUpdateTime) }}</text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <uni-load-more status="loading" />
      </view>
      
      <!-- 没有更多 -->
      <view v-if="noMore && list.length > 0" class="no-more">
        <text>没有更多数据了</text>
      </view>
      
      <!-- 空状态 -->
      <empty-view v-if="!loading && list.length === 0" />
    </scroll-view>
    
    <!-- 浮动按钮 -->
    <view class="fab" @click="handleInspection">
      <uni-icons type="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProductionLineStore } from '@/stores/productionLineStore'
import { useOfflineSync } from '@/composables/useOfflineSync'
import { useNetworkStatus } from '@/composables/useNetworkStatus'
import EmptyView from '@/components/empty-view.vue'

const store = useProductionLineStore()
const { isOnline } = useNetworkStatus()
const { isSyncing, syncOfflineData, getOfflineDataCount } = useOfflineSync()

// 搜索关键词
const searchKeyword = ref('')

// 列表数据
const list = ref<any[]>([])
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

// 分页
const pagination = ref({
  current: 1,
  pageSize: 20
})

// 离线数据数量
const offlineDataCount = computed(() => getOfflineDataCount())

// 加载数据
const loadData = async (append = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const result = await store.getList({
      keyword: searchKeyword.value,
      skipCount: (pagination.value.current - 1) * pagination.value.pageSize,
      maxResultCount: pagination.value.pageSize
    })
    
    if (append) {
      list.value.push(...result.items)
    } else {
      list.value = result.items
    }
    
    noMore.value = list.value.length >= result.totalCount
  } catch (error) {
    // 如果离线，从本地缓存加载
    if (!isOnline.value) {
      const cachedData = uni.getStorageSync('productionLineList')
      if (cachedData) {
        list.value = cachedData
        uni.showToast({
          title: '离线数据',
          icon: 'none'
        })
      }
    } else {
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

// 清空搜索
const handleClear = () => {
  searchKeyword.value = ''
  handleSearch()
}

// 下拉刷新
const handleRefresh = () => {
  refreshing.value = true
  pagination.value.current = 1
  loadData()
}

// 上拉加载
const handleLoadMore = () => {
  if (noMore.value || loading.value) return
  
  pagination.value.current++
  loadData(true)
}

// 查看详情
const handleDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/production-line/detail?id=${id}`
  })
}

// 设备巡检
const handleInspection = () => {
  uni.navigateTo({
    url: '/pages/inspection/index'
  })
}

// 同步离线数据
const handleSync = async () => {
  await syncOfflineData()
  // 刷新列表
  handleRefresh()
}

// 状态标签
const getStatusType = (status: string) => {
  switch (status) {
    case 'running': return 'success'
    case 'idle': return 'warning'
    case 'fault': return 'error'
    default: return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'running': return '运行中'
    case 'idle': return '空闲'
    case 'fault': return '故障'
    default: return '未知'
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  background-color: #fff;
  padding: 20rpx;
}

.offline-tip {
  background-color: #fff3cd;
  border-bottom: 1px solid #ffc107;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 28rpx;
  color: #856404;
}

.scroll-view {
  flex: 1;
  padding: 20rpx;
}

.list-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.item-content {
  margin-bottom: 12rpx;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.item-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 12rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}
</style>
```

---

## 📝 四、开发步骤（5天详细计划）

### Day 1：基础工具和Composables开发（1天）

**任务清单**：
1. 创建request.ts（uni.request封装）
2. 创建useAuth.ts（JWT认证）
3. 创建useNetworkStatus.ts（网络状态检测）
4. 单元测试

**验收标准**：
- ✅ API请求正常
- ✅ JWT认证正常
- ✅ 网络状态检测正常

### Day 2：离线数据同步开发（1天）

**任务清单**：
1. 创建useOfflineSync.ts（离线数据同步）
2. 实现离线数据存储
3. 实现离线数据同步逻辑
4. 实现冲突解决

**验收标准**：
- ✅ 离线数据存储正常
- ✅ 离线数据同步正常
- ✅ 冲突解决正常

### Day 3：文件上传开发（1天）

**任务清单**：
1. 创建useFileUpload.ts（文件上传）
2. 实现小文件上传
3. 实现大文件分片上传
4. 实现上传进度显示

**验收标准**：
- ✅ 小文件上传正常
- ✅ 大文件分片上传正常
- ✅ 上传进度正常

### Day 4：MES移动端开发（1天）

**任务清单**：
1. 创建ProductionLineList.vue（产线列表）
2. 创建EquipmentInspection.vue（设备巡检）
3. 创建MaintenanceOrder.vue（报修工单）
4. 集成离线数据同步

**验收标准**：
- ✅ 产线列表正常
- ✅ 设备巡检正常
- ✅ 报修工单正常

### Day 5：智慧工地移动端开发 + 测试（1天）

**任务清单**：
1. 创建SiteInspection.vue（现场巡查）
2. 创建SafetyCheck.vue（安全检查）
3. 完整测试（iOS/Android/H5）
4. 文档更新

**验收标准**：
- ✅ 现场巡查正常
- ✅ 安全检查正常
- ✅ 三端运行正常

---

## ✅ 五、验收标准

### 5.1 功能验收

| 验收项 | 验收标准 | 验收方式 |
|--------|---------|---------|
| JWT认证 | 登录、Token刷新、登出正常 | 集成测试 |
| 离线数据同步 | 离线操作、网络恢复后同步正常 | 功能测试 |
| 文件上传 | 支持100MB+大文件分片上传 | 性能测试 |
| 多端运行 | iOS/Android/H5运行正常 | 多端测试 |

### 5.2 性能验收

| 性能指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 列表首屏加载 | <1秒 | 性能测试 |
| 文件上传速度 | ≥5MB/s | 性能测试 |
| 离线数据同步 | <2秒/100条 | 性能测试 |

---

## 📦 六、交付清单

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/utils/request.ts` | API请求封装 | ✅ 新增 |
| `src/composables/useAuth.ts` | JWT认证 | ✅ 新增 |
| `src/composables/useOfflineSync.ts` | 离线数据同步 | ✅ 新增 |
| `src/composables/useFileUpload.ts` | 文件上传 | ✅ 新增 |
| `pages/production-line/list.vue` | 产线列表 | ✅ 新增 |
| `pages/inspection/index.vue` | 设备巡检 | ✅ 新增 |
| `pages/site-inspection/index.vue` | 现场巡查 | ✅ 新增 |

---

## 🎯 七、成功指标

- ✅ JWT认证正常
- ✅ 离线数据同步正常
- ✅ 文件上传支持100MB+大文件
- ✅ 支持三端运行（iOS/Android/H5）
- ✅ 前端代码质量≥95分

**Phase 3B 完成标志**：
- ✅ 所有代码合并到主分支
- ✅ 所有测试通过
- ✅ MES和智慧工地移动端可正常运行

---

**✅ 所有前端链路开发方案已完成！**

