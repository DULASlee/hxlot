<!-- pages/equipment/list.vue -->
<template>
  <view class="list-page">
    <!-- 搜索栏 (uView UI) -->
    <u-search 
      v-model="searchKeyword" 
      @search="handleSearch" 
      placeholder="搜索设备..." 
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
                <text class="field-label">设备编码:</text>
                <text class="field-value">{{ item.code }}</text>
              </view>
              <view class="item-field">
                <text class="field-label">设备类型:</text>
                <text class="field-value">{{ item.type }}</text>
              </view>
              <view class="item-field">
                <text class="field-label">所属生产线:</text>
                <text class="field-value">{{ item.productionLineId }}</text>
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
      text="新增设备" 
      @click="handleAdd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEquipmentStore } from '@/stores/equipment-store'
import type { EquipmentDto } from '@/types/equipment.types'

const equipmentStore = useEquipmentStore()
const list = ref<EquipmentDto[]>([])
const searchKeyword = ref('')
const loading = ref(false)
const hasMore = ref(true)

async function loadData() {
  loading.value = true
  try {
    const result = await equipmentStore.getList({ filter: searchKeyword.value })
    list.value = result.items
  } finally {
    loading.value = false
  }
}

function handleSearch() { loadData() }
function handleLoadMore() { /* 加载更多 */ }
function handleItemClick(item: EquipmentDto) {
  uni.navigateTo({ url: `/pages/equipment/detail?id=${item.id}` })
}
function handleAdd() {
  uni.navigateTo({ url: `/pages/equipment/form` })
}

loadData()
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
  生成时间: 2025-10-22 10:17:01
  生成器: SmartAbp DevKit Low-Code Engine
  组件库: uView UI 2.0.0
  类型安全: 100% TypeScript
-->
