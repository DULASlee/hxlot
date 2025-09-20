<template>
  <div class="entity-designer">
    <el-card class="designer-card">
      <template #header>
        <div class="designer-header">
          <div class="header-left">
            <el-icon class="header-icon">
              <Collection />
            </el-icon>
            <span class="header-title">{{ t('designer.entityDesigner') }}</span>
            <el-tag
              v-if="entityModel.name"
              type="primary"
              size="small"
            >
              {{ entityModel.name }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button
              size="small"
              type="default"
              plain
              @click="loadDraft"
            >
              <el-icon><DocumentCopy /></el-icon> {{ t('designer.loadDraft') }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="saveDraft"
            >
              <el-icon><Document /></el-icon> {{ t('designer.saveDraft') }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              plain
              @click="openDbImport"
            >
              <el-icon><Connection /></el-icon> {{ t('designer.importDb') }}
            </el-button>
            <el-button
              size="small"
              type="warning"
              plain
              @click="openSqlImport"
            >
              <el-icon><Document /></el-icon> {{ t('designer.importSql') }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              plain
              @click="clearDesigner"
            >
              <el-icon><Delete /></el-icon> {{ t('designer.clear') }}
            </el-button>
            <el-button
              size="small"
              type="success"
              plain
              @click="activeTab = 'relationships'"
            >
              <el-icon><Connection /></el-icon> {{ t('designer.relationships') }}
            </el-button>
            <el-button
              size="small"
              type="info"
              plain
              @click="previewCodeMethod"
            >
              <el-icon><View /></el-icon> {{ t('designer.preview') }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              :loading="isGenerating"
              @click="generateEntity"
            >
              <el-icon><MagicStick /></el-icon> {{ t('designer.generate') }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="designer-content">
        <!-- Entity switcher & actions -->
        <div
          class="entity-switcher"
          style="margin: 8px 0 16px; display: flex; gap: 8px; align-items: center;"
        >
          <span style="color:#606266;">{{ t('designer.entities') }}</span>
          <el-select
            v-model="currentIndex"
            size="small"
            style="width: 220px;"
          >
            <el-option
              v-for="(e, idx) in entities"
              :key="idx"
              :label="e.name || ('Entity'+(idx+1))"
              :value="idx"
            />
          </el-select>
          <el-button
            size="small"
            type="primary"
            @click="addEntity"
          >
            {{ t('designer.addEntity') }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            plain
            :disabled="entities.length<=1"
            @click="removeEntity"
          >
            {{ t('designer.removeEntity') }}
          </el-button>
        </div>

        <!-- Entity Configuration Panel -->
        <div class="config-panel">
          <el-card
            shadow="never"
            class="config-card"
          >
            <template #header>
              <span><el-icon><Setting /></el-icon> {{ t('designer.entityConfig') }}</span>
            </template>

            <el-form
              :model="entityModel"
              label-width="120px"
              size="small"
            >
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item
                    :label="t('designer.entityName')"
                    required
                  >
                    <el-input
                      v-model="entityModel.name"
                      :placeholder="t('designer.entityName')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('designer.module')">
                    <el-input
                      v-model="entityModel.module"
                      :placeholder="t('designer.module')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item :label="t('designer.baseClass')">
                    <el-input
                      v-model="entityModel.baseClass"
                      :placeholder="t('designer.baseClass')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('designer.description')">
                    <el-input
                      v-model="entityModel.description"
                      :placeholder="t('designer.description')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item :label="t('designer.namespace')">
                    <el-input
                      v-model="entityModel.namespace"
                      :placeholder="t('designer.namespace')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="t('designer.table')">
                    <el-input
                      v-model="entityModel.tableName"
                      :placeholder="t('designer.table')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="t('designer.schema')">
                    <el-input
                      v-model="entityModel.schema"
                      :placeholder="t('designer.schema')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item>
                <el-checkbox-group v-model="entityFeatures">
                  <el-checkbox label="isAggregateRoot">
                    聚合根
                  </el-checkbox>
                  <el-checkbox label="isMultiTenant">
                    多租户
                  </el-checkbox>
                  <el-checkbox label="isSoftDelete">
                    软删除
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- Main Designer Area -->
        <div class="designer-main">
          <el-tabs
            v-model="activeTab"
            class="designer-tabs"
          >
            <el-tab-pane
              :label="t('designer.properties')"
              name="properties"
            >
              <div class="properties-workspace">
                <!-- Property Toolbox -->
                <div class="property-toolbox">
                  <h4><el-icon><Box /></el-icon> {{ t('designer.propertyTypes') }}</h4>
                  <div class="toolbox-items">
                    <div
                      v-for="propertyType in propertyTypes"
                      :key="propertyType.type"
                      class="toolbox-item"
                      draggable="true"
                      @dragstart="onDragStart($event, propertyType)"
                    >
                      <el-icon
                        class="type-icon"
                        :style="{ color: propertyType.color }"
                      >
                        <component :is="propertyType.icon" />
                      </el-icon>
                      <span class="type-name">{{ propertyType.name }}</span>
                    </div>
                  </div>
                </div>

                <!-- Entity Canvas -->
                <div class="entity-canvas">
                  <div class="canvas-header">
                    <h4>{{ entityModel.name || t('designer.untitled') }}</h4>
                    <el-tag
                      v-if="entityModel.properties.length"
                      size="small"
                    >
                      {{ entityModel.properties.length }} {{ t('designer.propsCount') }}
                    </el-tag>
                  </div>

                  <div
                    class="drop-zone"
                    :class="{ 'drag-over': isDragOver }"
                    @drop="onDrop"
                    @dragover.prevent="isDragOver = true"
                    @dragleave="isDragOver = false"
                  >
                    <div
                      v-if="entityModel.properties.length === 0"
                      class="empty-state"
                    >
                      <el-icon class="empty-icon">
                        <Plus />
                      </el-icon>
                      <p>{{ t('designer.dropHint') }}</p>
                    </div>

                    <!-- Entity Properties -->
                    <draggable
                      v-model="entityModel.properties"
                      group="properties"
                      item-key="id"
                      class="properties-list"
                    >
                      <template #item="{ element: property, index }">
                        <div
                          class="property-item"
                          :class="{ 'selected': selectedProperty === property.id }"
                        >
                          <div
                            class="property-content"
                            @click="selectProperty(property.id)"
                          >
                            <div
                              class="property-header"
                              style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;"
                            >
                              <el-icon
                                class="property-icon"
                                :style="{ color: getPropertyTypeColor(property.type) }"
                              >
                                <component :is="getPropertyTypeIcon(property.type)" />
                              </el-icon>
                              <el-input
                                v-model="property.name"
                                size="small"
                                style="width: 160px;"
                                :placeholder="t('designer.name')"
                              />
                              <el-select
                                v-model="property.type"
                                size="small"
                                style="width: 140px;"
                                :placeholder="t('designer.type')"
                              >
                                <el-option
                                  v-for="pt in propertyTypes"
                                  :key="pt.type"
                                  :label="pt.name"
                                  :value="pt.type"
                                />
                              </el-select>
                              <span style="color:#909399;">{{ t('designer.required') }}</span>
                              <el-switch
                                v-model="property.isRequired"
                                size="small"
                              />
                              <template v-if="property.type==='string'">
                                <span style="color:#909399;">{{ t('designer.length') }}</span>
                                <el-input-number
                                  v-model="property.maxLength"
                                  :min="1"
                                  :max="4000"
                                  size="small"
                                  style="width: 140px;"
                                />
                              </template>
                            </div>
                          </div>

                          <div class="property-actions">
                            <el-button
                              size="small"
                              type="primary"
                              text
                              @click="editProperty(property)"
                            >
                              <el-icon><Edit /></el-icon>
                            </el-button>
                            <el-button
                              size="small"
                              type="success"
                              text
                              @click="duplicateProperty(property)"
                            >
                              <el-icon><DocumentCopy /></el-icon>
                            </el-button>
                            <el-button
                              size="small"
                              type="danger"
                              text
                              @click="removeProperty(index)"
                            >
                              <el-icon><Delete /></el-icon>
                            </el-button>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane
              :label="t('designer.relationships')"
              name="relationships"
            >
              <RelationshipDesigner
                v-model:model-value="entities"
                @create-relationship="(r) => (entityModel.relationships = [...entityModel.relationships, r as any])"
                @update-relationship="(r) => (entityModel.relationships = entityModel.relationships.map(x => (x as any).id === (r as any).id ? (r as any) : x))"
                @delete-relationship="(id) => (entityModel.relationships = entityModel.relationships.filter(x => (x as any).id !== id))"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>

    <!-- Property Editor Dialog -->
    <el-dialog
      v-model="showPropertyDialog"
      :title="t('designer.propConfig')"
      width="60%"
      :before-close="closePropertyDialog"
    >
      <PropertyEditor
        v-if="editingProperty"
        :property="editingProperty"
        @save="savePropertyConfig"
        @cancel="closePropertyDialog"
      />
    </el-dialog>

    <!-- Enhanced Code Preview Dialog -->
    <el-dialog
      v-model="showPreview"
      :title="t('designer.codePreview')"
      width="90%"
      :before-close="closePreview"
      class="code-preview-dialog"
    >
      <EnhancedCodePreview
        v-if="showPreview"
        :entity="entityModel"
        :visible="showPreview"
      />
    </el-dialog>

    <!-- SQL Import Dialog -->
    <el-dialog
      v-model="showSqlDialog"
      :title="t('designer.importSql')"
      width="70%"
    >
      <div style="margin-bottom:8px; display:flex; align-items:center; gap:12px;">
        <span>{{ t('designer.importMode') }}</span>
        <el-radio-group
          v-model="importMode"
          size="small"
        >
          <el-radio-button label="append">
            {{ t('designer.append') }}
          </el-radio-button>
          <el-radio-button label="replace">
            {{ t('designer.replace') }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <el-input
        v-model="sqlText"
        type="textarea"
        :rows="14"
        :placeholder="t('designer.sqlPlaceholder')"
      />
      <template #footer>
        <el-button @click="showSqlDialog=false">
          {{ t('designer.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="doImportSql"
        >
          {{ t('designer.import') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- DB Import Dialog -->
    <el-dialog
      v-model="showDbDialog"
      :title="t('designer.importDb')"
      width="60%"
    >
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <el-form label-width="120px">
          <el-form-item :label="t('designer.connectionString')">
            <el-select
              v-model="dbConnName"
              :placeholder="t('designer.connectionString')"
            >
              <el-option
                v-for="cs in connStrings"
                :key="cs"
                :label="cs"
                :value="cs"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('designer.provider')">
            <el-select
              v-model="dbProvider"
              :placeholder="t('designer.provider')"
            >
              <el-option
                label="SqlServer"
                value="SqlServer"
              />
              <el-option
                label="PostgreSql"
                value="PostgreSql"
              />
              <el-option
                label="MySql"
                value="MySql"
              />
              <el-option
                label="Oracle"
                value="Oracle"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('designer.schema')">
            <el-input
              v-model="dbSchema"
              :placeholder="t('designer.schema')"
            />
          </el-form-item>
          <el-form-item :label="t('designer.tables')">
            <div style="display:flex; gap:8px; align-items:center;">
              <el-select
                v-model="selectedTables"
                multiple
                filterable
                :placeholder="t('designer.selectTables')"
                style="min-width:260px;"
              >
                <el-option
                  v-for="titem in schemaTables"
                  :key="titem"
                  :label="titem"
                  :value="titem"
                />
              </el-select>
              <el-button
                type="primary"
                plain
                :loading="loadingTables"
                @click="loadTables"
              >
                {{ t('designer.loadTables') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showDbDialog=false">
          {{ t('designer.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!dbConnName || !dbProvider"
          @click="doImportDb"
        >
          {{ t('designer.import') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, defineEmits, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Collection,
  Delete,
  View,
  MagicStick,
  Setting,
  Box,
  Plus,
  Edit,
  DocumentCopy,
  Connection,
  Document,
  Promotion,
  Money,
  Switch,
  Calendar,
  Key,
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import RelationshipDesigner from './RelationshipDesigner.vue'
import PropertyEditor from '../EntityProperty/PropertyEditor.vue'
import EnhancedCodePreview from './EnhancedCodePreview.vue'
import type { PropertyType, EntityProperty, EnhancedEntityModel } from '../../types'
import { codeGeneratorApi, type DatabaseSchema } from '@smartabp/lowcode-api'

// accept optional props from wizard
const props = defineProps<{ schema?: string; moduleName?: string; systemName?: string; architecture?: string; dbProvider?: 'SqlServer'|'PostgreSql'|'MySql'|'Oracle'; dbConnName?: string; active?: boolean }>()

interface PropertyTypeDefinition {
  type: PropertyType
  name: string
  description: string
  icon: Component
  color: string
  defaultRequired: boolean
  hasLength: boolean
}

const { t } = useI18n()

// Reactive state
const entityModel = reactive<EnhancedEntityModel>({
  id: '1',
  name: 'SampleEntity',
  module: 'SampleModule',
  description: 'A sample entity for demonstration.',
  namespace: 'SmartAbp.Sample',
  tableName: 'AppSampleEntities',
  schema: 'dbo',
  properties: [],
  relationships: [],
  businessRules: [],
  permissions: [],
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  baseClass: 'FullAuditedAggregateRoot',
  interfaces: [],
  isAudited: true,
  indexes: [],
  constraints: [],
  codeGeneration: {} as any,
  uiConfig: {} as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: '1.0.0',
  tags: [],
})

const entityFeatures = ref(['isAggregateRoot', 'isMultiTenant', 'isSoftDelete'])
const isDragOver = ref(false)
const selectedProperty = ref<string | null>(null)
const selectedPropertyData = ref<EntityProperty | null>(null)
const editingProperty = ref<EntityProperty | null>(null)
const showPropertyDialog = ref(false)
const isGenerating = ref(false)
const showPreview = ref(false)
const activeTab = ref('properties')
const entities = ref<EnhancedEntityModel[]>([entityModel])
const currentIndex = ref(0)

watch(entityModel, (val) => {
  // sync back to entities array
  entities.value[currentIndex.value] = JSON.parse(JSON.stringify(val)) as any
}, { deep: true })

const addEntity = () => {
  const idx = entities.value.length
  const e: EnhancedEntityModel = JSON.parse(JSON.stringify({
    ...entityModel,
    id: String(idx + 1),
    name: `Entity${idx + 1}`,
    tableName: `AppEntity${idx + 1}`,
    properties: [],
    relationships: [],
  }))
  entities.value.push(e)
  currentIndex.value = idx
  Object.assign(entityModel, e)
  emit('update:entities', JSON.parse(JSON.stringify(entities.value)))
}

const removeEntity = async () => {
  if (entities.value.length <= 1) return
  try {
    await ElMessageBox.confirm(t('designer.confirmRemoveEntity'), t('designer.removeEntity'), { type: 'warning' })
    entities.value.splice(currentIndex.value, 1)
    currentIndex.value = Math.max(0, currentIndex.value - 1)
    Object.assign(entityModel, entities.value[currentIndex.value])
    ElMessage.success(t('designer.entityRemoved'))
    emit('update:entities', JSON.parse(JSON.stringify(entities.value)))
  } catch { /* cancel */ }
}

watch(currentIndex, (idx) => {
  const target = entities.value[idx]
  if (target) Object.assign(entityModel, JSON.parse(JSON.stringify(target)))
})

const propertyTypes: PropertyTypeDefinition[] = [
  { type: 'string', name: '文本', description: '文本字段', icon: Document, color: '#409EFF', defaultRequired: false, hasLength: true },
  { type: 'int', name: '整数', description: '整型数值', icon: Promotion, color: '#67C23A', defaultRequired: false, hasLength: false },
  { type: 'decimal', name: '小数', description: '小数数值', icon: Money, color: '#E6A23C', defaultRequired: false, hasLength: false },
  { type: 'bool', name: '布尔', description: '是/否', icon: Switch, color: '#F56C6C', defaultRequired: false, hasLength: false },
  { type: 'datetime', name: '日期时间', description: '日期与时间', icon: Calendar, color: '#909399', defaultRequired: false, hasLength: false },
  { type: 'guid', name: 'GUID', description: '全局唯一标识', icon: Key, color: '#722ED1', defaultRequired: false, hasLength: false },
]
// ------------------- Utilities: normalization & dedupe -------------------
const toKey = (name: string) => (name || '').trim().toLowerCase()
const toPascal = (name: string) => (name || '')
  .replace(/(^|_|-|\s)+(\w)/g, (_, __, c) => (c || '').toUpperCase())
  .replace(/[^A-Za-z0-9]/g, '')

const mergeEntities = (base: EnhancedEntityModel, inc: EnhancedEntityModel): EnhancedEntityModel => {
  // merge properties by name (case-insensitive)
  const propMap = new Map<string, any>()
  for (const p of (base.properties || [])) propMap.set(toKey(p.name), { ...p })
  for (const p of (inc.properties || [])) {
    const k = toKey(p.name)
    if (!propMap.has(k)) propMap.set(k, { ...p })
  }
  base.properties = Array.from(propMap.values()) as any

  // merge relationships (dedupe by id or target/name)
  const relMap = new Map<string, any>()
  for (const r of (base.relationships || [])) relMap.set(r.id || `${r.targetEntityId}-${r.name}`, { ...r })
  for (const r of (inc.relationships || [])) {
    const rk = r.id || `${r.targetEntityId}-${r.name}`
    if (!relMap.has(rk)) relMap.set(rk, { ...r })
  }
  base.relationships = Array.from(relMap.values()) as any
  return base
}

const dedupeEntities = (list: EnhancedEntityModel[]): { unique: EnhancedEntityModel[]; removed: number } => {
  const map = new Map<string, EnhancedEntityModel>()
  let removed = 0
  for (const e of list || []) {
    const key = toKey(e.name)
    if (map.has(key)) {
      const merged = mergeEntities(map.get(key)!, e)
      map.set(key, merged)
      removed += 1
    } else {
      // normalize name to PascalCase to keep consistent
      const normalized = { ...e, name: toPascal(e.name) } as EnhancedEntityModel
      map.set(key, normalized)
    }
  }
  return { unique: Array.from(map.values()), removed }
}


watch(entityFeatures, (newFeatures: string[]) => {
    entityModel.isAggregateRoot = newFeatures.includes('isAggregateRoot')
    entityModel.isMultiTenant = newFeatures.includes('isMultiTenant')
    entityModel.isSoftDelete = newFeatures.includes('isSoftDelete')
  }, { deep: true }
)

watch(() => props.schema, (val) => {
  if (val) entityModel.schema = val
}, { immediate: true })

watch(() => props.moduleName, (val) => {
  if (val) entityModel.module = val
}, { immediate: true })

// Default namespace and table name derived from system/module if user hasn't changed them yet
const userEditedNamespace = ref(false)
const userEditedTable = ref(false)
const userEditedBaseClass = ref(false)
watch(() => entityModel.namespace, (v) => { if (v && v !== 'SmartAbp.Sample') userEditedNamespace.value = true })
watch(() => entityModel.tableName, (v) => { if (v && v !== 'AppSampleEntities') userEditedTable.value = true })
watch(() => entityModel.baseClass, (v) => { if (v && v !== 'FullAuditedAggregateRoot') userEditedBaseClass.value = true })

watch([() => props.systemName, () => props.moduleName], ([sys, mod]) => {
  if (!sys || !mod) return
  const ns = `SmartAbp.${sys}.${mod}.Domain`
  if (!userEditedNamespace.value) entityModel.namespace = ns
}, { immediate: true })

// Derive table name from entity name (pluralize naive: add 's' if not ends with s)
watch(() => entityModel.name, (name) => {
  if (!name || userEditedTable.value) return
  const plural = name.endsWith('s') ? name : `${name}s`
  entityModel.tableName = `App${plural}`
})

// Recommend base class from architecture + aggregate root flag
const recommendBaseClass = (_arch?: string, isAgg?: boolean): string => {
  const agg = isAgg ?? entityModel.isAggregateRoot
  // For ABP, prefer FullAuditedAggregateRoot for aggregates, FullAuditedEntity otherwise
  return agg ? 'FullAuditedAggregateRoot' : 'FullAuditedEntity'
}

watch([() => props.architecture, () => entityModel.isAggregateRoot], () => {
  if (userEditedBaseClass.value) return
  entityModel.baseClass = recommendBaseClass(props.architecture, entityModel.isAggregateRoot)
}, { immediate: true })

const onDragStart = (event: DragEvent, propertyType: PropertyTypeDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(propertyType))
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  if (event.dataTransfer) {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      try {
        const propertyType = JSON.parse(data) as PropertyTypeDefinition
        addPropertyFromType(propertyType)
      } catch (e) {
        console.error('Failed to parse dropped data:', e)
      }
    }
  }
}

const addPropertyFromType = (propertyType: PropertyTypeDefinition) => {
  const propertyCount = entityModel.properties.length + 1
  const newProperty: EntityProperty = {
    id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `Property${propertyCount}`,
    type: propertyType.type,
    isRequired: propertyType.defaultRequired,
    description: propertyType.description,
    isKey: false,
    isUnique: false,
    isIndexed: false,
    validationRules: [],
    displayOrder: propertyCount,
    groupName: 'General',
    isVisible: true,
    isReadonly: false,
    isAuditField: false,
    isSoftDeleteField: false,
    isTenantField: false,
  }

  if (propertyType.hasLength && propertyType.type === 'string') {
    newProperty.maxLength = 256
  }

  entityModel.properties.push(newProperty)
  nextTick(() => {
    selectProperty(newProperty.id)
  })
  ElMessage.success(`已添加属性：${propertyType.name}`)
  emit('update:entities', JSON.parse(JSON.stringify(entities.value)))
}

const selectProperty = (propertyId: string) => {
  selectedProperty.value = propertyId
  const property = entityModel.properties.find((p: EntityProperty) => p.id === propertyId)
  if (property) {
    selectedPropertyData.value = { ...property }
  }
}

const editProperty = (property: EntityProperty) => {
  editingProperty.value = { ...property }
  showPropertyDialog.value = true
}

const duplicateProperty = (property: EntityProperty) => {
  const duplicated: EntityProperty = {
    ...property,
    id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${property.name}Copy`,
  }
  const index = entityModel.properties.findIndex((p: EntityProperty) => p.id === property.id)
  entityModel.properties.splice(index + 1, 0, duplicated)
  ElMessage.success('Property duplicated')
}

const removeProperty = async (index: number) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to remove this property?', 'Confirm Delete', { type: 'warning' })
    entityModel.properties.splice(index, 1)
    selectedProperty.value = null
    selectedPropertyData.value = null
    ElMessage.success('Property removed')
  } catch { /* User cancelled */ }
}

const getPropertyTypeColor = (type: PropertyType): string => {
  const propertyType = propertyTypes.find(pt => pt.type === type)
  return propertyType?.color || '#409EFF'
}

const getPropertyTypeIcon = (type: PropertyType): Component | string => {
  const propertyType = propertyTypes.find(pt => pt.type === type)
  return propertyType?.icon || 'Document'
}

const clearDesigner = async () => {
  try {
    await ElMessageBox.confirm('确定要清空设计器吗？', '确认清空', { type: 'warning' })
    Object.assign(entityModel, {
      id: '', name: '', module: '', description: '', properties: [],
      isAggregateRoot: true, isMultiTenant: true, isSoftDelete: true, baseClass: '',
    })
    entityFeatures.value = ['isAggregateRoot', 'isMultiTenant', 'isSoftDelete']
    selectedProperty.value = null
    selectedPropertyData.value = null
    ElMessage.success('已清空')
  } catch { /* User cancelled */ }
}

const previewCodeMethod = async () => {
  if (!entityModel.name) {
    ElMessage.error('请先填写实体名称再预览代码')
    return
  }
  showPreview.value = true
}

const generateEntity = async () => {
  if (!entityModel.name) {
    ElMessage.error('请先填写实体名称')
    return
  }
  isGenerating.value = true
  try {
    console.log('Generating entity:', JSON.parse(JSON.stringify(entityModel)))
    await new Promise(resolve => setTimeout(resolve, 1000))
    const result = { success: true, message: '实体生成成功！' }
    ElMessage.success(result.message)
    emit('entityGenerated', result)
  } catch (error) {
    ElMessage.error('生成实体失败：' + (error as Error).message)
  } finally {
    isGenerating.value = false
  }
}

// SQL import
const showSqlDialog = ref(false)
const sqlText = ref('')
const importMode = ref<'append' | 'replace'>('append')

const openSqlImport = () => { showSqlDialog.value = true }

const mapSqlType = (raw: string): { type: PropertyType; maxLength?: number } => {
  const s = raw.toLowerCase()
  if (s.startsWith('nvarchar') || s.startsWith('varchar') || s.startsWith('char') || s.startsWith('nchar')) {
    const m = s.match(/\((\d+)\)/)
    return { type: 'string', maxLength: m ? Number(m[1]) : 256 }
  }
  if (s.startsWith('uniqueidentifier') || s.includes('uuid')) return { type: 'guid' as any }
  if (s.startsWith('bit') || s.startsWith('boolean')) return { type: 'bool' as any }
  if (s.startsWith('datetime') || s.startsWith('timestamp') || s.startsWith('date')) return { type: 'datetime' as any }
  if (s.startsWith('decimal') || s.startsWith('numeric') || s.startsWith('money')) return { type: 'decimal' as any }
  if (s.startsWith('bigint') || s.startsWith('long')) return { type: 'int' as any }
  if (s.startsWith('int') || s.startsWith('integer')) return { type: 'int' as any }
  return { type: 'string' as any }
}

const parseSqlToEntities = (sql: string): EnhancedEntityModel[] => {
  const tables: Record<string, EnhancedEntityModel> = {}
  const fkDefs: Array<{ table: string; column: string; refTable: string; refColumn: string }> = []

  const createTableRegex = /create\s+table\s+([\w\.[\]]+)/ig
  let match: RegExpExecArray | null
  const blocks: Array<{ name: string; body: string }> = []
  while ((match = createTableRegex.exec(sql)) !== null) {
    const name = match[1].replace(/\[|\]/g, '')
    const start = match.index + match[0].length
    const end = sql.indexOf(';', start) !== -1 ? sql.indexOf(';', start) : sql.length
    const body = sql.slice(start, end)
    blocks.push({ name, body })
  }

  for (const { name, body } of blocks) {
    const simpleName = name.includes('.') ? name.split('.').pop()! : name
    const entity: EnhancedEntityModel = {
      id: simpleName,
      name: simpleName,
      displayName: simpleName,
      description: '',
      properties: [],
      relationships: [],
    } as any

    const lines = body.split(/\r?\n/).map(l => l.trim()).filter(l => l.length)
    for (const line of lines) {
      const fkMatch = line.match(/foreign\s+key\s*\((\w+)\)\s*references\s+([\w\.[\]]+)\s*\((\w+)\)/i)
      if (fkMatch) {
        const column = fkMatch[1]
        const refTable = fkMatch[2].replace(/\[|\]/g, '')
        const refColumn = fkMatch[3]
        fkDefs.push({ table: simpleName, column, refTable: refTable.includes('.') ? refTable.split('.').pop()! : refTable, refColumn })
        continue
      }
      const colMatch = line.match(/^(\[?\w+\]?)[\s\t]+([\w\(\),]+)(.*)$/)
      if (colMatch && !/^(primary|constraint|foreign|unique|key)/i.test(line)) {
        const col = colMatch[1].replace(/\[|\]/g, '')
        const typeRaw = colMatch[2]
        const mapped = mapSqlType(typeRaw)
        const prop: any = {
          id: `prop_${entity.name}_${col}`,
          name: col,
          type: mapped.type,
          isRequired: /not\s+null/i.test(line),
        }
        if (mapped.maxLength) prop.maxLength = mapped.maxLength
        entity.properties.push(prop)
      }
    }
    tables[simpleName] = entity
  }

  // Detect many-to-many for pure join tables: two FKs and (optional) composite PK
  const tableNames = Object.keys(tables)
  for (const t of tableNames) {
    const fks = fkDefs.filter(f => f.table === t)
    const cols = tables[t].properties.map(p => p.name)
    if (fks.length === 2 && cols.every(c => fks.some(f => f.column === c))) {
      const [a, b] = fks
      const A = tables[a.refTable]
      const B = tables[b.refTable]
      if (A && B) {
        A.relationships.push({ id: `rel_${A.name}_${B.name}`, name: `${A.name}_${B.name}`, targetEntityId: B.name, type: 'ManyToMany', sourceNavigationProperty: B.name, targetNavigationProperty: A.name } as any)
        B.relationships.push({ id: `rel_${B.name}_${A.name}`, name: `${B.name}_${A.name}`, targetEntityId: A.name, type: 'ManyToMany', sourceNavigationProperty: A.name, targetNavigationProperty: B.name } as any)
        delete tables[t] // drop join table entity
      }
    }
  }

  // OneToMany / ManyToOne
  for (const fk of fkDefs) {
    const source = tables[fk.table]
    const target = tables[fk.refTable]
    if (source && target) {
      // Source has FK to target => many source to one target
      source.relationships.push({ id: `rel_${source.name}_${target.name}`, name: `${source.name}_${target.name}`, targetEntityId: target.name, type: 'ManyToOne', sourceNavigationProperty: target.name } as any)
      target.relationships.push({ id: `rel_${target.name}_${source.name}`, name: `${target.name}_${source.name}`, targetEntityId: source.name, type: 'OneToMany', sourceNavigationProperty: source.name } as any)
    }
  }

  return Object.values(tables)
}

const doImportSql = () => {
  try {
    const parsed = parseSqlToEntities(sqlText.value)
    if (importMode.value === 'replace') {
      entities.value = parsed
      currentIndex.value = 0
      Object.assign(entityModel, parsed[0] || {})
    } else {
      entities.value.push(...parsed)
      currentIndex.value = entities.value.length - parsed.length
      Object.assign(entityModel, entities.value[currentIndex.value])
    }
    showSqlDialog.value = false
    sqlText.value = ''
    ElMessage.success(t('designer.importSuccess', { count: parsed.length }))
  } catch (e) {
    ElMessage.error(t('designer.parseFailed'))
  }
}

// DB import
const showDbDialog = ref(false)
const dbProvider = ref<'SqlServer'|'PostgreSql'|'MySql'|'Oracle'>('SqlServer')
const dbConnName = ref<string>('')
const dbSchema = ref<string>('')
const connStrings = ref<string[]>([])
const schemaTables = ref<string[]>([])
const selectedTables = ref<string[]>([])
const lastSchema = ref<DatabaseSchema | null>(null)
const loadingTables = ref(false)

const openDbImport = async () => {
  // If DB provider/conn already selected in step 2, lock them here to avoid divergence
  if (props.dbProvider && dbProvider.value !== props.dbProvider) dbProvider.value = props.dbProvider
  if (props.dbConnName && dbConnName.value !== props.dbConnName) dbConnName.value = props.dbConnName
  showDbDialog.value = true
  if (connStrings.value.length === 0) connStrings.value = await codeGeneratorApi.getConnectionStrings()
}

const loadTables = async () => {
  if (!dbConnName.value) { ElMessage.warning(t('designer.connRequired')); return }
  loadingTables.value = true
  try {
    const schema = await codeGeneratorApi.introspectDatabase({ connectionStringName: dbConnName.value, provider: dbProvider.value, schema: dbSchema.value || undefined })
    lastSchema.value = schema
    schemaTables.value = (schema.tables || []).map(t => t.name)
    ElMessage.success(t('designer.tablesLoaded', { count: schemaTables.value.length }))
  } catch (e) {
    ElMessage.error(t('designer.loadFailed'))
  } finally {
    loadingTables.value = false
  }
}

const mapDbType = (dt: string): PropertyType => {
  const s = dt.toLowerCase()
  if (s.includes('char') || s.includes('text') || s.includes('string')) return 'string' as any
  if (s.includes('uuid') || s.includes('uniqueidentifier')) return 'guid' as any
  if (s.includes('bool') || s === 'bit') return 'bool' as any
  if (s.includes('date') || s.includes('time')) return 'datetime' as any
  if (s.includes('decimal') || s.includes('numeric') || s.includes('money')) return 'decimal' as any
  if (s.includes('bigint') || s.includes('long')) return 'int' as any
  if (s.includes('int')) return 'int' as any
  return 'string' as any
}

const dbSchemaToEntities = (schema: DatabaseSchema, only?: string[]): EnhancedEntityModel[] => {
  const tables = schema.tables.filter(t => !only || only.includes(t.name))
  const map: Record<string, EnhancedEntityModel> = {}
  for (const t of tables) {
    map[t.name] = {
      id: t.name,
      name: t.name,
      displayName: t.name,
      description: '',
      properties: t.columns.map(c => ({
        id: `prop_${t.name}_${c.name}`,
        name: c.name,
        type: mapDbType(c.dataType),
        isRequired: !c.isNullable,
        maxLength: c.maxLength ?? undefined,
        isKey: !!c.isPrimaryKey,
      })) as any,
      relationships: [],
    } as any
  }
  // many-to-many via pure join tables (two FKs covering all columns)
  for (const t of tables) {
    const cols = new Set(t.columns.map(c => c.name))
    const fks = t.foreignKeys
    if (fks.length === 2 && fks.every(f => cols.has(f.column))) {
      const a = fks[0].referencedTable, b = fks[1].referencedTable
      if (map[a] && map[b]) {
        map[a].relationships.push({ id: `rel_${a}_${b}`, name: `${a}_${b}`, targetEntityId: b, type: 'ManyToMany', sourceNavigationProperty: b, targetNavigationProperty: a } as any)
        map[b].relationships.push({ id: `rel_${b}_${a}`, name: `${b}_${a}`, targetEntityId: a, type: 'ManyToMany', sourceNavigationProperty: a, targetNavigationProperty: b } as any)
      }
      continue
    }
    // one-to-many / many-to-one
    for (const fk of fks) {
      const source = t.name, target = fk.referencedTable
      if (map[source] && map[target]) {
        map[source].relationships.push({ id: `rel_${source}_${target}`, name: `${source}_${target}`, targetEntityId: target, type: 'ManyToOne', sourceNavigationProperty: target } as any)
        map[target].relationships.push({ id: `rel_${target}_${source}`, name: `${target}_${source}`, targetEntityId: source, type: 'OneToMany', sourceNavigationProperty: source } as any)
      }
    }
  }
  return Object.values(map)
}

const doImportDb = () => {
  if (!lastSchema.value) { ElMessage.warning(t('designer.loadTablesFirst')); return }
  const ents = dbSchemaToEntities(lastSchema.value, selectedTables.value.length ? selectedTables.value : undefined)
  if (importMode.value === 'replace') {
    const { unique, removed } = dedupeEntities(ents)
    entities.value = unique
    currentIndex.value = 0
    Object.assign(entityModel, unique[0] || {})
    if (removed > 0) ElMessage.warning(`发现并合并了 ${removed} 个重复实体`)
  } else {
    const combined = [...entities.value, ...ents]
    const { unique, removed } = dedupeEntities(combined)
    entities.value = unique
    currentIndex.value = Math.max(0, unique.findIndex(e => toKey(e.name) === toKey(ents[0]?.name)))
    Object.assign(entityModel, entities.value[currentIndex.value] || {})
    if (removed > 0) ElMessage.warning(`发现并合并了 ${removed} 个重复实体`)
  }
  showDbDialog.value = false
  ElMessage.success(t('designer.importSuccess', { count: ents.length }))
  emit('update:entities', JSON.parse(JSON.stringify(entities.value)))
}

const closePropertyDialog = () => {
  showPropertyDialog.value = false
  editingProperty.value = null
}

const closePreview = () => {
  showPreview.value = false
}

const savePropertyConfig = (property: EntityProperty) => {
  if (editingProperty.value) {
    const index = entityModel.properties.findIndex((p: EntityProperty) => p.id === property.id)
    if (index !== -1) {
      entityModel.properties[index] = property
    }
  }
  closePropertyDialog()
  ElMessage.success('属性保存成功')
  emit('update:entities', JSON.parse(JSON.stringify(entities.value)))
}

// -------- Draft save / load (localStorage) --------
const draftKey = () => {
  const sys = props.systemName || 'DefaultSystem'
  const mod = props.moduleName || 'DefaultModule'
  return `lowcode:draft:${sys}:${mod}`
}

const saveDraft = () => {
  const payload = {
    schema: entityModel.schema,
    namespace: entityModel.namespace,
    module: entityModel.module,
    entities: entities.value,
    ts: Date.now(),
    systemName: props.systemName || 'DefaultSystem',
    moduleName: props.moduleName || 'DefaultModule',
  }
  localStorage.setItem(draftKey(), JSON.stringify(payload))
  localStorage.setItem('lowcode:draft:latest', JSON.stringify(payload))
  ElMessage.success(t('designer.draftSaved'))
}

const loadDraft = () => {
  let raw = localStorage.getItem(draftKey())
  if (!raw) {
    const latest = localStorage.getItem('lowcode:draft:latest')
    if (latest) {
      try {
        const l = JSON.parse(latest)
        if ((!props.systemName || l.systemName === props.systemName) && (!props.moduleName || l.moduleName === props.moduleName)) {
          raw = latest
        }
      } catch { /* ignore */ }
    }
  }
  if (!raw) { ElMessage.info(t('designer.noDraft')); return }
  try {
    const data = JSON.parse(raw)
    if (Array.isArray(data.entities) && data.entities.length > 0) {
      entities.value = data.entities
      currentIndex.value = 0
      Object.assign(entityModel, JSON.parse(JSON.stringify(entities.value[0])))
      if (data.schema) entityModel.schema = data.schema
      if (data.namespace) entityModel.namespace = data.namespace
      if (data.module) entityModel.module = data.module
      ElMessage.success(t('designer.draftLoaded'))
      emit('update:entities', JSON.parse(JSON.stringify(entities.value)))
    } else {
      ElMessage.info(t('designer.noDraft'))
    }
  } catch {
    ElMessage.error(t('designer.loadFailed'))
  }
}

// optional: auto-save on unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try { saveDraft() } catch { /* ignore */ }
  })
}

// auto-load when this step becomes active and entities are empty
watch(() => props.active, (val) => {
  if (val && entities.value.length === 0) {
    try { loadDraft() } catch { /* ignore */ }
  }
  if (!val) {
    try { saveDraft() } catch { /* ignore */ }
  }
}, { immediate: false })

defineExpose({ saveDraft, loadDraft })

// Emit initial entities to parent on mount, and whenever entities change
onMounted(() => {
  try { emit('update:entities', JSON.parse(JSON.stringify(entities.value))) } catch {}
})

watch(entities, (val) => {
  // enforce uniqueness continuously
  const { unique, removed } = dedupeEntities(val as any)
  if (removed > 0 || unique.length !== val.length) {
    entities.value = unique
    if (removed > 0) ElMessage.warning(`发现并合并了 ${removed} 个重复实体`)
  }
  try { emit('update:entities', JSON.parse(JSON.stringify(entities.value))) } catch {}
}, { deep: true })

const emit = defineEmits<{
  (e: 'entityGenerated', result: any): void
  (e: 'update:entities', value: EnhancedEntityModel[]): void
  (e: 'update:db', value: { connectionStringName?: string; provider?: string; schema?: string }): void
}>()
</script>

<script lang="ts">
export default {}
</script>

<style scoped>
.entity-designer { width: 100%; }
.designer-card { border-radius: 8px; }
.designer-header, .header-left, .header-actions { display: flex; align-items: center; }
.properties-workspace { display: grid; grid-template-columns: 240px 1fr; gap: 16px; height: 100%; }
.property-toolbox, .entity-canvas { border: 1px solid #e4e7ed; border-radius: 6px; }
.toolbox-item, .property-item { cursor: grab; }
.drop-zone { min-height: 400px; }
</style>
