<template>
  <div class="generation-view">
    <div class="generation-header">
      <h2>Code Generation</h2>
      <div
        v-if="projectStore.currentProject"
        class="project-info"
      >
        <el-tag type="info">
          Project: {{ projectStore.currentProject.name }}
        </el-tag>
      </div>
      <!-- 🔥 新增：无项目提示 -->
      <div
        v-else
        class="no-project-warning"
      >
        <el-alert
          title="没有活跃项目"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            请先创建或选择一个项目才能生成代码
            <el-button 
              type="primary" 
              size="small" 
              style="margin-left: 12px;"
              @click="createDefaultProject"
            >
              创建默认项目
            </el-button>
          </template>
        </el-alert>
      </div>
    </div>

    <div class="generation-content">
      <div class="left-panel">
        <el-card class="template-section">
          <template #header>
            <span>1. Select Template</span>
          </template>
          <TemplateSelector @select="(template: any) => onTemplateSelect(template)" />
        </el-card>

        <el-card
          v-if="selectedTemplate"
          class="parameters-section"
        >
          <template #header>
            <div class="parameters-header">
              <span>2. Configure Parameters</span>
              <!-- 🔥 新增：验证状态显示 -->
              <div class="validation-status">
                <el-tag
                  v-if="validationState.isValidating"
                  type="info"
                  size="small"
                >
                  <i class="el-icon-loading" /> Validating...
                </el-tag>
                <el-tag
                  v-else-if="isValid"
                  type="success"
                  size="small"
                >
                  <i class="el-icon-check" /> Valid
                </el-tag>
                <el-tag
                  v-else-if="errorCount > 0"
                  type="danger"
                  size="small"
                >
                  <i class="el-icon-close" /> {{ errorCount }} Error{{ errorCount > 1 ? 's' : '' }}
                </el-tag>
                <el-tag
                  v-if="warningCount > 0"
                  type="warning"
                  size="small"
                >
                  <i class="el-icon-warning" /> {{ warningCount }} Warning{{ warningCount > 1 ? 's' : '' }}
                </el-tag>
              </div>
            </div>
          </template>

          <!-- 🔥 新增：验证错误显示 -->
          <div
            v-if="errorCount > 0"
            class="validation-errors"
          >
            <el-alert
              v-for="error in validationState.errors"
              :key="error.path"
              :title="error.message"
              type="error"
              size="small"
              :closable="false"
              show-icon
            />
          </div>

          <!-- 🔥 新增：验证警告显示 -->
          <div
            v-if="warningCount > 0"
            class="validation-warnings"
          >
            <el-alert
              v-for="warning in validationState.warnings"
              :key="warning.path"
              :title="warning.message"
              type="warning"
              size="small"
              :closable="false"
              show-icon
            />
          </div>

          <el-form
            :model="generationParams"
            label-width="120px"
          >
            <el-form-item
              label="Entity Name"
              required
            >
              <el-input
                v-model="generationParams.entityName"
                placeholder="User"
              />
            </el-form-item>
            <el-form-item
              label="Module Name"
              required
            >
              <el-input
                v-model="generationParams.moduleName"
                placeholder="Identity"
              />
            </el-form-item>
            <el-form-item label="Display Name">
              <el-input
                v-model="generationParams.displayName"
                placeholder="用户管理"
              />
            </el-form-item>
            <el-form-item label="Framework">
              <el-select v-model="generationParams.framework">
                <el-option
                  label="Vue 3"
                  value="vue"
                />
                <el-option
                  label="React"
                  value="react"
                />
                <el-option
                  label="Angular"
                  value="angular"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Language">
              <el-select v-model="generationParams.language">
                <el-option
                  label="TypeScript"
                  value="typescript"
                />
                <el-option
                  label="JavaScript"
                  value="javascript"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card
          v-if="selectedTemplate"
          class="generation-actions"
        >
          <template #header>
            <span>3. Generate Code</span>
          </template>
          <div class="action-buttons">
            <el-button
              type="primary"
              :loading="generating"
              :disabled="!canGenerate"
              @click="generateCode"
            >
              Generate Code
            </el-button>
            <el-button
              :disabled="!generatedCode"
              @click="previewCode"
            >
              Preview
            </el-button>
          </div>
        </el-card>
      </div>

      <div
        v-if="showPreview && generatedCode"
        class="right-panel"
      >
        <el-card class="preview-section">
          <template #header>
            <div class="preview-header">
              <span>Code Preview</span>
              <el-button
                size="small"
                @click="copyCode"
              >
                Copy
              </el-button>
            </div>
          </template>
          <SandboxPreview :code="generatedCode" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "@/stores/lowcode/projectStore"
import { logger } from "@/utils/logger"
import SandboxPreview from "@smartabp/lowcode-designer/components/SandboxPreview.vue"
import TemplateSelector from "@smartabp/lowcode-designer/components/TemplateSelector.vue"
import { ElAlert, ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect, ElTag } from "element-plus"
import { computed, ref, watch } from "vue"

// ✅ 使用真实的代码生成器API
import { codeGeneratorApi, type GenerationResult, type ModuleGenerationConfig, type ModuleMetadataDto, type Template } from "@smartabp/lowcode-api"

// 🔥 新增：导入验证功能
import type { UnifiedModuleMetadata } from "@smartabp/lowcode-shared"
import { useValidation, type ValidationOptions } from "@smartabp/lowcode-shared/composables/useValidation"

const projectStore = useProjectStore()
const selectedTemplate = ref<Template | null>(null)
const generating = ref(false)
const showPreview = ref(false)
const generatedCode = ref("")

const generationParams = ref({
  entityName: "",
  moduleName: "",
  displayName: "",
  framework: "vue",
  language: "typescript",
})

// 🔥 新增：初始化验证功能
const validationOptions: ValidationOptions = {
  debounceMs: 300,
  enableCache: true,
  realtime: true,
  mode: 'standard',
  featureFlags: {
    enablePerformanceMonitoring: true,
    enableDetailedErrorReporting: true,
    enableStrictValidation: false
  }
}

const {
  validationState,
  isValid,
  errorCount,
  warningCount,
  validateModule,
  clearErrors
} = useValidation(validationOptions)

const canGenerate = computed(() => {
  return selectedTemplate.value &&
    generationParams.value.entityName &&
    generationParams.value.moduleName &&
    isValid.value // 🔥 新增：只有验证通过才能生成代码
})

const onTemplateSelect = (template: Template) => {
  selectedTemplate.value = template
  // Auto-fill some parameters based on template
  if (template.id === "crud") {
    generationParams.value.displayName = `${generationParams.value.entityName}管理`
  }

  // 🔥 新增：模板选择后清除之前的验证错误
  clearErrors()
}

// 🔥 新增：创建UnifiedModuleMetadata用于验证
const createUnifiedModuleMetadata = (): UnifiedModuleMetadata => {
  return {
    id: crypto.randomUUID(),
    systemName: 'SmartAbp',
    name: generationParams.value.moduleName,
    displayName: generationParams.value.displayName || generationParams.value.entityName,
    description: `${generationParams.value.displayName || generationParams.value.entityName}模块`,
    version: '1.0.0',
    author: 'SmartAbp',
    namespace: `SmartAbp.${generationParams.value.moduleName}`,
    architecturePattern: 'Crud' as const,
    databaseInfo: {
      connectionStringName: 'Default',
      schema: 'dbo',
      provider: 'SqlServer' as const
    },
    frontend: {
      parentId: '',
      routePrefix: generationParams.value.moduleName.toLowerCase()
    },
    generateMobilePages: false,
    featureManagement: {
      isEnabled: true,
      defaultPolicy: 'RequiresAuthentication'
    },
    dependencies: [],
    schemaVersion: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    entities: [{
      id: crypto.randomUUID(),
      name: generationParams.value.entityName,
      displayName: generationParams.value.displayName || generationParams.value.entityName,
      tableName: generationParams.value.entityName,
      module: generationParams.value.moduleName,
      namespace: `SmartAbp.${generationParams.value.moduleName}.Entities`,
      description: `${generationParams.value.displayName || generationParams.value.entityName}实体`,
      schema: 'dbo',
      isAggregateRoot: true,
      baseClass: 'FullAuditedAggregateRoot<Guid>',
      interfaces: [],
      isAudited: true,
      isSoftDelete: true,
      isMultiTenant: false,
      fields: [
        {
          id: crypto.randomUUID(),
          name: 'Id',
          displayName: 'ID',
          type: 'Guid',
          isRequired: true,
          isPrimaryKey: true,
          isReadonly: true,
          description: '主键ID',
          helpText: '',
          isUnique: true,
          isIndexed: true,
          enumValues: [],
          defaultValue: undefined,
          minLength: undefined,
          maxLength: undefined,
          minValue: undefined,
          maxValue: undefined,
          pattern: undefined,
          validationRules: [],
          displayOrder: 1,
          groupName: 'Basic',
          isVisible: true,
          listVisible: true,
          detailVisible: true,
          formVisible: false,
          searchable: false,
          sortable: true,
          filterable: false,
          disabled: false,
          columnName: 'Id',
          columnType: 'uniqueidentifier',
          isAuditField: false,
          isSoftDeleteField: false,
          isTenantField: false
        }
      ],
      relationships: [],
      validationRules: [],
      businessRules: [],
      indexes: [],
      constraints: [],
      permissions: [],
      uiConfig: {
        listPage: {
          pageSize: 20,
          sortField: 'Id',
          sortOrder: 'desc' as const,
          searchFields: ['Name'],
          displayFields: ['Id', 'Name']
        },
        formPage: {
          layout: 'vertical' as const,
          labelWidth: 120,
          fieldGroups: [{
            name: 'basic',
            displayName: 'Basic Information',
            fields: ['Name']
          }]
        },
        detailPage: {
          layout: 'card' as const,
          displayFields: ['Id', 'Name']
        }
      },
      codeGeneration: {
        generateEntity: true,
        generateDto: true,
        generateAppService: true,
        generateController: true,
        generateRepository: true,
        generateFrontend: true,
        generateTests: false
      },
      isCompleted: false,
      tags: [],
      schemaVersion: '1.0.0',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }],
    permissionConfig: {
      groupName: generationParams.value.moduleName,
      permissions: []
    },
    menuConfig: []
  }
}

// 🔥 新增：实时验证参数变化
watch(
  [() => generationParams.value.entityName, () => generationParams.value.moduleName, () => generationParams.value.displayName],
  async () => {
    if (generationParams.value.entityName && generationParams.value.moduleName) {
      const moduleMetadata = createUnifiedModuleMetadata()
      await validateModule(moduleMetadata)
    }
  },
  { deep: true }
)

const generateCode = async () => {
  if (!selectedTemplate.value || !projectStore.currentProject) {
    ElMessage.error("Please select a template and ensure a project is active")
    return
  }

  // 🔥 新增：生成前最终验证
  if (!isValid.value) {
    ElMessage.error(`Validation failed: ${errorCount.value} errors found`)
    return
  }

  generating.value = true
  try {
    // 🔥 构建符合后端ModuleMetadataDto要求的配置
    const config = {
      systemName: 'SmartAbp',
      name: generationParams.value.moduleName,
      displayName: generationParams.value.displayName || generationParams.value.entityName,
      description: `${generationParams.value.displayName || generationParams.value.entityName}模块`,
      version: '1.0.0',
      architecturePattern: 'Crud' as const, // 明确指定为字面量类型
      namespace: `SmartAbp.${generationParams.value.moduleName}`,
      databaseInfo: {
        connectionStringName: 'Default',
        schema: 'dbo', // ✅ 修复: 添加必需的schema字段
        provider: 'SqlServer' as const
      },
      featureManagement: {
        isEnabled: true,
        defaultPolicy: 'RequiresAuthentication'
      },
      frontend: {
        parentId: '',
        routePrefix: generationParams.value.moduleName.toLowerCase()
      },
      dependencies: [],
      entities: [{
        id: crypto.randomUUID(),
        name: generationParams.value.entityName,
        displayName: generationParams.value.displayName || generationParams.value.entityName,
        tableName: generationParams.value.entityName,
        module: generationParams.value.moduleName,
        namespace: `${generationParams.value.moduleName}.Entities`,
        description: `${generationParams.value.displayName || generationParams.value.entityName}实体`,
        schema: 'dbo',
        isAggregateRoot: true,
        baseClass: 'FullAuditedAggregateRoot<Guid>',
        interfaces: [],
        isAudited: true,
        isSoftDelete: true,
        isMultiTenant: false,
        fields: [],
        relationships: [],
        validationRules: [],
        businessRules: [],
        indexes: [],
        constraints: [],
        permissions: [],
        uiConfig: {
          listPage: {
            pageSize: 20,
            sortField: 'name',
            sortOrder: 'asc',
            searchFields: ['name'],
            displayFields: ['name', 'description']
          },
          formPage: {
            layout: 'vertical',
            labelWidth: 120,
            fieldGroups: [{
              name: 'basic',
              displayName: '基本信息',
              fields: ['name', 'description']
            }]
          },
          detailPage: {
            layout: 'tabs',
            displayFields: ['name', 'description']
          }
        },
        codeGeneration: {
          generateEntity: true,
          generateDto: true,
          generateAppService: true,
          generateController: true,
          generateRepository: true,
          generateFrontend: true,
          generateTests: true
        },
        isCompleted: false,
        tags: [],
        schemaVersion: '1.0.0',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      // ✅ 添加缺少的必需字段
      id: crypto.randomUUID(),
      author: 'SmartAbp Team',
      generateMobilePages: false,
      menuConfig: [{
        id: crypto.randomUUID(),
        label: generationParams.value.displayName || generationParams.value.entityName,
        icon: 'el-icon-document',
        route: `/${generationParams.value.moduleName.toLowerCase()}`,
        children: []
      }],
      permissionConfig: {
        groupName: generationParams.value.moduleName,
        permissions: [
          {
            name: `${generationParams.value.moduleName}.Default`,
            displayName: `${generationParams.value.displayName || generationParams.value.entityName}管理`,
            description: `${generationParams.value.displayName || generationParams.value.entityName}模块的默认权限`,
            isGrantedByDefault: false
          }
        ]
      },
      schemaVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    } satisfies ModuleMetadataDto

    // ✅ 修复: 构建符合ModuleGenerationConfig接口的完整配置
    const generationConfig: ModuleGenerationConfig = {
      moduleMetadata: config,
      targetPath: './generated', // 默认生成路径
      overwriteExisting: true,
      generateTests: false,
      generateDocs: false
    }

    // 🔥 调用真实的后端API
    const result: GenerationResult = await codeGeneratorApi.generateModule(generationConfig)

    if (result.success) {
      // 处理真实的生成结果
      const totalFiles = result.statistics?.totalFiles || result.generatedFiles?.length || 0
      const totalLines = result.statistics?.totalLines || 0

      // 生成预览内容（显示所有生成的文件）
      let preview = `<div class="generation-result">`
      preview += `<h2>✅ 代码生成成功！</h2>`
      preview += `<div class="stats">`
      preview += `<div class="stat-item"><span class="label">生成文件:</span> <span class="value">${totalFiles} 个</span></div>`
      preview += `<div class="stat-item"><span class="label">代码行数:</span> <span class="value">${totalLines} 行</span></div>`
      preview += `<div class="stat-item"><span class="label">生成时间:</span> <span class="value">${result.statistics?.generationTime || 0}ms</span></div>`
      preview += `<div class="stat-item"><span class="label">模块:</span> <span class="value">${generationParams.value.moduleName}</span></div>`
      preview += `<div class="stat-item"><span class="label">实体:</span> <span class="value">${generationParams.value.entityName}</span></div>`
      preview += `</div>`

      if (result.generatedFiles && result.generatedFiles.length > 0) {
        preview += `<h3>生成的文件列表:</h3>`
        preview += `<div class="file-list">`
        result.generatedFiles.forEach((file: { path: string; content?: string }) => {
          preview += `<div class="file-item">`
          preview += `<div class="file-path">📄 ${file.path}</div>`
          if (file.content) {
            preview += `<pre class="file-content">${file.content.substring(0, 500)}...</pre>`
          }
          preview += `</div>`
        })
        preview += `</div>`
      }

      preview += `</div>`
      preview += `<style>
        .generation-result { padding: 20px; }
        .generation-result h2 { color: #67C23A; margin-bottom: 20px; }
        .stats { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .stat-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .stat-item .label { font-weight: 600; color: #606266; }
        .stat-item .value { color: #409EFF; }
        .file-list { max-height: 500px; overflow-y: auto; }
        .file-item { background: #fff; border: 1px solid #DCDFE6; border-radius: 4px; padding: 12px; margin-bottom: 10px; }
        .file-path { font-weight: 600; color: #409EFF; margin-bottom: 8px; }
        .file-content { background: #f5f7fa; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; }
      </style>`

      generatedCode.value = preview

      ElMessage.success(`成功生成 ${totalFiles} 个文件！`)
      showPreview.value = true

      // Update project with generated code
      if (projectStore.currentProject) {
        projectStore.currentProject.pages.push({
          id: `page-${Date.now()}`,
          name: generationParams.value.entityName,
          template: selectedTemplate.value.id,
          code: result.generatedFiles, // ✅ 修复: 直接存储文件数组，不转JSON字符串
          createdAt: Date.now(),
        })
        projectStore.saveProject()
      }
    } else {
      // 处理生成失败
      const errors = result.errors || []
      const errorMessage = errors.length > 0
        ? `生成失败：${errors.join(', ')}`
        : '代码生成失败，请检查配置'
      ElMessage.error(errorMessage)
    }
  } catch (error) {
    console.error('❌ Code generation error:', error)
    logger?.error("代码生成错误", { error: String(error) })

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error"

    ElMessage.error({
      message: `代码生成失败: ${errorMessage}`,
      duration: 5000
    })
  } finally {
    generating.value = false
  }
}

const previewCode = () => {
  showPreview.value = !showPreview.value
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success("Code copied to clipboard!")
  } catch {
    ElMessage.error("Failed to copy code")
  }
}

// 🔥 新增：创建默认项目的方法
const createDefaultProject = () => {
  projectStore.createProject({
    name: `SmartAbp Project ${Date.now()}`,
    description: "默认低代码项目，用于代码生成"
  })
  ElMessage.success("默认项目已创建！现在可以开始生成代码了。")
}
</script>

<style scoped>
.generation-view {
  padding: 24px;
  height: 100%;
}

.generation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.generation-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: calc(100vh - 200px);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-panel {
  display: flex;
  flex-direction: column;
}

.template-section,
.parameters-section,
.generation-actions,
.preview-section {
  height: fit-content;
}

.preview-section {
  height: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.project-info {
  display: flex;
  gap: 8px;
}

/* 🔥 新增：验证相关样式 */
.parameters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.validation-status {
  display: flex;
  gap: 8px;
  align-items: center;
}

.validation-errors,
.validation-warnings {
  margin-bottom: 16px;
}

.validation-errors .el-alert,
.validation-warnings .el-alert {
  margin-bottom: 8px;
}

.validation-errors .el-alert:last-child,
.validation-warnings .el-alert:last-child {
  margin-bottom: 0;
}

/* 验证状态动画 */
.validation-status .el-tag {
  transition: all 0.3s ease;
}

.validation-status .el-tag i {
  margin-right: 4px;
}

/* 🔥 新增：无项目警告样式 */
.no-project-warning {
  margin-bottom: 16px;
}

.no-project-warning .el-alert {
  border-radius: 8px;
}

.no-project-warning .el-button {
  border-radius: 4px;
}
</style>
