<template>
  <div class="generation-view">
    <div class="generation-header">
      <h2>Code Generation</h2>
      <div
        v-if="workspaceStore.currentProject"
        class="project-info"
      >
        <el-tag type="info">
          Project: {{ workspaceStore.currentProject.name }}
        </el-tag>
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
            <span>2. Configure Parameters</span>
          </template>
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
import { ref, computed } from "vue"
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTag, ElMessage } from "element-plus"
import { logger } from "@/utils/logger"
import { TemplateSelector } from "@smartabp/lowcode-designer"
import { SandboxPreview } from "@smartabp/lowcode-designer"
import { useWorkspaceStore } from "@/stores/lowcode/workspace"

// ✅ 使用真实的代码生成器API
import { codeGeneratorApi, type Template, type ModuleMetadataDto, type GenerationResult } from "@smartabp/lowcode-api"

const workspaceStore = useWorkspaceStore()
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

const canGenerate = computed(() => {
  return selectedTemplate.value &&
         generationParams.value.entityName &&
         generationParams.value.moduleName
})

const onTemplateSelect = (template: Template) => {
  selectedTemplate.value = template
  // Auto-fill some parameters based on template
  if (template.id === "crud") {
    generationParams.value.displayName = `${generationParams.value.entityName}管理`
  }
}

const generateCode = async () => {
  if (!selectedTemplate.value || !workspaceStore.currentProject) {
    ElMessage.error("Please select a template and ensure a project is active")
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
      author: 'SmartAbp LowCode Generator',
      databaseInfo: {
        connectionStringName: 'Default',
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
      generateMobilePages: false,
      dependencies: [],
      entities: [{
        name: generationParams.value.entityName,
        displayName: generationParams.value.displayName || generationParams.value.entityName,
        // 最简配置，更多字段由后端推断
      }]
    } satisfies ModuleMetadataDto

    console.log('🚀 Calling real code generator API...', config)

    // 🔥 调用真实的后端API
    const result: GenerationResult = await codeGeneratorApi.generateModule(config)

    console.log('✅ Code generation result:', result)

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
      if (workspaceStore.currentProject) {
        workspaceStore.currentProject.pages.push({
          id: `page-${Date.now()}`,
          name: generationParams.value.entityName,
          template: selectedTemplate.value.id,
          code: JSON.stringify(result.generatedFiles),
          createdAt: Date.now(),
        })
        workspaceStore.saveProject()
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
</style>
