<template>
  <div class="intelligent-code-generation-engine">
    <el-card>
      <template #header>
        <div class="engine-header">
          <h3>
            <i class="el-icon-cpu" />
            智能代码生成引擎
          </h3>
          <div class="engine-actions">
            <el-button-group size="small">
              <el-button
                type="primary"
                icon="el-icon-magic-stick"
                :loading="analyzing"
                @click="analyzeAndGenerate"
              >
                智能分析生成
              </el-button>
              <el-button
                icon="el-icon-view"
                @click="previewGeneration"
              >
                预览生成结果
              </el-button>
              <el-button
                icon="el-icon-download"
                :disabled="!hasGeneratedCode"
                @click="downloadGeneratedCode"
              >
                下载代码包
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 智能分析结果 -->
      <div
        v-if="analysisResult"
        class="analysis-result"
      >
        <el-alert
          :title="`智能分析完成 - 推荐生成方案`"
          type="success"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="analysis-summary">
              <div class="summary-item">
                <span class="summary-label">检测到实体:</span>
                <span class="summary-value">{{ analysisResult.entities.length }}个</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">推荐模板:</span>
                <span class="summary-value">{{ analysisResult.recommendedTemplates.length }}个</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">预计文件:</span>
                <span class="summary-value">{{ analysisResult.estimatedFiles }}个</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">代码行数:</span>
                <span class="summary-value">{{ analysisResult.estimatedLines }}行</span>
              </div>
            </div>
          </template>
        </el-alert>
      </div>

      <!-- 智能模板匹配 -->
      <div class="template-matching">
        <div class="matching-header">
          <h4>
            <i class="el-icon-connection" />
            智能模板匹配结果
          </h4>
          <span class="confidence-badge">
            匹配置信度: {{ Math.round(templateMatchingConfidence * 100) }}%
          </span>
        </div>

        <div class="template-matches">
          <div
            v-for="match in templateMatches"
            :key="match.id"
            class="template-match-card"
            :class="{ recommended: match.isRecommended, selected: match.selected }"
            @click="toggleTemplateSelection(match)"
          >
            <div class="match-header">
              <div class="match-info">
                <div class="template-name">
                  {{ match.template.name }}
                </div>
                <div class="template-category">
                  {{ match.template.category }}
                </div>
              </div>
              <div class="match-score">
                <el-progress
                  type="circle"
                  :percentage="Math.round(match.confidence * 100)"
                  :width="40"
                  :stroke-width="4"
                  :show-text="false"
                  :color="getConfidenceColor(match.confidence)"
                />
                <span class="score-text">{{ Math.round(match.confidence * 100) }}%</span>
              </div>
            </div>
            
            <div class="match-details">
              <div class="match-reason">
                <strong>匹配原因:</strong> {{ match.reason }}
              </div>
              <div class="match-entities">
                <strong>适用实体:</strong>
                <el-tag
                  v-for="entityName in match.applicableEntities"
                  :key="entityName"
                  size="mini"
                  type="primary"
                >
                  {{ entityName }}
                </el-tag>
              </div>
              <div class="match-output">
                <strong>生成内容:</strong> {{ match.estimatedOutput }}
              </div>
            </div>

            <div class="match-actions">
              <el-checkbox
                v-model="match.selected"
                @change="updateGenerationPlan"
              >
                选择此模板
              </el-checkbox>
              <el-button
                size="mini"
                @click.stop="previewTemplate(match.template)"
              >
                预览模板
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 智能参数填充 -->
      <div class="parameter-automation">
        <div class="automation-header">
          <h4>
            <i class="el-icon-magic-stick" />
            智能参数填充
          </h4>
          <el-button
            size="small"
            type="primary"
            :loading="autoFilling"
            @click="autoFillParameters"
          >
            自动填充参数
          </el-button>
        </div>

        <div class="parameter-grid">
          <div
            v-for="param in intelligentParameters"
            :key="param.name"
            class="parameter-card"
            :class="{ 'auto-filled': param.autoFilled, 'requires-input': param.requiresInput }"
          >
            <div class="param-header">
              <div class="param-info">
                <div class="param-name">
                  {{ param.displayName }}
                </div>
                <div class="param-description">
                  {{ param.description }}
                </div>
              </div>
              <div class="param-status">
                <el-tag
                  :type="param.autoFilled ? 'success' : (param.requiresInput ? 'warning' : 'info')"
                  size="mini"
                >
                  {{ param.autoFilled ? '自动填充' : (param.requiresInput ? '需要输入' : '可选') }}
                </el-tag>
              </div>
            </div>

            <div class="param-input">
              <!-- 字符串参数 -->
              <el-input
                v-if="param.type === 'string'"
                v-model="param.value"
                :placeholder="param.placeholder"
                @change="validateParameter(param)"
              />
              
              <!-- 选择参数 -->
              <el-select
                v-else-if="param.type === 'select'"
                v-model="param.value"
                :placeholder="param.placeholder"
                @change="validateParameter(param)"
              >
                <el-option
                  v-for="option in param.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              
              <!-- 布尔参数 -->
              <el-checkbox
                v-else-if="param.type === 'boolean'"
                v-model="param.value"
                @change="validateParameter(param)"
              >
                {{ param.description }}
              </el-checkbox>
              
              <!-- 数组参数 -->
              <div
                v-else-if="param.type === 'array'"
                class="array-param"
              >
                <el-tag
                  v-for="(item, index) in param.value"
                  :key="index"
                  closable
                  @close="removeArrayItem(param, index)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  v-model="newArrayItem"
                  size="mini"
                  placeholder="添加项目"
                  style="width: 100px"
                  @keyup.enter="addArrayItem(param)"
                />
              </div>
            </div>

            <div
              v-if="param.autoFilled"
              class="auto-fill-info"
            >
              <i class="el-icon-magic-stick" />
              <span>基于{{ param.autoFillSource }}自动填充</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码生成配置 -->
      <div class="generation-config">
        <div class="config-header">
          <h4>
            <i class="el-icon-setting" />
            生成配置
          </h4>
        </div>

        <el-form
          label-width="120px"
          size="small"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="项目命名空间">
                <el-input
                  v-model="generationConfig.namespace"
                  placeholder="例如: SmartAbp.UserManagement"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="输出目录">
                <el-input
                  v-model="generationConfig.outputPath"
                  placeholder="例如: src/generated"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="生成选项">
            <el-checkbox-group v-model="generationConfig.options">
              <el-row>
                <el-col :span="8">
                  <el-checkbox label="backend">
                    后端代码
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="frontend">
                    前端代码
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="database">
                    数据库脚本
                  </el-checkbox>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-checkbox label="tests">
                    单元测试
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="docs">
                    API文档
                  </el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="deployment">
                    部署配置
                  </el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="质量要求">
            <el-slider
              v-model="generationConfig.qualityLevel"
              :min="60"
              :max="100"
              :step="5"
              :marks="qualityMarks"
              show-tooltip
            />
          </el-form-item>

          <el-form-item label="代码风格">
            <el-select v-model="generationConfig.codeStyle">
              <el-option
                label="企业标准"
                value="enterprise"
              />
              <el-option
                label="简洁风格"
                value="minimal"
              />
              <el-option
                label="详细注释"
                value="verbose"
              />
              <el-option
                label="高性能"
                value="performance"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 生成预览 -->
      <div
        v-if="generationPreview"
        class="generation-preview"
      >
        <div class="preview-header">
          <h4>
            <i class="el-icon-view" />
            生成预览
          </h4>
          <el-button
            size="small"
            :loading="previewing"
            @click="refreshPreview"
          >
            刷新预览
          </el-button>
        </div>

        <el-tabs
          v-model="activePreviewTab"
          type="border-card"
        >
          <el-tab-pane
            label="文件树"
            name="files"
          >
            <div class="file-tree">
              <el-tree
                :data="generationPreview.fileTree"
                :props="fileTreeProps"
                node-key="path"
                :expand-on-click-node="false"
                @node-click="selectFile"
              >
                <template #default="{ node, data }">
                  <div class="file-tree-node">
                    <i :class="getFileIcon(data)" />
                    <span class="file-name">{{ node.label }}</span>
                    <el-tag
                      v-if="data.isGenerated"
                      size="mini"
                      type="success"
                    >
                      NEW
                    </el-tag>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="代码预览"
            name="code"
          >
            <div class="code-preview">
              <div class="code-tabs">
                <el-tabs
                  v-model="selectedFileType"
                  type="card"
                >
                  <el-tab-pane
                    label="后端代码"
                    name="backend"
                  >
                    <div class="code-files">
                      <div
                        v-for="file in backendFiles"
                        :key="file.path"
                        class="code-file"
                        :class="{ active: selectedFile?.path === file.path }"
                        @click="selectFile(file)"
                      >
                        <div class="file-header">
                          <i :class="getFileIcon(file)" />
                          <span class="file-name">{{ file.name }}</span>
                          <el-tag
                            size="mini"
                            :type="getFileTypeTag(file.type)"
                          >
                            {{ file.type }}
                          </el-tag>
                        </div>
                        <div class="file-preview">
                          <pre class="code-content">{{ file.preview }}</pre>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane
                    label="前端代码"
                    name="frontend"
                  >
                    <div class="code-files">
                      <div
                        v-for="file in frontendFiles"
                        :key="file.path"
                        class="code-file"
                        :class="{ active: selectedFile?.path === file.path }"
                        @click="selectFile(file)"
                      >
                        <div class="file-header">
                          <i :class="getFileIcon(file)" />
                          <span class="file-name">{{ file.name }}</span>
                          <el-tag
                            size="mini"
                            :type="getFileTypeTag(file.type)"
                          >
                            {{ file.type }}
                          </el-tag>
                        </div>
                        <div class="file-preview">
                          <pre class="code-content">{{ file.preview }}</pre>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane
                    label="测试代码"
                    name="tests"
                  >
                    <div class="code-files">
                      <div
                        v-for="file in testFiles"
                        :key="file.path"
                        class="code-file"
                        :class="{ active: selectedFile?.path === file.path }"
                        @click="selectFile(file)"
                      >
                        <div class="file-header">
                          <i :class="getFileIcon(file)" />
                          <span class="file-name">{{ file.name }}</span>
                          <el-tag
                            size="mini"
                            type="warning"
                          >
                            {{ file.type }}
                          </el-tag>
                        </div>
                        <div class="file-preview">
                          <pre class="code-content">{{ file.preview }}</pre>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane
            label="质量报告"
            name="quality"
          >
            <div class="quality-report">
              <div class="quality-overview">
                <div class="quality-score">
                  <el-progress
                    type="circle"
                    :percentage="codeQuality.overallScore"
                    :width="80"
                    :stroke-width="6"
                    :color="getQualityColor(codeQuality.overallScore)"
                  >
                    <template #default="{ percentage }">
                      <span class="score-text">{{ percentage }}</span>
                      <span class="score-label">分</span>
                    </template>
                  </el-progress>
                </div>
                <div class="quality-details">
                  <h4>代码质量评估</h4>
                  <div class="quality-metrics">
                    <div class="metric-item">
                      <span class="metric-name">代码规范:</span>
                      <span class="metric-value">{{ codeQuality.codeStandards }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-name">测试覆盖:</span>
                      <span class="metric-value">{{ codeQuality.testCoverage }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-name">性能优化:</span>
                      <span class="metric-value">{{ codeQuality.performance }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-name">安全性:</span>
                      <span class="metric-value">{{ codeQuality.security }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="quality-issues">
                <h4>质量检查结果</h4>
                <div class="issues-list">
                  <div
                    v-for="issue in codeQuality.issues"
                    :key="issue.id"
                    class="issue-item"
                    :class="issue.severity"
                  >
                    <i :class="getIssueIcon(issue.severity)" />
                    <div class="issue-content">
                      <div class="issue-title">
                        {{ issue.title }}
                      </div>
                      <div class="issue-description">
                        {{ issue.description }}
                      </div>
                      <div class="issue-location">
                        {{ issue.file }}:{{ issue.line }}
                      </div>
                    </div>
                    <div class="issue-actions">
                      <el-button
                        v-if="issue.autoFixable"
                        size="mini"
                        type="primary"
                        @click="autoFixIssue(issue)"
                      >
                        自动修复
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 生成控制面板 -->
      <div class="generation-control">
        <div class="control-header">
          <h4>
            <i class="el-icon-cpu" />
            代码生成控制
          </h4>
        </div>

        <div class="generation-summary">
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">
                {{ selectedTemplateCount }}
              </div>
              <div class="stat-label">
                选中模板
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{ targetEntityCount }}
              </div>
              <div class="stat-label">
                目标实体
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{ estimatedFileCount }}
              </div>
              <div class="stat-label">
                预计文件
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">
                {{ estimatedTime }}
              </div>
              <div class="stat-label">
                预计时间(分钟)
              </div>
            </div>
          </div>
        </div>

        <div class="generation-actions">
          <el-button
            type="success"
            size="large"
            icon="el-icon-cpu"
            :loading="generating"
            :disabled="!canGenerate"
            @click="startIntelligentGeneration"
          >
            开始智能生成 ({{ estimatedTime }}分钟)
          </el-button>
          
          <el-button
            size="large"
            @click="resetGeneration"
          >
            重置配置
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 生成进度对话框 -->
    <el-dialog
      v-model="showGenerationProgress"
      title="智能代码生成进行中..."
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="generation-progress-detail">
        <div class="overall-progress">
          <h4>总体进度</h4>
          <el-progress
            :percentage="generationProgress.overall"
            :stroke-width="12"
            :show-text="true"
            status="success"
          />
        </div>

        <div class="generation-stages">
          <div
            v-for="stage in generationStages"
            :key="stage.id"
            class="stage-item"
            :class="getStageClass(stage.status)"
          >
            <div class="stage-icon">
              <i :class="getStageIcon(stage.status)" />
            </div>
            <div class="stage-content">
              <div class="stage-title">
                {{ stage.title }}
              </div>
              <div class="stage-description">
                {{ stage.description }}
              </div>
              <div
                v-if="stage.currentFile"
                class="current-file"
              >
                正在生成: {{ stage.currentFile }}
              </div>
            </div>
            <div class="stage-progress">
              <el-progress
                :percentage="stage.progress"
                :stroke-width="4"
                :show-text="false"
                :color="getProgressColor(stage.progress)"
              />
              <span class="progress-text">{{ stage.progress }}%</span>
            </div>
          </div>
        </div>

        <div class="generation-logs">
          <h4>生成日志</h4>
          <div class="logs-container">
            <div
              v-for="log in generationLogs"
              :key="log.id"
              class="log-entry"
              :class="log.level"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { useCodeGenerationStore } from '@/stores/lowcode/codeGeneration'
import { ElMessage } from 'element-plus'

// Stores
const entityStore = useEntityModelingStore()
const codeGenStore = useCodeGenerationStore()

// 响应式数据
const analyzing = ref(false)
const autoFilling = ref(false)
const generating = ref(false)
const previewing = ref(false)
const showGenerationProgress = ref(false)

// 分析结果
const analysisResult = ref(null)
const templateMatchingConfidence = ref(0.85)

// 模板匹配结果
const templateMatches = ref([
  {
    id: 'vue-crud-management',
    template: {
      name: 'Vue CRUD管理页面',
      category: 'frontend/vue',
      path: 'templates/frontend/vue/CrudManagement.template.vue'
    },
    confidence: 0.95,
    isRecommended: true,
    selected: true,
    reason: '检测到多个实体需要标准CRUD操作',
    applicableEntities: ['User', 'Role', 'Permission'],
    estimatedOutput: '3个Vue管理页面 + Pinia Store + 路由配置'
  },
  {
    id: 'abp-app-service',
    template: {
      name: 'ABP应用服务',
      category: 'backend/abp',
      path: 'templates/backend/application/CrudAppService.template.cs'
    },
    confidence: 0.92,
    isRecommended: true,
    selected: true,
    reason: '基于ABP框架的实体需要对应的应用服务',
    applicableEntities: ['User', 'Role', 'Permission'],
    estimatedOutput: '3个应用服务类 + DTO + 接口定义'
  },
  {
    id: 'entity-dto',
    template: {
      name: '实体DTO类',
      category: 'backend/dto',
      path: 'templates/backend/contracts/EntityDto.template.cs'
    },
    confidence: 0.88,
    isRecommended: true,
    selected: true,
    reason: '实体需要对应的数据传输对象',
    applicableEntities: ['User', 'Role', 'Permission'],
    estimatedOutput: '9个DTO类 (Create/Update/List/Detail)'
  },
  {
    id: 'permission-definitions',
    template: {
      name: '权限定义',
      category: 'backend/permissions',
      path: 'templates/backend/permissions/PermissionDefinitions.template.cs'
    },
    confidence: 0.85,
    isRecommended: false,
    selected: false,
    reason: '检测到权限相关实体，推荐生成权限定义',
    applicableEntities: ['User', 'Role', 'Permission'],
    estimatedOutput: '权限定义类 + 权限常量'
  }
])

// 智能参数
const intelligentParameters = ref([
  {
    name: 'ProjectName',
    displayName: '项目名称',
    description: '生成代码的项目名称，用于命名空间和文件名',
    type: 'string',
    value: '用户权限管理',
    placeholder: '例如：用户权限管理',
    autoFilled: true,
    autoFillSource: '项目向导配置',
    requiresInput: false
  },
  {
    name: 'Namespace',
    displayName: '命名空间',
    description: '代码生成的根命名空间',
    type: 'string',
    value: 'SmartAbp.UserManagement',
    placeholder: '例如：SmartAbp.UserManagement',
    autoFilled: true,
    autoFillSource: '项目名称',
    requiresInput: false
  },
  {
    name: 'DatabaseProvider',
    displayName: '数据库提供程序',
    description: '选择目标数据库类型',
    type: 'select',
    value: 'SqlServer',
    options: [
      { label: 'SQL Server', value: 'SqlServer' },
      { label: 'MySQL', value: 'MySQL' },
      { label: 'PostgreSQL', value: 'PostgreSQL' },
      { label: 'Oracle', value: 'Oracle' }
    ],
    autoFilled: true,
    autoFillSource: '项目配置',
    requiresInput: false
  },
  {
    name: 'UIFramework',
    displayName: 'UI框架',
    description: '前端UI框架选择',
    type: 'select',
    value: 'ElementPlus',
    options: [
      { label: 'Element Plus', value: 'ElementPlus' },
      { label: 'Ant Design Vue', value: 'AntDesignVue' },
      { label: 'Naive UI', value: 'NaiveUI' },
      { label: 'Quasar', value: 'Quasar' }
    ],
    autoFilled: true,
    autoFillSource: '项目配置',
    requiresInput: false
  },
  {
    name: 'Features',
    displayName: '功能特性',
    description: '需要集成的企业级功能特性',
    type: 'array',
    value: ['MultiTenant', 'Auditing', 'PermissionControl', 'Caching'],
    autoFilled: true,
    autoFillSource: '实体分析',
    requiresInput: false
  },
  {
    name: 'ApiPrefix',
    displayName: 'API前缀',
    description: 'RESTful API的URL前缀',
    type: 'string',
    value: '/api/app',
    placeholder: '例如：/api/app',
    autoFilled: false,
    autoFillSource: '',
    requiresInput: true
  }
])

// 生成配置
const generationConfig = ref({
  namespace: 'SmartAbp.UserManagement',
  outputPath: 'src/generated',
  options: ['backend', 'frontend', 'tests', 'docs'],
  qualityLevel: 95,
  codeStyle: 'enterprise'
})

// 质量等级标记
const qualityMarks = ref({
  60: '基础',
  70: '标准',
  80: '优秀',
  90: '企业级',
  95: '卓越',
  100: '完美'
})

// 生成预览数据
const generationPreview = ref(null)
const activePreviewTab = ref('files')
const selectedFileType = ref('backend')
const selectedFile = ref(null)

// 代码质量
const codeQuality = ref({
  overallScore: 95,
  codeStandards: 98,
  testCoverage: 85,
  performance: 92,
  security: 96,
  issues: [
    {
      id: 'naming-1',
      severity: 'warning',
      title: '命名规范建议',
      description: '建议使用更具描述性的变量名',
      file: 'UserAppService.cs',
      line: 45,
      autoFixable: true
    },
    {
      id: 'performance-1',
      severity: 'info',
      title: '性能优化建议',
      description: '可以使用异步方法提升性能',
      file: 'UserRepository.cs',
      line: 78,
      autoFixable: false
    }
  ]
})

// 生成进度
const generationProgress = ref({
  overall: 0,
  current: ''
})

const generationStages = ref([
  {
    id: 'analysis',
    title: '智能分析',
    description: '分析实体结构和关系',
    status: 'pending',
    progress: 0,
    currentFile: ''
  },
  {
    id: 'template-matching',
    title: '模板匹配',
    description: '匹配最佳代码模板',
    status: 'pending',
    progress: 0,
    currentFile: ''
  },
  {
    id: 'parameter-generation',
    title: '参数生成',
    description: '生成模板参数',
    status: 'pending',
    progress: 0,
    currentFile: ''
  },
  {
    id: 'backend-generation',
    title: '后端代码生成',
    description: '生成实体、服务、控制器',
    status: 'pending',
    progress: 0,
    currentFile: ''
  },
  {
    id: 'frontend-generation',
    title: '前端代码生成',
    description: '生成Vue组件、Store、路由',
    status: 'pending',
    progress: 0,
    currentFile: ''
  },
  {
    id: 'test-generation',
    title: '测试代码生成',
    description: '生成单元测试和集成测试',
    status: 'pending',
    progress: 0,
    currentFile: ''
  },
  {
    id: 'quality-check',
    title: '质量检查',
    description: '执行代码质量验证',
    status: 'pending',
    progress: 0,
    currentFile: ''
  }
])

const generationLogs = ref([])
const newArrayItem = ref('')

// 计算属性
const entities = computed(() => entityStore.entities)
const hasGeneratedCode = computed(() => generationPreview.value !== null)

const selectedTemplateCount = computed(() => {
  return templateMatches.value.filter(m => m.selected).length
})

const targetEntityCount = computed(() => {
  return entities.value.length
})

const estimatedFileCount = computed(() => {
  return selectedTemplateCount.value * targetEntityCount.value * 3 // 平均每个模板每个实体3个文件
})

const estimatedTime = computed(() => {
  return Math.ceil(estimatedFileCount.value * 0.1) // 每个文件约0.1分钟
})

const canGenerate = computed(() => {
  return selectedTemplateCount.value > 0 && targetEntityCount.value > 0
})

const backendFiles = computed(() => {
  return generationPreview.value?.files.filter(f => f.category === 'backend') || []
})

const frontendFiles = computed(() => {
  return generationPreview.value?.files.filter(f => f.category === 'frontend') || []
})

const testFiles = computed(() => {
  return generationPreview.value?.files.filter(f => f.category === 'test') || []
})

const fileTreeProps = {
  children: 'children',
  label: 'name'
}

// 方法
const analyzeAndGenerate = async () => {
  analyzing.value = true

  try {
    // 执行智能分析
    await performIntelligentAnalysis()
    
    // 生成预览
    await generatePreview()
    
    ElMessage.success('智能分析完成，已生成推荐方案')
    
  } catch (error) {
    ElMessage.error('智能分析失败：' + error.message)
  } finally {
    analyzing.value = false
  }
}

const performIntelligentAnalysis = async () => {
  // 模拟智能分析过程
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  analysisResult.value = {
    entities: entities.value,
    recommendedTemplates: templateMatches.value.filter(m => m.isRecommended),
    estimatedFiles: estimatedFileCount.value,
    estimatedLines: estimatedFileCount.value * 45,
    confidence: templateMatchingConfidence.value
  }
}

const generatePreview = async () => {
  previewing.value = true

  try {
    // 模拟代码生成预览
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    generationPreview.value = {
      fileTree: generateFileTree(),
      files: generateFileList()
    }
    
  } catch (error) {
    throw new Error('生成预览失败：' + error.message)
  } finally {
    previewing.value = false
  }
}

const generateFileTree = () => {
  return [
    {
      name: 'Backend',
      path: 'backend/',
      isGenerated: true,
      children: [
        {
          name: 'SmartAbp.UserManagement.Application',
          path: 'backend/application/',
          children: [
            { name: 'UserAppService.cs', path: 'backend/application/UserAppService.cs', isGenerated: true },
            { name: 'RoleAppService.cs', path: 'backend/application/RoleAppService.cs', isGenerated: true }
          ]
        },
        {
          name: 'SmartAbp.UserManagement.Domain',
          path: 'backend/domain/',
          children: [
            { name: 'User.cs', path: 'backend/domain/User.cs', isGenerated: true },
            { name: 'Role.cs', path: 'backend/domain/Role.cs', isGenerated: true }
          ]
        }
      ]
    },
    {
      name: 'Frontend',
      path: 'frontend/',
      isGenerated: true,
      children: [
        {
          name: 'views',
          path: 'frontend/views/',
          children: [
            { name: 'UserManagement.vue', path: 'frontend/views/UserManagement.vue', isGenerated: true },
            { name: 'RoleManagement.vue', path: 'frontend/views/RoleManagement.vue', isGenerated: true }
          ]
        },
        {
          name: 'stores',
          path: 'frontend/stores/',
          children: [
            { name: 'userStore.ts', path: 'frontend/stores/userStore.ts', isGenerated: true },
            { name: 'roleStore.ts', path: 'frontend/stores/roleStore.ts', isGenerated: true }
          ]
        }
      ]
    }
  ]
}

const generateFileList = () => {
  return [
    // 后端文件
    {
      name: 'UserAppService.cs',
      path: 'backend/application/UserAppService.cs',
      type: 'AppService',
      category: 'backend',
      preview: `public class UserAppService : CrudAppService<User, UserDto, Guid, GetUserListDto, CreateUserDto, UpdateUserDto>
{
    public UserAppService(IRepository<User, Guid> repository) : base(repository)
    {
    }
    
    [Authorize(UserManagementPermissions.Users.Default)]
    public override async Task<PagedResultDto<UserDto>> GetListAsync(GetUserListDto input)
    {
        var query = await CreateFilteredQueryAsync(input);
        var totalCount = await AsyncExecuter.CountAsync(query);
        var users = await AsyncExecuter.ToListAsync(query);
        
        return new PagedResultDto<UserDto>(totalCount, ObjectMapper.Map<List<UserDto>>(users));
    }
}`
    },
    {
      name: 'User.cs',
      path: 'backend/domain/User.cs',
      type: 'Entity',
      category: 'backend',
      preview: `public class User : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public virtual string UserName { get; set; }
    public virtual string Email { get; set; }
    public virtual string PhoneNumber { get; set; }
    public virtual bool IsActive { get; set; }
    public virtual DateTime? LastLoginTime { get; set; }
    public virtual Guid? TenantId { get; set; }
    
    protected User()
    {
    }
    
    public User(Guid id, string userName, string email) : base(id)
    {
        UserName = userName;
        Email = email;
        IsActive = true;
    }
}`
    },
    // 前端文件
    {
      name: 'UserManagement.vue',
      path: 'frontend/views/UserManagement.vue',
      type: 'Vue Component',
      category: 'frontend',
      preview: `<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <el-button type="primary" @click="handleCreate">
        <i class="el-icon-plus" /> 新增用户
      </el-button>
    </div>
    
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="isActive" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>`
    },
    {
      name: 'userStore.ts',
      path: 'frontend/stores/userStore.ts',
      type: 'Pinia Store',
      category: 'frontend',
      preview: `import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const fetchUsers = async (params = {}) => {
    try {
      loading.value = true
      const result = await userService.getList(params)
      users.value = result.items
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    users,
    loading,
    error,
    fetchUsers
  }
})`
    },
    // 测试文件
    {
      name: 'UserAppService.Tests.cs',
      path: 'tests/UserAppService.Tests.cs',
      type: 'Unit Test',
      category: 'test',
      preview: `public class UserAppServiceTests : UserManagementTestBase
{
    private readonly IUserAppService _userAppService;
    
    public UserAppServiceTests()
    {
        _userAppService = GetRequiredService<IUserAppService>();
    }
    
    [Fact]
    public async Task Should_Get_User_List()
    {
        // Arrange
        var input = new GetUserListDto();
        
        // Act
        var result = await _userAppService.GetListAsync(input);
        
        // Assert
        result.TotalCount.ShouldBeGreaterThan(0);
        result.Items.ShouldNotBeEmpty();
    }
}`
    }
  ]
}

const toggleTemplateSelection = (match) => {
  match.selected = !match.selected
  updateGenerationPlan()
}

const updateGenerationPlan = () => {
  // 重新计算生成计划
  const selectedTemplates = templateMatches.value.filter(m => m.selected)
  console.log('Generation plan updated:', selectedTemplates)
}

const autoFillParameters = async () => {
  autoFilling.value = true

  try {
    // 模拟自动填充过程
    await new Promise(resolve => setTimeout(resolve, 800))
    
    intelligentParameters.value.forEach(param => {
      if (!param.autoFilled && param.name === 'ApiPrefix') {
        param.value = `/api/app/${generationConfig.value.namespace.split('.').pop().toLowerCase()}`
        param.autoFilled = true
        param.autoFillSource = '智能推断'
      }
    })
    
    ElMessage.success('参数自动填充完成')
    
  } catch (error) {
    ElMessage.error('自动填充失败：' + error.message)
  } finally {
    autoFilling.value = false
  }
}

const validateParameter = (param) => {
  // 参数验证逻辑
  if (param.requiresInput && !param.value) {
    ElMessage.warning(`参数"${param.displayName}"为必填项`)
  }
}

const addArrayItem = (param) => {
  if (newArrayItem.value) {
    param.value.push(newArrayItem.value)
    newArrayItem.value = ''
  }
}

const removeArrayItem = (param, index) => {
  param.value.splice(index, 1)
}

const previewGeneration = () => {
  if (!generationPreview.value) {
    generatePreview()
  } else {
    activePreviewTab.value = 'files'
  }
}

const previewTemplate = (template) => {
  ElMessage.info(`预览模板"${template.name}"`)
}

const refreshPreview = () => {
  generatePreview()
}

const selectFile = (fileData) => {
  selectedFile.value = fileData
  console.log('File selected:', fileData)
}

const getFileIcon = (file) => {
  const iconMap = {
    'cs': 'el-icon-document',
    'vue': 'el-icon-document',
    'ts': 'el-icon-document',
    'js': 'el-icon-document',
    'json': 'el-icon-document-copy',
    'css': 'el-icon-brush',
    'scss': 'el-icon-brush'
  }
  
  const extension = file.name?.split('.').pop() || ''
  return iconMap[extension] || 'el-icon-document'
}

const getFileTypeTag = (type) => {
  const typeMap = {
    'Entity': 'primary',
    'AppService': 'success',
    'Controller': 'warning',
    'DTO': 'info',
    'Vue Component': 'primary',
    'Pinia Store': 'success',
    'Unit Test': 'warning'
  }
  return typeMap[type] || 'default'
}

const startIntelligentGeneration = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请先完成配置')
    return
  }

  generating.value = true
  showGenerationProgress.value = true
  generationLogs.value = []

  try {
    await executeIntelligentGeneration()
    
    ElMessage.success('🎉 智能代码生成完成！')
    
  } catch (error) {
    ElMessage.error('代码生成失败：' + error.message)
  } finally {
    generating.value = false
  }
}

const executeIntelligentGeneration = async () => {
  const stages = generationStages.value
  const totalStages = stages.length

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    stage.status = 'running'
    
    addGenerationLog('info', `开始执行: ${stage.title}`)
    
    // 模拟生成过程
    for (let progress = 0; progress <= 100; progress += 20) {
      stage.progress = progress
      generationProgress.value.overall = Math.round(((i + progress / 100) / totalStages) * 100)
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    stage.status = 'completed'
    addGenerationLog('success', `完成: ${stage.title}`)
  }
  
  // 更新生成结果
  await generatePreview()
}

const addGenerationLog = (level, message) => {
  generationLogs.value.push({
    id: Date.now(),
    level,
    message,
    timestamp: Date.now()
  })
}

const resetGeneration = () => {
  analysisResult.value = null
  generationPreview.value = null
  templateMatches.value.forEach(match => {
    match.selected = match.isRecommended
  })
  
  ElMessage.success('生成配置已重置')
}

const downloadGeneratedCode = () => {
  if (!hasGeneratedCode.value) {
    ElMessage.warning('请先生成代码')
    return
  }

  try {
    // 模拟下载过程
    const blob = new Blob(['Generated code content'], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${generationConfig.value.namespace.split('.').pop()}_generated_code.zip`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('代码包下载成功')
  } catch (error) {
    ElMessage.error('下载失败：' + error.message)
  }
}

const autoFixIssue = (issue) => {
  ElMessage.success(`自动修复问题: ${issue.title}`)
  
  // 移除已修复的问题
  const index = codeQuality.value.issues.findIndex(i => i.id === issue.id)
  if (index > -1) {
    codeQuality.value.issues.splice(index, 1)
  }
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return '#67c23a'
  if (confidence >= 0.8) return '#e6a23c'
  if (confidence >= 0.7) return '#f56c6c'
  return '#909399'
}

const getQualityColor = (score) => {
  if (score >= 95) return '#67c23a'
  if (score >= 85) return '#95d475'
  if (score >= 75) return '#e6a23c'
  return '#f56c6c'
}

const getStageClass = (status) => {
  return `stage-${status}`
}

const getStageIcon = (status) => {
  const icons = {
    pending: 'el-icon-time',
    running: 'el-icon-loading',
    completed: 'el-icon-check',
    failed: 'el-icon-close'
  }
  return icons[status] || 'el-icon-time'
}

const getProgressColor = (progress) => {
  if (progress >= 90) return '#67c23a'
  if (progress >= 70) return '#e6a23c'
  return '#409eff'
}

const getIssueIcon = (severity) => {
  const icons = {
    error: 'el-icon-circle-close',
    warning: 'el-icon-warning',
    info: 'el-icon-info'
  }
  return icons[severity] || 'el-icon-info'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Emits
const emit = defineEmits<{
  'generation-completed': [result: any]
  'template-selected': [template: any]
  'preview-updated': [preview: any]
}>()

// 监听实体变化，自动重新分析
watch(
  entities,
  () => {
    if (entities.value.length > 0) {
      analyzeAndGenerate()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.intelligent-code-generation-engine {
  height: 100%;
}

.engine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.engine-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 分析结果样式 */
.analysis-result {
  margin-bottom: 20px;
}

.analysis-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-color-primary);
}

/* 模板匹配样式 */
.template-matching {
  margin-bottom: 24px;
}

.matching-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.matching-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.confidence-badge {
  font-size: 13px;
  color: var(--el-color-primary);
  font-weight: 600;
}

.template-matches {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-match-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-match-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-match-card.recommended {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.template-match-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.template-category {
  font-size: 12px;
  color: var(--el-color-primary);
}

.match-score {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-text {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.match-details {
  margin-bottom: 12px;
  font-size: 13px;
}

.match-reason,
.match-entities,
.match-output {
  margin-bottom: 6px;
  color: var(--el-text-color-regular);
}

.match-entities .el-tag {
  margin-right: 4px;
}

.match-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 参数自动化样式 */
.parameter-automation {
  margin-bottom: 24px;
}

.automation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.automation-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.parameter-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px;
}

.parameter-card.auto-filled {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.parameter-card.requires-input {
  border-color: var(--el-color-warning-light-5);
  background: var(--el-color-warning-light-9);
}

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.param-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.param-description {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.param-input {
  margin-bottom: 8px;
}

.array-param {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.auto-fill-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--el-color-success);
}

/* 生成配置样式 */
.generation-config {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.config-header h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 生成控制样式 */
.generation-control {
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  text-align: center;
}

.control-header h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.generation-summary {
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.generation-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 预览样式 */
.file-tree {
  max-height: 400px;
  overflow-y: auto;
}

.file-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.file-name {
  flex: 1;
}

.code-preview {
  height: 400px;
}

.code-files {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 350px;
  overflow-y: auto;
}

.code-file {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-file:hover {
  border-color: var(--el-color-primary-light-5);
}

.code-file.active {
  border-color: var(--el-color-primary);
}

.file-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.file-preview {
  max-height: 200px;
  overflow: hidden;
}

.code-content {
  margin: 0;
  padding: 12px;
  font-family: var(--el-font-family-mono, Consolas, monospace);
  font-size: 11px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  background: white;
  overflow-x: auto;
}

/* 质量报告样式 */
.quality-report {
  padding: 16px;
}

.quality-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.quality-score {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-text {
  position: absolute;
  font-size: 16px;
  font-weight: bold;
}

.score-label {
  position: absolute;
  font-size: 10px;
  margin-top: 12px;
  color: var(--el-text-color-secondary);
}

.quality-details {
  flex: 1;
}

.quality-details h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.quality-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.metric-name {
  color: var(--el-text-color-secondary);
}

.metric-value {
  font-weight: 600;
  color: var(--el-color-primary);
}

.quality-issues h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
}

.issue-item.error {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.issue-item.warning {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.issue-item.info {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.issue-content {
  flex: 1;
}

.issue-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.issue-description {
  font-size: 12px;
  margin-bottom: 2px;
}

.issue-location {
  font-size: 11px;
  font-family: var(--el-font-family-mono, Consolas, monospace);
  opacity: 0.8;
}

/* 生成进度样式 */
.generation-progress-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.overall-progress {
  margin-bottom: 20px;
  text-align: center;
}

.overall-progress h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.generation-stages {
  margin-bottom: 20px;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.stage-pending {
  background: var(--el-bg-color-page);
}

.stage-running {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
}

.stage-completed {
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
}

.stage-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-info);
  color: white;
  flex-shrink: 0;
}

.stage-running .stage-icon {
  background: var(--el-color-primary);
}

.stage-completed .stage-icon {
  background: var(--el-color-success);
}

.stage-content {
  flex: 1;
}

.stage-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.stage-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 2px;
}

.current-file {
  font-size: 11px;
  color: var(--el-color-primary);
  font-family: var(--el-font-family-mono, Consolas, monospace);
}

.stage-progress {
  width: 100px;
  text-align: center;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

/* 生成日志样式 */
.generation-logs h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.logs-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
  background: var(--el-bg-color-page);
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 2px 0;
  font-size: 11px;
  font-family: var(--el-font-family-mono, Consolas, monospace);
}

.log-time {
  color: var(--el-text-color-secondary);
  min-width: 60px;
}

.log-level {
  min-width: 50px;
  font-weight: bold;
}

.log-entry.info .log-level {
  color: var(--el-color-info);
}

.log-entry.success .log-level {
  color: var(--el-color-success);
}

.log-entry.error .log-level {
  color: var(--el-color-danger);
}

.log-message {
  flex: 1;
  color: var(--el-text-color-regular);
}
</style>
