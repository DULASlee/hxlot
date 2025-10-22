<!-- pages/equipment/form.vue -->
<template>
  <view class="form-page">
    <u-form :model="form" :rules="rules" ref="formRef" label-width="160">
      <u-form-item label="设备名称" prop="name" required>
        <u-input v-model="form.name" placeholder="请输入设备名称" clearable />
      </u-form-item>
      <u-form-item label="设备编码" prop="code" required>
        <u-input v-model="form.code" placeholder="请输入设备编码" clearable />
      </u-form-item>
      <u-form-item label="设备类型" prop="type" required>
        <u-select v-model="form.type" :list="enumOptions.type" />
      </u-form-item>
      <u-form-item label="所属生产线" prop="productionLineId" required>
        <u-input v-model="form.productionLineId" placeholder="请输入所属生产线" clearable />
      </u-form-item>
      <u-form-item label="是否在线" prop="isOnline" >
        <u-switch v-model="form.isOnline" />
      </u-form-item>
      <u-form-item label="运行时长(小时)" prop="operatingHours" >
        <u-number-box v-model="form.operatingHours" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="最后维护日期" prop="lastMaintenanceDate" >
        <u-datetime-picker v-model="form.lastMaintenanceDate" mode="datetime" />
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
import { useEquipmentStore } from '@/stores/equipment-store'
import type { CreateEquipmentDto, UpdateEquipmentDto, EquipmentDto } from '@/types/equipment.types'
import { uniToast } from '@/utils/uni-tools'

const equipmentStore = useEquipmentStore()
const formRef = ref<any>(null)
const isEdit = ref(false)
const entityId = ref<string | null>(null)
const submitting = ref(false)

const form = reactive<CreateEquipmentDto | UpdateEquipmentDto>({
  name: '',
  code: '',
  type: '',
  productionLineId: '',
  isOnline: false,
  operatingHours: 0,
  lastMaintenanceDate: new Date()
})

const rules = reactive<any>({
  name: [
    { required: true, message: '请输入设备名称', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入设备编码', trigger: ['blur', 'change'] }
  ],
  type: [
    { required: true, message: '请输入设备类型', trigger: ['blur', 'change'] }
  ],
  productionLineId: [
    { required: true, message: '请输入所属生产线', trigger: ['blur', 'change'] }
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
    const data = await equipmentStore.getById(id)
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
      await equipmentStore.update(entityId.value!, form as UpdateEquipmentDto)
      uniToast('保存成功', 'success')
    } else {
      await equipmentStore.create(form as CreateEquipmentDto)
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
