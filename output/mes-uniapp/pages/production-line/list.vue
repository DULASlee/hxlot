<!-- pages/production-line/list.vue -->
<template>
  <view class="list-page">
    <!-- 搜索栏 (uView UI) -->
    <u-search 
      v-model="searchKeyword" 
      @search="handleSearch" 
      placeholder="搜索生产线..." 
      :showAction="true" 
      actionText="搜索"
    />

    <!-- 列表内容 (uView UI) -->
    <u-list
      @scrolltolower="handleLoadMore"
      :loading="loading"
      :finished="!hasMore"
      finishedText="没有更多了"
    >
      <u-list-item 
        v-for="item in list" 
        :key="item.id" 
        @click="handleItemClick(item)"
      >
        <u-cell :title="item.name">
          <template #value>
            <view class="item-content">
              <view class="item-field">
                <text class="field-label">生产线编码:</text>
                <text class="field-value">{{ item.code }}</text>
              </view>
              <view class="item-field">
                <text class="field-label">运行状态:</text>
                <text class="field-value">{{ item.status }}</text>
              </view>
              <view class="item-field">
                <text class="field-label">位置:</text>
                <text class="field-value">{{ item.location }}</text>
              </view>
            </view>
          </template>
          <template #right-icon>
            <u-icon name="arrow-right" color="#909399" size="18" />
          </template>
        </u-cell>
      </u-list-item>
    </u-list>

    <!-- 新增按钮 (uView UI) -->
    <u-fab 
      :bottom="160" 
      :right="40" 
      icon="plus" 
      text="新增生产线" 
      @click="handleAdd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductionLineStore } from '@/stores/production-line-store'
import { useAuthGuard } from '@/middleware/auth'
import type { ProductionLineDto } from '@/types/production-line.types'

// ✅ 认证守卫（符合铁律2：控件完整性）
const { checkLogin, isAuthenticated } = useAuthGuard()

const productionLineStore = useProductionLineStore()
const list = ref<ProductionLineDto[]>([])
const searchKeyword = ref('')
const loading = ref(false)
const hasMore = ref(true)

async function loadData() {
  // ✅ 检查登录状态
  if (!isAuthenticated) {
    checkLogin()
    return
  }
  
  loading.value = true
  try {
    const result = await productionLineStore.getList({ filter: searchKeyword.value })
    list.value = result.items
  } catch (error: any) {
    // ✅ 错误处理
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

function handleSearch() { loadData() }
function handleLoadMore() { /* 加载更多 */ }
function handleItemClick(item: ProductionLineDto) {
  uni.navigateTo({ url: `/pages/production-line/detail?id=${item.id}` })
}
function handleAdd() {
  uni.navigateTo({ url: `/pages/production-line/form` })
}

// ✅ 页面加载时检查登录并加载数据
onMounted(() => {
  checkLogin()
  loadData()
})
</script>

<style scoped lang="scss">
.list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.item-field {
  display: flex;
  margin-bottom: 8rpx;
}
.field-label {
  color: #909399;
  margin-right: 16rpx;
}
</style>

<!-- 
  生成时间: 2025-10-22 11:49:07
  生成器: SmartAbp DevKit Low-Code Engine
  组件库: uView UI 3.2.7
  类型安全: 100% TypeScript
-->
