<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item
      label="服务名称"
      prop="name"
      required
    >
      <el-input
        v-model="formData.name"
        placeholder="例如: user-service"
      />
      <span class="field-hint">用于服务标识，建议使用kebab-case</span>
    </el-form-item>
    
    <el-form-item
      label="项目名称"
      prop="projectName"
      required
    >
      <el-input
        v-model="formData.projectName"
        placeholder="例如: UserService"
      />
      <span class="field-hint">C#项目名称，使用PascalCase</span>
    </el-form-item>
    
    <el-form-item
      label="显示名称"
      prop="displayName"
      required
    >
      <el-input
        v-model="formData.displayName"
        placeholder="例如: 用户服务"
      />
    </el-form-item>
    
    <el-form-item
      label="描述"
      prop="description"
    >
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
        placeholder="简要描述此微服务的职责和功能..."
      />
    </el-form-item>
    
    <el-form-item
      label="副本数量"
      prop="replicas"
    >
      <el-input-number
        v-model="formData.replicas"
        :min="1"
        :max="10"
      />
      <span class="field-hint">生产环境建议至少2个副本</span>
    </el-form-item>
    
    <el-divider>可选特性</el-divider>
    
    <el-form-item label="Dapr集成">
      <el-switch v-model="formData.useDapr" />
    </el-form-item>
    
    <el-form-item label="服务发现">
      <el-switch v-model="formData.useServiceDiscovery" />
    </el-form-item>
    
    <el-form-item label="健康检查">
      <el-switch v-model="formData.useHealthChecks" />
    </el-form-item>
    
    <el-form-item label="OpenTelemetry">
      <el-switch v-model="formData.useOpenTelemetry" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: any
  existingServices?: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const formRef = ref<FormInstance>()
const formData = ref({ ...props.modelValue })

const rules: FormRules = {
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9-]*$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ],
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '必须以大写字母开头', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (newVal) => {
  formData.value = { ...newVal }
}, { deep: true })

watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })
</script>

<style scoped lang="scss">
.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>

