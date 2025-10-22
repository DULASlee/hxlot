<!-- pages/production-line/form.vue -->
<template>
  <view class="form-page">
    <u-form :model="form" :rules="rules" ref="formRef" label-width="160">
      <u-form-item label="生产线名称" prop="name" required>
        <u-input v-model="form.name" placeholder="请输入生产线名称" clearable />
      </u-form-item>
      <u-form-item label="生产线编码" prop="code" required>
        <u-input v-model="form.code" placeholder="请输入生产线编码" clearable />
      </u-form-item>
      <u-form-item label="运行状态" prop="status" required>
        <u-select v-model="form.status" :list="enumOptions.status" />
      </u-form-item>
      <u-form-item label="位置" prop="location" >
        <u-input v-model="form.location" placeholder="请输入位置" clearable />
      </u-form-item>
      <u-form-item label="产能" prop="capacity" >
        <u-number-box v-model="form.capacity" :min="0" :step="1" />
      </u-form-item>
      <u-form-item label="当前产量" prop="currentOutput" >
        <u-number-box v-model="form.currentOutput" :min="0" :step="1" />
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
import { useProductionLineStore } from '@/stores/production-line-store'
import type { CreateProductionLineDto, UpdateProductionLineDto, ProductionLineDto } from '@/types/production-line.types'
import { uniToast } from '@/utils/uni-tools'

const productionLineStore = useProductionLineStore()
const formRef = ref<any>(null)
const isEdit = ref(false)
const entityId = ref<string | null>(null)
const submitting = ref(false)

const form = reactive<CreateProductionLineDto | UpdateProductionLineDto>({
  name: '',
  code: '',
  status: '',
  location: '',
  capacity: 0,
  currentOutput: 0
})

const rules = reactive<any>({
  name: [
    { required: true, message: '请输入生产线名称', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入生产线编码', trigger: ['blur', 'change'] }
  ],
  status: [
    { required: true, message: '请输入运行状态', trigger: ['blur', 'change'] }
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
    const data = await productionLineStore.getById(id)
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
      await productionLineStore.update(entityId.value!, form as UpdateProductionLineDto)
      uniToast('保存成功', 'success')
    } else {
      await productionLineStore.create(form as CreateProductionLineDto)
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
