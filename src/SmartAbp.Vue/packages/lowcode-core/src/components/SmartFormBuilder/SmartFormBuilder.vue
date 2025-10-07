<template>
  <div class="smart-form-builder">
    <!-- form-create核心渲染器 -->
    <form-create v-model:api="formApi" v-model="formData" :rule="formRules" :option="formOptions" @submit="handleSubmit"
      @reset="handleReset" />
  </div>
</template>

<script setup lang="ts">
import type { Api } from '@form-create/element-ui'
import formCreate from '@form-create/element-ui'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { FormSchemaAdapter } from './adapters/FormSchemaAdapter'
import { FormLinkageEngine } from './engine/FormLinkageEngine'
import type { FormCreateConfig, FormCreateRule } from './types/form-create-types'
import type { CalculatedFieldConfig, CascadeConfig, DynamicFieldConfig, LinkageRule } from './types/linkage-types'

/**
 * @component SmartFormBuilder
 * @description SmartAbp企业级表单构建器 2.0
 * 
 * 核心特性：
 * - ✅ 真实集成form-create（不是假的Element Plus封装！）
 * - ✅ 支持30+标准字段类型
 * - ✅ 支持10+MES/IoT自定义字段
 * - ✅ 完整的验证规则转换
 * - ✅ 动态表单数据绑定
 * - ✅ 实时验证反馈
 * - ✅ 🆕 动态表单与字段联动
 * - ✅ 🆕 级联选择器
 * - ✅ 🆕 动态字段添加/删除
 * - ✅ 🆕 字段联动计算
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  /** 表单Schema（SmartAbp统一格式） */
  schema?: any
  /** 或直接传入form-create规则数组 */
  rules?: FormCreateRule[]
  /** 表单配置 */
  config?: Partial<FormCreateConfig>
  /** 初始表单数据 */
  modelValue?: Record<string, any>
  /** 是否只读模式 */
  readonly?: boolean
  /** 是否禁用所有字段 */
  disabled?: boolean
  /** 🆕 联动规则数组 */
  linkageRules?: LinkageRule[]
  /** 🆕 级联配置数组 */
  cascadeConfigs?: CascadeConfig[]
  /** 🆕 动态字段配置数组 */
  dynamicFieldConfigs?: DynamicFieldConfig[]
  /** 🆕 计算字段配置数组 */
  calculatedFieldConfigs?: CalculatedFieldConfig[]
}

const props = withDefaults(defineProps<Props>(), {
  schema: undefined,
  rules: undefined,
  config: () => ({}),
  modelValue: () => ({}),
  readonly: false,
  disabled: false,
  linkageRules: () => [],
  cascadeConfigs: () => [],
  dynamicFieldConfigs: () => [],
  calculatedFieldConfigs: () => []
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Emits定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const emit = defineEmits<{
  (e: 'update:modelValue', data: Record<string, any>): void
  (e: 'submit', data: Record<string, any>): void
  (e: 'reset'): void
  (e: 'validate', result: { valid: boolean; errors?: any[] }): void
  (e: 'change', field: string, value: any): void
}>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式数据
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** form-create API实例 */
const formApi = ref<Api | null>(null)

/** 表单数据（v-model双向绑定） */
const formData = ref<Record<string, any>>({ ...props.modelValue })

/** 🆕 联动引擎实例（延迟初始化） */
let linkageEngine: FormLinkageEngine | null = null

/** form-create规则数组 */
const formRules = computed<FormCreateRule[]>(() => {
  // 优先使用直接传入的rules
  if (props.rules && props.rules.length > 0) {
    return props.rules
  }

  // 否则从schema转换
  if (props.schema) {
    try {
      return FormSchemaAdapter.toFormCreateRules(props.schema)
    } catch (error) {
      console.error('Failed to convert schema to form-create rules:', error)
      return []
    }
  }

  return []
})

/** form-create配置 */
const formOptions = computed<FormCreateConfig>(() => {
  const baseConfig: FormCreateConfig = {
    form: {
      labelPosition: 'right',
      labelWidth: '120px',
      size: 'default'
    },
    submitBtn: {
      show: true,
      innerText: '提交'
    },
    resetBtn: {
      show: true,
      innerText: '重置'
    }
  }

  // 合并用户配置
  if (props.schema?.config) {
    const schemaConfig = FormSchemaAdapter.toFormCreateConfig(props.schema.config)
    return {
      ...baseConfig,
      ...schemaConfig,
      ...props.config
    }
  }

  return {
    ...baseConfig,
    ...props.config
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 监听与同步
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 监听表单数据变化，同步到父组件 */
watch(formData, (newData) => {
  emit('update:modelValue', newData)
}, { deep: true })

/** 监听props.modelValue变化，同步到表单 */
watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    formData.value = { ...newValue }
    // 同步到form-create实例
    if (formApi.value) {
      formApi.value.setValue(newValue)
    }
  }
}, { deep: true })

/** 监听字段变化事件 */
watch(formData, (newData, oldData) => {
  // 找出变化的字段
  for (const key in newData) {
    if (newData[key] !== oldData?.[key]) {
      emit('change', key, newData[key])
      // 🆕 触发联动引擎（需要确保引擎已初始化）
      linkageEngine?.triggerFieldChange(key)
    }
  }
}, { deep: true })

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 表单操作方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 提交表单 */
const handleSubmit = async (formData: Record<string, any>) => {
  if (!formApi.value) return

  // 执行验证
  try {
    const valid = await formApi.value.validate()
    if (valid) {
      emit('submit', formData)
      emit('validate', { valid: true })
    }
  } catch (errors) {
    emit('validate', { valid: false, errors })
    console.error('Form validation failed:', errors)
  }
}

/** 重置表单 */
const handleReset = () => {
  if (formApi.value) {
    formApi.value.resetFields()
  }
  formData.value = { ...props.modelValue }
  emit('reset')
}

/** 验证整个表单 */
const validate = async (): Promise<boolean> => {
  if (!formApi.value) return false

  try {
    const valid = await formApi.value.validate()
    emit('validate', { valid, errors: [] })
    return valid
  } catch (errors: unknown) {
    emit('validate', { valid: false, errors: Array.isArray(errors) ? errors : [errors] })
    return false
  }
}

/** 验证单个字段 */
const validateField = async (field: string): Promise<boolean> => {
  if (!formApi.value) return false

  try {
    await formApi.value.validateField(field)
    return true
  } catch (error) {
    return false
  }
}

/** 清空验证结果 */
const clearValidate = (fields?: string | string[]) => {
  if (formApi.value) {
    formApi.value.clearValidateState(fields)
  }
}

/** 获取表单数据 */
const getFormData = (): Record<string, any> => {
  return formApi.value?.formData() || formData.value
}

/** 设置表单数据 */
const setFormData = (data: Record<string, any>) => {
  formData.value = { ...data }
  if (formApi.value) {
    formApi.value.setValue(data)
  }
}

/** 获取字段值 */
const getFieldValue = (field: string): any => {
  return formApi.value?.getValue(field) || formData.value[field]
}

/** 设置字段值 */
const setFieldValue = (field: string, value: any) => {
  if (formApi.value) {
    formApi.value.setValue({ [field]: value })
  }
  formData.value[field] = value
}

/** 禁用表单 */
const disableForm = (disabled = true) => {
  if (formApi.value) {
    formApi.value.disabled(disabled)
  }
}

/** 显示/隐藏字段 */
const setFieldVisible = (field: string, visible: boolean) => {
  if (formApi.value) {
    formApi.value.hidden(!visible, field)
  }
}

/** 更新字段规则 */
const updateRule = (field: string, rule: Partial<FormCreateRule>) => {
  if (formApi.value) {
    formApi.value.updateRule(field, rule)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 暴露给父组件的方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

defineExpose({
  /** form-create API实例 */
  formApi,
  /** 验证整个表单 */
  validate,
  /** 验证单个字段 */
  validateField,
  /** 清空验证 */
  clearValidate,
  /** 获取表单数据 */
  getFormData,
  /** 设置表单数据 */
  setFormData,
  /** 获取字段值 */
  getFieldValue,
  /** 设置字段值 */
  setFieldValue,
  /** 禁用表单 */
  disableForm,
  /** 显示/隐藏字段 */
  setFieldVisible,
  /** 更新字段规则 */
  updateRule,
  /** 重置表单 */
  reset: handleReset,

  // 🆕 联动引擎相关方法
  /** 联动引擎实例 */
  linkageEngine,
  /** 添加联动规则 */
  addLinkageRule: (rule: LinkageRule) => linkageEngine?.addRule(rule),
  /** 移除联动规则 */
  removeLinkageRule: (ruleId: string) => linkageEngine?.removeRule(ruleId),
  /** 添加级联配置 */
  addCascadeConfig: (cascade: CascadeConfig) => linkageEngine?.addCascade(cascade),
  /** 添加动态字段配置 */
  addDynamicFieldConfig: (config: DynamicFieldConfig) => linkageEngine?.addDynamicField(config),
  /** 添加计算字段配置 */
  addCalculatedFieldConfig: (config: CalculatedFieldConfig) => linkageEngine?.addCalculatedField(config),
  /** 手动触发字段变化 */
  triggerFieldChange: (fieldName: string) => linkageEngine?.triggerFieldChange(fieldName)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  // 初始化后应用只读/禁用状态
  if (props.readonly || props.disabled) {
    disableForm(true)
  }

  // 🆕 初始化联动引擎
  if (formApi.value && !linkageEngine) {
    linkageEngine = new FormLinkageEngine(formApi, formData)
    
    // 添加联动规则
    if (props.linkageRules && props.linkageRules.length > 0) {
      props.linkageRules.forEach(rule => linkageEngine!.addRule(rule))
    }

    // 添加级联配置
    if (props.cascadeConfigs && props.cascadeConfigs.length > 0) {
      props.cascadeConfigs.forEach(cascade => linkageEngine!.addCascade(cascade))
    }

    // 添加动态字段配置
    if (props.dynamicFieldConfigs && props.dynamicFieldConfigs.length > 0) {
      props.dynamicFieldConfigs.forEach(config => linkageEngine!.addDynamicField(config))
    }

    // 添加计算字段配置
    if (props.calculatedFieldConfigs && props.calculatedFieldConfigs.length > 0) {
      props.calculatedFieldConfigs.forEach(config => linkageEngine!.addCalculatedField(config))
    }

    // 初始化所有联动
    linkageEngine.initializeAll()
  }
})

// 🆕 清理联动引擎
onUnmounted(() => {
  linkageEngine?.cleanup()
})
</script>

<style scoped>
.smart-form-builder {
  width: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

/* 覆盖form-create默认样式 */
.smart-form-builder :deep(.form-create) {
  width: 100%;
}

/* 表单项间距 */
.smart-form-builder :deep(.el-form-item) {
  margin-bottom: 22px;
}

/* 按钮组样式 */
.smart-form-builder :deep(.el-form-item__content) {
  display: flex;
  gap: 12px;
}
</style>
