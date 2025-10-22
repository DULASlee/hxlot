<!-- pages/sensor-data/form.vue -->
<template>
  <view class="form-page">
    <u-form :model="form" :rules="rules" ref="formRef" label-width="160">
      <u-form-item label="所属设备" prop="equipmentId" required>
        <u-input v-model="form.equipmentId" placeholder="请输入所属设备" clearable />
      </u-form-item>
      <u-form-item label="传感器类型" prop="sensorType" required>
        <u-input v-model="form.sensorType" placeholder="请输入传感器类型" clearable />
      </u-form-item>
      <u-form-item label="温度(℃)" prop="temperature" >
        <u-number-box v-model="form.temperature" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="压力(MPa)" prop="pressure" >
        <u-number-box v-model="form.pressure" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="湿度(%)" prop="humidity" >
        <u-number-box v-model="form.humidity" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="振动(mm/s)" prop="vibration" >
        <u-number-box v-model="form.vibration" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="功率(kW)" prop="power" >
        <u-number-box v-model="form.power" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="采集时间" prop="timestamp" required>
        <u-datetime-picker v-model="form.timestamp" mode="datetime" />
      </u-form-item>
      <u-form-item label="是否告警" prop="isAlarm" >
        <u-switch v-model="form.isAlarm" />
      </u-form-item>
    </u-form>

    <view class="form-actions">
      <u-button type="primary" @click="handleSubmit" :loading="submitting">
        <u-icon name="checkmark" /> {{ isEdit ? '保存' : '创建' }}
      </u-button>
      <u-button type="info" @click="handleCancel" :disabled="submitting">
        <u-icon name="close" /> 取消
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSensorDataStore } from '@/stores/sensor-data-store'
import type { CreateSensorDataDto, UpdateSensorDataDto, SensorDataDto } from '@/types/sensor-data.types'
import { uniToast } from '@/utils/uni-tools'

const sensorDataStore = useSensorDataStore()
const formRef = ref<any>(null)
const isEdit = ref(false)
const entityId = ref<string | null>(null)
const submitting = ref(false)

const form = reactive<CreateSensorDataDto | UpdateSensorDataDto>({
  equipmentId: '',
  sensorType: '',
  temperature: 0,
  pressure: 0,
  humidity: 0,
  vibration: 0,
  power: 0,
  timestamp: new Date(),
  isAlarm: false
})

const rules = reactive<any>({
  equipmentId: [
    { required: true, message: '请输入所属设备', trigger: ['blur', 'change'] }
  ],
  sensorType: [
    { required: true, message: '请输入传感器类型', trigger: ['blur', 'change'] }
  ],
  timestamp: [
    { required: true, message: '请输入采集时间', trigger: ['blur', 'change'] }
  ]
})

onLoad((options) => {
  if (options?.id) {
    entityId.value = options.id
    isEdit.value = true
    loadEntityData(options.id)
  }
})

async function loadEntityData(id: string) {
  try {
    const data = await sensorDataStore.getById(id)
    Object.assign(form, data)
  } catch (error) {
    uniToast('加载失败', 'error')
    console.error('Load entity error:', error)
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await sensorDataStore.update(entityId.value!, form as UpdateSensorDataDto)
      uniToast('保存成功', 'success')
    } else {
      await sensorDataStore.create(form as CreateSensorDataDto)
      uniToast('创建成功', 'success')
    }
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    uniToast(isEdit.value ? '保存失败' : '创建失败', 'error')
    console.error('Submit error:', error)
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.form-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  padding: 40rpx 20rpx;
}
</style>

<!-- 
  生成时间: 2025-10-22 11:49:08
  生成器: SmartAbp DevKit Low-Code Engine
  组件库: uView UI 3.2.7
  类型安全: 100% TypeScript
  表单验证: 完整实现
-->
