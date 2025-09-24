<template>
  <div class="advanced-relationship-designer">
    <el-card>
      <template #header>
        <div class="designer-header">
          <h3>
            <i class="el-icon-share" />
            高级实体关系设计器
          </h3>
          <div class="designer-actions">
            <el-button-group size="small">
              <el-button
                :type="viewMode === 'graph' ? 'primary' : 'default'"
                icon="el-icon-connection"
                @click="setViewMode('graph')"
              >
                关系图
              </el-button>
              <el-button
                :type="viewMode === 'matrix' ? 'primary' : 'default'"
                icon="el-icon-menu"
                @click="setViewMode('matrix')"
              >
                关系矩阵
              </el-button>
              <el-button
                :type="viewMode === 'tree' ? 'primary' : 'default'"
                icon="el-icon-s-grid"
                @click="setViewMode('tree')"
              >
                继承树
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 关系图视图 -->
      <div v-if="viewMode === 'graph'" class="graph-view">
        <div class="graph-toolbar">
          <div class="toolbar-left">
            <el-button-group size="small">
              <el-button
                type="primary"
                icon="el-icon-plus"
                @click="showAddRelationDialog = true"
              >
                添加关系
              </el-button>
              <el-button
                icon="el-icon-magic-stick"
                @click="autoLayoutRelations"
              >
                自动布局
              </el-button>
              <el-button
                icon="el-icon-view"
                @click="fitToScreen"
              >
                适合屏幕
              </el-button>
            </el-button-group>
          </div>
          <div class="toolbar-right">
            <el-tooltip content="显示继承关系">
              <el-checkbox v-model="showInheritance">继承</el-checkbox>
            </el-tooltip>
            <el-tooltip content="显示聚合关系">
              <el-checkbox v-model="showAggregation">聚合</el-checkbox>
            </el-tooltip>
            <el-tooltip content="显示组合关系">
              <el-checkbox v-model="showComposition">组合</el-checkbox>
            </el-tooltip>
            <el-tooltip content="显示依赖关系">
              <el-checkbox v-model="showDependency">依赖</el-checkbox>
            </el-tooltip>
          </div>
        </div>

        <!-- Vue Flow 关系图 -->
        <div class="relationship-graph">
          <VueFlow
            ref="vueFlowRef"
            :nodes="graphNodes"
            :edges="graphEdges"
            @node-click="onNodeClick"
            @edge-click="onEdgeClick"
            @nodes-change="onNodesChange"
            @edges-change="onEdgesChange"
            class="vue-flow-container"
          >
            <Background />
            <Controls />
            <MiniMap />
            
            <!-- 自定义实体节点 -->
            <template #node-entity="{ data }">
              <EntityNode
                :entity="data.entity"
                :selected="data.selected"
                @edit="editEntity"
                @delete="deleteEntity"
              />
            </template>

            <!-- 自定义关系边 -->
            <template #edge-relationship="{ data }">
              <RelationshipEdge
                :relationship="data.relationship"
                @edit="editRelationship"
                @delete="deleteRelationship"
              />
            </template>
          </VueFlow>
        </div>
      </div>

      <!-- 关系矩阵视图 -->
      <div v-else-if="viewMode === 'matrix'" class="matrix-view">
        <div class="matrix-container">
          <table class="relationship-matrix">
            <thead>
              <tr>
                <th class="entity-header">实体</th>
                <th
                  v-for="entity in entities"
                  :key="entity.id"
                  class="entity-header"
                >
                  {{ entity.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fromEntity in entities"
                :key="fromEntity.id"
                class="matrix-row"
              >
                <th class="entity-name">{{ fromEntity.name }}</th>
                <td
                  v-for="toEntity in entities"
                  :key="toEntity.id"
                  class="matrix-cell"
                  @click="addQuickRelation(fromEntity, toEntity)"
                >
                  <div
                    v-if="getRelation(fromEntity.id, toEntity.id)"
                    class="relation-indicator"
                    :class="getRelationClass(getRelation(fromEntity.id, toEntity.id))"
                    @click.stop="editRelation(getRelation(fromEntity.id, toEntity.id))"
                  >
                    <i :class="getRelationIcon(getRelation(fromEntity.id, toEntity.id))" />
                    <span class="relation-type">
                      {{ getRelationTypeLabel(getRelation(fromEntity.id, toEntity.id).type) }}
                    </span>
                  </div>
                  <div
                    v-else-if="fromEntity.id !== toEntity.id"
                    class="add-relation-hint"
                  >
                    <i class="el-icon-plus" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 继承树视图 -->
      <div v-else-if="viewMode === 'tree'" class="tree-view">
        <div class="tree-toolbar">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showAddInheritanceDialog = true"
          >
            添加继承关系
          </el-button>
          <el-button
            size="small"
            icon="el-icon-magic-stick"
            @click="createAbstractEntity"
          >
            创建抽象实体
          </el-button>
        </div>

        <div class="inheritance-tree">
          <el-tree
            :data="inheritanceTreeData"
            :props="treeProps"
            node-key="id"
            :expand-on-click-node="false"
            :render-content="renderTreeNode"
            @node-click="onTreeNodeClick"
          />
        </div>
      </div>
    </el-card>

    <!-- 高级关系配置对话框 -->
    <el-dialog
      v-model="showAdvancedRelationDialog"
      title="高级关系配置"
      width="800px"
    >
      <el-form
        ref="relationFormRef"
        :model="relationForm"
        :rules="relationRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="源实体" prop="fromEntityId">
              <el-select
                v-model="relationForm.fromEntityId"
                placeholder="选择源实体"
                style="width: 100%"
              >
                <el-option
                  v-for="entity in entities"
                  :key="entity.id"
                  :label="entity.name"
                  :value="entity.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标实体" prop="toEntityId">
              <el-select
                v-model="relationForm.toEntityId"
                placeholder="选择目标实体"
                style="width: 100%"
              >
                <el-option
                  v-for="entity in entities"
                  :key="entity.id"
                  :label="entity.name"
                  :value="entity.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关系类型" prop="type">
              <el-select
                v-model="relationForm.type"
                placeholder="选择关系类型"
                style="width: 100%"
              >
                <el-option-group label="基本关系">
                  <el-option label="一对一" value="one-to-one" />
                  <el-option label="一对多" value="one-to-many" />
                  <el-option label="多对多" value="many-to-many" />
                </el-option-group>
                <el-option-group label="高级关系">
                  <el-option label="继承" value="inheritance" />
                  <el-option label="聚合" value="aggregation" />
                  <el-option label="组合" value="composition" />
                  <el-option label="依赖" value="dependency" />
                </el-option-group>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关系强度" prop="strength">
              <el-select
                v-model="relationForm.strength"
                placeholder="选择关系强度"
                style="width: 100%"
              >
                <el-option label="强关联" value="strong" />
                <el-option label="弱关联" value="weak" />
                <el-option label="可选关联" value="optional" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="源端属性" prop="fromProperty">
              <el-input
                v-model="relationForm.fromProperty"
                placeholder="导航属性名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标端属性" prop="toProperty">
              <el-input
                v-model="relationForm.toProperty"
                placeholder="导航属性名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="外键字段" prop="foreignKey">
          <el-input
            v-model="relationForm.foreignKey"
            placeholder="外键字段名称"
          />
        </el-form-item>

        <el-form-item label="级联操作">
          <el-checkbox-group v-model="relationForm.cascadeActions">
            <el-checkbox label="cascadeDelete">级联删除</el-checkbox>
            <el-checkbox label="cascadeUpdate">级联更新</el-checkbox>
            <el-checkbox label="cascadeInsert">级联插入</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="业务规则">
          <el-input
            v-model="relationForm.businessRules"
            type="textarea"
            :rows="3"
            placeholder="描述此关系的业务规则和约束..."
          />
        </el-form-item>

        <el-form-item label="关系描述">
          <el-input
            v-model="relationForm.description"
            type="textarea"
            :rows="2"
            placeholder="描述实体间的关系..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAdvancedRelationDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveAdvancedRelation"
            :loading="saving"
          >
            保存关系
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 继承关系配置对话框 -->
    <el-dialog
      v-model="showInheritanceDialog"
      title="配置继承关系"
      width="600px"
    >
      <el-form
        ref="inheritanceFormRef"
        :model="inheritanceForm"
        label-width="100px"
      >
        <el-form-item label="基类实体">
          <el-select
            v-model="inheritanceForm.baseEntityId"
            placeholder="选择基类实体"
            style="width: 100%"
          >
            <el-option
              v-for="entity in entities.filter(e => !e.isAbstract)"
              :key="entity.id"
              :label="entity.name"
              :value="entity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="派生实体">
          <el-select
            v-model="inheritanceForm.derivedEntityIds"
            placeholder="选择派生实体"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="entity in entities"
              :key="entity.id"
              :label="entity.name"
              :value="entity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="继承策略">
          <el-radio-group v-model="inheritanceForm.strategy">
            <el-radio label="table-per-hierarchy">每个层次结构一张表</el-radio>
            <el-radio label="table-per-type">每个类型一张表</el-radio>
            <el-radio label="table-per-concrete">每个具体类一张表</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="抽象类">
          <el-checkbox v-model="inheritanceForm.isAbstract">
            设置为抽象实体
          </el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showInheritanceDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveInheritance"
        >
          保存继承关系
        </el-button>
      </template>
    </el-dialog>

    <!-- 关系验证结果 -->
    <div v-if="relationshipValidation.length > 0" class="validation-panel">
      <h4>
        <i class="el-icon-warning" />
        关系验证结果
      </h4>
      <div class="validation-list">
        <div
          v-for="validation in relationshipValidation"
          :key="validation.id"
          class="validation-item"
          :class="validation.severity"
        >
          <i :class="getValidationIcon(validation.severity)" />
          <span class="validation-message">{{ validation.message }}</span>
          <el-button
            v-if="validation.autoFix"
            size="mini"
            type="primary"
            @click="autoFixValidation(validation)"
          >
            自动修复
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VueFlow, Background, Controls, MiniMap } from '@vue-flow/core'
import EntityNode from './EntityNode.vue'
import RelationshipEdge from './RelationshipEdge.vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { ElMessage } from 'element-plus'

// Store
const entityStore = useEntityModelingStore()

// 响应式数据
const viewMode = ref('graph')
const showInheritance = ref(true)
const showAggregation = ref(true)
const showComposition = ref(true)
const showDependency = ref(false)

const showAdvancedRelationDialog = ref(false)
const showInheritanceDialog = ref(false)
const showAddRelationDialog = ref(false)
const saving = ref(false)

// Vue Flow 引用
const vueFlowRef = ref()

// 表单数据
const relationForm = ref({
  fromEntityId: '',
  toEntityId: '',
  type: 'one-to-many',
  strength: 'strong',
  fromProperty: '',
  toProperty: '',
  foreignKey: '',
  cascadeActions: [],
  businessRules: '',
  description: ''
})

const inheritanceForm = ref({
  baseEntityId: '',
  derivedEntityIds: [],
  strategy: 'table-per-hierarchy',
  isAbstract: false
})

// 关系验证规则
const relationRules = {
  fromEntityId: [
    { required: true, message: '请选择源实体', trigger: 'change' }
  ],
  toEntityId: [
    { required: true, message: '请选择目标实体', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择关系类型', trigger: 'change' }
  ]
}

// 计算属性
const entities = computed(() => entityStore.entities)
const relations = computed(() => entityStore.relations)

const graphNodes = computed(() => {
  return entities.value.map(entity => ({
    id: entity.id,
    type: 'entity',
    position: entity.position || { x: Math.random() * 500, y: Math.random() * 300 },
    data: {
      entity,
      selected: false
    }
  }))
})

const graphEdges = computed(() => {
  return relations.value
    .filter(relation => {
      // 根据过滤条件显示不同类型的关系
      switch (relation.type) {
        case 'inheritance':
          return showInheritance.value
        case 'aggregation':
          return showAggregation.value
        case 'composition':
          return showComposition.value
        case 'dependency':
          return showDependency.value
        default:
          return true
      }
    })
    .map(relation => ({
      id: relation.id,
      type: 'relationship',
      source: relation.fromEntityId,
      target: relation.toEntityId,
      label: getRelationLabel(relation),
      markerEnd: getRelationMarker(relation.type),
      style: getRelationStyle(relation.type),
      data: {
        relationship: relation
      }
    }))
})

const inheritanceTreeData = computed(() => {
  // 构建继承树结构
  const tree = []
  const processedEntities = new Set()

  entities.value.forEach(entity => {
    if (!processedEntities.has(entity.id)) {
      const treeNode = buildInheritanceTree(entity, processedEntities)
      if (treeNode) {
        tree.push(treeNode)
      }
    }
  })

  return tree
})

const relationshipValidation = computed(() => {
  const validations = []

  // 验证循环依赖
  const cycles = detectCircularDependencies()
  cycles.forEach(cycle => {
    validations.push({
      id: `cycle-${cycle.join('-')}`,
      severity: 'error',
      message: `检测到循环依赖：${cycle.join(' → ')}`,
      autoFix: false
    })
  })

  // 验证孤立实体
  const orphanEntities = findOrphanEntities()
  orphanEntities.forEach(entity => {
    validations.push({
      id: `orphan-${entity.id}`,
      severity: 'warning',
      message: `实体"${entity.name}"没有任何关系，可能需要建立关联`,
      autoFix: true
    })
  })

  // 验证缺失外键
  const missingForeignKeys = findMissingForeignKeys()
  missingForeignKeys.forEach(missing => {
    validations.push({
      id: `fk-${missing.relationId}`,
      severity: 'warning',
      message: `关系"${missing.relationName}"缺少外键字段`,
      autoFix: true
    })
  })

  return validations
})

const treeProps = {
  children: 'children',
  label: 'name'
}

// 方法
const setViewMode = (mode) => {
  viewMode.value = mode
}

const onNodeClick = (event) => {
  console.log('Node clicked:', event)
}

const onEdgeClick = (event) => {
  console.log('Edge clicked:', event)
}

const onNodesChange = (changes) => {
  // 处理节点位置变化，保存到实体数据中
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      const entity = entities.value.find(e => e.id === change.id)
      if (entity) {
        entity.position = change.position
      }
    }
  })
}

const onEdgesChange = (changes) => {
  console.log('Edges changed:', changes)
}

const addQuickRelation = (fromEntity, toEntity) => {
  if (fromEntity.id === toEntity.id) return

  relationForm.value = {
    fromEntityId: fromEntity.id,
    toEntityId: toEntity.id,
    type: 'one-to-many',
    strength: 'strong',
    fromProperty: `${toEntity.name}s`,
    toProperty: fromEntity.name,
    foreignKey: `${fromEntity.name}Id`,
    cascadeActions: [],
    businessRules: '',
    description: `${fromEntity.name}到${toEntity.name}的关系`
  }

  showAdvancedRelationDialog.value = true
}

const getRelation = (fromEntityId, toEntityId) => {
  return relations.value.find(r => 
    r.fromEntityId === fromEntityId && r.toEntityId === toEntityId
  )
}

const getRelationClass = (relation) => {
  return `relation-${relation.type}`
}

const getRelationIcon = (relation) => {
  const icons = {
    'one-to-one': 'el-icon-connection',
    'one-to-many': 'el-icon-s-unfold',
    'many-to-many': 'el-icon-menu',
    'inheritance': 'el-icon-top',
    'aggregation': 'el-icon-collection',
    'composition': 'el-icon-box',
    'dependency': 'el-icon-right'
  }
  return icons[relation.type] || 'el-icon-connection'
}

const getRelationTypeLabel = (type) => {
  const labels = {
    'one-to-one': '1:1',
    'one-to-many': '1:N',
    'many-to-many': 'N:N',
    'inheritance': '继承',
    'aggregation': '聚合',
    'composition': '组合',
    'dependency': '依赖'
  }
  return labels[type] || type
}

const getRelationLabel = (relation) => {
  return getRelationTypeLabel(relation.type)
}

const getRelationMarker = (type) => {
  const markers = {
    'inheritance': 'triangle',
    'aggregation': 'diamond',
    'composition': 'diamond-filled',
    'dependency': 'arrow'
  }
  return markers[type] || 'arrow'
}

const getRelationStyle = (type) => {
  const styles = {
    'inheritance': { strokeDasharray: '5,5' },
    'dependency': { strokeDasharray: '10,5' },
    'aggregation': { stroke: '#e6a23c' },
    'composition': { stroke: '#f56c6c' }
  }
  return styles[type] || {}
}

const buildInheritanceTree = (entity, processed) => {
  if (processed.has(entity.id)) return null

  processed.add(entity.id)

  const children = entities.value.filter(e => {
    const inheritanceRelation = relations.value.find(r => 
      r.type === 'inheritance' && r.fromEntityId === e.id && r.toEntityId === entity.id
    )
    return inheritanceRelation && !processed.has(e.id)
  }).map(childEntity => buildInheritanceTree(childEntity, processed))
  .filter(Boolean)

  return {
    id: entity.id,
    name: entity.name,
    isAbstract: entity.isAbstract || false,
    children: children.length > 0 ? children : undefined
  }
}

const renderTreeNode = (h, { node, data }) => {
  const entity = entities.value.find(e => e.id === data.id)
  return h(
    'span',
    {
      class: ['tree-node', { abstract: data.isAbstract }]
    },
    [
      h('i', { class: data.isAbstract ? 'el-icon-document-remove' : 'el-icon-document' }),
      h('span', data.name),
      entity && h('el-tag', {
        props: { size: 'mini', type: data.isAbstract ? 'warning' : 'success' }
      }, data.isAbstract ? '抽象' : '具体')
    ]
  )
}

const onTreeNodeClick = (data) => {
  const entity = entities.value.find(e => e.id === data.id)
  if (entity) {
    // 触发实体选择事件
    emit('entity-selected', entity)
  }
}

const saveAdvancedRelation = async () => {
  try {
    saving.value = true

    // 验证表单
    await relationFormRef.value?.validate()

    // 创建高级关系对象
    const relation = {
      id: `relation-${Date.now()}`,
      ...relationForm.value,
      createdAt: new Date().toISOString()
    }

    // 保存到store
    entityStore.addRelation(relation)

    ElMessage.success('高级关系配置保存成功')
    showAdvancedRelationDialog.value = false

    // 重置表单
    relationForm.value = {
      fromEntityId: '',
      toEntityId: '',
      type: 'one-to-many',
      strength: 'strong',
      fromProperty: '',
      toProperty: '',
      foreignKey: '',
      cascadeActions: [],
      businessRules: '',
      description: ''
    }

  } catch (error) {
    ElMessage.error('保存关系失败：' + error.message)
  } finally {
    saving.value = false
  }
}

const saveInheritance = async () => {
  try {
    const baseEntity = entities.value.find(e => e.id === inheritanceForm.value.baseEntityId)
    
    if (inheritanceForm.value.isAbstract) {
      // 设置基类为抽象实体
      entityStore.updateEntity(baseEntity.id, { isAbstract: true })
    }

    // 为每个派生实体创建继承关系
    inheritanceForm.value.derivedEntityIds.forEach(derivedId => {
      const inheritanceRelation = {
        id: `inheritance-${baseEntity.id}-${derivedId}`,
        fromEntityId: derivedId,
        toEntityId: baseEntity.id,
        type: 'inheritance',
        strategy: inheritanceForm.value.strategy,
        description: `${entities.value.find(e => e.id === derivedId)?.name} 继承自 ${baseEntity.name}`
      }
      
      entityStore.addRelation(inheritanceRelation)
    })

    ElMessage.success('继承关系配置成功')
    showInheritanceDialog.value = false

  } catch (error) {
    ElMessage.error('配置继承关系失败：' + error.message)
  }
}

const autoLayoutRelations = () => {
  // 实现自动布局算法
  const layoutConfig = {
    direction: 'TB', // Top to Bottom
    nodeDistance: 200,
    levelDistance: 150
  }

  // 简单的层次化布局
  const levels = calculateEntityLevels()
  levels.forEach((entityIds, level) => {
    entityIds.forEach((entityId, index) => {
      const entity = entities.value.find(e => e.id === entityId)
      if (entity) {
        entity.position = {
          x: index * layoutConfig.nodeDistance,
          y: level * layoutConfig.levelDistance
        }
      }
    })
  })

  ElMessage.success('自动布局完成')
}

const calculateEntityLevels = () => {
  const levels = new Map()
  const visited = new Set()

  const dfs = (entityId, level) => {
    if (visited.has(entityId)) return
    visited.add(entityId)

    if (!levels.has(level)) {
      levels.set(level, [])
    }
    levels.get(level).push(entityId)

    // 查找依赖此实体的其他实体
    const dependents = relations.value
      .filter(r => r.toEntityId === entityId)
      .map(r => r.fromEntityId)

    dependents.forEach(dependentId => {
      if (!visited.has(dependentId)) {
        dfs(dependentId, level + 1)
      }
    })
  }

  // 从没有依赖的实体开始
  const rootEntities = entities.value.filter(entity => 
    !relations.value.some(r => r.fromEntityId === entity.id)
  )

  rootEntities.forEach(entity => dfs(entity.id, 0))

  return levels
}

const fitToScreen = () => {
  if (vueFlowRef.value) {
    vueFlowRef.value.fitView()
  }
}

const createAbstractEntity = () => {
  // 创建抽象实体的逻辑
  emit('create-abstract-entity')
}

const detectCircularDependencies = () => {
  const cycles = []
  const visited = new Set()
  const recStack = new Set()

  const dfs = (entityId, path) => {
    if (recStack.has(entityId)) {
      // 找到循环依赖
      const cycleStart = path.indexOf(entityId)
      cycles.push(path.slice(cycleStart).concat([entityId]))
      return
    }

    if (visited.has(entityId)) return

    visited.add(entityId)
    recStack.add(entityId)

    const dependencies = relations.value
      .filter(r => r.fromEntityId === entityId)
      .map(r => r.toEntityId)

    dependencies.forEach(depId => {
      dfs(depId, [...path, depId])
    })

    recStack.delete(entityId)
  }

  entities.value.forEach(entity => {
    if (!visited.has(entity.id)) {
      dfs(entity.id, [entity.id])
    }
  })

  return cycles
}

const findOrphanEntities = () => {
  return entities.value.filter(entity => {
    return !relations.value.some(r => 
      r.fromEntityId === entity.id || r.toEntityId === entity.id
    )
  })
}

const findMissingForeignKeys = () => {
  const missing = []

  relations.value.forEach(relation => {
    if (['one-to-many', 'many-to-one'].includes(relation.type) && relation.foreignKey) {
      const targetEntity = entities.value.find(e => 
        relation.type === 'one-to-many' ? e.id === relation.fromEntityId : e.id === relation.toEntityId
      )

      if (targetEntity && !targetEntity.fields.some(f => f.name === relation.foreignKey)) {
        missing.push({
          relationId: relation.id,
          relationName: `${relation.fromEntity} → ${relation.toEntity}`,
          missingKey: relation.foreignKey,
          entity: targetEntity.name
        })
      }
    }
  })

  return missing
}

const getValidationIcon = (severity) => {
  const icons = {
    error: 'el-icon-circle-close',
    warning: 'el-icon-warning',
    info: 'el-icon-info'
  }
  return icons[severity] || 'el-icon-info'
}

const autoFixValidation = (validation) => {
  // 自动修复验证问题
  if (validation.id.startsWith('fk-')) {
    // 自动添加缺失的外键字段
    const missingFK = findMissingForeignKeys().find(m => 
      validation.id.includes(m.relationId)
    )
    if (missingFK) {
      const entity = entities.value.find(e => e.name === missingFK.entity)
      if (entity) {
        entityStore.addField(entity.id, {
          name: missingFK.missingKey,
          displayName: `${missingFK.missingKey}`,
          type: 'Guid',
          isRequired: true,
          description: '外键字段'
        })
        ElMessage.success('已自动添加外键字段')
      }
    }
  }
}

// Emits
const emit = defineEmits<{
  'entity-selected': [entity: any]
  'create-abstract-entity': []
}>()

// 引用
const relationFormRef = ref()
const inheritanceFormRef = ref()
</script>

<style scoped>
.advanced-relationship-designer {
  height: 100%;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.designer-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 关系图样式 */
.graph-view {
  height: 600px;
}

.graph-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.toolbar-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.relationship-graph {
  height: 520px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.vue-flow-container {
  background: var(--el-bg-color-page);
}

/* 关系矩阵样式 */
.matrix-view {
  height: 600px;
  overflow: auto;
}

.matrix-container {
  min-width: fit-content;
}

.relationship-matrix {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--el-border-color);
}

.relationship-matrix th,
.relationship-matrix td {
  border: 1px solid var(--el-border-color-lighter);
  padding: 8px;
  text-align: center;
  min-width: 120px;
  min-height: 40px;
}

.entity-header {
  background: var(--el-color-primary-light-9);
  font-weight: 600;
  color: var(--el-color-primary);
}

.entity-name {
  background: var(--el-color-primary-light-9);
  font-weight: 600;
  color: var(--el-color-primary);
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.matrix-cell {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.matrix-cell:hover {
  background: var(--el-color-primary-light-9);
}

.relation-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
}

.relation-indicator.relation-inheritance {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning);
}

.relation-indicator.relation-aggregation {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}

.relation-indicator.relation-composition {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

.relation-type {
  font-size: 10px;
  font-weight: 600;
}

.add-relation-hint {
  color: var(--el-border-color);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.matrix-cell:hover .add-relation-hint {
  opacity: 1;
}

/* 继承树样式 */
.tree-view {
  height: 600px;
}

.tree-toolbar {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.inheritance-tree {
  height: 520px;
  overflow: auto;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-node.abstract {
  font-style: italic;
  color: var(--el-color-warning);
}

/* 验证面板样式 */
.validation-panel {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-warning);
}

.validation-panel h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
}

.validation-item.error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.validation-item.warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.validation-item.info {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.validation-message {
  flex: 1;
  font-size: 13px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
