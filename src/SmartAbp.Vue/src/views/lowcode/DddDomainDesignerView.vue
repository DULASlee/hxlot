<template>
  <div class="ddd-domain-designer">
    <div class="designer-header">
      <h2>DDD Domain Designer</h2>
      <el-button
        type="primary"
        :loading="generating"
        :disabled="!canGenerate"
        @click="handleGenerate"
      >
        <el-icon><Document /></el-icon>
        Generate DDD Domain
      </el-button>
    </div>

    <div class="designer-content">
      <!-- Left Panel: Configuration -->
      <div class="left-panel">
        <!-- Module Configuration -->
        <el-card class="config-section">
          <template #header>
            <span>📦 Module Configuration</span>
          </template>
          <el-form
            :model="dddDefinition"
            label-width="140px"
          >
            <el-form-item
              label="Module Name"
              required
            >
              <el-input
                v-model="dddDefinition.moduleName"
                placeholder="ProjectManagement"
              />
            </el-form-item>
            <el-form-item label="Key Type">
              <el-select v-model="dddDefinition.defaultKeyType">
                <el-option
                  label="Guid"
                  value="Guid"
                />
                <el-option
                  label="Int"
                  value="int"
                />
                <el-option
                  label="Long"
                  value="long"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Features">
              <el-checkbox-group v-model="features">
                <el-checkbox label="MultiTenancy">
                  Multi-tenancy
                </el-checkbox>
                <el-checkbox label="SoftDelete">
                  Soft Delete
                </el-checkbox>
                <el-checkbox label="Auditing">
                  Auditing
                </el-checkbox>
                <el-checkbox label="ExtraProperties">
                  Extra Properties
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Aggregate Roots -->
        <el-card class="aggregates-section">
          <template #header>
            <div class="section-header">
              <span>🏛️ Aggregate Roots</span>
              <el-button
                size="small"
                type="primary"
                @click="addAggregate"
              >
                Add
              </el-button>
            </div>
          </template>
          <el-collapse v-model="activeAggregates">
            <el-collapse-item
              v-for="(aggregate, index) in dddDefinition.aggregates"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="aggregate-title">
                  <span>{{ aggregate.name || `Aggregate ${index + 1}` }}</span>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="removeAggregate(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
              <AggregateEditor
                v-model="dddDefinition.aggregates[index]"
              />
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- Value Objects -->
        <el-card class="value-objects-section">
          <template #header>
            <div class="section-header">
              <span>💎 Value Objects</span>
              <el-button
                size="small"
                type="primary"
                @click="addValueObject"
              >
                Add
              </el-button>
            </div>
          </template>
          <el-collapse v-model="activeValueObjects">
            <el-collapse-item
              v-for="(vo, index) in dddDefinition.valueObjects"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="vo-title">
                  <span>{{ vo.name || `Value Object ${index + 1}` }}</span>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="removeValueObject(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
              <ValueObjectEditor
                v-model="dddDefinition.valueObjects[index]"
              />
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>

      <!-- Right Panel: Result Preview -->
      <div
        v-if="showResult && generationResult"
        class="right-panel"
      >
        <el-card class="result-section">
          <template #header>
            <div class="result-header">
              <span>✅ Generation Result</span>
              <el-button
                size="small"
                @click="downloadCode"
              >
                <el-icon><Download /></el-icon>
                Download
              </el-button>
            </div>
          </template>

          <!-- Statistics -->
          <div class="stats">
            <el-statistic
              title="Aggregates"
              :value="generationResult.aggregateCount"
            />
            <el-statistic
              title="Value Objects"
              :value="generationResult.valueObjectCount"
            />
            <el-statistic
              title="Repositories"
              :value="generationResult.repositoryCount"
            />
            <el-statistic
              title="Domain Events"
              :value="generationResult.domainEventCount"
            />
            <el-statistic
              title="Files"
              :value="generationResult.files.length"
            />
            <el-statistic
              title="Lines of Code"
              :value="generationResult.totalLinesOfCode"
            />
          </div>

          <!-- File List -->
          <div class="files-section">
            <h4>Generated Files ({{ generationResult.files.length }})</h4>
            <el-tree
              :data="fileTree"
              :props="{ label: 'name', children: 'children' }"
              @node-click="handleFileClick"
            />
          </div>

          <!-- Code Preview -->
          <div
            v-if="selectedFile"
            class="code-preview"
          >
            <h4>{{ selectedFile.relativePath }}</h4>
            <pre><code>{{ selectedFile.content }}</code></pre>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElCheckbox,
  ElCheckboxGroup,
  ElCollapse,
  ElCollapseItem,
  ElStatistic,
  ElTree,
  ElMessage,
  ElIcon
} from 'element-plus'
import { Document, Download, Delete } from '@element-plus/icons-vue'
import {
  dddGeneratorApi,
  type DddDefinitionDto,
  type AggregateDefinitionDto,
  type ValueObjectDefinitionDto,
  type GeneratedDddSolutionDto,
  type GeneratedFileDto
} from '@smartabp/lowcode-api'
import AggregateEditor from './components/AggregateEditor.vue'
import ValueObjectEditor from './components/ValueObjectEditor.vue'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

// ================================
// State
// ================================

const dddDefinition = ref<DddDefinitionDto>({
  moduleName: '',
  aggregates: [],
  valueObjects: [],
  domainEvents: [],
  domainServices: [],
  repositories: [],
  useMultiTenancy: false,
  useSoftDelete: false,
  useAuditing: true,
  useExtraProperties: false,
  defaultKeyType: 'Guid'
})

const features = ref<string[]>([])
const activeAggregates = ref<number[]>([])
const activeValueObjects = ref<number[]>([])
const generating = ref(false)
const showResult = ref(false)
const generationResult = ref<GeneratedDddSolutionDto | null>(null)
const selectedFile = ref<GeneratedFileDto | null>(null)

// ================================
// Computed
// ================================

const canGenerate = computed(() => {
  return dddDefinition.value.moduleName.length > 0 &&
         dddDefinition.value.aggregates.length > 0
})

const fileTree = computed(() => {
  if (!generationResult.value) return []
  
  // Build file tree from flat file list
  const tree: any[] = []
  const map = new Map()
  
  generationResult.value.files.forEach((file) => {
    const parts = file.relativePath.split('/')
    let current = tree
    let path = ''
    
    parts.forEach((part, index) => {
      path = path ? `${path}/${part}` : part
      
      if (!map.has(path)) {
        const node = {
          name: part,
          path,
          children: index < parts.length - 1 ? [] : undefined,
          file: index === parts.length - 1 ? file : undefined
        }
        map.set(path, node)
        current.push(node)
        
        if (node.children) {
          current = node.children
        }
      } else {
        const node = map.get(path)
        if (node.children) {
          current = node.children
        }
      }
    })
  })
  
  return tree
})

// ================================
// Watchers
// ================================

watch(features, (newFeatures) => {
  dddDefinition.value.useMultiTenancy = newFeatures.includes('MultiTenancy')
  dddDefinition.value.useSoftDelete = newFeatures.includes('SoftDelete')
  dddDefinition.value.useAuditing = newFeatures.includes('Auditing')
  dddDefinition.value.useExtraProperties = newFeatures.includes('ExtraProperties')
})

// ================================
// Methods
// ================================

const addAggregate = () => {
  const newAggregate: AggregateDefinitionDto = {
    name: '',
    properties: [],
    description: '',
    keyType: dddDefinition.value.defaultKeyType,
    isMultiTenant: dddDefinition.value.useMultiTenancy,
    isSoftDelete: dddDefinition.value.useSoftDelete,
    hasExtraProperties: dddDefinition.value.useExtraProperties,
    domainMethods: [],
    domainEvents: [],
    businessRules: []
  }
  dddDefinition.value.aggregates.push(newAggregate)
  activeAggregates.value.push(dddDefinition.value.aggregates.length - 1)
}

const removeAggregate = (index: number) => {
  dddDefinition.value.aggregates.splice(index, 1)
}

const addValueObject = () => {
  const newVO: ValueObjectDefinitionDto = {
    name: '',
    properties: [],
    description: '',
    isImmutable: true,
    implementsEquality: true
  }
  dddDefinition.value.valueObjects.push(newVO)
  activeValueObjects.value.push(dddDefinition.value.valueObjects.length - 1)
}

const removeValueObject = (index: number) => {
  dddDefinition.value.valueObjects.splice(index, 1)
}

const handleGenerate = async () => {
  try {
    generating.value = true
    logger.info('🚀 Starting DDD domain generation', dddDefinition.value)
    
    const result = await dddGeneratorApi.generateDddDomain(dddDefinition.value)
    
    if (result.success) {
      generationResult.value = result
      showResult.value = true
      
      ElMessage.success({
        message: `✅ Successfully generated ${result.files.length} files!`,
        duration: 3000
      })
      
      logger.info('✅ DDD domain generation completed', {
        files: result.files.length,
        aggregates: result.aggregateCount,
        duration: result.generationTimeMs
      })
    } else {
      ElMessage.error({
        message: `❌ Generation failed: ${result.message}`,
        duration: 5000
      })
      
      logger.error('❌ DDD domain generation failed', result.message)
    }
  } catch (error) {
    ElMessage.error({
      message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      duration: 5000
    })
    
    logger.error('❌ DDD domain generation error', error)
  } finally {
    generating.value = false
  }
}

const handleFileClick = (data: any) => {
  if (data.file) {
    selectedFile.value = data.file
  }
}

const downloadCode = () => {
  if (!generationResult.value) return
  
  // Create ZIP file content (simplified version)
  const zipContent = generationResult.value.files
    .map(file => `// ${file.relativePath}\n${file.content}`)
    .join('\n\n')
  
  const blob = new Blob([zipContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${generationResult.value.moduleName}_DDD_Domain.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('📦 Code downloaded successfully!')
}
</script>

<style scoped lang="scss">
.ddd-domain-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .designer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .designer-content {
    flex: 1;
    display: flex;
    gap: 20px;
    overflow: hidden;

    .left-panel,
    .right-panel {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .left-panel {
      max-width: 600px;
    }
  }

  .section-header,
  .result-header,
  .aggregate-title,
  .vo-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .files-section {
    margin-top: 20px;

    h4 {
      margin-bottom: 10px;
    }
  }

  .code-preview {
    margin-top: 20px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 12px;

    h4 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    pre {
      margin: 0;
      max-height: 400px;
      overflow: auto;
      background-color: var(--el-fill-color-lighter);
      padding: 12px;
      border-radius: 4px;

      code {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
      }
    }
  }
}
</style>

