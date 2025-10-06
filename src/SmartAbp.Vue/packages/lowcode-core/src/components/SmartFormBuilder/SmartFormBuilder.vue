<template>
  <div class="smart-form-builder">
    <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="labelWidth" v-bind="$attrs">
      <el-form-item v-for="field in fields" :key="field.name" :label="field.label" :prop="field.name">
        <!-- 文本输入 -->
        <el-input v-if="field.type === 'text' || field.type === 'email'" v-model="formData[field.name]"
          :placeholder="field.placeholder" :disabled="field.disabled" />

        <!-- 数字输入 -->
        <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.name]" :min="field.min"
          :max="field.max" :disabled="field.disabled" />

        <!-- 下拉选择 -->
        <el-select v-else-if="field.type === 'select'" v-model="formData[field.name]" :placeholder="field.placeholder"
          :disabled="field.disabled">
          <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <!-- 日期选择 -->
        <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.name]" type="date"
          :placeholder="field.placeholder" :disabled="field.disabled" />

        <!-- 开关 -->
        <el-switch v-else-if="field.type === 'switch'" v-model="formData[field.name]" :disabled="field.disabled" />

        <!-- 多行文本 -->
        <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.name]" type="textarea"
          :rows="field.rows || 3" :placeholder="field.placeholder" :disabled="field.disabled" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElSwitch
} from 'element-plus'
import { reactive, ref } from 'vue'

interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'switch' | 'textarea' | 'email'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  min?: number
  max?: number
  rows?: number
  options?: Array<{ label: string; value: any }>
  validator?: (value: any) => boolean | string
}

interface Props {
  fields: FormField[]
  labelWidth?: string | number
  initialData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '120px',
  initialData: () => ({})
})

const emit = defineEmits<{
  (e: 'submit', data: Record<string, any>): void
  (e: 'reset'): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({ ...props.initialData })

const formRules = reactive<FormRules>(
  props.fields.reduce((rules, field) => {
    if (field.required || field.validator) {
      const ruleList: any[] = []
      if (field.required) {
        ruleList.push({ required: true, message: `${field.label}不能为空`, trigger: 'blur' })
      }
      if (field.validator) {
        ruleList.push({
          validator: (_rule: any, value: any, callback: any) => {
            const result = field.validator!(value)
            if (result === true) callback()
            else callback(new Error(typeof result === 'string' ? result : '验证失败'))
          },
          trigger: 'blur'
        })
      }
      // Element Plus FormRules 每个prop可为单个规则或数组，这里统一为数组
      ; (rules as any)[field.name] = ruleList
    }
    return rules
  }, {} as FormRules)
)

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', formData)
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}
</script>

<style scoped>
.smart-form-builder {
  width: 100%;
}
</style>
