/**
 * 实体关联关系UI生成器
 * 
 * 功能：
 * - 根据RelationType生成不同的UI组件
 * - OneToMany: 主从表UI
 * - ManyToMany: 穿梭框/多选UI
 * - OneToOne: 关联选择器UI
 * - 支持企业级功能（批量操作、搜索、验证）
 * 
 * @example
 * ```typescript
 * const generator = new RelationshipUIGenerator()
 * const vueCode = generator.generate(navigationProperty, entityMetadata)
 * ```
 */

// 🚀 从metadata-core导入统一类型定义
import type {
  NavigationPropertyMetadata as CoreNavigationPropertyMetadata,
  EntityMetadata,
  PropertyMetadata
} from '@smartabp/metadata-core'

// 🔄 扩展NavigationPropertyMetadata以支持UI特定属性
export interface NavigationPropertyMetadata extends CoreNavigationPropertyMetadata {
  isLazyLoaded?: boolean
  displayField?: string
  valueField?: string
}

export interface RelationshipUICodeResult {
  /** Vue组件代码 */
  vueCode: string
  /** TypeScript类型定义 */
  typeCode: string
  /** Composable逻辑代码 */
  composableCode: string
}

/**
 * 关联关系UI生成器
 */
export class RelationshipUIGenerator {

  /**
   * 生成关联关系UI
   */
  public generate(
    navigation: NavigationPropertyMetadata,
    masterEntity: EntityMetadata,
    targetEntity: EntityMetadata
  ): RelationshipUICodeResult {

    switch (navigation.relationType) {
      case 'OneToMany':
        return this.generateOneToManyUI(navigation, masterEntity, targetEntity)

      case 'ManyToMany':
        return this.generateManyToManyUI(navigation, masterEntity, targetEntity)

      case 'OneToOne':
      case 'ManyToOne':
        return this.generateOneToOneUI(navigation, masterEntity, targetEntity)

      default:
        throw new Error(`Unsupported relation type: ${navigation.relationType}`)
    }
  }

  /**
   * 生成一对多（主从表）UI
   */
  private generateOneToManyUI(
    navigation: NavigationPropertyMetadata,
    masterEntity: EntityMetadata,
    detailEntity: EntityMetadata
  ): RelationshipUICodeResult {

    const masterFormFields = this.generateFormFields(masterEntity.properties)
    const detailTableColumns = this.generateTableColumns(detailEntity.properties)
    const detailFormFields = this.generateFormFields(detailEntity.properties)

    const vueCode = `<template>
  <div class="master-detail-container">
    <!-- 主表区域 -->
    <el-card class="master-section" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">${masterEntity.displayName}</span>
          <div class="actions">
            <el-button type="primary" @click="saveAll" :loading="loading">
              保存全部
            </el-button>
            <el-button @click="reset">重置</el-button>
            <el-button v-if="hasUnsavedChanges" @click="undo" type="warning">
              撤销
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form
        ref="masterFormRef"
        :model="masterForm"
        :rules="masterRules"
        label-width="120px"
        label-position="right"
      >
${masterFormFields}
      </el-form>
    </el-card>
    
    <!-- 从表区域 -->
    <el-card class="detail-section" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">${detailEntity.displayName}明细（{{ detailCount }}）</span>
          <div class="actions">
            <el-button 
              type="primary" 
              @click="handleAddDetail"
              :disabled="isMaxDetailReached"
            >
              <el-icon><Plus /></el-icon>
              添加明细
            </el-button>
            <el-button 
              type="danger" 
              @click="handleBatchDelete"
              :disabled="selectedDetails.length === 0"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button @click="loadDetails(masterForm.id)">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="detailList"
        v-loading="loading"
        @selection-change="handleDetailSelectionChange"
        border
        stripe
        max-height="500"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column type="index" label="#" width="60" fixed="left" />
${detailTableColumns}
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              link
              @click="handleEditDetail(row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              link
              @click="handleDeleteDetail(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 明细编辑对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="isDetailEditMode ? '编辑明细' : '新增明细'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="detailFormRef"
        :model="currentDetail"
        :rules="detailRules"
        label-width="120px"
      >
${detailFormFields}
      </el-form>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDetail">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, Refresh } from '@element-plus/icons-vue'
import { useMasterDetail } from '@smartabp/lowcode-core'
import type { ${masterEntity.name}, ${detailEntity.name} } from './types'

// Props
const props = defineProps<{
  masterId?: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:masterId', id: string): void
  (e: 'saved'): void
}>()

// 主从表逻辑
const {
  masterForm,
  detailList,
  selectedDetails,
  loading,
  hasUnsavedChanges,
  addDetail,
  editDetail,
  deleteDetail,
  batchDeleteDetails,
  loadDetails,
  saveAll: saveMasterDetail,
  validate,
  reset: resetMasterDetail,
  undo
} = useMasterDetail<${masterEntity.name}, ${detailEntity.name}>({
  masterApi: '${masterEntity.apiPath}',
  detailApi: '${detailEntity.apiPath}',
  foreignKey: '${navigation.foreignKey || 'masterId'}',
  initialMaster: {},
  maxDetailCount: 999,
  onMasterChange: async (master) => {
    emit('update:masterId', master.id)
  }
})

// 表单引用
const masterFormRef = ref()
const detailFormRef = ref()

// 明细对话框
const detailDialogVisible = ref(false)
const isDetailEditMode = ref(false)
const currentDetail = ref<Partial<${detailEntity.name}>>({})

// 计算属性
const detailCount = computed(() => detailList.value.length)
const isMaxDetailReached = computed(() => detailCount.value >= 999)

// 主表验证规则
const masterRules = {
${this.generateValidationRules(masterEntity.properties)}
}

// 从表验证规则
const detailRules = {
${this.generateValidationRules(detailEntity.properties)}
}

// 事件处理
const handleDetailSelectionChange = (selection: ${detailEntity.name}[]) => {
  selectedDetails.value = selection
}

const handleAddDetail = () => {
  currentDetail.value = {}
  isDetailEditMode.value = false
  detailDialogVisible.value = true
}

const handleEditDetail = (row: ${detailEntity.name}) => {
  currentDetail.value = { ...row }
  isDetailEditMode.value = true
  detailDialogVisible.value = true
}

const handleSaveDetail = async () => {
  await detailFormRef.value.validate()
  
  if (isDetailEditMode.value) {
    await editDetail(currentDetail.value as ${detailEntity.name})
  } else {
    await addDetail(currentDetail.value)
  }
  
  detailDialogVisible.value = false
}

const handleDeleteDetail = async (row: ${detailEntity.name}) => {
  await deleteDetail(row)
}

const handleBatchDelete = async () => {
  await batchDeleteDetails(selectedDetails.value)
}

const saveAll = async () => {
  await masterFormRef.value.validate()
  await saveMasterDetail()
  emit('saved')
}

const reset = () => {
  masterFormRef.value.resetFields()
  resetMasterDetail()
}

// 初始化
if (props.masterId) {
  loadDetails(props.masterId)
}
</script>

<style scoped lang="scss">
.master-detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .master-section {
    flex-shrink: 0;
  }
  
  .detail-section {
    flex: 1;
    min-height: 400px;
  }
}
</style>`

    const typeCode = this.generateTypeDefinitions(masterEntity, detailEntity)
    const composableCode = '' // 已经使用了useMasterDetail

    return { vueCode, typeCode, composableCode }
  }

  /**
   * 生成多对多UI
   */
  private generateManyToManyUI(
    navigation: NavigationPropertyMetadata,
    sourceEntity: EntityMetadata,
    targetEntity: EntityMetadata
  ): RelationshipUICodeResult {

    const displayField = navigation.displayField || 'name'
    const valueField = navigation.valueField || 'id'

    const vueCode = `<template>
  <div class="many-to-many-selector">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">${targetEntity.displayName}选择</span>
          <div class="info">
            已选择: {{ selectedCount }} / {{ totalCount }}
          </div>
        </div>
      </template>
      
      <!-- 搜索框 -->
      <div class="search-box" v-if="enableSearch">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索${targetEntity.displayName}..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <!-- 穿梭框 -->
      <el-transfer
        v-model="selectedIds"
        :data="transferData"
        :titles="['可选${targetEntity.displayName}', '已选${targetEntity.displayName}']"
        :button-texts="['移除', '添加']"
        :filter-method="filterMethod"
        filterable
        @change="handleTransferChange"
      >
        <template #default="{ option }">
          <span class="transfer-item">
            {{ option.label }}
          </span>
        </template>
      </el-transfer>
      
      <!-- 批量操作 -->
      <div class="batch-actions">
        <el-button 
          type="primary" 
          @click="handleSave"
          :loading="loading"
        >
          保存选择
        </el-button>
        <el-button @click="handleRefresh">刷新</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useManyToMany } from '@smartabp/lowcode-core'
import type { ${targetEntity.name} } from './types'

// Props
const props = withDefaults(defineProps<{
  entityId: string
  enableSearch?: boolean
}>(), {
  enableSearch: true
})

// Emits
const emit = defineEmits<{
  (e: 'saved', selectedIds: string[]): void
}>()

// 多对多关系逻辑
const {
  selectedItems,
  availableItems,
  allTargetItems,
  selectedIds,
  loading,
  searchKeyword,
  filteredAvailableItems,
  addRelations,
  removeRelations,
  loadData,
  refresh,
  search
} = useManyToMany<any, ${targetEntity.name}>({
  entityApi: '${sourceEntity.apiPath}',
  targetApi: '${targetEntity.apiPath}',
  relationApi: '${sourceEntity.apiPath}/${navigation.name}',
  entityId: props.entityId,
  displayField: '${displayField}',
  valueField: '${valueField}',
  enableSearch: props.enableSearch,
  enableVirtualScroll: true
})

// 穿梭框数据格式
const transferData = computed(() => {
  return allTargetItems.value.map((item: any) => ({
    key: item.${valueField},
    label: item.${displayField},
    disabled: false
  }))
})

// 统计
const selectedCount = computed(() => selectedItems.value.length)
const totalCount = computed(() => allTargetItems.value.length)

// 过滤方法
const filterMethod = (query: string, item: any) => {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

// 事件处理
const handleTransferChange = async (value: string[], direction: 'left' | 'right', movedKeys: string[]) => {
  if (direction === 'right') {
    // 添加关联
    await addRelations(movedKeys)
  } else {
    // 移除关联
    await removeRelations(movedKeys)
  }
}

const handleSearch = (keyword: string) => {
  search(keyword)
}

const handleSave = () => {
  emit('saved', selectedIds.value)
}

const handleRefresh = async () => {
  await refresh()
}
</script>

<style scoped lang="scss">
.many-to-many-selector {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    
    .info {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
  
  .search-box {
    margin-bottom: 16px;
  }
  
  :deep(.el-transfer) {
    .el-transfer-panel {
      width: 45%;
    }
  }
  
  .transfer-item {
    display: block;
    padding: 4px 0;
  }
  
  .batch-actions {
    margin-top: 16px;
    display: flex;
    gap: 8px;
  }
}
</style>`

    const typeCode = this.generateTypeDefinitions(sourceEntity, targetEntity)
    const composableCode = '' // 已经使用了useManyToMany

    return { vueCode, typeCode, composableCode }
  }

  /**
   * 生成一对一/多对一UI（关联选择器）
   */
  private generateOneToOneUI(
    navigation: NavigationPropertyMetadata,
    sourceEntity: EntityMetadata,
    targetEntity: EntityMetadata
  ): RelationshipUICodeResult {

    const displayField = navigation.displayField || 'name'
    const valueField = navigation.valueField || 'id'

    const vueCode = `<template>
  <el-form-item 
    :label="label" 
    :prop="prop"
    :rules="rules"
  >
    <el-select
      v-model="modelValue"
      :placeholder="\`请选择\${label}\`"
      filterable
      remote
      :remote-method="handleRemoteSearch"
      :loading="loading"
      clearable
      @change="handleChange"
    >
      <el-option
        v-for="item in options"
        :key="item.${valueField}"
        :label="item.${displayField}"
        :value="item.${valueField}"
      />
    </el-select>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { ${targetEntity.name} } from './types'

// Props
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  prop?: string
  rules?: any[]
  apiPath?: string
}>(), {
  label: '${targetEntity.displayName}',
  apiPath: '${targetEntity.apiPath}'
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
  (e: 'change', value: string | undefined, item?: ${targetEntity.name}): void
}>()

// 状态
const options = ref<${targetEntity.name}[]>([])
const loading = ref(false)

// 加载选项
const loadOptions = async (keyword?: string) => {
  loading.value = true
  try {
    // 实际项目中调用API
    // const params = keyword ? { search: keyword } : {}
    // const response = await http.get(props.apiPath, { params })
    // options.value = response.data
    options.value = []
  } catch (error) {
    console.error('Load options error:', error)
  } finally {
    loading.value = false
  }
}

// 远程搜索（防抖）
const handleRemoteSearch = useDebounceFn((query: string) => {
  if (query) {
    loadOptions(query)
  } else {
    loadOptions()
  }
}, 300)

// 值变化
const handleChange = (value: string | undefined) => {
  emit('update:modelValue', value)
  const selectedItem = options.value.find(item => item.${valueField} === value)
  emit('change', value, selectedItem)
}

// 初始化加载
watch(() => props.modelValue, (newValue) => {
  if (newValue && options.value.length === 0) {
    loadOptions()
  }
}, { immediate: true })
</script>`

    const typeCode = this.generateTypeDefinitions(sourceEntity, targetEntity)
    const composableCode = ''

    return { vueCode, typeCode, composableCode }
  }

  /**
   * 生成表单字段
   */
  private generateFormFields(properties: PropertyMetadata[]): string {
    return properties.map(prop => {
      const inputType = this.getInputType(prop.type)
      return `        <el-form-item label="${prop.displayName}" prop="${prop.name}">
          <el-${inputType} 
            v-model="masterForm.${prop.name}" 
            placeholder="请输入${prop.displayName}"
            ${prop.maxLength ? `maxlength="${prop.maxLength}"` : ''}
            clearable
          />
        </el-form-item>`
    }).join('\n')
  }

  /**
   * 生成表格列
   */
  private generateTableColumns(properties: PropertyMetadata[]): string {
    return properties.map(prop => {
      return `        <el-table-column 
          prop="${prop.name}" 
          label="${prop.displayName}" 
          min-width="120"
          show-overflow-tooltip
        />`
    }).join('\n')
  }

  /**
   * 生成验证规则
   */
  private generateValidationRules(properties: PropertyMetadata[]): string {
    return properties
      .filter(prop => prop.isRequired)
      .map(prop => {
        return `  ${prop.name}: [
    { required: true, message: '请输入${prop.displayName}', trigger: 'blur' }
  ]`
      }).join(',\n')
  }

  /**
   * 生成类型定义
   */
  private generateTypeDefinitions(entity1: EntityMetadata, entity2: EntityMetadata): string {
    return `export interface ${entity1.name} {
${entity1.properties.map((p: any) => `  ${p.name}: ${this.mapToTypeScriptType(p.type)}`).join('\n')}
}

export interface ${entity2.name} {
${entity2.properties.map((p: any) => `  ${p.name}: ${this.mapToTypeScriptType(p.type)}`).join('\n')}
}`
  }

  /**
   * 获取输入控件类型
   */
  private getInputType(dataType: string): string {
    switch (dataType.toLowerCase()) {
      case 'string':
      case 'varchar':
        return 'input'
      case 'int':
      case 'number':
      case 'decimal':
        return 'input-number'
      case 'bool':
      case 'boolean':
        return 'switch'
      case 'date':
      case 'datetime':
        return 'date-picker'
      default:
        return 'input'
    }
  }

  /**
   * 映射到TypeScript类型
   */
  private mapToTypeScriptType(dataType: string): string {
    switch (dataType.toLowerCase()) {
      case 'string':
      case 'varchar':
      case 'guid':
        return 'string'
      case 'int':
      case 'number':
      case 'decimal':
      case 'double':
        return 'number'
      case 'bool':
      case 'boolean':
        return 'boolean'
      case 'date':
      case 'datetime':
        return 'Date | string'
      default:
        return 'any'
    }
  }
}

