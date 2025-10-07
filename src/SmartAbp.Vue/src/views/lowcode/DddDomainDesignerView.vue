<template>
  <div class="ddd-domain-designer">
    <div class="designer-header">
      <h2>DDD Domain Designer</h2>
      <el-button type="primary" :loading="generating" :disabled="!canGenerate" @click="handleGenerate">
        <el-icon>
          <Document />
        </el-icon>
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
          <el-form :model="dddDefinition" label-width="140px">
            <el-form-item label="Module Name" required>
              <el-input v-model="dddDefinition.moduleName" placeholder="ProjectManagement" />
            </el-form-item>
            <el-form-item label="Key Type">
              <el-select v-model="dddDefinition.defaultKeyType">
                <el-option label="Guid" value="Guid" />
                <el-option label="Int" value="int" />
                <el-option label="Long" value="long" />
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
              <el-button size="small" type="primary" @click="addAggregate">
                Add
              </el-button>
            </div>
          </template>
          <el-collapse v-model="activeAggregates">
            <el-collapse-item v-for="(aggregate, index) in dddDefinition.aggregates" :key="index" :name="index">
              <template #title>
                <div class="aggregate-title">
                  <span>{{ aggregate.name || `Aggregate ${index + 1}` }}</span>
                  <el-button size="small" type="danger" text @click.stop="removeAggregate(index)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </template>
              <AggregateEditor v-model="dddDefinition.aggregates[index]" />
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- Value Objects -->
        <el-card class="value-objects-section">
          <template #header>
            <div class="section-header">
              <span>💎 Value Objects</span>
              <el-button size="small" type="primary" @click="addValueObject">
                Add
              </el-button>
            </div>
          </template>
          <el-collapse v-model="activeValueObjects">
            <el-collapse-item v-for="(vo, index) in dddDefinition.valueObjects" :key="index" :name="index">
              <template #title>
                <div class="vo-title">
                  <span>{{ vo.name || `Value Object ${index + 1}` }}</span>
                  <el-button size="small" type="danger" text @click.stop="removeValueObject(index)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </template>
              <ValueObjectEditor v-model="dddDefinition.valueObjects[index]" />
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>

      <!-- Right Panel: Result Preview -->
      <div v-if="showResult && generationResult" class="right-panel">
        <el-card class="result-section">
          <template #header>
            <div class="result-header">
              <span>✅ Generation Result</span>
              <el-button size="small" @click="downloadCode">
                <el-icon>
                  <Download />
                </el-icon>
                Download
              </el-button>
            </div>
          </template>

          <!-- Statistics -->
          <div class="stats">
            <el-statistic title="Aggregates" :value="generationResult.aggregateCount" />
            <el-statistic title="Value Objects" :value="generationResult.valueObjectCount" />
            <el-statistic title="Repositories" :value="generationResult.repositoryCount" />
            <el-statistic title="Domain Events" :value="generationResult.domainEventCount" />
            <el-statistic title="Files" :value="generationResult.files.length" />
            <el-statistic title="Lines of Code" :value="generationResult.totalLinesOfCode" />
          </div>

          <!-- File List -->
          <div class="files-section">
            <h4>Generated Files ({{ generationResult.files.length }})</h4>
            <el-tree :data="fileTree" :props="{ label: 'name', children: 'children' }" @node-click="handleFileClick" />
          </div>

          <!-- Code Preview -->
          <div v-if="selectedFile" class="code-preview">
            <h4>{{ selectedFile.relativePath }}</h4>
            <pre><code>{{ selectedFile.content }}</code></pre>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Document, Download } from '@element-plus/icons-vue'
import {
  dddGeneratorApi,
  type AggregateDefinitionDto,
  type DddDefinitionDto,
  type GeneratedDddSolutionDto,
  type GeneratedFileDto,
  type ValueObjectDefinitionDto
} from '@smartabp/lowcode-api'
import { getGlobalLogger } from '@smartabp/lowcode-shared'
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElCheckboxGroup,
  ElCollapse,
  ElCollapseItem,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElStatistic,
  ElTree
} from 'element-plus'
import JSZip from 'jszip'; // 🔥 新增：用于生成真正的ZIP包
import { computed, ref, watch } from 'vue'
import AggregateEditor from './components/AggregateEditor.vue'
import ValueObjectEditor from './components/ValueObjectEditor.vue'

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

// 🔥 修复：使用JSZip生成真正的ZIP包
const downloadCode = async () => {
  if (!generationResult.value) return

  try {
    logger.info('📦 开始生成ZIP包', {
      files: generationResult.value.files.length,
      moduleName: generationResult.value.moduleName
    })

    const zip = new JSZip()

    // 按目录结构添加所有生成的文件
    generationResult.value.files.forEach(file => {
      zip.file(file.relativePath, file.content)
    })

    // 添加README文件
    const readme = `# ${generationResult.value.moduleName} - DDD Domain Model

## 生成信息
- 生成时间: ${generationResult.value.generatedAt}
- 生成耗时: ${generationResult.value.generationTimeMs}ms
- 聚合根数量: ${generationResult.value.aggregateCount}
- 值对象数量: ${generationResult.value.valueObjectCount}
- 领域事件数量: ${generationResult.value.domainEventCount}
- 仓储数量: ${generationResult.value.repositoryCount}
- 总代码行数: ${generationResult.value.totalLinesOfCode}

## 文件列表
${generationResult.value.files.map(f => `- ${f.relativePath}`).join('\n')}

## 使用说明
1. 解压此ZIP包到你的项目目录
2. 根据需要调整命名空间
3. 添加必要的依赖项
4. 运行项目

---
Generated by SmartAbp Low-Code Platform
`
    zip.file('README.md', readme)

    // 生成ZIP文件（异步）
    ElMessage.info('正在生成ZIP包，请稍候...')
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    })

    // 下载ZIP文件
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generationResult.value.moduleName}_DDD_Domain.zip`
    a.click()
    URL.revokeObjectURL(url)

    logger.info('✅ ZIP包下载成功', {
      fileName: `${generationResult.value.moduleName}_DDD_Domain.zip`,
      size: content.size
    })

    ElMessage.success({
      message: '📦 代码包下载成功！',
      duration: 3000
    })
  } catch (error) {
    logger.error('❌ ZIP包生成失败', error)
    ElMessage.error({
      message: `下载失败: ${error instanceof Error ? error.message : String(error)}`,
      duration: 5000
    })
  }
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
