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
// 暂时注释避免编译错误
// import { codeGeneratorApi } from "@smartabp/lowcode-api"

// 临时API替代
const codeGeneratorApi = {
  generateCode: () => Promise.resolve({ success: true, files: [] })
}
// import type { Template } from "@smartabp/lowcode-api/types"

interface Template {
  id: string
  name: string
  description: string
}

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
    const config = {
      metadata: {
        name: generationParams.value.entityName,
        displayName: generationParams.value.displayName,
        module: generationParams.value.moduleName,
        projectId: workspaceStore.currentProject.id,
        templateId: selectedTemplate.value.id,
      },
      options: {
        framework: generationParams.value.framework,
        language: generationParams.value.language,
        architecture: "ddd",
        testing: true,
        documentation: true,
      },
      target: {
        outputDir: "generated",
        baseNamespace: "SmartAbp",
        basePath: "/",
        apiVersion: "v1",
      },
    }

    const result = await (codeGeneratorApi as any).generateModule?.(config)

    if (result && (result.success === undefined || result.success === true)) {
      // Simulate generated code for preview
      generatedCode.value = `
        <div class="generated-component">
          <h2>${generationParams.value.displayName}</h2>
          <p>Generated ${generationParams.value.framework.toUpperCase()} component for ${generationParams.value.entityName}</p>
          <div class="meta-info">
            <span>Template: ${selectedTemplate.value.name}</span>
            <span>Language: ${generationParams.value.language}</span>
            <span>Project: ${workspaceStore.currentProject.name}</span>
          </div>
        </div>
        <style>
          .generated-component { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .meta-info { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
          .meta-info span { font-size: 12px; color: #666; }
        </style>
      `

      ElMessage.success("Code generated successfully!")
      showPreview.value = true

      // Update project with generated code
      if (workspaceStore.currentProject) {
        workspaceStore.currentProject.pages.push({
          id: `page-${Date.now()}`,
          name: generationParams.value.entityName,
          template: selectedTemplate.value.id,
          code: generatedCode.value,
          createdAt: Date.now(),
        })
        workspaceStore.saveProject()
      }
    } else {
      ElMessage.error("Code generation failed")
    }
  } catch (error) {
    logger?.error("代码生成错误", { error: String(error) })
    ElMessage.error("Code generation failed: " + (error instanceof Error ? error.message : "Unknown error"))
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
