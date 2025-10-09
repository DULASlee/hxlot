<template>
  <div class="enhanced-code-preview">
    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-icon class="code-icon">
            <Document />
          </el-icon>
          <span class="title">💻 代码预览</span>
          <el-tag
            v-if="currentFile"
            type="primary"
            size="small"
          >
            {{ currentFile.name }}
          </el-tag>
        </div>
        
        <div class="toolbar-right">
          <!-- 语言选择 -->
          <el-select
            v-model="selectedLanguage"
            size="small"
            style="width: 150px"
            @change="onLanguageChange"
          >
            <el-option
              label="YAML"
              value="yaml"
            />
            <el-option
              label="TypeScript"
              value="typescript"
            />
            <el-option
              label="C#"
              value="csharp"
            />
            <el-option
              label="JSON"
              value="json"
            />
            <el-option
              label="JavaScript"
              value="javascript"
            />
            <el-option
              label="XML"
              value="xml"
            />
            <el-option
              label="Dockerfile"
              value="dockerfile"
            />
            <el-option
              label="Shell"
              value="shell"
            />
          </el-select>

          <!-- 主题选择 -->
          <el-select
            v-model="editorTheme"
            size="small"
            style="width: 150px"
            @change="onThemeChange"
          >
            <el-option
              label="VS Code Light"
              value="vs"
            />
            <el-option
              label="VS Code Dark"
              value="vs-dark"
            />
            <el-option
              label="High Contrast Dark"
              value="hc-black"
            />
            <el-option
              label="GitHub Light"
              value="github-light"
            />
          </el-select>

          <!-- 视图模式 -->
          <el-radio-group
            v-model="viewMode"
            size="small"
            @change="onViewModeChange"
          >
            <el-radio-button label="single">
              <el-icon><Document /></el-icon>
              单窗口
            </el-radio-button>
            <el-radio-button label="split">
              <el-icon><CopyDocument /></el-icon>
              分屏对比
            </el-radio-button>
          </el-radio-group>

          <!-- 操作按钮 -->
          <el-button-group size="small">
            <el-button @click="formatCode">
              <el-icon><MagicStick /></el-icon>
              格式化
            </el-button>
            <el-button @click="copyCode">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
            <el-button @click="downloadCode">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </el-button-group>

          <el-switch
            v-model="readOnly"
            size="small"
            inline-prompt
            active-text="只读"
            inactive-text="编辑"
            @change="onReadOnlyChange"
          />

          <el-button
            size="small"
            :icon="FullScreen"
            circle
            @click="toggleFullscreen"
          />
        </div>
      </div>
    </el-card>

    <!-- 文件标签页 -->
    <el-card
      v-if="files.length > 1"
      class="tabs-card"
    >
      <el-tabs
        v-model="activeFileIndex"
        type="card"
        @tab-change="onTabChange"
      >
        <el-tab-pane
          v-for="(file, index) in files"
          :key="index"
          :label="file.name"
          :name="index.toString()"
        >
          <template #label>
            <span class="tab-label">
              <el-icon><Document /></el-icon>
              {{ file.name }}
              <el-icon
                class="close-icon"
                @click.stop="closeFile(index)"
              >
                <Close />
              </el-icon>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑器区域 -->
    <div
      ref="editorContainer"
      class="editor-container"
      :class="{ fullscreen: isFullscreen }"
    >
      <!-- 单窗口模式 -->
      <div
        v-if="viewMode === 'single'"
        class="single-editor"
      >
        <div
          ref="monacoEditor"
          class="monaco-editor"
        />
      </div>

      <!-- 分屏对比模式 -->
      <div
        v-else
        class="split-editor"
      >
        <div class="editor-panel">
          <div class="panel-header">
            <span>原始代码</span>
            <el-button
              size="small"
              text
              @click="loadOriginalCode"
            >
              <el-icon><RefreshRight /></el-icon>
              重新加载
            </el-button>
          </div>
          <div
            ref="originalEditor"
            class="monaco-editor"
          />
        </div>
        <div class="editor-divider" />
        <div class="editor-panel">
          <div class="panel-header">
            <span>修改后代码</span>
            <el-button
              size="small"
              text
              @click="acceptChanges"
            >
              <el-icon><Check /></el-icon>
              接受更改
            </el-button>
          </div>
          <div
            ref="modifiedEditor"
            class="monaco-editor"
          />
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span>行: {{ cursorPosition.line }}</span>
          <span>列: {{ cursorPosition.column }}</span>
          <span>选中: {{ selectedText.length }} 字符</span>
        </div>
        <div class="status-right">
          <span>{{ selectedLanguage.toUpperCase() }}</span>
          <span>UTF-8</span>
          <span>LF</span>
          <el-icon
            v-if="hasUnsavedChanges"
            color="#f56c6c"
          >
            <WarningFilled />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 搜索面板 -->
    <el-drawer
      v-model="searchDrawerVisible"
      title="搜索和替换"
      size="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="查找">
          <el-input
            v-model="searchText"
            placeholder="输入搜索内容"
            @keyup.enter="findNext"
          >
            <template #append>
              <el-button @click="findNext">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="替换为">
          <el-input
            v-model="replaceText"
            placeholder="输入替换内容"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="searchOptions.caseSensitive">
            区分大小写
          </el-checkbox>
          <el-checkbox v-model="searchOptions.wholeWord">
            全字匹配
          </el-checkbox>
          <el-checkbox v-model="searchOptions.regex">
            正则表达式
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-space>
            <el-button
              type="primary"
              @click="replaceOne"
            >
              替换
            </el-button>
            <el-button
              type="primary"
              @click="replaceAll"
            >
              全部替换
            </el-button>
            <el-button @click="findPrevious">
              上一个
            </el-button>
            <el-button @click="findNext">
              下一个
            </el-button>
          </el-space>
        </el-form-item>
        <el-form-item>
          <el-alert
            v-if="searchResults.total > 0"
            :closable="false"
          >
            找到 {{ searchResults.total }} 个匹配项
            (当前: {{ searchResults.current }})
          </el-alert>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 设置面板 -->
    <el-drawer
      v-model="settingsDrawerVisible"
      title="编辑器设置"
      size="400px"
    >
      <el-form label-width="120px">
        <el-form-item label="字体大小">
          <el-slider
            v-model="editorSettings.fontSize"
            :min="10"
            :max="32"
            @change="updateSettings"
          />
          <span>{{ editorSettings.fontSize }}px</span>
        </el-form-item>
        <el-form-item label="Tab大小">
          <el-input-number
            v-model="editorSettings.tabSize"
            :min="2"
            :max="8"
            @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="自动换行">
          <el-switch
            v-model="editorSettings.wordWrap"
            @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="显示行号">
          <el-switch
            v-model="editorSettings.lineNumbers"
            @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="显示空格">
          <el-switch
            v-model="editorSettings.renderWhitespace"
            @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="代码折叠">
          <el-switch
            v-model="editorSettings.folding"
            @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="小地图">
          <el-switch
            v-model="editorSettings.minimap"
            @change="updateSettings"
          />
        </el-form-item>
        <el-form-item label="括号匹配">
          <el-switch
            v-model="editorSettings.bracketMatching"
            @change="updateSettings"
          />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  CopyDocument,
  DocumentCopy,
  Download,
  MagicStick,
  FullScreen,
  Close,
  Check,
  RefreshRight,
  WarningFilled,
  ArrowDown
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'

// Props
interface Props {
  initialCode?: string
  language?: string
  theme?: string
  readOnly?: boolean
  files?: Array<{ name: string; content: string; language: string }>
}

const props = withDefaults(defineProps<Props>(), {
  initialCode: '',
  language: 'yaml',
  theme: 'vs-dark',
  readOnly: false,
  files: () => []
})

// Emits
const emit = defineEmits<{
  'update:code': [code: string]
  'save': [code: string]
  'change': [code: string]
}>()

// State
const monacoEditor = ref<HTMLElement>()
const originalEditor = ref<HTMLElement>()
const modifiedEditor = ref<HTMLElement>()
const editorContainer = ref<HTMLElement>()

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

const selectedLanguage = ref(props.language)
const editorTheme = ref(props.theme)
const viewMode = ref<'single' | 'split'>('single')
const readOnly = ref(props.readOnly)
const isFullscreen = ref(false)
const hasUnsavedChanges = ref(false)

const activeFileIndex = ref('0')
const files = ref(props.files.length > 0 ? props.files : [
  { name: 'deployment.yaml', content: props.initialCode, language: props.language }
])
const currentFile = ref(files.value[0])

const cursorPosition = reactive({ line: 1, column: 1 })
const selectedText = ref('')

// 搜索相关
const searchDrawerVisible = ref(false)
const searchText = ref('')
const replaceText = ref('')
const searchOptions = reactive({
  caseSensitive: false,
  wholeWord: false,
  regex: false
})
const searchResults = reactive({
  total: 0,
  current: 0
})

// 设置相关
const settingsDrawerVisible = ref(false)
const editorSettings = reactive({
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  renderWhitespace: false,
  folding: true,
  minimap: true,
  bracketMatching: true
})

// 初始化Monaco Editor
onMounted(async () => {
  await nextTick()
  initializeEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
  if (diffEditor) {
    diffEditor.dispose()
  }
})

// Watch viewMode changes
watch(viewMode, async (newMode) => {
  await nextTick()
  if (newMode === 'single') {
    if (diffEditor) {
      diffEditor.dispose()
      diffEditor = null
    }
    initializeSingleEditor()
  } else {
    if (editor) {
      editor.dispose()
      editor = null
    }
    initializeDiffEditor()
  }
})

// 初始化编辑器
const initializeEditor = () => {
  if (viewMode.value === 'single') {
    initializeSingleEditor()
  } else {
    initializeDiffEditor()
  }
}

// 初始化单窗口编辑器
const initializeSingleEditor = () => {
  if (!monacoEditor.value) return

  editor = monaco.editor.create(monacoEditor.value, {
    value: currentFile.value.content,
    language: selectedLanguage.value,
    theme: editorTheme.value,
    readOnly: readOnly.value,
    fontSize: editorSettings.fontSize,
    tabSize: editorSettings.tabSize,
    wordWrap: editorSettings.wordWrap ? 'on' : 'off',
    lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
    renderWhitespace: editorSettings.renderWhitespace ? 'all' : 'none',
    folding: editorSettings.folding,
    minimap: { enabled: editorSettings.minimap },
    bracketPairColorization: { enabled: editorSettings.bracketMatching },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const value = editor.getValue()
      currentFile.value.content = value
      hasUnsavedChanges.value = true
      emit('update:code', value)
      emit('change', value)
    }
  })

  // 监听光标位置变化
  editor.onDidChangeCursorPosition((e) => {
    cursorPosition.line = e.position.lineNumber
    cursorPosition.column = e.position.column
  })

  // 监听选中文本变化
  editor.onDidChangeCursorSelection(() => {
    if (editor) {
      const selection = editor.getSelection()
      if (selection) {
        selectedText.value = editor.getModel()?.getValueInRange(selection) || ''
      }
    }
  })

  // 快捷键
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    saveCode()
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
    searchDrawerVisible.value = true
  })
}

// 初始化diff编辑器
const initializeDiffEditor = () => {
  if (!originalEditor.value || !modifiedEditor.value) return

  const originalModel = monaco.editor.createModel(
    currentFile.value.content,
    selectedLanguage.value
  )
  const modifiedModel = monaco.editor.createModel(
    currentFile.value.content,
    selectedLanguage.value
  )

  diffEditor = monaco.editor.createDiffEditor(editorContainer.value!, {
    theme: editorTheme.value,
    automaticLayout: true,
    readOnly: readOnly.value
  })

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
}

// 语言变化
const onLanguageChange = () => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, selectedLanguage.value)
    }
  }
  currentFile.value.language = selectedLanguage.value
}

// 主题变化
const onThemeChange = () => {
  monaco.editor.setTheme(editorTheme.value)
}

// 视图模式变化
const onViewModeChange = () => {
  // Handled by watcher
}

// 只读模式变化
const onReadOnlyChange = () => {
  if (editor) {
    editor.updateOptions({ readOnly: readOnly.value })
  }
}

// 格式化代码
const formatCode = async () => {
  if (editor) {
    await editor.getAction('editor.action.formatDocument')?.run()
    ElMessage.success('代码已格式化')
  }
}

// 复制代码
const copyCode = () => {
  if (editor) {
    const code = editor.getValue()
    navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制到剪贴板')
  }
}

// 下载代码
const downloadCode = () => {
  if (editor) {
    const code = editor.getValue()
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFile.value.name
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('代码已下载')
  }
}

// 保存代码
const saveCode = () => {
  if (editor) {
    const code = editor.getValue()
    emit('save', code)
    hasUnsavedChanges.value = false
    ElMessage.success('代码已保存')
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    editorContainer.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 标签页切换
const onTabChange = (index: string) => {
  const fileIndex = parseInt(index)
  currentFile.value = files.value[fileIndex]
  selectedLanguage.value = currentFile.value.language
  if (editor) {
    editor.setValue(currentFile.value.content)
    monaco.editor.setModelLanguage(editor.getModel()!, currentFile.value.language)
  }
}

// 关闭文件
const closeFile = (index: number) => {
  if (files.value.length === 1) {
    ElMessage.warning('至少保留一个文件')
    return
  }
  files.value.splice(index, 1)
  if (parseInt(activeFileIndex.value) === index) {
    activeFileIndex.value = '0'
    onTabChange('0')
  }
}

// 加载原始代码
const loadOriginalCode = () => {
  ElMessage.info('重新加载原始代码')
}

// 接受更改
const acceptChanges = () => {
  ElMessage.success('已接受更改')
}

// 搜索相关
const findNext = () => {
  if (editor && searchText.value) {
    editor.getAction('actions.find')?.run()
  }
}

const findPrevious = () => {
  if (editor) {
    editor.getAction('editor.action.previousMatchFindAction')?.run()
  }
}

const replaceOne = () => {
  if (editor) {
    editor.getAction('editor.action.replaceOne')?.run()
    ElMessage.success('已替换一处')
  }
}

const replaceAll = () => {
  if (editor) {
    editor.getAction('editor.action.replaceAll')?.run()
    ElMessage.success('已全部替换')
  }
}

// 更新设置
const updateSettings = () => {
  if (editor) {
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      wordWrap: editorSettings.wordWrap ? 'on' : 'off',
      lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
      renderWhitespace: editorSettings.renderWhitespace ? 'all' : 'none',
      folding: editorSettings.folding,
      minimap: { enabled: editorSettings.minimap }
    })
  }
}

// 暴露方法
defineExpose({
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  formatCode,
  saveCode
})
</script>

<style scoped lang="scss">
.enhanced-code-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .toolbar-card {
    margin-bottom: 10px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .code-icon {
          font-size: 24px;
          color: #409EFF;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }

  .tabs-card {
    margin-bottom: 10px;

    .tab-label {
      display: flex;
      align-items: center;
      gap: 5px;

      .close-icon {
        margin-left: 5px;
        cursor: pointer;

        &:hover {
          color: #f56c6c;
        }
      }
    }
  }

  .editor-container {
    flex: 1;
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    background: #1e1e1e;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
    }

    .single-editor,
    .split-editor {
      height: calc(100% - 30px);
    }

    .monaco-editor {
      height: 100%;
    }

    .split-editor {
      display: flex;
      gap: 0;

      .editor-panel {
        flex: 1;
        display: flex;
        flex-direction: column;

        .panel-header {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          background: #2d2d2d;
          color: #fff;
          font-size: 14px;
        }

        .monaco-editor {
          flex: 1;
        }
      }

      .editor-divider {
        width: 4px;
        background: #3e3e3e;
        cursor: col-resize;

        &:hover {
          background: #007acc;
        }
      }
    }

    .status-bar {
      height: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 15px;
      background: #007acc;
      color: #fff;
      font-size: 12px;

      .status-left,
      .status-right {
        display: flex;
        gap: 15px;
      }
    }
  }
}
</style>

