<template>
  <div class="template-manager">
    <!-- 🚀 企业级模板管理器 - 基于21个模板文件 -->
    <div class="template-header">
      <h3>模板管理器</h3>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板..."
          :prefix-icon="SearchIcon"
          style="width: 300px"
          clearable
          @input="handleSearch"
        />
        <el-select
          v-model="selectedFramework"
          placeholder="选择框架"
          clearable
          @change="handleFrameworkChange"
        >
          <el-option
            label="全部"
            value=""
          />
          <el-option
            label="后端"
            value="backend"
          />
          <el-option
            label="前端"
            value="frontend"
          />
          <el-option
            label="低代码"
            value="lowcode"
          />
        </el-select>
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          @change="handleCategoryChange"
        >
          <el-option
            label="全部"
            value=""
          />
          <el-option
            v-for="category in availableCategories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
      </div>
    </div>

    <!-- 模板统计 -->
    <div class="template-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">
                {{ allTemplates.length }}
              </div>
              <div class="stat-label">
                总模板数
              </div>
            </div>
            <i class="stat-icon el-icon-document" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card backend">
            <div class="stat-content">
              <div class="stat-number">
                {{ backendTemplates.length }}
              </div>
              <div class="stat-label">
                后端模板
              </div>
            </div>
            <i class="stat-icon el-icon-cpu" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card frontend">
            <div class="stat-content">
              <div class="stat-number">
                {{ frontendTemplates.length }}
              </div>
              <div class="stat-label">
                前端模板
              </div>
            </div>
            <i class="stat-icon el-icon-monitor" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card lowcode">
            <div class="stat-content">
              <div class="stat-number">
                {{ lowcodeTemplates.length }}
              </div>
              <div class="stat-label">
                低代码模板
              </div>
            </div>
            <i class="stat-icon el-icon-magic-stick" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 模板列表 -->
    <div
      v-loading="loading"
      class="template-list"
    >
      <div
        v-for="(templates, category) in groupedTemplates"
        :key="category"
        class="category-section"
      >
        <div class="category-header">
          <h4>{{ category }}</h4>
          <span class="category-count">{{ templates.length }} 个模板</span>
        </div>

        <el-row :gutter="16">
          <el-col
            v-for="template in templates"
            :key="template.id"
            :span="8"
          >
            <el-card
              class="template-card"
              :class="template.targetFramework"
              shadow="hover"
            >
              <div class="template-info">
                <div class="template-title">
                  <h5>{{ template.name }}</h5>
                  <el-tag
                    :type="getFrameworkTagType(template.targetFramework)"
                    size="small"
                  >
                    {{ template.targetFramework }}
                  </el-tag>
                </div>

                <p class="template-description">
                  {{ template.metadata.description }}
                </p>

                <div class="template-tags">
                  <el-tag
                    v-for="tag in template.metadata.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                  <span
                    v-if="template.metadata.tags.length > 3"
                    class="more-tags"
                  >
                    +{{ template.metadata.tags.length - 3 }}
                  </span>
                </div>

                <div class="template-meta">
                  <div class="meta-item">
                    <i class="el-icon-files" />
                    <span>{{ template.fileExtension.toUpperCase() }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="el-icon-setting" />
                    <span>{{ template.metadata.parameters.length }} 参数</span>
                  </div>
                  <div
                    v-if="template.metadata.permissionsRequired"
                    class="meta-item"
                  >
                    <i class="el-icon-lock" />
                    <span>需要权限</span>
                  </div>
                </div>

                <div class="template-actions">
                  <el-button
                    size="small"
                    @click="viewTemplate(template)"
                  >
                    查看
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    @click="useTemplate(template)"
                  >
                    使用
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 模板详情对话框 -->
    <el-dialog
      v-model="showTemplateDetail"
      :title="selectedTemplate?.name"
      width="80%"
      :destroy-on-close="true"
    >
      <div
        v-if="selectedTemplate"
        class="template-detail"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane
            label="基本信息"
            name="info"
          >
            <div class="template-info-detail">
              <el-descriptions
                :column="2"
                border
              >
                <el-descriptions-item label="模板名称">
                  {{ selectedTemplate.name }}
                </el-descriptions-item>
                <el-descriptions-item label="分类">
                  {{ selectedTemplate.category }}
                </el-descriptions-item>
                <el-descriptions-item label="目标框架">
                  <el-tag :type="getFrameworkTagType(selectedTemplate.targetFramework)">
                    {{ selectedTemplate.targetFramework }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="文件扩展名">
                  {{ selectedTemplate.fileExtension }}
                </el-descriptions-item>
                <el-descriptions-item
                  label="需要权限"
                  :span="2"
                >
                  <el-tag :type="selectedTemplate.metadata.permissionsRequired ? 'warning' : 'success'">
                    {{ selectedTemplate.metadata.permissionsRequired ? '是' : '否' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item
                  label="描述"
                  :span="2"
                >
                  {{ selectedTemplate.metadata.description }}
                </el-descriptions-item>
              </el-descriptions>

              <div class="template-tags-section">
                <h4>标签</h4>
                <el-tag
                  v-for="tag in selectedTemplate.metadata.tags"
                  :key="tag"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <div class="template-scenarios">
                <h4>适用场景</h4>
                <ul>
                  <li
                    v-for="scenario in selectedTemplate.metadata.scenarios"
                    :key="scenario"
                  >
                    {{ scenario }}
                  </li>
                </ul>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="参数配置"
            name="parameters"
          >
            <div class="template-parameters">
              <el-table
                :data="selectedTemplate.metadata.parameters"
                border
              >
                <el-table-column
                  prop="name"
                  label="参数名"
                  width="120"
                />
                <el-table-column
                  prop="type"
                  label="类型"
                  width="80"
                >
                  <template #default="{ row }">
                    <el-tag size="small">
                      {{ row.type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="required"
                  label="必需"
                  width="60"
                >
                  <template #default="{ row }">
                    <el-tag
                      :type="row.required ? 'danger' : 'info'"
                      size="small"
                    >
                      {{ row.required ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="description"
                  label="描述"
                />
                <el-table-column
                  prop="example"
                  label="示例"
                  width="120"
                />
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="使用示例"
            name="examples"
          >
            <div class="template-examples">
              <div
                v-for="(example, index) in selectedTemplate.metadata.usageExamples"
                :key="index"
                class="example-item"
              >
                <h4>{{ example.scenario }}</h4>
                <el-descriptions
                  :column="1"
                  size="small"
                  border
                >
                  <el-descriptions-item
                    v-for="(value, key) in example.parameters"
                    :key="key"
                    :label="key"
                  >
                    <code>{{ value }}</code>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="验证规则"
            name="validation"
          >
            <div class="template-validation">
              <ul>
                <li
                  v-for="rule in selectedTemplate.metadata.validationRules"
                  :key="rule"
                >
                  {{ rule }}
                </li>
              </ul>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="showTemplateDetail = false">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="useTemplate(selectedTemplate!)"
        >
          使用模板
        </el-button>
      </template>
    </el-dialog>

    <!-- 模板使用对话框 -->
    <el-dialog
      v-model="showTemplateUse"
      :title="`使用模板: ${selectedTemplate?.name}`"
      width="60%"
      :destroy-on-close="true"
    >
      <div
        v-if="selectedTemplate"
        class="template-use"
      >
        <el-form
          ref="parameterFormRef"
          :model="templateParameters"
          :rules="parameterRules"
          label-width="120px"
        >
          <el-form-item
            v-for="param in selectedTemplate.metadata.parameters"
            :key="param.name"
            :label="param.name"
            :prop="param.name"
            :required="param.required"
          >
            <template #label>
              <div class="parameter-label">
                <span>{{ param.name }}</span>
                <el-tooltip
                  :content="param.description"
                  placement="top"
                >
                  <i
                    class="el-icon-question"
                    style="margin-left: 4px; color: #909399"
                  />
                </el-tooltip>
              </div>
            </template>

            <el-input
              v-if="param.type === 'string'"
              v-model="templateParameters[param.name]"
              :placeholder="param.example ? `示例: ${param.example}` : param.description"
            />
            <el-input-number
              v-else-if="param.type === 'number'"
              v-model="templateParameters[param.name]"
              :min="param.validation?.min"
              :max="param.validation?.max"
            />
            <el-switch
              v-else-if="param.type === 'boolean'"
              v-model="templateParameters[param.name]"
            />
            <el-select
              v-else-if="param.validation?.options"
              v-model="templateParameters[param.name]"
              placeholder="请选择"
            >
              <el-option
                v-for="option in param.validation.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-input
              v-else
              v-model="templateParameters[param.name]"
              :placeholder="param.description"
            />

            <div
              v-if="param.example"
              class="parameter-example"
            >
              示例: <code>{{ param.example }}</code>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showTemplateUse = false">
          取消
        </el-button>
        <el-button @click="resetParameters">
          重置
        </el-button>
        <el-button
          type="primary"
          :loading="generating"
          @click="generateCode"
        >
          生成代码
        </el-button>
      </template>
    </el-dialog>

    <!-- 代码生成结果对话框 -->
    <el-dialog
      v-model="showGenerationResult"
      title="代码生成结果"
      width="80%"
      :destroy-on-close="true"
    >
      <div
        v-if="generationResult"
        class="generation-result"
      >
        <div
          v-if="generationResult.success"
          class="success-result"
        >
          <el-alert
            title="代码生成成功"
            type="success"
            :closable="false"
            style="margin-bottom: 16px"
          >
            <template #default>
              <p>生成了 {{ generationResult.files.length }} 个文件，共 {{ generationResult.metadata.linesOfCode }} 行代码</p>
            </template>
          </el-alert>

          <el-tabs v-model="activeResultTab">
            <el-tab-pane
              v-for="(file, index) in generationResult.files"
              :key="index"
              :label="file.path"
              :name="`file-${index}`"
            >
              <div class="file-header">
                <span class="file-path">{{ file.path }}</span>
                <div class="file-actions">
                  <el-button
                    size="small"
                    @click="copyFileContent(file.content)"
                  >
                    复制
                  </el-button>
                  <el-button
                    size="small"
                    @click="downloadFile(file)"
                  >
                    下载
                  </el-button>
                </div>
              </div>
              <pre class="code-content"><code>{{ file.content }}</code></pre>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div
          v-else
          class="error-result"
        >
          <el-alert
            title="代码生成失败"
            type="error"
            :closable="false"
            style="margin-bottom: 16px"
          >
            <template #default>
              <ul>
                <li
                  v-for="(errorMsg, index) in generationResult.errors"
                  :key="index"
                >
                  {{ errorMsg }}
                </li>
              </ul>
            </template>
          </el-alert>
        </div>

        <div
          v-if="generationResult.warnings.length > 0"
          class="warnings"
        >
          <el-alert
            title="警告信息"
            type="warning"
            :closable="false"
          >
            <template #default>
              <ul>
                <li
                  v-for="warning in generationResult.warnings"
                  :key="warning"
                >
                  {{ warning }}
                </li>
              </ul>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <el-button @click="showGenerationResult = false">
          关闭
        </el-button>
        <el-button
          v-if="generationResult?.success"
          type="primary"
          @click="downloadAllFiles"
        >
          下载全部
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Search as SearchIcon } from '@element-plus/icons-vue'
import { useTemplateEngine, type TemplateFile, type GenerationResult } from '../core/TemplateEngine'

// 使用模板引擎
const {
  templates: allTemplates,
  loading,
  error,
  backendTemplates,
  frontendTemplates,
  lowcodeTemplates,
  templatesByCategory,
  loadTemplates,
  searchTemplates,
  generateCode: engineGenerateCode
} = useTemplateEngine()

// 搜索和筛选
const searchKeyword = ref('')
const selectedFramework = ref('')
const selectedCategory = ref('')
const searchResults = ref<TemplateFile[]>([])

// 对话框状态
const showTemplateDetail = ref(false)
const showTemplateUse = ref(false)
const showGenerationResult = ref(false)
const selectedTemplate = ref<TemplateFile | null>(null)

// 标签页
const activeTab = ref('info')
const activeResultTab = ref('file-0')

// 模板参数
const templateParameters = ref<Record<string, any>>({})
const parameterFormRef = ref<FormInstance>()
const generating = ref(false)
const generationResult = ref<GenerationResult | null>(null)

// 计算属性
const displayedTemplates = computed(() => {
  let result = allTemplates.value

  // 应用搜索
  if (searchKeyword.value) {
    result = searchTemplates(searchKeyword.value)
  }

  // 应用框架筛选
  if (selectedFramework.value) {
    result = result.filter(t => t.targetFramework === selectedFramework.value)
  }

  // 应用分类筛选
  if (selectedCategory.value) {
    result = result.filter(t => t.category === selectedCategory.value)
  }

  return result
})

const groupedTemplates = computed(() => {
  const grouped: Record<string, TemplateFile[]> = {}
  displayedTemplates.value.forEach(template => {
    if (!grouped[template.category]) {
      grouped[template.category] = []
    }
    grouped[template.category].push(template)
  })
  return grouped
})

const availableCategories = computed(() => {
  const categories = new Set<string>()
  allTemplates.value.forEach(template => {
    categories.add(template.category)
  })
  return Array.from(categories).sort()
})

// 参数验证规则
const parameterRules = computed(() => {
  if (!selectedTemplate.value) return {}

  const rules: Record<string, any[]> = {}
  selectedTemplate.value.metadata.parameters.forEach(param => {
    const paramRules: any[] = []

    if (param.required) {
      paramRules.push({
        required: true,
        message: `${param.name} 是必需的`,
        trigger: 'blur'
      })
    }

    if (param.validation?.pattern) {
      paramRules.push({
        pattern: new RegExp(param.validation.pattern),
        message: `${param.name} 格式不正确`,
        trigger: 'blur'
      })
    }

    if (param.validation?.min !== undefined) {
      paramRules.push({
        min: param.validation.min,
        message: `${param.name} 长度不能小于 ${param.validation.min}`,
        trigger: 'blur'
      })
    }

    if (param.validation?.max !== undefined) {
      paramRules.push({
        max: param.validation.max,
        message: `${param.name} 长度不能大于 ${param.validation.max}`,
        trigger: 'blur'
      })
    }

    if (paramRules.length > 0) {
      rules[param.name] = paramRules
    }
  })

  return rules
})

// 事件处理
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleFrameworkChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleCategoryChange = () => {
  // 筛选逻辑已在计算属性中处理
}

const viewTemplate = (template: TemplateFile) => {
  selectedTemplate.value = template
  activeTab.value = 'info'
  showTemplateDetail.value = true
}

const useTemplate = (template: TemplateFile) => {
  selectedTemplate.value = template

  // 初始化参数
  const initialParams: Record<string, any> = {}
  template.metadata.parameters.forEach(param => {
    initialParams[param.name] = param.defaultValue || (param.type === 'boolean' ? false : '')
  })
  templateParameters.value = initialParams

  showTemplateDetail.value = false
  showTemplateUse.value = true
}

const resetParameters = () => {
  if (!selectedTemplate.value) return

  const initialParams: Record<string, any> = {}
  selectedTemplate.value.metadata.parameters.forEach(param => {
    initialParams[param.name] = param.defaultValue || (param.type === 'boolean' ? false : '')
  })
  templateParameters.value = initialParams
}

const generateCode = async () => {
  if (!selectedTemplate.value || !parameterFormRef.value) return

  try {
    await parameterFormRef.value.validate()

    generating.value = true
    const result = await engineGenerateCode(selectedTemplate.value.id, templateParameters.value)

    generationResult.value = result
    showTemplateUse.value = false
    showGenerationResult.value = true
    activeResultTab.value = 'file-0'

    if (result.success) {
      ElMessage.success('代码生成成功')
    } else {
      ElMessage.error('代码生成失败')
    }
  } catch (error) {
    ElMessage.error('参数验证失败')
  } finally {
    generating.value = false
  }
}

const copyFileContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadFile = (file: { path: string; content: string; type: string }) => {
  const blob = new Blob([file.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.path
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const downloadAllFiles = () => {
  if (!generationResult.value?.success) return

  generationResult.value.files.forEach(file => {
    downloadFile(file)
  })
}

const getFrameworkTagType = (framework: string): string => {
  switch (framework) {
    case 'backend': return 'danger'
    case 'frontend': return 'success'
    case 'lowcode': return 'warning'
    default: return 'info'
  }
}

// 生命周期
onMounted(async () => {
  await loadTemplates()
})

// 监听错误
watch(error, (newError) => {
  if (newError) {
    ElMessage.error(`模板引擎错误: ${newError}`)
  }
})
</script>

<style scoped>
.template-manager {
  padding: 20px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.template-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.template-stats {
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card.backend {
  border-left: 4px solid var(--el-color-danger);
}

.stat-card.frontend {
  border-left: 4px solid var(--el-color-success);
}

.stat-card.lowcode {
  border-left: 4px solid var(--el-color-warning);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stat-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32px;
  color: var(--el-color-primary);
  opacity: 0.2;
}

.category-section {
  margin-bottom: 32px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-border-color-lighter);
}

.category-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.category-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.template-card {
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.template-card:hover {
  transform: translateY(-2px);
}

.template-card.backend {
  border-left: 4px solid var(--el-color-danger);
}

.template-card.frontend {
  border-left: 4px solid var(--el-color-success);
}

.template-card.lowcode {
  border-left: 4px solid var(--el-color-warning);
}

.template-info {
  padding: 16px;
}

.template-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-title h5 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.template-description {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  min-height: 42px;
}

.template-tags {
  margin-bottom: 12px;
  min-height: 24px;
}

.template-tags .el-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.more-tags {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.template-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.template-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.template-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.template-tags-section {
  margin-top: 20px;
}

.template-tags-section h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.template-scenarios {
  margin-top: 20px;
}

.template-scenarios h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.template-scenarios ul {
  margin: 0;
  padding-left: 20px;
}

.template-scenarios li {
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}

.example-item {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.example-item h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.parameter-label {
  display: flex;
  align-items: center;
}

.parameter-example {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.parameter-example code {
  background: var(--el-fill-color-light);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.generation-result {
  max-height: 70vh;
  overflow-y: auto;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 6px 6px 0 0;
  margin-bottom: 0;
}

.file-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.file-actions {
  display: flex;
  gap: 8px;
}

.code-content {
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color);
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 16px;
  margin: 0;
  max-height: 400px;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-content code {
  background: none;
  padding: 0;
  color: var(--el-text-color-primary);
}

.warnings {
  margin-top: 16px;
}

.warnings ul,
.error-result ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.warnings li,
.error-result li {
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .template-card {
    margin-bottom: 12px;
  }
}

@media (max-width: 768px) {
  .template-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .header-actions .el-input,
  .header-actions .el-select {
    width: 100% !important;
  }

  .stat-card {
    margin-bottom: 12px;
  }

  .template-meta {
    flex-direction: column;
    gap: 8px;
  }

  .template-actions {
    justify-content: stretch;
  }

  .template-actions .el-button {
    flex: 1;
  }
}
</style>
