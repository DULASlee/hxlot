<!-- pages/production-line/detail.vue -->
<template>
  <view class="detail-page">
    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" text="加载中..." mode="circle" size="36" />
    
    <!-- 数据展示 -->
    <view v-else-if="entity.id" class="detail-content">
      <!-- 基本信息卡片 (uView UI) -->
      <u-card :title="entity.name" :sub-title="'ID: ' + entity.id" :border="false">
        <template #body>
          <u-cell-group :border="false">
            <u-cell title="生产线名称" :value="entity.name" :border="false" />
            <u-cell title="生产线编码" :value="entity.code" :border="false" />
            <u-cell title="运行状态" :value="entity.status" :border="false" />
            <u-cell title="位置" :value="entity.location" :border="false" />
            <u-cell title="产能" :value="entity.capacity" :border="false" />
            <u-cell title="当前产量" :value="entity.currentOutput" :border="false" />
          </u-cell-group>
        </template>
        <template #foot>
          <view class="card-footer">
            <u-button type="primary" size="small" @click="handleEdit">
              <u-icon name="edit-pen" /> 编辑
            </u-button>
            <u-button type="error" size="small" @click="handleDelete">
              <u-icon name="trash" /> 删除
            </u-button>
            <u-button type="info" size="small" @click="handleBack">
              <u-icon name="arrow-left" /> 返回
            </u-button>
          </view>
        </template>
      </u-card>
    </view>

    <!-- 空状态 -->
    <u-empty v-else mode="data" text="数据加载失败或不存在" icon="http://cdn.uviewui.com/uview/empty/data.png" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useProductionLineStore } from '@/stores/production-line-store'
import { useAuthGuard } from '@/middleware/auth'
import type { ProductionLineDto } from '@/types/production-line.types'

// ✅ 认证守卫（符合铁律2：控件完整性）
const { checkLogin, isAuthenticated } = useAuthGuard()

const productionLineStore = useProductionLineStore()
const entity = ref<ProductionLineDto>({} as ProductionLineDto)
const loading = ref(false)
const entityId = ref<string | null>(null)

onLoad((options) => {
  // ✅ 检查登录状态
  checkLogin()
  
  if (options?.id) {
    entityId.value = options.id
    loadEntityData(options.id)
  }
})

async function loadEntityData(id: string) {
  // ✅ 检查登录状态
  if (!isAuthenticated) {
    checkLogin()
    return
  }
  
  loading.value = true
  try {
    entity.value = await productionLineStore.getById(id)
  } catch (error: any) {
    // ✅ 完善错误处理（符合铁律2：控件完整性）
    const errorMessage = error?.response?.data?.error?.message || error?.message || '加载失败'
    uni.showModal({
      title: '加载失败',
      content: errorMessage,
      showCancel: false,
      confirmText: '知道了'
    })
    console.error('Load entity error:', error)
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  if (!entityId.value) return
  uni.navigateTo({
    url: `/pages/production-line/form?id=$${entityId.value}`
  })
}

async function handleDelete() {
  // ✅ 检查登录状态
  if (!isAuthenticated) {
    checkLogin()
    return
  }
  
  // ✅ 二次确认（符合铁律2：控件完整性）
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确认删除吗？',
      confirmText: '确认删除',
      cancelText: '取消',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
  
  if (!confirmed) return

  try {
    await productionLineStore.delete(entityId.value!)
    uni.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 1500
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    // ✅ 完善错误处理（符合铁律2：控件完整性）
    const errorMessage = error?.response?.data?.error?.message || error?.message || '删除失败'
    uni.showModal({
      title: '删除失败',
      content: errorMessage,
      showCancel: false,
      confirmText: '知道了'
    })
    console.error('Delete entity error:', error)
  }
}

function handleBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.detail-content {
  animation: fadeIn 0.3s ease-in;
}

.card-footer {
  display: flex;
  gap: 20rpx;
  justify-content: space-between;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<!-- 
  生成时间: 2025-10-22 11:49:08
  生成器: SmartAbp DevKit Low-Code Engine
  组件库: uView UI 3.2.7
  类型安全: 100% TypeScript
-->
