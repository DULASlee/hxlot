<template>
  <div class="cqrs-designer">
    <div class="designer-header">
      <h2>CQRS Pattern Designer</h2>
      <div class="header-actions">
        <el-button
          type="default"
          @click="handleNew"
        >
          <el-icon><Plus /></el-icon>
          New CQRS
        </el-button>
        <el-button
          type="default"
          :disabled="!canValidate"
          @click="handleValidate"
        >
          <el-icon><CircleCheck /></el-icon>
          Validate
        </el-button>
        <el-button
          type="primary"
          :loading="generating"
          :disabled="!canGenerate"
          @click="handleGenerate"
        >
          <el-icon><Document /></el-icon>
          Generate CQRS Code
        </el-button>
      </div>
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
            :model="cqrsDefinition"
            label-width="140px"
          >
            <el-form-item
              label="Module Name"
              required
            >
              <el-input
                v-model="cqrsDefinition.moduleName"
                placeholder="ProjectManagement"
              />
            </el-form-item>
            <el-form-item
              label="Namespace"
              required
            >
              <el-input
                v-model="cqrsDefinition.namespace"
                placeholder="SmartAbp.ProjectManagement"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Commands Section -->
        <el-card class="commands-section">
          <template #header>
            <div class="section-header">
              <span>⚡ Commands</span>
              <el-button
                size="small"
                type="primary"
                @click="addCommand"
              >
                Add Command
              </el-button>
            </div>
          </template>
          <el-collapse v-model="activeCommands">
            <el-collapse-item
              v-for="(command, index) in cqrsDefinition.commands"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="command-title">
                  <span>{{ command.name || `Command ${index + 1}` }}</span>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="removeCommand(index)"
                  >
                    Delete
                  </el-button>
                </div>
              </template>
              <el-form
                :model="command"
                label-width="140px"
                size="small"
              >
                <el-form-item label="Command Name">
                  <el-input
                    v-model="command.name"
                    placeholder="CreateProject"
                  />
                </el-form-item>
                <el-form-item label="Description">
                  <el-input
                    v-model="command.description"
                    type="textarea"
                    :rows="2"
                    placeholder="Command description..."
                  />
                </el-form-item>
                <el-form-item label="Return Type">
                  <el-input
                    v-model="command.returnType"
                    placeholder="ProjectDto (leave empty for void)"
                  />
                </el-form-item>
                <el-form-item label="Options">
                  <el-checkbox
                    v-model="command.requiresTransaction"
                  >
                    Requires Transaction
                  </el-checkbox>
                  <el-checkbox
                    v-model="command.requiresAuthorization"
                  >
                    Requires Authorization
                  </el-checkbox>
                </el-form-item>
                <el-form-item label="Properties">
                  <el-button
                    size="small"
                    @click="addCommandProperty(index)"
                  >
                    Add Property
                  </el-button>
                  <el-table
                    :data="command.properties"
                    size="small"
                    class="property-table"
                  >
                    <el-table-column
                      prop="name"
                      label="Name"
                      width="120"
                    >
                      <template #default="{ row }">
                        <el-input
                          v-model="row.name"
                          size="small"
                          placeholder="propertyName"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="type"
                      label="Type"
                      width="100"
                    >
                      <template #default="{ row }">
                        <el-input
                          v-model="row.type"
                          size="small"
                          placeholder="string"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="isRequired"
                      label="Required"
                      width="80"
                    >
                      <template #default="{ row }">
                        <el-checkbox v-model="row.isRequired" />
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="Actions"
                      width="80"
                    >
                      <template #default="{ $index }">
                        <el-button
                          size="small"
                          type="danger"
                          text
                          @click="removeCommandProperty(index, $index)"
                        >
                          Delete
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- Queries Section -->
        <el-card class="queries-section">
          <template #header>
            <div class="section-header">
              <span>🔍 Queries</span>
              <el-button
                size="small"
                type="primary"
                @click="addQuery"
              >
                Add Query
              </el-button>
            </div>
          </template>
          <el-collapse v-model="activeQueries">
            <el-collapse-item
              v-for="(query, index) in cqrsDefinition.queries"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="query-title">
                  <span>{{ query.name || `Query ${index + 1}` }}</span>
                  <el-button
                    size="small"
                    type="danger"
                    text
                    @click.stop="removeQuery(index)"
                  >
                    Delete
                  </el-button>
                </div>
              </template>
              <el-form
                :model="query"
                label-width="140px"
                size="small"
              >
                <el-form-item label="Query Name">
                  <el-input
                    v-model="query.name"
                    placeholder="GetProject"
                  />
                </el-form-item>
                <el-form-item label="Description">
                  <el-input
                    v-model="query.description"
                    type="textarea"
                    :rows="2"
                    placeholder="Query description..."
                  />
                </el-form-item>
                <el-form-item label="Return Type">
                  <el-input
                    v-model="query.returnType"
                    placeholder="ProjectDto"
                  />
                </el-form-item>
                <el-form-item label="Options">
                  <el-checkbox
                    v-model="query.isPaged"
                  >
                    Is Paged Query
                  </el-checkbox>
                  <el-checkbox
                    v-model="query.isCacheable"
                  >
                    Is Cacheable
                  </el-checkbox>
                </el-form-item>
                <el-form-item label="Parameters">
                  <el-button
                    size="small"
                    @click="addQueryParameter(index)"
                  >
                    Add Parameter
                  </el-button>
                  <el-table
                    :data="query.parameters"
                    size="small"
                    class="parameter-table"
                  >
                    <el-table-column
                      prop="name"
                      label="Name"
                      width="120"
                    >
                      <template #default="{ row }">
                        <el-input
                          v-model="row.name"
                          size="small"
                          placeholder="paramName"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="type"
                      label="Type"
                      width="100"
                    >
                      <template #default="{ row }">
                        <el-input
                          v-model="row.type"
                          size="small"
                          placeholder="string"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="isOptional"
                      label="Optional"
                      width="80"
                    >
                      <template #default="{ row }">
                        <el-checkbox v-model="row.isOptional" />
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="Actions"
                      width="80"
                    >
                      <template #default="{ $index }">
                        <el-button
                          size="small"
                          type="danger"
                          text
                          @click="removeQueryParameter(index, $index)"
                        >
                          Delete
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </div>

      <!-- Right Panel: Generation Result -->
      <div
        v-if="showResult && generationResult"
        class="right-panel"
      >
        <el-card class="result-section">
          <template #header>
            <div class="result-header">
              <span>📊 Generation Result</span>
              <el-button
                size="small"
                @click="showResult = false"
              >
                Close
              </el-button>
            </div>
          </template>
          
          <!-- Statistics -->
          <div class="result-stats">
            <el-descriptions
              :column="2"
              border
            >
              <el-descriptions-item label="Module">
                {{ generationResult.moduleName }}
              </el-descriptions-item>
              <el-descriptions-item label="Session ID">
                {{ generationResult.sessionId }}
              </el-descriptions-item>
              <el-descriptions-item label="Commands">
                {{ generationResult.commandCount }}
              </el-descriptions-item>
              <el-descriptions-item label="Queries">
                {{ generationResult.queryCount }}
              </el-descriptions-item>
              <el-descriptions-item label="Total Files">
                {{ Object.keys(generationResult.files).length }}
              </el-descriptions-item>
              <el-descriptions-item label="Generated At">
                {{ new Date(generationResult.generatedAt).toLocaleString() }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- File Tree -->
          <div class="result-files">
            <h4>Generated Files:</h4>
            <el-tree
              :data="fileTreeData"
              :props="{ label: 'label', children: 'children' }"
              @node-click="handleFileClick"
            />
          </div>

          <!-- Code Preview -->
          <div
            v-if="selectedFile"
            class="code-preview"
          >
            <h4>{{ selectedFile.name }}</h4>
            <pre><code>{{ selectedFile.content }}</code></pre>
          </div>

          <!-- Download Button -->
          <div class="result-actions">
            <el-button
              type="primary"
              @click="handleDownload"
            >
              <el-icon><Download /></el-icon>
              Download All Files
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleCheck, Document, Download, Plus } from '@element-plus/icons-vue'
import {
    cqrsGeneratorApi,
    type CqrsDefinitionDto,
    type GeneratedCqrsSolutionDto
} from '@smartabp/lowcode-api'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import JSZip from 'jszip'
import { computed, onMounted, ref, watch } from 'vue'

// ================================
// 持久化Key
// ================================
const STORAGE_KEY = 'smartabp_cqrs_definition'

// ================================
// State Management
// ================================

const cqrsDefinition = ref<CqrsDefinitionDto>({
  moduleName: '',
  namespace: '',
  commands: [],
  queries: []
})

const activeCommands = ref<number[]>([])
const activeQueries = ref<number[]>([])
const generating = ref(false)
const generationResult = ref<GeneratedCqrsSolutionDto | null>(null)
const showResult = ref(false)
const selectedFile = ref<{ name: string; content: string } | null>(null)

// ================================
// Computed Properties
// ================================

const canValidate = computed(() => {
  return cqrsDefinition.value.moduleName !== '' && cqrsDefinition.value.namespace !== ''
})

const canGenerate = computed(() => {
  return (
    canValidate.value &&
    (cqrsDefinition.value.commands.length > 0 || cqrsDefinition.value.queries.length > 0)
  )
})

const fileTreeData = computed(() => {
  if (!generationResult.value) return []
  
  const files = generationResult.value.files
  const tree: any[] = []
  
  Object.keys(files).forEach(filePath => {
    const parts = filePath.split('/')
    let currentLevel = tree
    
    parts.forEach((part, index) => {
      const existingNode = currentLevel.find(node => node.label === part)
      
      if (existingNode) {
        currentLevel = existingNode.children
      } else {
        const newNode: any = {
          label: part,
          path: parts.slice(0, index + 1).join('/'),
          children: []
        }
        
        if (index === parts.length - 1) {
          newNode.isFile = true
          newNode.content = files[filePath]
        }
        
        currentLevel.push(newNode)
        currentLevel = newNode.children
      }
    })
  })
  
  return tree
})

// ================================
// Command Management
// ================================

function addCommand() {
  cqrsDefinition.value.commands.push({
    name: '',
    description: '',
    returnType: '',
    properties: [],
    requiresTransaction: true,
    requiresAuthorization: true
  })
  activeCommands.value.push(cqrsDefinition.value.commands.length - 1)
}

function removeCommand(index: number) {
  cqrsDefinition.value.commands.splice(index, 1)
  const activeIndex = activeCommands.value.indexOf(index)
  if (activeIndex > -1) {
    activeCommands.value.splice(activeIndex, 1)
  }
}

function addCommandProperty(commandIndex: number) {
  const command = cqrsDefinition.value.commands[commandIndex]
  if (command) {
    command.properties.push({
      name: '',
      type: 'string',
      isRequired: false
    })
  }
}

function removeCommandProperty(commandIndex: number, propertyIndex: number) {
  const command = cqrsDefinition.value.commands[commandIndex]
  if (command) {
    command.properties.splice(propertyIndex, 1)
  }
}

// ================================
// Query Management
// ================================

function addQuery() {
  cqrsDefinition.value.queries.push({
    name: '',
    description: '',
    returnType: '',
    parameters: [],
    isPaged: false,
    isCacheable: true
  })
  activeQueries.value.push(cqrsDefinition.value.queries.length - 1)
}

function removeQuery(index: number) {
  cqrsDefinition.value.queries.splice(index, 1)
  const activeIndex = activeQueries.value.indexOf(index)
  if (activeIndex > -1) {
    activeQueries.value.splice(activeIndex, 1)
  }
}

function addQueryParameter(queryIndex: number) {
  const query = cqrsDefinition.value.queries[queryIndex]
  if (query) {
    query.parameters.push({
      name: '',
      type: 'string',
      isOptional: false
    })
  }
}

function removeQueryParameter(queryIndex: number, parameterIndex: number) {
  const query = cqrsDefinition.value.queries[queryIndex]
  if (query) {
    query.parameters.splice(parameterIndex, 1)
  }
}

// ================================
// Generation Actions
// ================================

// ✅ 新建CQRS定义
async function handleNew() {
  if (cqrsDefinition.value.moduleName || cqrsDefinition.value.commands.length > 0 || cqrsDefinition.value.queries.length > 0) {
    try {
      await ElMessageBox.confirm(
        '当前有未保存的CQRS定义，确定要清空并新建吗？',
        '确认新建',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      clearStorage()
    } catch {
      // 用户取消
    }
  } else {
    clearStorage()
  }
}

async function handleValidate() {
  try {
    const result = await cqrsGeneratorApi.validateCqrsDefinition(cqrsDefinition.value)
    
    if (result.isValid) {
      ElMessage.success('CQRS definition is valid!')
    } else {
      const errorMessages = result.errors.map((e: { message: string }) => e.message).join('\n')
      ElNotification({
        title: 'Validation Failed',
        message: errorMessages,
        type: 'error',
        duration: 5000
      })
    }
  } catch (error) {
    ElMessage.error('Validation failed: ' + (error as Error).message)
  }
}

async function handleGenerate() {
  if (!canGenerate.value) {
    ElMessage.warning('Please configure at least one command or query')
    return
  }
  
  generating.value = true
  
  try {
    const result = await cqrsGeneratorApi.generateCqrs(cqrsDefinition.value)
    
    generationResult.value = result
    showResult.value = true
    
    ElNotification({
      title: 'Generation Successful',
      message: `Generated ${result.commandCount} commands, ${result.queryCount} queries, ${Object.keys(result.files).length} files`,
      type: 'success',
      duration: 5000
    })
  } catch (error) {
    ElMessage.error('Generation failed: ' + (error as Error).message)
    console.error('CQRS generation error:', error)
  } finally {
    generating.value = false
  }
}

function handleFileClick(node: any) {
  if (node.isFile) {
    selectedFile.value = {
      name: node.label,
      content: node.content
    }
  }
}

// ✅ 企业级真实下载：生成C#代码ZIP包
async function handleDownload() {
  if (!generationResult.value) return
  
  try {
    ElMessage.info('正在生成ZIP包，请稍候...')
    
    const zip = new JSZip()
    const files = generationResult.value.files
    
    // 按目录结构添加所有生成的C#代码文件
    Object.keys(files).forEach(filePath => {
      const content = files[filePath]
      if (content) {
        zip.file(filePath, content)
      }
    })
    
    // 添加README文件
    const readme = `# ${generationResult.value.moduleName} - CQRS Pattern Code

## Generation Information
- Session ID: ${generationResult.value.sessionId}
- Generated At: ${new Date(generationResult.value.generatedAt).toLocaleString()}
- Commands: ${generationResult.value.commandCount}
- Queries: ${generationResult.value.queryCount}
- Total Files: ${Object.keys(files).length}

## File Structure
${Object.keys(files).map(f => `- ${f}`).join('\n')}

## Usage Instructions
1. Extract this ZIP to your project directory
2. Review and adjust namespaces if needed
3. Add necessary NuGet package references
4. Build and test your project

---
Generated by SmartAbp Low-Code Platform - CQRS Designer
https://github.com/your-repo/smartabp
`
    zip.file('README.md', readme)
    
    // 生成ZIP文件（异步）
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    })
    
    // 下载ZIP文件
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `${generationResult.value.moduleName}_CQRS_${Date.now()}.zip`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success({
      message: '📦 C#代码ZIP包下载成功！',
      duration: 3000
    })
  } catch (error) {
    console.error('ZIP generation error:', error)
    ElMessage.error({
      message: `下载失败: ${error instanceof Error ? error.message : String(error)}`,
      duration: 5000
    })
  }
}

// ================================
// 数据持久化
// ================================

// ✅ 自动保存到localStorage
watch(
  cqrsDefinition,
  (newValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
      console.log('✅ CQRS定义已自动保存到localStorage')
    } catch (error) {
      console.warn('⚠️ 保存到localStorage失败:', error)
    }
  },
  { deep: true }
)

// ✅ 从localStorage加载
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const loaded = JSON.parse(stored)
      cqrsDefinition.value = loaded
      ElMessage.success('已恢复上次编辑的CQRS定义')
      console.log('✅ 从localStorage加载CQRS定义成功')
    }
  } catch (error) {
    console.warn('⚠️ 从localStorage加载失败:', error)
  }
}

// ✅ 清除localStorage
function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    cqrsDefinition.value = {
      moduleName: '',
      namespace: '',
      commands: [],
      queries: []
    }
    ElMessage.success('已清除CQRS定义')
  } catch (error) {
    console.warn('⚠️ 清除localStorage失败:', error)
  }
}

// ✅ 页面加载时自动恢复
onMounted(() => {
  loadFromStorage()
})
</script>

<style scoped lang="scss">
.cqrs-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-5);
  background: #f5f7fa;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.designer-content {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
}

.left-panel {
  flex: 0 0 600px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .el-card {
    margin-bottom: 0;
  }
}

.right-panel {
  flex: 1;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.command-title,
.query-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 10px;
}

.property-table,
.parameter-table {
  margin-top: 10px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-stats {
  margin-bottom: 20px;
}

.result-files {
  margin: var(--spacing-5) 0;

  h4 {
    margin-bottom: 10px;
  }
}

.code-preview {
  margin: var(--spacing-5) 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;

  h4 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  pre {
    margin: 0;
    padding: 15px;
    background: #282c34;
    color: #abb2bf;
    border-radius: 4px;
    overflow-x: auto;

    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

.result-actions {
  margin-top: 20px;
  text-align: center;
}
</style>

