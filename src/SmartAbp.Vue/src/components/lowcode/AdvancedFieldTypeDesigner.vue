<!-- 
基于企业级模板库的高级字段类型设计器
适用场景: 企业级字段类型定义、验证规则、UI控件配置
依赖项: Vue 3, SmartAbp低代码引擎, Element Plus
-->

<template>
  <div class="advanced-field-type-designer">
    <!-- 工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="activeTab === 'basic' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'basic'"
          >
            基础类型
          </el-button>
          <el-button
            :type="activeTab === 'custom' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'custom'"
          >
            自定义类型
          </el-button>
          <el-button
            :type="activeTab === 'validation' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'validation'"
          >
            验证规则
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-right">
        <el-button
          size="small"
          :disabled="!selectedField"
          @click="previewField"
        >
          预览字段
        </el-button>
        <el-button
          size="small"
          type="primary"
          :disabled="!isFieldTypeValid"
          @click="saveFieldType"
        >
          保存类型
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="designer-content">
      <!-- 左侧：字段类型列表 -->
      <div class="field-types-panel">
        <div class="panel-header">
          <h4>字段类型库</h4>
          <el-button
            size="small"
            @click="showAddTypeDialog = true"
          >
            新增类型
          </el-button>
        </div>
        
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索字段类型..."
            size="small"
            clearable
          />
        </div>
        
        <div class="types-list">
          <div
            v-for="fieldType in filteredFieldTypes"
            :key="fieldType.name"
            class="type-item"
            :class="{ 'type-item--selected': selectedFieldType?.name === fieldType.name }"
            @click="selectFieldType(fieldType)"
          >
            <div class="type-header">
              <span class="type-icon">{{ fieldType.icon }}</span>
              <span class="type-name">{{ fieldType.displayName }}</span>
            </div>
            <div class="type-description">
              {{ fieldType.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：配置面板 -->
      <div class="configuration-panel">
        <!-- 基础类型配置 -->
        <div
          v-if="activeTab === 'basic' && selectedFieldType"
          class="basic-config"
        >
          <h4>基础配置</h4>
          
          <el-form
            :model="fieldConfig"
            label-width="100px"
            size="small"
          >
            <el-form-item label="字段名称">
              <el-input
                v-model="fieldConfig.name"
                placeholder="请输入字段名称"
              />
            </el-form-item>
            
            <el-form-item label="显示名称">
              <el-input
                v-model="fieldConfig.displayName"
                placeholder="请输入显示名称"
              />
            </el-form-item>
            
            <el-form-item label="数据类型">
              <el-select
                v-model="fieldConfig.dataType"
                style="width: 100%"
              >
                <el-option
                  v-for="option in selectedFieldType.dataTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item
              v-if="fieldConfig.dataType === 'string'"
              label="长度限制"
            >
              <el-input-number
                v-model="fieldConfig.length"
                :min="0"
                :max="4000"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item
              v-if="fieldConfig.dataType === 'decimal'"
              label="精度"
            >
              <el-input-number
                v-model="fieldConfig.precision"
                :min="1"
                :max="38"
                style="width: 48%"
              />
              <span style="margin: 0 2%">.</span>
              <el-input-number
                v-model="fieldConfig.scale"
                :min="0"
                :max="fieldConfig.precision || 18"
                style="width: 48%"
              />
            </el-form-item>
            
            <el-form-item label="默认值">
              <el-input
                v-model="fieldConfig.defaultValue"
                placeholder="请输入默认值"
              />
            </el-form-item>
            
            <el-form-item label="是否必填">
              <el-switch v-model="fieldConfig.isRequired" />
            </el-form-item>
            
            <el-form-item label="是否主键">
              <el-switch v-model="fieldConfig.isPrimaryKey" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 自定义类型配置 -->
        <div
          v-else-if="activeTab === 'custom'"
          class="custom-config"
        >
          <h4>自定义类型配置</h4>
          
          <el-form
            :model="customTypeConfig"
            label-width="100px"
            size="small"
          >
            <el-form-item label="类型名称">
              <el-input
                v-model="customTypeConfig.typeName"
                placeholder="请输入类型名称"
              />
            </el-form-item>
            
            <el-form-item label="基础类型">
              <el-select
                v-model="customTypeConfig.baseType"
                style="width: 100%"
              >
                <el-option
                  label="字符串"
                  value="string"
                />
                <el-option
                  label="数字"
                  value="number"
                />
                <el-option
                  label="日期"
                  value="date"
                />
                <el-option
                  label="布尔"
                  value="boolean"
                />
                <el-option
                  label="枚举"
                  value="enum"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="验证模式">
              <el-input
                v-model="customTypeConfig.validationPattern"
                placeholder="请输入正则表达式"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
            
            <el-form-item label="格式化函数">
              <el-input
                v-model="customTypeConfig.formatFunction"
                placeholder="请输入格式化JavaScript代码"
                type="textarea"
                :rows="4"
              />
            </el-form-item>
            
            <el-form-item
              v-if="customTypeConfig.baseType === 'enum'"
              label="枚举选项"
            >
              <div class="enum-options">
                <div
                  v-for="(option, index) in customTypeConfig.enumOptions"
                  :key="index"
                  class="enum-option"
                >
                  <el-input
                    v-model="option.label"
                    placeholder="显示文本"
                    size="small"
                    style="width: 45%"
                  />
                  <el-input
                    v-model="option.value"
                    placeholder="值"
                    size="small"
                    style="width: 45%"
                  />
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click="removeEnumOption(index)"
                  >
                    删除
                  </el-button>
                </div>
                <el-button
                  size="small"
                  type="primary"
                  text
                  @click="addEnumOption"
                >
                  添加选项
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 验证规则配置 -->
        <div
          v-else-if="activeTab === 'validation'"
          class="validation-config"
        >
          <h4>验证规则</h4>
          
          <div class="validation-rules">
            <div
              v-for="(rule, index) in fieldConfig.validationRules"
              :key="index"
              class="validation-rule"
            >
              <el-select
                v-model="rule.type"
                style="width: 30%"
                size="small"
              >
                <el-option
                  label="必填"
                  value="required"
                />
                <el-option
                  label="长度"
                  value="length"
                />
                <el-option
                  label="范围"
                  value="range"
                />
                <el-option
                  label="正则"
                  value="regex"
                />
                <el-option
                  label="唯一"
                  value="unique"
                />
                <el-option
                  label="自定义"
                  value="custom"
                />
              </el-select>
              
              <el-input
                v-model="rule.value"
                placeholder="规则值"
                style="width: 35%"
                size="small"
              />
              
              <el-input
                v-model="rule.message"
                placeholder="错误信息"
                style="width: 30%"
                size="small"
              />
              
              <el-button
                size="small"
                type="danger"
                text
                @click="removeValidationRule(index)"
              >
                删除
              </el-button>
            </div>
            
            <el-button
              size="small"
              type="primary"
              text
              @click="addValidationRule"
            >
              添加规则
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：预览面板 -->
      <div class="preview-panel">
        <div class="panel-header">
          <h4>字段预览</h4>
        </div>
        
        <div class="preview-content">
          <div
            v-if="!selectedField"
            class="no-selection"
          >
            请选择或配置一个字段类型
          </div>
          
          <div
            v-else
            class="field-preview"
          >
            <!-- 表单控件预览 -->
            <div class="control-preview">
              <el-form-item :label="fieldConfig.displayName || fieldConfig.name">
                <component
                  :is="getPreviewComponent(fieldConfig.dataType)"
                  v-model="previewValue"
                  v-bind="getPreviewProps()"
                  :placeholder="`请输入${fieldConfig.displayName || fieldConfig.name}`"
                />
              </el-form-item>
            </div>
            
            <!-- 字段信息 -->
            <div class="field-info">
              <h5>字段信息</h5>
              <div class="info-item">
                <span class="label">数据类型:</span>
                <span class="value">{{ fieldConfig.dataType }}</span>
              </div>
              <div
                v-if="fieldConfig.length"
                class="info-item"
              >
                <span class="label">长度:</span>
                <span class="value">{{ fieldConfig.length }}</span>
              </div>
              <div class="info-item">
                <span class="label">必填:</span>
                <span class="value">{{ fieldConfig.isRequired ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <span class="label">主键:</span>
                <span class="value">{{ fieldConfig.isPrimaryKey ? '是' : '否' }}</span>
              </div>
            </div>
            
            <!-- 验证规则信息 -->
            <div
              v-if="fieldConfig.validationRules.length > 0"
              class="validation-info"
            >
              <h5>验证规则</h5>
              <div
                v-for="rule in fieldConfig.validationRules"
                :key="rule.type"
                class="validation-rule-info"
              >
                <span class="rule-type">{{ getValidationRuleLabel(rule.type) }}</span>
                <span class="rule-value">{{ rule.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增字段类型对话框 -->
    <el-dialog
      v-model="showAddTypeDialog"
      title="新增字段类型"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addTypeFormRef"
        :model="newTypeForm"
        :rules="newTypeFormRules"
        label-width="100px"
      >
        <el-form-item
          label="类型名称"
          prop="name"
        >
          <el-input
            v-model="newTypeForm.name"
            placeholder="请输入类型名称"
          />
        </el-form-item>
        
        <el-form-item
          label="显示名称"
          prop="displayName"
        >
          <el-input
            v-model="newTypeForm.displayName"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        
        <el-form-item
          label="图标"
          prop="icon"
        >
          <el-input
            v-model="newTypeForm.icon"
            placeholder="请输入图标"
          />
        </el-form-item>
        
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="newTypeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddTypeDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmAddType"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { type EntityField } from '@/stores/lowcode/entityModeling'
import { logger } from '@/utils/logger'

// Props
interface Props {
  selectedField?: EntityField
  entityFields?: EntityField[]
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'field-updated': [field: EntityField]
  'field-validated': [field: EntityField, isValid: boolean]
  'field-type-created': [fieldType: any]
}>()

// Store - 暂时注释未使用
// const entityStore = useEntityModelingStore()

// 响应式数据
const addTypeFormRef = ref()
const activeTab = ref<'basic' | 'custom' | 'validation'>('basic')
const searchKeyword = ref('')
const selectedFieldType = ref<any>(null)
const previewValue = ref<any>('')

// UI状态
const showAddTypeDialog = ref(false)

// 字段配置
const fieldConfig = ref({
  name: '',
  displayName: '',
  dataType: 'string',
  length: 255,
  precision: 18,
  scale: 2,
  defaultValue: '',
  isRequired: false,
  isPrimaryKey: false,
  validationRules: [] as Array<{
    type: string
    value: string
    message: string
  }>
})

// 自定义类型配置
const customTypeConfig = ref({
  typeName: '',
  baseType: 'string',
  validationPattern: '',
  formatFunction: '',
  enumOptions: [] as Array<{ label: string; value: string }>
})

// 新增类型表单
const newTypeForm = ref({
  name: '',
  displayName: '',
  icon: '🔤',
  description: ''
})

// 内置字段类型
const builtInFieldTypes = ref([
  {
    name: 'string',
    displayName: '字符串',
    icon: '🔤',
    description: '文本字符串类型',
    dataTypeOptions: [
      { label: 'string', value: 'string' },
      { label: 'text', value: 'text' }
    ]
  },
  {
    name: 'int',
    displayName: '整数',
    icon: '🔢',
    description: '32位整数类型',
    dataTypeOptions: [
      { label: 'int', value: 'int' },
      { label: 'long', value: 'long' }
    ]
  },
  {
    name: 'decimal',
    displayName: '小数',
    icon: '💰',
    description: '高精度小数类型',
    dataTypeOptions: [
      { label: 'decimal', value: 'decimal' },
      { label: 'double', value: 'double' }
    ]
  },
  {
    name: 'datetime',
    displayName: '日期时间',
    icon: '📅',
    description: '日期时间类型',
    dataTypeOptions: [
      { label: 'DateTime', value: 'DateTime' },
      { label: 'DateOnly', value: 'DateOnly' },
      { label: 'TimeOnly', value: 'TimeOnly' }
    ]
  },
  {
    name: 'bool',
    displayName: '布尔',
    icon: '✅',
    description: '布尔值类型',
    dataTypeOptions: [
      { label: 'bool', value: 'bool' }
    ]
  },
  {
    name: 'guid',
    displayName: 'GUID',
    icon: '🔑',
    description: '全局唯一标识符',
    dataTypeOptions: [
      { label: 'Guid', value: 'Guid' }
    ]
  }
])

// 表单验证规则
const newTypeFormRules = {
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ]
}

// 计算属性
const filteredFieldTypes = computed(() => {
  if (!searchKeyword.value) {
    return builtInFieldTypes.value
  }
  return builtInFieldTypes.value.filter(type =>
    type.displayName.includes(searchKeyword.value) ||
    type.description.includes(searchKeyword.value)
  )
})

const selectedField = computed(() => {
  return props.selectedField || null
})

const isFieldTypeValid = computed(() => {
  return fieldConfig.value.name && fieldConfig.value.dataType
})

// 方法
const selectFieldType = (fieldType: any) => {
  selectedFieldType.value = fieldType
  
  // 重置字段配置
  fieldConfig.value = {
    name: '',
    displayName: '',
    dataType: fieldType.dataTypeOptions[0]?.value || 'string',
    length: fieldType.name === 'string' ? 255 : 0,
    precision: fieldType.name === 'decimal' ? 18 : 0,
    scale: fieldType.name === 'decimal' ? 2 : 0,
    defaultValue: '',
    isRequired: false,
    isPrimaryKey: false,
    validationRules: []
  }
  
  logger?.info('选择字段类型', { fieldType: fieldType.name })
}

const addValidationRule = () => {
  fieldConfig.value.validationRules.push({
    type: 'required',
    value: '',
    message: ''
  })
}

const removeValidationRule = (index: number) => {
  fieldConfig.value.validationRules.splice(index, 1)
}

const addEnumOption = () => {
  customTypeConfig.value.enumOptions.push({
    label: '',
    value: ''
  })
}

const removeEnumOption = (index: number) => {
  customTypeConfig.value.enumOptions.splice(index, 1)
}

const getPreviewComponent = (dataType: string) => {
  const componentMap: Record<string, string> = {
    'string': 'el-input',
    'text': 'el-input',
    'int': 'el-input-number',
    'long': 'el-input-number',
    'decimal': 'el-input-number',
    'double': 'el-input-number',
    'DateTime': 'el-date-picker',
    'DateOnly': 'el-date-picker',
    'TimeOnly': 'el-time-picker',
    'bool': 'el-switch',
    'Guid': 'el-input'
  }
  return componentMap[dataType] || 'el-input'
}

const getPreviewProps = () => {
  const dataType = fieldConfig.value.dataType
  const props: Record<string, any> = {}
  
  if (dataType === 'text') {
    props.type = 'textarea'
    props.rows = 3
  } else if (dataType === 'DateTime') {
    props.type = 'datetime'
  } else if (dataType === 'DateOnly') {
    props.type = 'date'
  } else if (['int', 'long', 'decimal', 'double'].includes(dataType)) {
    if (fieldConfig.value.precision) {
      props.precision = fieldConfig.value.scale || 0
    }
  }
  
  return props
}

const getValidationRuleLabel = (type: string) => {
  const labels: Record<string, string> = {
    'required': '必填',
    'length': '长度',
    'range': '范围',
    'regex': '正则',
    'unique': '唯一',
    'custom': '自定义'
  }
  return labels[type] || type
}

const previewField = () => {
  if (!selectedField.value) return
  
  // 更新预览值
  previewValue.value = fieldConfig.value.defaultValue || ''
  
  ElMessage.success('字段预览已更新')
  logger?.info('预览字段', { field: fieldConfig.value })
}

const saveFieldType = () => {
  if (!isFieldTypeValid.value) {
    ElMessage.warning('请完善字段类型配置')
    return
  }
  
  // 构建符合EntityField接口的字段对象
  const newField: EntityField = {
    name: fieldConfig.value.name,
    displayName: fieldConfig.value.displayName,
    type: fieldConfig.value.dataType,
    isRequired: fieldConfig.value.isRequired,
    isPrimaryKey: fieldConfig.value.isPrimaryKey,
    defaultValue: fieldConfig.value.defaultValue,
    description: `${selectedFieldType.value?.displayName || ''}类型字段`
  }
  
  // 只有当length有有效值时才添加该属性
  if (fieldConfig.value.length && fieldConfig.value.length > 0) {
    newField.length = fieldConfig.value.length
  }
  
  emit('field-updated', newField)
  
  ElMessage.success('字段类型保存成功')
  logger?.info('保存字段类型', { field: newField })
}

const confirmAddType = async () => {
  try {
    await addTypeFormRef.value?.validate()
    
    const newType = {
      id: `custom_${Date.now()}`,
      ...newTypeForm.value,
      category: 'custom',
      dataTypeOptions: [
        { label: newTypeForm.value.name, value: newTypeForm.value.name }
      ]
    }
    
    builtInFieldTypes.value.push(newType)
    emit('field-type-created', newType)
    
    showAddTypeDialog.value = false
    
    // 重置表单
    newTypeForm.value = {
      name: '',
      displayName: '',
      icon: '🔤',
      description: ''
    }
    
    ElMessage.success('字段类型创建成功')
    logger?.info('创建自定义字段类型', { type: newType })
  } catch (error) {
    logger?.error('创建字段类型失败', error)
  }
}

// 生命周期
onMounted(() => {
  // 如果有选中的字段，初始化配置
  if (selectedField.value) {
    const matchingType = builtInFieldTypes.value.find(type => 
      type.dataTypeOptions.some(option => option.value === selectedField.value?.type)
    )
    
    if (matchingType) {
      selectFieldType(matchingType)
      
      fieldConfig.value = {
        name: selectedField.value.name,
        displayName: selectedField.value.displayName,
        dataType: selectedField.value.type,
        length: selectedField.value.length ?? 255, // 使用空值合并提供默认值
        precision: 18,
        scale: 2,
        defaultValue: selectedField.value.defaultValue || '',
        isRequired: selectedField.value.isRequired,
        isPrimaryKey: selectedField.value.isPrimaryKey,
        validationRules: []
      }
    }
  }
  
  logger?.info('高级字段类型设计器初始化完成')
})
</script>

<style scoped>
.advanced-field-type-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.designer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.designer-content {
  display: flex;
  flex: 1;
  height: 0;
}

.field-types-panel {
  width: 300px;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.panel-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.search-section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.types-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.type-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.type-item--selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.type-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.type-icon {
  font-size: 16px;
}

.type-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.type-description {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.configuration-panel {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.configuration-panel h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.enum-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enum-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.validation-rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-rule {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-panel {
  width: 350px;
  border-left: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.field-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-preview {
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: white;
}

.field-info,
.validation-info {
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: white;
}

.field-info h5,
.validation-info h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.info-item .label {
  color: var(--el-text-color-regular);
}

.info-item .value {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.validation-rule-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.rule-type {
  color: var(--el-color-primary);
  font-weight: 500;
}

.rule-value {
  color: var(--el-text-color-regular);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .field-types-panel {
    width: 250px;
  }
  
  .preview-panel {
    width: 300px;
  }
}
</style>
