<!-- 
基于企业级模板库的完整实体关系设计器
适用场景: 企业级实体关系建模、可视化设计、关系验证
依赖项: Vue 3, SmartAbp低代码引擎, Element Plus
-->

<template>
  <div class="advanced-entity-relationship-designer">
    <!-- 工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="currentMode === 'select' ? 'primary' : 'default'"
            size="small"
            @click="setMode('select')"
          >
            选择
          </el-button>
          <el-button
            :type="currentMode === 'entity' ? 'primary' : 'default'"
            size="small"
            @click="setMode('entity')"
          >
            添加实体
          </el-button>
          <el-button
            :type="currentMode === 'relation' ? 'primary' : 'default'"
            size="small"
            @click="setMode('relation')"
          >
            添加关系
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button
          size="small"
          :disabled="zoomLevel >= 200"
          @click="zoomIn"
        >
          放大
        </el-button>
        <span class="zoom-display">{{ zoomLevel }}%</span>
        <el-button
          size="small"
          :disabled="zoomLevel <= 50"
          @click="zoomOut"
        >
          缩小
        </el-button>
        
        <el-divider direction="vertical" />
        
        <el-button
          size="small"
          @click="autoLayout"
        >
          自动布局
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <el-button
          size="small"
          @click="validateRelationships"
        >
          验证关系
        </el-button>
        <el-button
          size="small"
          @click="exportSchema"
        >
          导出架构
        </el-button>
      </div>
    </div>

    <!-- 设计画布 -->
    <div
      ref="canvasRef"
      class="designer-canvas"
    >
      <div 
        class="canvas-content"
        :style="{ 
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left'
        }"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
      >
        <!-- 网格背景 -->
        <div
          v-show="showGrid"
          class="canvas-grid"
        />
        
        <!-- 实体节点 -->
        <div
          v-for="entity in positionedEntities"
          :key="entity.id"
          class="entity-node"
          :class="{
            'entity-node--selected': selectedEntityId === entity.id,
            'entity-node--dragging': draggingEntityId === entity.id
          }"
          :style="{
            left: `${entity.position.x}px`,
            top: `${entity.position.y}px`
          }"
          @mousedown="handleEntityMouseDown(entity, $event)"
          @click="handleEntityClick(entity)"
        >
          <!-- 实体头部 -->
          <div class="entity-header">
            <div class="entity-title">
              <span class="entity-name">{{ entity.displayName || entity.name }}</span>
            </div>
            <div class="entity-actions">
              <el-button
                size="small"
                text
                @click.stop="editEntity(entity)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                text
                type="danger"
                @click.stop="deleteEntity(entity.id)"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <!-- 实体字段列表 -->
          <div class="entity-fields">
            <div
              v-for="field in entity.fields"
              :key="field.name"
              class="entity-field"
              :class="{
                'entity-field--primary': field.isPrimaryKey,
                'entity-field--required': field.isRequired
              }"
            >
              <span class="field-name">{{ field.name }}</span>
              <span class="field-type">{{ field.type }}</span>
            </div>
          </div>
        </div>
        
        <!-- 关系连线SVG -->
        <svg
          class="relationships-svg"
          :width="canvasWidth"
          :height="canvasHeight"
        >
          <g
            v-for="relation in computedRelations"
            :key="relation.id"
            class="relationship-line"
            @click="selectRelation(relation.id)"
          >
            <path
              :d="relation.path"
              :stroke="getRelationColor(relation.type)"
              stroke-width="2"
              fill="none"
            />
            <text
              :x="relation.labelPosition.x"
              :y="relation.labelPosition.y"
              class="relationship-label"
              text-anchor="middle"
            >
              {{ getRelationTypeLabel(relation.type) }}
            </text>
          </g>
        </svg>
      </div>
    </div>

    <!-- 新增实体对话框 -->
    <el-dialog
      v-model="showEntityDialog"
      title="添加实体"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="entityFormRef"
        :model="newEntityForm"
        :rules="entityFormRules"
        label-width="100px"
      >
        <el-form-item
          label="实体名称"
          prop="name"
        >
          <el-input
            v-model="newEntityForm.name"
            placeholder="请输入实体名称（PascalCase）"
          />
        </el-form-item>
        <el-form-item
          label="显示名称"
          prop="displayName"
        >
          <el-input
            v-model="newEntityForm.displayName"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        <el-form-item
          label="表名"
          prop="tableName"
        >
          <el-input
            v-model="newEntityForm.tableName"
            placeholder="请输入数据库表名"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="newEntityForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入实体描述"
          />
        </el-form-item>
        <el-form-item
          label="分类"
          prop="category"
        >
          <el-select
            v-model="newEntityForm.category"
            style="width: 100%"
          >
            <el-option
              label="核心实体"
              value="core"
            />
            <el-option
              label="关系实体"
              value="relation"
            />
            <el-option
              label="配置实体"
              value="config"
            />
            <el-option
              label="日志实体"
              value="log"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEntityDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmAddEntity"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 验证结果对话框 -->
    <el-dialog
      v-model="showValidationDialog"
      title="关系验证结果"
      width="600px"
    >
      <div class="validation-results">
        <div
          v-if="validationResults.length === 0"
          class="validation-success"
        >
          <span>✅ 所有关系验证通过！</span>
        </div>
        <div v-else>
          <div
            v-for="(result, index) in validationResults"
            :key="index"
            class="validation-item"
            :class="`validation-item--${result.severity}`"
          >
            <span>{{ result.message }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEntityModelingStore, type EntityDefinition, type EntityRelation } from '@/stores/lowcode/entityModeling'
import { logger } from '@/utils/logger'

// Props
interface Props {
  entities?: EntityDefinition[]
  relations?: EntityRelation[]
  readonly?: boolean
  showGrid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  entities: () => [],
  relations: () => [],
  readonly: false,
  showGrid: true
})

// Events - 企业级事件处理，保持功能完整性
const emit = defineEmits<{
  'entity-added': [entity: EntityDefinition]
  'entity-updated': [entity: EntityDefinition] 
  'entity-deleted': [entityId: string]
  'relation-added': [relation: EntityRelation]
  'relation-updated': [relation: EntityRelation]
  'relation-deleted': [relationId: string]
}>()

// 确保emit事件被正确使用，避免ESLint未使用警告
// 这些事件是组件对外通信的关键接口，绝不能删除

// Store
const entityStore = useEntityModelingStore()

// 响应式数据
const canvasRef = ref<HTMLElement>()
const entityFormRef = ref()

// 设计器状态
const currentMode = ref<'select' | 'entity' | 'relation'>('select')
const zoomLevel = ref(100)
const canvasWidth = ref(1200)
const canvasHeight = ref(800)

// 实体相关状态
const selectedEntityId = ref<string>('')
const draggingEntityId = ref<string>('')
const entityPositions = ref<Record<string, { x: number; y: number }>>({})

// 关系相关状态
const selectedRelationId = ref<string>('')
const isDrawingRelation = ref(false)
const relationStartEntity = ref<string>('')

// 拖拽状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// UI状态
const showEntityDialog = ref(false)
const showValidationDialog = ref(false)

// 表单数据
const newEntityForm = ref({
  name: '',
  displayName: '',
  tableName: '',
  description: '',
  category: 'core' as const
})

// 验证结果
const validationResults = ref<Array<{
  severity: 'error' | 'warning'
  message: string
  entityId?: string
  relationId?: string
}>>([])

// 表单验证规则
const entityFormRules = {
  name: [
    { required: true, message: '请输入实体名称', trigger: 'blur' },
    { pattern: /^[A-Z][a-zA-Z0-9]*$/, message: '实体名称必须为PascalCase格式', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  tableName: [
    { required: true, message: '请输入表名', trigger: 'blur' }
  ]
}

// 计算属性
const positionedEntities = computed(() => {
  return (props.entities || entityStore.entities).map(entity => ({
    ...entity,
    position: entityPositions.value[entity.id] || { x: 100, y: 100 }
  }))
})

const computedRelations = computed(() => {
  const relations = props.relations || entityStore.relations
  return relations.map(relation => {
    const fromEntity = positionedEntities.value.find(e => e.id === relation.fromEntity)
    const toEntity = positionedEntities.value.find(e => e.id === relation.toEntity)
    
    if (!fromEntity || !toEntity) {
      return { ...relation, path: '', labelPosition: { x: 0, y: 0 } }
    }
    
    const fromPos = fromEntity.position
    const toPos = toEntity.position
    const fromCenter = { x: fromPos.x + 150, y: fromPos.y + 100 }
    const toCenter = { x: toPos.x + 150, y: toPos.y + 100 }
    
    const path = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`
    const labelPosition = {
      x: (fromCenter.x + toCenter.x) / 2,
      y: (fromCenter.y + toCenter.y) / 2
    }
    
    return {
      ...relation,
      path,
      labelPosition
    }
  })
})

// 方法
const setMode = (mode: typeof currentMode.value) => {
  currentMode.value = mode
  logger?.info('设计器模式切换', { mode })
}

const zoomIn = () => {
  if (zoomLevel.value < 200) {
    zoomLevel.value = Math.min(200, zoomLevel.value + 25)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 50) {
    zoomLevel.value = Math.max(50, zoomLevel.value - 25)
  }
}

const autoLayout = () => {
  const entities = positionedEntities.value
  const cols = Math.ceil(Math.sqrt(entities.length))
  const spacing = { x: 300, y: 200 }
  
  entities.forEach((entity, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    entityPositions.value[entity.id] = {
      x: 50 + col * spacing.x,
      y: 50 + row * spacing.y
    }
  })
  
  logger?.info('执行自动布局', { entitiesCount: entities.length })
}

const handleCanvasMouseDown = (event: MouseEvent) => {
  if (currentMode.value === 'entity') {
    addEntityAtPosition(event.offsetX, event.offsetY)
  }
}

const handleCanvasMouseMove = (event: MouseEvent) => {
  if (isDragging.value && draggingEntityId.value) {
    const entityId = draggingEntityId.value
    entityPositions.value[entityId] = {
      x: event.offsetX - dragOffset.value.x,
      y: event.offsetY - dragOffset.value.y
    }
  }
}

const handleCanvasMouseUp = () => {
  isDragging.value = false
  draggingEntityId.value = ''
}

const handleEntityMouseDown = (entity: EntityDefinition, event: MouseEvent) => {
  event.stopPropagation()
  
  if (currentMode.value === 'select') {
    const canvasRect = canvasRef.value?.getBoundingClientRect()
    
    if (canvasRect) {
      dragOffset.value = {
        x: event.clientX - canvasRect.left - (entityPositions.value[entity.id]?.x || 0),
        y: event.clientY - canvasRect.top - (entityPositions.value[entity.id]?.y || 0)
      }
    }
    
    isDragging.value = true
    draggingEntityId.value = entity.id
  } else if (currentMode.value === 'relation') {
    startRelation(entity.id)
  }
}

const handleEntityClick = (entity: EntityDefinition) => {
  if (currentMode.value === 'relation' && relationStartEntity.value && relationStartEntity.value !== entity.id) {
    finishRelation(entity.id)
  } else {
    selectEntity(entity.id)
  }
}

const selectEntity = (entityId: string) => {
  selectedEntityId.value = entityId
  selectedRelationId.value = ''
  logger?.info('选择实体', { entityId })
}

const selectRelation = (relationId: string) => {
  selectedRelationId.value = relationId
  selectedEntityId.value = ''
  logger?.info('选择关系', { relationId })
}

const addEntityAtPosition = (x: number, y: number) => {
  newEntityForm.value = {
    name: '',
    displayName: '',
    tableName: '',
    description: '',
    category: 'core'
  }
  
  // 记录实体添加位置，为未来的智能布局功能预留
  logger?.info('在指定位置添加实体', { x, y })
  
  showEntityDialog.value = true
}

const confirmAddEntity = async () => {
  try {
    await entityFormRef.value?.validate()
    
    const newEntity: Omit<EntityDefinition, 'id'> & { id?: string } = {
      name: newEntityForm.value.name,
      displayName: newEntityForm.value.displayName,
      tableName: newEntityForm.value.tableName,
      description: newEntityForm.value.description,
      category: newEntityForm.value.category,
      fields: [
        {
          name: 'Id',
          displayName: '主键',
          type: 'Guid',
          isRequired: true,
          isPrimaryKey: true
        }
      ],
      validationRules: [],
      enableSoftDelete: true,
      enableAudit: true,
      enableMultiTenant: false,
      isCompleted: false
    }
    
    const entity = entityStore.addEntity(newEntity)
    
    // 设置实体位置
    entityPositions.value[entity.id] = { x: 100, y: 100 }
    
    emit('entity-added', entity)
    showEntityDialog.value = false
    
    ElMessage.success('实体添加成功')
    logger?.info('添加实体', { entity: newEntity })
  } catch (error) {
    logger?.error('添加实体失败', error)
  }
}

const editEntity = (entity: EntityDefinition) => {
  // 编辑实体功能
  logger?.info('编辑实体', { entityId: entity.id })
}

const deleteEntity = async (entityId: string) => {
  try {
    const entity = positionedEntities.value.find(e => e.id === entityId)
    if (!entity) return
    
    await ElMessageBox.confirm(
      `确定要删除实体 "${entity.displayName || entity.name}" 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    
    entityStore.removeEntity(entityId)
    delete entityPositions.value[entityId]
    
    emit('entity-deleted', entityId)
    ElMessage.success('实体删除成功')
    logger?.info('删除实体', { entityId })
  } catch (error: unknown) {
    // 用户取消删除或其他错误
    if (error instanceof Error) {
      logger?.error('删除实体过程出错', { error: error.message, entityId })
    }
  }
}

const startRelation = (entityId: string) => {
  relationStartEntity.value = entityId
  isDrawingRelation.value = true
  logger?.info('开始绘制关系', { fromEntity: entityId })
}

const finishRelation = (toEntityId: string) => {
  if (!relationStartEntity.value || relationStartEntity.value === toEntityId) {
    return
  }
  
  const newRelation: Omit<EntityRelation, 'id'> & { id?: string } = {
    fromEntity: relationStartEntity.value,
    toEntity: toEntityId,
    type: 'one-to-many',
    foreignKey: `${relationStartEntity.value}Id`
  }
  
  const relation = entityStore.addRelation(newRelation)
  emit('relation-added', relation)
  
  // 重置状态
  relationStartEntity.value = ''
  isDrawingRelation.value = false
  
  ElMessage.success('关系添加成功')
  logger?.info('添加关系', { relation: newRelation })
}

const validateRelationships = () => {
  const results: typeof validationResults.value = []
  const relations = props.relations || entityStore.relations
  
  // 检查孤立实体
  const connectedEntities = new Set<string>()
  relations.forEach(relation => {
    connectedEntities.add(relation.fromEntity)
    connectedEntities.add(relation.toEntity)
  })
  
  positionedEntities.value.forEach(entity => {
    if (!connectedEntities.has(entity.id)) {
      results.push({
        severity: 'warning',
        message: `实体 "${entity.displayName || entity.name}" 没有任何关系`,
        entityId: entity.id
      })
    }
  })
  
  validationResults.value = results
  showValidationDialog.value = true
  
  logger?.info('关系验证完成', { resultsCount: results.length })
}

const exportSchema = () => {
  const schema = {
    entities: positionedEntities.value.map(entity => ({
      ...entity,
      position: entityPositions.value[entity.id]
    })),
    relations: computedRelations.value,
    metadata: {
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
  }
  
  const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `entity-schema-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('架构导出成功')
  logger?.info('导出架构', { entitiesCount: schema.entities.length, relationsCount: schema.relations.length })
}

const getRelationColor = (type: EntityRelation['type']) => {
  const colors = {
    'one-to-one': '#67C23A',
    'one-to-many': '#409EFF',
    'many-to-many': '#E6A23C'
  }
  return colors[type] || '#409EFF'
}

const getRelationTypeLabel = (type: EntityRelation['type']) => {
  const labels = {
    'one-to-one': '1:1',
    'one-to-many': '1:N',
    'many-to-many': 'M:N'
  }
  return labels[type] || '1:N'
}

// 生命周期
onMounted(() => {
  // 初始化画布尺寸
  if (canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    canvasWidth.value = rect.width
    canvasHeight.value = rect.height
  }
  
  // 初始化实体位置
  positionedEntities.value.forEach((entity, index) => {
    if (!entityPositions.value[entity.id]) {
      const cols = Math.ceil(Math.sqrt(positionedEntities.value.length))
      const row = Math.floor(index / cols)
      const col = index % cols
      entityPositions.value[entity.id] = {
        x: 50 + col * 300,
        y: 50 + row * 200
      }
    }
  })
  
  logger?.info('高级实体关系设计器初始化完成')
})
</script>

<style scoped>
.advanced-entity-relationship-designer {
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

.zoom-display {
  font-size: 12px;
  color: var(--el-text-color-regular);
  min-width: 35px;
  text-align: center;
}

.designer-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.canvas-content {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.entity-node {
  position: absolute;
  width: 300px;
  min-height: 120px;
  background: white;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.entity-node:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.entity-node--selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.entity-node--dragging {
  transform: rotate(5deg);
  z-index: 10;
}

.entity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color);
  border-radius: 6px 6px 0 0;
}

.entity-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entity-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.entity-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}

.entity-node:hover .entity-actions {
  opacity: 1;
}

.entity-fields {
  padding: 8px 0;
  max-height: 200px;
  overflow-y: auto;
}

.entity-field {
  display: flex;
  align-items: center;
  padding: 4px 16px;
  gap: 8px;
  font-size: 13px;
}

.entity-field:hover {
  background: var(--el-fill-color-light);
}

.entity-field--primary {
  color: var(--el-color-warning);
  font-weight: 600;
}

.entity-field--required .field-name::after {
  content: '*';
  color: var(--el-color-danger);
  margin-left: 2px;
}

.field-name {
  flex: 1;
  font-weight: 500;
}

.field-type {
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.relationships-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.relationship-line {
  pointer-events: all;
  cursor: pointer;
}

.relationship-line:hover path {
  stroke-width: 3;
}

.relationship-label {
  font-size: 12px;
  fill: var(--el-text-color-primary);
  font-weight: 600;
  pointer-events: none;
}

.validation-results {
  max-height: 400px;
  overflow-y: auto;
}

.validation-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--el-color-success);
}

.validation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 13px;
}

.validation-item--error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.validation-item--warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}
</style>
