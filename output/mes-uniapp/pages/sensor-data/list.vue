<!-- pages/sensor-data/list.vue -->
<template>
  <view class="list-page">
    <!-- 搜索栏 (uView UI) -->
    <u-search 
      v-model="searchKeyword" 
      @search="handleSearch" 
      placeholder="搜索传感器数据..." 
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
        <u-cell :title="item.equipmentid">
          <template #value>
            <view class="item-content">
              <view class="item-field">
                <text class="field-label">传感器类型:</text>
                <text class="field-value">{{ item.sensorType }}</text>
              </view>
              <view class="item-field">
                <text class="field-label">温度(℃):</text>
                <text class="field-value">{{ item.temperature }}</text>
              </view>
              <view class="item-field">
                <text class="field-label">压力(MPa):</text>
                <text class="field-value">{{ item.pressure }}</text>
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
      text="新增传感器数据" 
      @click="handleAdd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSensorDataStore } from '@/stores/sensor-data-store'
import type { SensorDataDto } from '@/types/sensor-data.types'

const sensorDataStore = useSensorDataStore()
const list = ref<SensorDataDto[]>([])
const searchKeyword = ref('')
const loading = ref(false)
const hasMore = ref(true)

async function loadData() {
  loading.value = true
  try {
    const result = await sensorDataStore.getList({ filter: searchKeyword.value })
    list.value = result.items
  } finally {
    loading.value = false
  }
}

function handleSearch() { loadData() }
function handleLoadMore() { /* 加载更多 */ }
function handleItemClick(item: SensorDataDto) {
  uni.navigateTo({ url: `/pages/sensor-data/detail?id=$${item.id}` })
}
function handleAdd() {
  uni.navigateTo({ url: `/pages/sensor-data/form` })
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
  生成时间: 2025-10-22 11:49:08
  生成器: SmartAbp DevKit Low-Code Engine
  组件库: uView UI 3.2.7
  类型安全: 100% TypeScript
-->
