<template>
  <div class="template-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-button
          type="primary"
          :icon="Document"
          size="small"
          @click="handleSave"
          :loading="saving"
          :disabled="!hasChanges"
        >
          {{ t('template.save') }}
        </el-button>
        <el-button
          type="default"
          :icon="Refresh"
          size="small"
          @click="handleReset"
          :disabled="!hasChanges"
        >
          {{ t('template.reset') }}
        </el-button>
        <el-button
          type="success"
          :icon="View"
          size="small"
          @click="handlePreview"
          :loading="compiling"
        >
          {{ t('template.preview') }}
        </el-button>
        <el-button
          type="warning"
          :icon="Upload"
          size="small"
          @click="handleTest"
        >
          {{ t('template.test') }}
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-select
          v-model="selectedEngine"
          size="small"
          style="width: 150px"
          @change="handleEngineChange"
        >
          <el-option label="Handlebars" value="Handlebars" />
          <el-option label="Mustache" value="Mustache" />
          <el-option label="EJS" value="EJS" />
        </el-select>

        <el-switch
          v-model="showPreview"
          :active-text="t('template.showPreview')"
          :inactive-text="t('template.hidePreview')"
          style="margin-left: 12px"
        />

        <el-tooltip :content="t('template.fullscreen')" placement="bottom">
          <el-button
            type="text"
            :icon="FullScreen"
            size="small"
            @click="toggleFullscreen"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- 主编辑区 -->
    <div class="editor-main" :class="{ 'split-view': showPreview }">
      <!-- 编辑器区域 -->
      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">{{ t('template.editor') }}</span>
          <span class="panel-info">{{ editorInfo }}</span>
        </div>
        <div ref="editorContainer" class="monaco-editor-container"></div>
      </div>

      <!-- 预览区域 -->
      <div v-if="showPreview" class="preview-panel">
        <div class="panel-header">
          <span class="panel-title">{{ t('template.preview') }}</span>
          <el-button
            v-if="previewResult"
            type="text"
            :icon="CopyDocument"
            size="small"
            @click="handleCopyPreview"
          >
            {{ t('template.copy') }}
          </el-button>
        </div>

        <!-- 预览内容 -->
        <div v-if="compiling" class="preview-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ t('template.compiling') }}</span>
        </div>

        <div v-else-if="previewError" class="preview-error">
          <el-alert
            :title="t('template.compileError')"
            type="error"
            :description="previewError"
            show-icon
            :closable="false"
          />
        </div>

        <div v-else-if="previewResult" class="preview-content">
          <pre><code>{{ previewResult }}</code></pre>
        </div>

        <div v-else class="preview-empty">
          <el-empty :description="t('template.clickPreviewToCompile')" />
        </div>
      </div>
    </div>

    <!-- 变量管理面板 -->
    <div v-if="showVariables" class="variables-panel">
      <div class="panel-header">
        <span class="panel-title">{{ t('template.variables') }}</span>
        <el-button
          type="primary"
          :icon="Plus"
          size="small"
          text
          @click="handleAddVariable"
        >
          {{ t('template.addVariable') }}
        </el-button>
      </div>

      <div class="variables-list">
        <div
          v-for="(variable, index) in variables"
          :key="index"
          class="variable-item"
        >
          <el-input
            v-model="variable.name"
            :placeholder="t('template.variableName')"
            size="small"
          />
          <el-select
            v-model="variable.type"
            :placeholder="t('template.variableType')"
            size="small"
            style="width: 120px"
          >
            <el-option label="String" value="string" />
            <el-option label="Number" value="number" />
            <el-option label="Boolean" value="boolean" />
            <el-option label="Object" value="object" />
            <el-option label="Array" value="array" />
          </el-select>
          <el-input
            v-model="variable.defaultValue"
            :placeholder="t('template.defaultValue')"
            size="small"
          />
          <el-button
            type="danger"
            :icon="Delete"
            size="small"
            text
            @click="handleRemoveVariable(index)"
          />
        </div>
      </div>
    </div>

    <!-- 测试对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      :title="t('template.testTemplate')"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="testForm" label-width="120px">
        <el-form-item :label="t('template.testData')">
          <el-input
            v-model="testForm.inputData"
            type="textarea"
            :rows="10"
            :placeholder="t('template.testDataPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('template.expectedOutput')">
          <el-input
            v-model="testForm.expectedOutput"
            type="textarea"
            :rows="8"
            :placeholder="t('template.expectedOutputPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="testDialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="testing"
          @click="handleRunTest"
        >
          {{ t('template.runTest') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Refresh,
  View,
  Upload,
  FullScreen,
  Plus,
  Delete,
  CopyDocument,
  Loading
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import * as monaco from 'monaco-editor'
import { TemplateEngine, type TemplateVariable } from '@smartabp/lowcode-shared'
import { useTemplateStore } from '../../stores/template'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Props & Emits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props {
  modelValue: string
  language?: string
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  readonly?: boolean
  showVariables?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'handlebars',
  theme: 'vs-dark',
  readonly: false,
  showVariables: true
})

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'save', value: string): void
  (e: 'change', value: string): void
}

const emit = defineEmits<Emits>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { t } = useI18n()
const templateStore = useTemplateStore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const editorContainer = ref<HTMLElement>()
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null

const originalValue = ref(props.modelValue)
const currentValue = ref(props.modelValue)
const selectedEngine = ref<TemplateEngine>(TemplateEngine.Handlebars)
const showPreview = ref(true)
const showVariables = ref(props.showVariables)

const saving = ref(false)
const compiling = ref(false)
const testing = ref(false)

const previewResult = ref<string>('')
const previewError = ref<string>('')

const testDialogVisible = ref(false)
const testForm = ref({
  inputData: '{}',
  expectedOutput: ''
})

const variables = ref<TemplateVariable[]>([])

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const hasChanges = computed(() => currentValue.value !== originalValue.value)

const editorInfo = computed(() => {
  if (!editorInstance) return ''
  const model = editorInstance.getModel()
  if (!model) return ''
  const lineCount = model.getLineCount()
  const position = editorInstance.getPosition()
  return `Line ${position?.lineNumber || 1}, Col ${position?.column || 1} | ${lineCount} lines`
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Monaco Editor Setup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function initializeEditor() {
  if (!editorContainer.value) return

  // 创建编辑器实例
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readonly,
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    formatOnPaste: true,
    formatOnType: true
  })

  // 监听内容变化
  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance?.getValue() || ''
    currentValue.value = value
    emit('update:modelValue', value)
    emit('change', value)
  })

  // 注册Handlebars语言支持
  registerHandlebarsLanguage()
}

function registerHandlebarsLanguage() {
  monaco.languages.register({ id: 'handlebars' })

  monaco.languages.setMonarchTokensProvider('handlebars', {
    tokenizer: {
      root: [
        [/\{\{[^}]*\}\}/, 'keyword'],
        [/#[a-zA-Z]+/, 'keyword'],
        [/\/[a-zA-Z]+/, 'keyword'],
        [/@[a-zA-Z]+/, 'variable']
      ]
    }
  })

  monaco.languages.registerCompletionItemProvider('handlebars', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      return {
        suggestions: [
          {
            label: '{{ }}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{{ ${1:variable} }}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Variable interpolation',
            range
          },
          {
            label: '{{#if}}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{{#if ${1:condition}}}\n  ${2}\n{{/if}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If block',
            range
          },
          {
            label: '{{#each}}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '{{#each ${1:array}}}\n  ${2}\n{{/each}}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Each loop',
            range
          }
        ]
      }
    }
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Actions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleSave() {
  saving.value = true
  try {
    emit('save', currentValue.value)
    originalValue.value = currentValue.value
    ElMessage.success(t('template.saveSuccess'))
  } catch (error) {
    ElMessage.error(t('template.saveFailed'))
    console.error('Save failed:', error)
  } finally {
    saving.value = false
  }
}

function handleReset() {
  ElMessageBox.confirm(
    t('template.resetConfirm'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    currentValue.value = originalValue.value
    if (editorInstance) {
      editorInstance.setValue(originalValue.value)
    }
    ElMessage.success(t('template.resetSuccess'))
  }).catch(() => {
    // User cancelled
  })
}

async function handlePreview() {
  compiling.value = true
  previewError.value = ''
  previewResult.value = ''

  try {
    // 解析测试数据
    const inputData = JSON.parse(testForm.value.inputData || '{}')

    // 调用编译API（需要先保存模板）
    if (!templateStore.currentTemplate) {
      throw new Error(t('template.pleaseSelectTemplate'))
    }

    const result = await templateStore.compileTemplate(
      templateStore.currentTemplate.id,
      inputData,
      { strict: true }
    )

    if (result.success && result.output) {
      previewResult.value = result.output
    } else if (result.error) {
      previewError.value = `${result.error.message} (Line ${result.error.line})`
    }
  } catch (error) {
    previewError.value = error instanceof Error ? error.message : t('template.compileFailed')
  } finally {
    compiling.value = false
  }
}

function handleTest() {
  testDialogVisible.value = true
}

async function handleRunTest() {
  testing.value = true
  try {
    const inputData = JSON.parse(testForm.value.inputData)

    if (!templateStore.currentTemplate) {
      throw new Error(t('template.pleaseSelectTemplate'))
    }

    const testCase = await templateStore.testTemplate(
      templateStore.currentTemplate.id,
      {
        name: 'Manual Test',
        inputData,
        expectedOutput: testForm.value.expectedOutput,
        status: 'pending'
      }
    )

    if (testCase.status === 'passed') {
      ElMessage.success(t('template.testPassed'))
      testDialogVisible.value = false
    } else {
      ElMessage.error(t('template.testFailed') + ': ' + testCase.errorMessage)
    }
  } catch (error) {
    ElMessage.error(t('template.testFailed'))
    console.error('Test failed:', error)
  } finally {
    testing.value = false
  }
}

function handleEngineChange() {
  // 更新语言支持
  const languageMap: Record<string, string> = {
    Handlebars: 'handlebars',
    Mustache: 'handlebars', // Mustache使用相同的语法高亮
    EJS: 'javascript'
  }
  const language = languageMap[selectedEngine.value] || 'handlebars'

  if (editorInstance) {
    const model = editorInstance.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language)
    }
  }
}

function toggleFullscreen() {
  const element = document.querySelector('.template-editor')
  if (element) {
    if (!document.fullscreenElement) {
      element.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
}

function handleCopyPreview() {
  if (previewResult.value) {
    navigator.clipboard.writeText(previewResult.value)
    ElMessage.success(t('template.copySuccess'))
  }
}

function handleAddVariable() {
  variables.value.push({
    name: '',
    type: 'string',
    description: '',
    required: false
  })
}

function handleRemoveVariable(index: number) {
  variables.value.splice(index, 1)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  nextTick(() => {
    initializeEditor()
  })
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose()
  }
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentValue.value && editorInstance) {
    editorInstance.setValue(newValue)
  }
})
</script>

<style scoped lang="scss">
.template-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color);

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;

  &.split-view {
    .editor-panel {
      width: 50%;
      border-right: 1px solid var(--el-border-color);
    }

    .preview-panel {
      width: 50%;
    }
  }
}

.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-panel {
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color);

  .panel-title {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .panel-info {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.monaco-editor-container {
  flex: 1;
  overflow: hidden;
}

.preview-content,
.preview-loading,
.preview-error,
.preview-empty {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.preview-content {
  pre {
    margin: 0;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--el-text-color-secondary);

  .el-icon {
    font-size: 32px;
  }
}

.variables-panel {
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color-overlay);
  max-height: 300px;
  overflow-y: auto;
}

.variables-list {
  padding: 12px;
}

.variable-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>

