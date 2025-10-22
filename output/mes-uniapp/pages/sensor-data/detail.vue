<!-- pages/sensor-data/detail.vue -->
<template>
  <view class="detail-page">
    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" text="加载中..." mode="circle" size="36" />
    
    <!-- 数据展示 -->
    <view v-else-if="entity.id" class="detail-content">
      <!-- 基本信息卡片 (uView UI) -->
      <u-card :title="entity.equipmentid" :sub-title="'ID: ' + entity.id" :border="false">
        <template #body>
          <u-cell-group :border="false">
            <u-cell title="所属设备" :value="entity.equipmentId" :border="false" />
            <u-cell title="传感器类型" :value="entity.sensorType" :border="false" />
            <u-cell title="温度(℃)" :value="entity.temperature" :border="false" />
            <u-cell title="压力(MPa)" :value="entity.pressure" :border="false" />
            <u-cell title="湿度(%)" :value="entity.humidity" :border="false" />
            <u-cell title="振动(mm/s)" :value="entity.vibration" :border="false" />
            <u-cell title="功率(kW)" :value="entity.power" :border="false" />
            <u-cell title="采集时间" :value="entity.timestamp" :border="false" />
            <u-cell title="是否告警" :value="entity.isAlarm" :border="false" />
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
import { useSensorDataStore } from '@/stores/sensor-data-store'
import type { SensorDataDto } from '@/types/sensor-data.types'
import { uniToast, uniConfirm } from '@/utils/uni-tools'

const sensorDataStore = useSensorDataStore()
const entity = ref<SensorDataDto>({} as SensorDataDto)
const loading = ref(false)
const entityId = ref<string | null>(null)

onLoad((options) => {
  if (options?.id) {
    entityId.value = options.id
    loadEntityData(options.id)
  }
})

async function loadEntityData(id: string) {
  loading.value = true
  try {
    entity.value = await sensorDataStore.getById(id)
  } catch (error) {
    uniToast('加载失败', 'error')
    console.error('Load entity error:', error)
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  if (!entityId.value) return
  uni.navigateTo({
    url: `/pages/sensor-data/form?id=$${entityId.value}`
  })
}

async function handleDelete() {
  const confirmed = await uniConfirm('确认删除', '删除后无法恢复，确认删除吗？')
  if (!confirmed) return

  try {
    await sensorDataStore.delete(entityId.value!)
    uniToast('删除成功', 'success')
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    uniToast('删除失败', 'error')
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
