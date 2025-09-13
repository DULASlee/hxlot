<template>
  <div class="entity-designer">
    <el-card class="designer-card">
      <template #header>
        <div class="designer-header">
          <div class="header-left">
            <el-icon class="header-icon"><Collection /></el-icon>
            <span class="header-title">Entity Designer</span>
            <el-tag v-if="entityModel.name" type="primary" size="small">
              {{ entityModel.name }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button @click="clearDesigner" size="small" type="danger" plain>
              <el-icon><Delete /></el-icon> Clear
            </el-button>
            <el-button @click="activeTab = 'relationships'" size="small" type="success" plain>
              <el-icon><Connection /></el-icon> Relationships
            </el-button>
            <el-button @click="previewCodeMethod" size="small" type="info" plain>
              <el-icon><View /></el-icon> Preview
            </el-button>
            <el-button @click="generateEntity" size="small" type="primary" :loading="isGenerating">
              <el-icon><MagicStick /></el-icon> Generate
            </el-button>
          </div>
        </div>
      </template>

      <div class="designer-content">
        <!-- Entity Configuration Panel -->
        <div class="config-panel">
          <el-card shadow="never" class="config-card">
            <template #header>
              <span><el-icon><Setting /></el-icon> Entity Configuration</span>
            </template>

            <el-form :model="entityModel" label-width="120px" size="small">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Entity Name" required>
                    <el-input
                      v-model="entityModel.name"
                      placeholder="e.g., Product, Customer"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Module">
                    <el-input v-model="entityModel.module" placeholder="e.g., Catalog, Orders" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Base Entity">
                    <el-input v-model="entityModel.baseClass" placeholder="e.g., FullAuditedAggregateRoot" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Description">
                    <el-input v-model="entityModel.description" placeholder="Entity description" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="Namespace">
                    <el-input v-model="entityModel.namespace" placeholder="e.g., MyApp.Domain" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Table Name">
                    <el-input v-model="entityModel.tableName" placeholder="Database table name" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Schema">
                    <el-input v-model="entityModel.schema" placeholder="Database schema" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item>
                <el-checkbox-group v-model="entityFeatures">
                  <el-checkbox label="isAggregateRoot">Aggregate Root</el-checkbox>
                  <el-checkbox label="isMultiTenant">Multi-Tenant</el-checkbox>
                  <el-checkbox label="isSoftDelete">Soft Delete</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- Main Designer Area -->
        <div class="designer-main">
          <el-tabs v-model="activeTab" class="designer-tabs">
            <el-tab-pane label="Properties" name="properties">
              <div class="properties-workspace">
                <!-- Property Toolbox -->
                <div class="property-toolbox">
                  <h4><el-icon><Box /></el-icon> Property Types</h4>
                  <div class="toolbox-items">
                    <div
                      v-for="propertyType in propertyTypes"
                      :key="propertyType.type"
                      class="toolbox-item"
                      draggable="true"
                      @dragstart="onDragStart($event, propertyType)"
                    >
                      <el-icon class="type-icon" :style="{ color: propertyType.color }">
                        <component :is="propertyType.icon" />
                      </el-icon>
                      <span class="type-name">{{ propertyType.name }}</span>
                    </div>
                  </div>
                </div>

                <!-- Entity Canvas -->
                <div class="entity-canvas">
                  <div class="canvas-header">
                    <h4>{{ entityModel.name || 'Untitled Entity' }}</h4>
                    <el-tag v-if="entityModel.properties.length" size="small">
                      {{ entityModel.properties.length }} properties
                    </el-tag>
                  </div>

                  <div
                    class="drop-zone"
                    :class="{ 'drag-over': isDragOver }"
                    @drop="onDrop"
                    @dragover.prevent="isDragOver = true"
                    @dragleave="isDragOver = false"
                  >
                    <div v-if="entityModel.properties.length === 0" class="empty-state">
                      <el-icon class="empty-icon"><Plus /></el-icon>
                      <p>Drag property types here to build your entity</p>
                    </div>

                    <!-- Entity Properties -->
                    <draggable
                      v-model="entityModel.properties"
                      group="properties"
                      itemKey="id"
                      class="properties-list"
                    >
                      <template #item="{ element: property, index }">
                        <div class="property-item" :class="{ 'selected': selectedProperty === property.id }">
                          <div class="property-content" @click="selectProperty(property.id)">
                            <div class="property-header">
                              <el-icon class="property-icon" :style="{ color: getPropertyTypeColor(property.type) }">
                                <component :is="getPropertyTypeIcon(property.type)" />
                              </el-icon>
                              <span class="property-name">{{ property.name }}</span>
                              <span class="property-type">: {{ property.type }}</span>
                              <div class="property-badges">
                                <el-tag v-if="property.isRequired" type="danger" size="small">Required</el-tag>
                                <el-tag v-if="property.maxLength" type="info" size="small">{{ property.maxLength }}</el-tag>
                              </div>
                            </div>
                          </div>

                          <div class="property-actions">
                            <el-button @click="editProperty(property)" size="small" type="primary" text>
                              <el-icon><Edit /></el-icon>
                            </el-button>
                            <el-button @click="duplicateProperty(property)" size="small" type="success" text>
                              <el-icon><DocumentCopy /></el-icon>
                            </el-button>
                            <el-button @click="removeProperty(index)" size="small" type="danger" text>
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

            <el-tab-pane label="Relationships" name="relationships">
               <RelationshipDesigner
                :entities="entities"
                :relationships="entityModel.relationships"
                @update:relationships="entityModel.relationships = $event"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>

    <!-- Property Editor Dialog -->
    <el-dialog
      v-model="showPropertyDialog"
      title="Property Configuration"
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
      title="Enhanced Code Preview"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick, onMounted, defineEmits, Component } from 'vue'
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
  Tools,
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
import type {
  PropertyType,
  EntityProperty,
  EnhancedEntityModel,
} from '../../types/entity'

interface PropertyTypeDefinition {
  type: PropertyType
  name: string
  description: string
  icon: Component
  color: string
  defaultRequired: boolean
  hasLength: boolean
}

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
  displaySettings: {
    listViewColumns: [],
    detailViewSections: [],
    searchableFields: [],
    sortableFields: [],
  },
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

const propertyTypes: PropertyTypeDefinition[] = [
  { type: 'string', name: 'Text', description: 'Text field', icon: Document, color: '#409EFF', defaultRequired: false, hasLength: true },
  { type: 'int', name: 'Integer', description: 'Whole number', icon: Promotion, color: '#67C23A', defaultRequired: false, hasLength: false },
  { type: 'decimal', name: 'Decimal', description: 'Decimal number', icon: Money, color: '#E6A23C', defaultRequired: false, hasLength: false },
  { type: 'bool', name: 'Boolean', description: 'True/False', icon: Switch, color: '#F56C6C', defaultRequired: false, hasLength: false },
  { type: 'datetime', name: 'Date Time', description: 'Date and time', icon: Calendar, color: '#909399', defaultRequired: false, hasLength: false },
  { type: 'guid', name: 'GUID', description: 'Unique identifier', icon: Key, color: '#722ED1', defaultRequired: false, hasLength: false },
]

watch(entityFeatures, (newFeatures: string[]) => {
    entityModel.isAggregateRoot = newFeatures.includes('isAggregateRoot')
    entityModel.isMultiTenant = newFeatures.includes('isMultiTenant')
    entityModel.isSoftDelete = newFeatures.includes('isSoftDelete')
  }, { deep: true }
)

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
  ElMessage.success(`Added ${propertyType.name} property`)
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
    await ElMessageBox.confirm('Are you sure you want to clear the entire designer?', 'Confirm Clear', { type: 'warning' })
    Object.assign(entityModel, {
      id: '', name: '', module: '', description: '', properties: [],
      isAggregateRoot: true, isMultiTenant: true, isSoftDelete: true, baseClass: '',
    })
    entityFeatures.value = ['isAggregateRoot', 'isMultiTenant', 'isSoftDelete']
    selectedProperty.value = null
    selectedPropertyData.value = null
    ElMessage.success('Designer cleared')
  } catch { /* User cancelled */ }
}

const previewCodeMethod = async () => {
  if (!entityModel.name) {
    ElMessage.error('Please provide an entity name before previewing code.')
    return
  }
  showPreview.value = true
}

const generateEntity = async () => {
  if (!entityModel.name) {
    ElMessage.error('Please enter an entity name first')
    return
  }
  isGenerating.value = true
  try {
    console.log('Generating entity:', JSON.parse(JSON.stringify(entityModel)))
    await new Promise(resolve => setTimeout(resolve, 1000))
    const result = { success: true, message: 'Entity generated successfully!' }
    ElMessage.success(result.message)
    emit('entityGenerated', result)
  } catch (error) {
    ElMessage.error('Failed to generate entity: ' + (error as Error).message)
  } finally {
    isGenerating.value = false
  }
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
  ElMessage.success('Property saved successfully')
}

const emit = defineEmits<{
  (e: 'entityGenerated', result: any): void
}>()
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
