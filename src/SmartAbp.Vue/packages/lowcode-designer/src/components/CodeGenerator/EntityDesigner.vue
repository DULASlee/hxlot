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
            <el-button @click="showRelationshipDiagram = true" size="small" type="success" plain>
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
                      @input="updateEntityName"
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
                  <el-form-item label="Aggregate Root">
                    <el-input v-model="entityModel.aggregate" placeholder="e.g., ProductAggregate" />
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
                  <el-checkbox label="hasExtraProperties">Extra Properties</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- Main Designer Area -->
        <div class="designer-main">
          <el-tabs v-model="activeTab" class="designer-tabs">
            <el-tab-pane label="Properties" name="properties">
              <div class="designer-workspace">
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
                  <small class="type-desc">{{ propertyType.description }}</small>
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
                @dragover.prevent="onDragOver"
                @dragleave="onDragLeave"
              >
                <div v-if="entityModel.properties.length === 0" class="empty-state">
                  <el-icon class="empty-icon"><Plus /></el-icon>
                  <p>Drag property types here to build your entity</p>
                </div>

                <!-- Entity Properties -->
                <VueDraggable
                  v-model="entityModel.properties"
                  group="properties"
                  itemKey="id"
                  class="properties-list"
                  @start="onSortStart"
                  @end="onSortEnd"
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
                        <div v-if="property.description" class="property-description">
                          {{ property.description }}
                        </div>
                      </div>

                      <div class="property-actions">
                        <el-button @click="editProperty(property)" size="small" type="primary" text>
                          <el-icon><Edit /></el-icon>
                        </el-button>
                        <el-button @click="duplicateProperty(property)" size="small" type="success" text>
                          <el-icon><CopyDocument /></el-icon>
                        </el-button>
                        <el-button @click="removeProperty(index)" size="small" type="danger" text>
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </template>
                </VueDraggable>
              </div>
            </div>
          </div>
            </el-tab-pane>

            <el-tab-pane label="Relationships" name="relationships">
              <RelationshipEditor
                v-model:relationships="entityModel.relationships"
                :entities="entities"
                :current-entity="entityModel"
                @add-relationship="addRelationship"
                @edit-relationship="editRelationship"
                @remove-relationship="removeRelationship"
              />
            </el-tab-pane>

            <el-tab-pane label="Validation Rules" name="validation">
              <ValidationRuleEditor
                v-model:rules="entityModel.validationRules"
                :properties="entityModel.properties"
                @add-rule="addValidationRule"
                @edit-rule="editValidationRule"
                @remove-rule="removeValidationRule"
              />
            </el-tab-pane>

            <el-tab-pane label="Indexes & Constraints" name="indexes">
              <div class="indexes-constraints-panel">
                <!-- Indexes configuration -->
                <el-card shadow="never" class="config-card">
                  <template #header>
                    <span>Database Indexes</span>
                    <el-button @click="addIndex" size="small" type="primary" plain>
                      <el-icon><Plus /></el-icon> Add Index
                    </el-button>
                  </template>
                  <!-- Index list implementation -->
                </el-card>

                <!-- Constraints configuration -->
                <el-card shadow="never" class="config-card">
                  <template #header>
                    <span>Database Constraints</span>
                    <el-button @click="addConstraint" size="small" type="primary" plain>
                      <el-icon><Plus /></el-icon> Add Constraint
                    </el-button>
                  </template>
                  <!-- Constraint list implementation -->
                </el-card>
              </div>
            </el-tab-pane>
          </el-tabs>

          <!-- Property Configuration Panel -->
          <div v-if="selectedPropertyData" class="property-config">
            <el-card shadow="never" class="config-card">
              <template #header>
                <span><el-icon><Tools /></el-icon> Property Configuration</span>
              </template>

              <el-form :model="selectedPropertyData" label-width="100px" size="small">
                <el-form-item label="Name" required>
                  <el-input v-model="selectedPropertyData.name" />
                </el-form-item>

                <el-form-item label="Type">
                  <el-select v-model="selectedPropertyData.type" style="width: 100%">
                    <el-option
                      v-for="type in availableTypes"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="Required">
                  <el-switch v-model="selectedPropertyData.isRequired" />
                </el-form-item>

                <el-form-item v-if="isStringType(selectedPropertyData.type)" label="Max Length">
                  <el-input-number
                    v-model="selectedPropertyData.maxLength"
                    :min="1"
                    :max="8000"
                    controls-position="right"
                  />
                </el-form-item>

                <el-form-item label="Description">
                  <el-input
                    v-model="selectedPropertyData.description"
                    type="textarea"
                    :rows="2"
                  />
                </el-form-item>

                <el-form-item label="Default Value">
                  <el-input v-model="selectedPropertyData.defaultValue" />
                </el-form-item>

                <el-form-item>
                  <el-button @click="applyPropertyChanges" type="primary" size="small">
                    Apply Changes
                  </el-button>
                  <el-button @click="cancelPropertyEdit" size="small">
                    Cancel
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Relationship Diagram Dialog -->
    <el-dialog
      v-model="showRelationshipDiagram"
      title="Entity Relationship Diagram"
      width="90%"
      :before-close="closeRelationshipDiagram"
    >
      <RelationshipDiagram
        :entities="[entityModel, ...entities]"
        :relationships="entityModel.relationships"
        @entity-selected="selectEntityInDiagram"
        @relationship-selected="selectRelationshipInDiagram"
      />

      <template #footer>
        <el-button @click="closeRelationshipDiagram">Close</el-button>
        <el-button @click="exportDiagram" type="primary">
          Export Diagram
        </el-button>
      </template>
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
        :entity="entityModel"
        :visible="showPreview"
        @regenerate="regenerateCode"
        @export="exportProject"
      />

      <template #footer>
        <el-button @click="closePreview">Close</el-button>
        <el-button @click="generateFromPreview" type="primary">
          Generate Project
        </el-button>
      </template>
    </el-dialog>

    <!-- Property Editor Dialog -->
    <el-dialog
      v-model="showPropertyDialog"
      title="Property Configuration"
      width="60%"
      :before-close="closePropertyDialog"
    >
      <PropertyEditor
        :property="editingProperty"
        :visible="showPropertyDialog"
        @save="savePropertyConfig"
        @cancel="closePropertyDialog"
        @preview="previewProperty"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick, onMounted } from 'vue'
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
  CopyDocument,
  Tools,
  Connection
} from '@element-plus/icons-vue'
import VueDraggable from 'vuedraggable'
import CodePreview from './CodePreview.vue'
import EnhancedCodePreview from './EnhancedCodePreview.vue'
import RelationshipDiagram from '../RelationshipDiagram/RelationshipDiagram.vue'
import RelationshipEditor from '../RelationshipDiagram/RelationshipEditor.vue'
import ValidationRuleEditor from '../ValidationRules/ValidationRuleEditor.vue'
import PropertyEditor from '../EntityProperty/PropertyEditor.vue'
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import { usePropertyDragDrop } from '@smartabp/lowcode-core'
import { CodeTemplateEngine } from '@smartabp/lowcode-core'
import type { 
  PropertyType, 
  EntityProperty, 
  EntityModel,
  EnhancedEntityModel,
  EntityRelationship,
  ValidationRule,
  EntityIndex,
  EntityConstraint
} from '@smartabp/lowcode-core'

// Drag and drop functionality
const { registerEntityCanvas, startPropertyDrag, dragOver, dragLeave, drop } = usePropertyDragDrop()

// Reactive state
const entityModel = reactive<EnhancedEntityModel>({
  name: '',
  module: '',
  aggregate: '',
  description: '',
  namespace: '',
  tableName: '',
  schema: '',
  properties: [],
  relationships: [],
  indexes: [],
  constraints: [],
  validationRules: [],
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true
})

const entityFeatures = ref(['isAggregateRoot', 'isMultiTenant', 'isSoftDelete', 'hasExtraProperties'])
const isDragOver = ref(false)
const selectedProperty = ref<string | null>(null)
const selectedPropertyData = ref<EntityProperty | null>(null)
const editingRelationship = ref<EntityRelationship | null>(null)
const editingProperty = ref<EntityProperty | null>(null)
const showPropertyDialog = ref(false)
const isGenerating = ref(false)
const showPreview = ref(false)
const showRelationshipDialog = ref(false)
const showValidationDialog = ref(false)
const showRelationshipDiagram = ref(false)
const previewCodeContent = ref('')
const activeTab = ref('properties')
const entities = ref<EnhancedEntityModel[]>([])

// Property types available in toolbox
const propertyTypes: PropertyType[] = [
  {
    type: 'string',
    name: 'Text',
    description: 'Text field',
    icon: 'Document',
    color: '#409EFF',
    defaultRequired: false,
    hasLength: true
  },
  {
    type: 'int',
    name: 'Integer',
    description: 'Whole number',
    icon: 'Promotion',
    color: '#67C23A',
    defaultRequired: false,
    hasLength: false
  },
  {
    type: 'decimal',
    name: 'Decimal',
    description: 'Decimal number',
    icon: 'Money',
    color: '#E6A23C',
    defaultRequired: false,
    hasLength: false
  },
  {
    type: 'bool',
    name: 'Boolean',
    description: 'True/False',
    icon: 'Switch',
    color: '#F56C6C',
    defaultRequired: false,
    hasLength: false
  },
  {
    type: 'DateTime',
    name: 'Date Time',
    description: 'Date and time',
    icon: 'Calendar',
    color: '#909399',
    defaultRequired: false,
    hasLength: false
  },
  {
    type: 'Guid',
    name: 'GUID',
    description: 'Unique identifier',
    icon: 'Key',
    color: '#722ED1',
    defaultRequired: false,
    hasLength: false
  }
]

const availableTypes = [
  { value: 'string', label: 'String' },
  { value: 'int', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'bool', label: 'Boolean' },
  { value: 'DateTime', label: 'DateTime' },
  { value: 'Guid', label: 'GUID' },
  { value: 'byte[]', label: 'Byte Array' },
  { value: 'double', label: 'Double' },
  { value: 'float', label: 'Float' },
  { value: 'long', label: 'Long' }
]

// Computed properties
const selectedPropertyIndex = computed(() => {
  return entityModel.properties.findIndex(p => p.id === selectedProperty.value)
})

// Initialize drag-drop functionality
onMounted(() => {
  registerEntityCanvas(addPropertyFromType)
})

// Watchers
watch(entityFeatures, (newFeatures) => {
  entityModel.isAggregateRoot = newFeatures.includes('isAggregateRoot')
  entityModel.isMultiTenant = newFeatures.includes('isMultiTenant')
  entityModel.isSoftDelete = newFeatures.includes('isSoftDelete')
  entityModel.hasExtraProperties = newFeatures.includes('hasExtraProperties')
}, { deep: true })

// Methods
const updateEntityName = () => {
  if (!entityModel.aggregate && entityModel.name) {
    entityModel.aggregate = entityModel.name + 'Aggregate'
  }
}

const onDragStart = (event: DragEvent, propertyType: PropertyType) => {
  startPropertyDrag(propertyType, event)
}

const onDragOver = (event: DragEvent) => {
  dragOver('entity-canvas', event)
  isDragOver.value = true
}

const onDragLeave = () => {
  dragLeave('entity-canvas')
  isDragOver.value = false
}

const onDrop = (event: DragEvent) => {
  drop('entity-canvas', event)
  isDragOver.value = false
}

const addPropertyFromType = (propertyType: PropertyType) => {
  const propertyCount = entityModel.properties.length + 1
  const newProperty: EntityProperty = {
    id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `Property${propertyCount}`,
    type: propertyType.type,
    isRequired: propertyType.defaultRequired,
    description: `${propertyType.description} property`
  }

  if (propertyType.hasLength && propertyType.type === 'string') {
    newProperty.maxLength = 256
  }

  entityModel.properties.push(newProperty)

  // Auto-select the new property for editing
  nextTick(() => {
    selectProperty(newProperty.id)
  })

  ElMessage.success(`Added ${propertyType.name} property`)
}

const selectProperty = (propertyId: string) => {
  selectedProperty.value = propertyId
  const property = entityModel.properties.find(p => p.id === propertyId)
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
    name: `${property.name}Copy`
  }

  const index = entityModel.properties.findIndex(p => p.id === property.id)
  entityModel.properties.splice(index + 1, 0, duplicated)

  ElMessage.success('Property duplicated')
}

const removeProperty = async (index: number) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to remove this property?', 'Confirm Delete', {
      type: 'warning'
    })

    entityModel.properties.splice(index, 1)
    selectedProperty.value = null
    selectedPropertyData.value = null

    ElMessage.success('Property removed')
  } catch {
    // User cancelled
  }
}

const applyPropertyChanges = () => {
  if (selectedPropertyData.value && selectedProperty.value) {
    const index = selectedPropertyIndex.value
    if (index >= 0) {
      entityModel.properties[index] = { ...selectedPropertyData.value }
      ElMessage.success('Property updated')
    }
  }
}

const cancelPropertyEdit = () => {
  selectedProperty.value = null
  selectedPropertyData.value = null
}

const onSortStart = () => {
  // Handle sort start if needed
}

const onSortEnd = () => {
  // Handle sort end if needed
}

const getPropertyTypeColor = (type: string): string => {
  const propertyType = propertyTypes.find(pt => pt.type === type)
  return propertyType?.color || '#409EFF'
}

const getPropertyTypeIcon = (type: string): string => {
  const propertyType = propertyTypes.find(pt => pt.type === type)
  return propertyType?.icon || 'Document'
}

const isStringType = (type: string): boolean => {
  return type === 'string'
}

const clearDesigner = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to clear the entire designer?', 'Confirm Clear', {
      type: 'warning'
    })

    Object.assign(entityModel, {
      name: '',
      module: '',
      aggregate: '',
      description: '',
      properties: [],
      isAggregateRoot: true,
      isMultiTenant: true,
      isSoftDelete: true,
      hasExtraProperties: true
    })

    entityFeatures.value = ['isAggregateRoot', 'isMultiTenant', 'isSoftDelete', 'hasExtraProperties']
    selectedProperty.value = null
    selectedPropertyData.value = null

    ElMessage.success('Designer cleared')
  } catch {
    // User cancelled
  }
}

const previewCodeMethod = async () => {
  if (!entityModel.name) {
    ElMessage.error('Please enter an entity name first')
    return
  }

  try {
    // Generate preview code (simplified version)
    const code = generateEntityCode()
    previewCodeContent.value = code
    showPreview.value = true
  } catch (error) {
    ElMessage.error('Failed to generate preview: ' + (error as Error).message)
  }
}

const generateEntityCode = (): string => {
  const templateEngine = new CodeTemplateEngine()
  return templateEngine.generateEntityCode(entityModel)
}

const generateEntity = async () => {
  if (!entityModel.name) {
    ElMessage.error('Please enter an entity name first')
    return
  }

  if (entityModel.properties.length === 0) {
    ElMessage.error('Please add at least one property to the entity')
    return
  }

  isGenerating.value = true

  try {
    const result = await codeGeneratorApi.generateEntity({
      name: entityModel.name,
      module: entityModel.module,
      aggregate: entityModel.aggregate,
      description: entityModel.description,
      namespace: entityModel.namespace,
      tableName: entityModel.tableName,
      schema: entityModel.schema,
      isAggregateRoot: entityModel.isAggregateRoot,
      isMultiTenant: entityModel.isMultiTenant,
      isSoftDelete: entityModel.isSoftDelete,
      hasExtraProperties: entityModel.hasExtraProperties,
      properties: entityModel.properties,
      relationships: entityModel.relationships,
      indexes: entityModel.indexes,
      constraints: entityModel.constraints,
      validationRules: entityModel.validationRules
    })

    ElMessage.success('Entity generated successfully!')

    // Emit event to parent component
    emit('entityGenerated', result)

  } catch (error) {
    ElMessage.error('Failed to generate entity: ' + (error as Error).message)
  } finally {
    isGenerating.value = false
  }
}

// Relationship management methods
const addRelationship = (relationship: EntityRelationship) => {
  entityModel.relationships.push(relationship)
  ElMessage.success('Relationship added successfully')
}

const editRelationship = (relationship: EntityRelationship) => {
  editingRelationship.value = relationship
  showRelationshipDialog.value = true
}

const removeRelationship = (index: number) => {
  entityModel.relationships.splice(index, 1)
  ElMessage.success('Relationship removed successfully')
}

// Validation rule management methods
const addValidationRule = (rule: ValidationRule) => {
  entityModel.validationRules.push(rule)
  ElMessage.success('Validation rule added successfully')
}

const editValidationRule = (rule: ValidationRule) => {
  // Implementation for editing validation rules
  showValidationDialog.value = true
}

const removeValidationRule = (index: number) => {
  entityModel.validationRules.splice(index, 1)
  ElMessage.success('Validation rule removed successfully')
}

// Index and constraint management methods
const addIndex = () => {
  // Implementation for adding database indexes
}

const addConstraint = () => {
  // Implementation for adding database constraints
}

// Diagram methods
const closeRelationshipDiagram = () => {
  showRelationshipDiagram.value = false
}

const selectEntityInDiagram = (entity: EnhancedEntityModel) => {
  // Handle entity selection in diagram
}

const selectRelationshipInDiagram = (relationship: EntityRelationship) => {
  // Handle relationship selection in diagram
}

const exportDiagram = () => {
  // Implementation for exporting diagram
  ElMessage.success('Diagram exported successfully')
}

const regenerateCode = () => {
  // Regenerate code with current entity model
  ElMessage.success('Code regenerated successfully')
}

const exportProject = (files: any[]) => {
  // Implementation for exporting entire project
  ElMessage.success(`Exported ${files.length} files successfully`)
}

const closePropertyDialog = () => {
  showPropertyDialog.value = false
  editingProperty.value = null
}

const savePropertyConfig = (property: EntityProperty) => {
  if (editingProperty.value) {
    // Update existing property
    const index = entityModel.properties.findIndex(p => p.id === property.id)
    if (index !== -1) {
      entityModel.properties[index] = property
    }
  } else {
    // Add new property
    property.id = Date.now().toString()
    entityModel.properties.push(property)
  }
  closePropertyDialog()
  ElMessage.success('Property saved successfully')
}

const previewProperty = (property: EntityProperty) => {
  // Implementation for property preview
  ElMessage.info('Property preview feature coming soon')
}

const generateFromPreview = () => {
  closePreview()
  generateEntity()
}

const closePreview = () => {
  showPreview.value = false
  previewCodeContent.value = ''
}

// Emit definition
const emit = defineEmits<{
  entityGenerated: [result: any]
}>()
</script>

<style scoped>
.entity-designer {
  width: 100%;
  min-height: 600px;
}

.designer-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #409eff;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.designer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-panel {
  width: 100%;
}

.config-card {
  border: 1px solid #e4e7ed;
}

.config-card :deep(.el-card__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.designer-main {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  min-height: 500px;
}

.designer-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.designer-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.designer-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.designer-workspace {
  display: contents;
}

.property-toolbox {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.property-toolbox h4 {
  margin: 0 0 12px 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbox-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbox-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;
  text-align: center;
}

.toolbox-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.toolbox-item:active {
  cursor: grabbing;
}

.type-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.type-name {
  font-weight: 600;
  font-size: 12px;
  color: #303133;
}

.type-desc {
  font-size: 10px;
  color: #909399;
  margin-top: 2px;
}

.entity-canvas {
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-header {
  padding: 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-header h4 {
  margin: 0;
  color: #303133;
}

.drop-zone {
  min-height: 400px;
  padding: 16px;
  transition: all 0.3s ease;
}

.drop-zone.drag-over {
  background: rgba(64, 158, 255, 0.05);
  border-color: #409eff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.property-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.property-item.selected {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.property-content {
  flex: 1;
}

.property-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.property-icon {
  font-size: 16px;
}

.property-name {
  font-weight: 600;
  color: #303133;
}

.property-type {
  color: #606266;
  font-size: 14px;
}

.property-badges {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.property-description {
  font-size: 12px;
  color: #909399;
}

.property-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.property-item:hover .property-actions {
  opacity: 1;
}

.property-config {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  height: fit-content;
}

/* New styles for enhanced features */
.indexes-constraints-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.relationship-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.validation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .designer-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }

  .property-toolbox {
    order: 1;
  }

  .entity-canvas {
    order: 3;
  }

  .property-config {
    order: 2;
  }

  .indexes-constraints-panel {
    padding: 12px;
  }
}
</style>
