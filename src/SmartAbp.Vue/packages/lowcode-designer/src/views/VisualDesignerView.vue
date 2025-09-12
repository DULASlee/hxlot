<template>
  <div class="visual-designer">
    <el-card>
      <h2>🧩 可视化设计器（P2）</h2>
      <p>以 Schema 为唯一真实来源的拖拽式可视化模块。此为 M1 基线视图，占位 Canvas/Palette/Inspector 与沙箱预览入口。</p>
      <el-alert type="info" show-icon title="说明">
        <template #default>
          <div>
            - 仅消费后端 Swagger/OpenAPI 契约，生成前端调用代码（不生成后端接口）。<br />
            - 支持 DesignerOverrideSchema 增量导出与回读（后续里程碑）。
          </div>
        </template>
      </el-alert>
      <div class="designer-layout">
        <Palette />
        <Canvas />
        <Inspector />
      </div>
      <div class="actions">
        <el-button type="primary" @click="onPreview" :disabled="!hasComponents">
          <el-icon><View /></el-icon>
          预览页面
        </el-button>
        <el-button @click="onGenerateCode" :disabled="!hasComponents" :loading="generating">
          <el-icon><Document /></el-icon>
          生成代码
        </el-button>
        <el-button @click="onExportSchema" :disabled="!hasComponents">
          <el-icon><Download /></el-icon>
          导出Schema
        </el-button>
        <el-button @click="onClearAll" :disabled="!hasComponents" type="danger">
          <el-icon><Delete /></el-icon>
          清空画布
        </el-button>
      </div>

      <!-- 代码生成配置对话框 -->
      <el-dialog v-model="showCodeDialog" title="代码生成配置" width="600px">
        <el-form :model="codegenOptions" label-width="100px">
          <el-form-item label="模块名称" required>
            <el-input v-model="codegenOptions.moduleName" placeholder="例如：UserManagement" />
          </el-form-item>
          <el-form-item label="页面名称" required>
            <el-input v-model="codegenOptions.pageName" placeholder="例如：UserList" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="codegenOptions.author" placeholder="可选" />
          </el-form-item>
          <el-form-item label="生成格式">
            <el-radio-group v-model="codegenOptions.format">
              <el-radio value="vue-sfc">Vue SFC</el-radio>
              <el-radio value="designer-schema">Designer Schema</el-radio>
              <el-radio value="both">两者都要</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="codegenOptions.includeEvents">包含事件绑定</el-checkbox>
            <el-checkbox v-model="codegenOptions.includeValidation">包含校验规则</el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCodeDialog = false">取消</el-button>
          <el-button type="primary" @click="handleGenerateCode" :loading="generating">
            生成代码
          </el-button>
        </template>
      </el-dialog>

      <!-- 代码预览对话框 -->
      <el-dialog v-model="showPreviewDialog" title="生成的代码" width="80%" :fullscreen="previewFullscreen">
        <template #header>
          <div class="dialog-header">
            <span>生成的代码</span>
            <div class="header-actions">
              <el-button text @click="previewFullscreen = !previewFullscreen">
                <el-icon><FullScreen v-if="!previewFullscreen" /><Aim v-else /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane v-if="generatedCode?.vueSFC" label="Vue模板" name="template">
            <el-input
              v-model="generatedCode.vueSFC.template"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane v-if="generatedCode?.vueSFC" label="脚本代码" name="script">
            <el-input
              v-model="generatedCode.vueSFC.script"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane v-if="generatedCode?.vueSFC" label="样式代码" name="style">
            <el-input
              v-model="generatedCode.vueSFC.style"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane v-if="generatedCode?.designerSchema" label="Designer Schema" name="schema">
            <el-input
              v-model="schemaText"
              type="textarea"
              :rows="20"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
          <el-tab-pane label="路由配置" name="routes">
            <el-input
              v-model="routesText"
              type="textarea"
              :rows="10"
              readonly
              class="code-textarea"
            />
          </el-tab-pane>
        </el-tabs>

        <template #footer>
          <el-button @click="showPreviewDialog = false">关闭</el-button>
          <el-button type="primary" @click="copyToClipboard">
            <el-icon><CopyDocument /></el-icon>
            复制当前代码
          </el-button>
          <el-button type="success" @click="downloadCode">
            <el-icon><Download /></el-icon>
            下载文件
          </el-button>
        </template>
      </el-dialog>
      <el-divider />
      <h4>回读SFC（占位）</h4>
      <el-input v-model="sfcText" type="textarea" :autosize="{ minRows: 6 }" placeholder="粘贴包含data-block-id/data-node-id的SFC模板" />
      <div class="actions">
        <el-button @click="onReadSFC">回读Selectors</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Canvas from './designer/Canvas.vue'
import Palette from './designer/Palette.vue'
import Inspector from './designer/Inspector.vue'
// 暂时注释掉不可用的回读逻辑，后续补齐 reader/override 实现
// import { BasicSchemaReader } from './designer/schema/reader'
// import { BasicMergeEngine } from './designer/schema/merge' // 暂时未使用
type DesignerOverrideSchema = any
import { ElMessage } from 'element-plus'
import {
  View,
  Document,
  Download,
  Delete,
  FullScreen,
  Aim,
  CopyDocument
} from '@element-plus/icons-vue'
// 统一从同一处导入一次，避免重复标识符
import { exportDesignerState, type ExportOptions, type CodeGenerationResult } from '../designer/schema/exporter'
// stores 目录暂缺最小实现，此处以本地空实现代替，后续补全
const useDesignerStore = () => ({ components: [], clear: () => {} } as any)
// 响应式数据
const sfcText = ref('')
const generating = ref(false)
const showCodeDialog = ref(false)
const showPreviewDialog = ref(false)
const previewFullscreen = ref(false)
const activeTab = ref('template')

// 代码生成配置
const codegenOptions = ref<ExportOptions>({
  moduleName: 'UserManagement',
  pageName: 'UserList',
  author: '',
  format: 'vue-sfc',
  includeEvents: true,
  includeValidation: true
})

// 生成的代码
const generatedCode = ref<CodeGenerationResult | null>(null)

// 设计器状态
const designerStore = useDesignerStore()

// Schema处理器
const reader = { readFromVueSFC: (_c: string, _o: any) => ({ selectors: {}, operations: [] }) } as any
// const merger = new BasicMergeEngine() // 暂时未使用

// 计算属性
const hasComponents = computed(() => designerStore.components.length > 0)

const schemaText = computed(() => {
  return generatedCode.value?.designerSchema
    ? JSON.stringify(generatedCode.value.designerSchema, null, 2)
    : ''
})

const routesText = computed(() => {
  return generatedCode.value?.routes
    ? JSON.stringify({
        routes: generatedCode.value.routes,
        menuItems: generatedCode.value.menuItems
      }, null, 2)
    : ''
})

// 方法实现
const onPreview = () => {
  if (!hasComponents.value) {
    ElMessage.warning('请先添加一些组件到画布')
    return
  }

  // TODO: 实现预览功能
  ElMessage.info('预览功能开发中...')
}

const onGenerateCode = () => {
  if (!hasComponents.value) {
    ElMessage.warning('请先添加一些组件到画布')
    return
  }

  // 重置配置为合理的默认值
  codegenOptions.value.moduleName = 'UserManagement'
  codegenOptions.value.pageName = 'UserList'
  showCodeDialog.value = true
}

const handleGenerateCode = async () => {
  if (!codegenOptions.value.moduleName || !codegenOptions.value.pageName) {
    ElMessage.error('请填写模块名称和页面名称')
    return
  }

  try {
    generating.value = true

    // 生成代码
    const result = exportDesignerState(designerStore.components, codegenOptions.value)
    generatedCode.value = result

    // 关闭配置对话框，打开预览对话框
    showCodeDialog.value = false
    showPreviewDialog.value = true
    activeTab.value = 'template'

    ElMessage.success('代码生成成功！')
  } catch (error) {
    console.error('代码生成失败:', error)
    ElMessage.error('代码生成失败，请检查组件配置')
  } finally {
    generating.value = false
  }
}

const onExportSchema = () => {
  if (!hasComponents.value) {
    ElMessage.warning('请先添加一些组件到画布')
    return
  }

  try {
    const result = exportDesignerState(designerStore.components, {
      moduleName: 'Demo',
      pageName: 'DemoPage',
      format: 'designer-schema'
    } as ExportOptions)
    const schema = result.designerSchema || {
      metadata: {
        schemaVersion: '0.1.0',
        moduleName: 'Demo',
        pageName: 'DemoPage',
        timestamp: new Date().toISOString()
      },
      selectors: {},
      operations: []
    }

    // 下载Schema文件
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `designer-schema-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('Schema已导出下载')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const onClearAll = () => {
  designerStore.clear()
  generatedCode.value = null
  ElMessage.success('画布已清空')
}

const copyToClipboard = async () => {
  try {
    let content = ''

    switch (activeTab.value) {
      case 'template':
        content = generatedCode.value?.vueSFC?.template || ''
        break
      case 'script':
        content = generatedCode.value?.vueSFC?.script || ''
        break
      case 'style':
        content = generatedCode.value?.vueSFC?.style || ''
        break
      case 'schema':
        content = schemaText.value
        break
      case 'routes':
        content = routesText.value
        break
    }

    await navigator.clipboard.writeText(content)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadCode = () => {
  if (!generatedCode.value) return

  try {
    let filename = ''
    let content = ''
    let mimeType = 'text/plain'

    switch (activeTab.value) {
      case 'template':
        filename = `${codegenOptions.value.pageName}.vue`
        content = `${generatedCode.value.vueSFC?.template || ''}\n\n${generatedCode.value.vueSFC?.script || ''}\n\n${generatedCode.value.vueSFC?.style || ''}`
        mimeType = 'text/plain'
        break
      case 'script':
        filename = `${codegenOptions.value.pageName}.js`
        content = generatedCode.value.vueSFC?.script || ''
        mimeType = 'text/javascript'
        break
      case 'style':
        filename = `${codegenOptions.value.pageName}.css`
        content = generatedCode.value.vueSFC?.style || ''
        mimeType = 'text/css'
        break
      case 'schema':
        filename = `${codegenOptions.value.pageName}-schema.json`
        content = schemaText.value
        mimeType = 'application/json'
        break
      case 'routes':
        filename = `${codegenOptions.value.pageName}-routes.json`
        content = routesText.value
        mimeType = 'application/json'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success(`文件 ${filename} 已下载`)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// Schema处理（保留原有功能）
const readFromSFC = (content: string): DesignerOverrideSchema => {
  return reader.readFromVueSFC(content, {
    moduleName: 'Demo',
    pageName: 'DemoPage'
  })
}

const onReadSFC = () => {
  const schema = readFromSFC(sfcText.value || '<template><div data-block-id="demo-root"/></template>')
  const blocks = Object.keys(schema.selectors.byBlockId || {})
  const nodes = Object.keys(schema.selectors.byDataNodeId || {})
  ElMessage.success(`回读成功：blocks=${blocks.length}, nodes=${nodes.length}`)
}
</script>

<style scoped>
.visual-designer {
  padding: 1rem;
}

.actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.designer-layout {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  min-height: 40rem;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.code-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

.code-textarea :deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
