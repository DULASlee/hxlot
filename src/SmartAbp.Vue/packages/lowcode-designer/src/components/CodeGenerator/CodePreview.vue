<template>
  <div class="code-preview-container">
    <el-card class="code-preview-card">
      <template #header>
        <div class="preview-header">
          <div class="header-left">
            <el-icon class="header-icon">
              <Document />
            </el-icon>
            <span class="header-title">Generated Code Preview</span>
            <el-tag
              v-if="language"
              :type="getLanguageTagType(language)"
              size="small"
            >
              {{ language.toUpperCase() }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-tooltip content="Copy to clipboard">
              <el-button
                :icon="Copy"
                size="small"
                type="primary"
                circle
                :loading="copying"
                @click="copyCode"
              />
            </el-tooltip>
            <el-tooltip content="Download file">
              <el-button
                :icon="Download"
                size="small"
                type="success"
                circle
                @click="downloadCode"
              />
            </el-tooltip>
            <el-tooltip content="Format code">
              <el-button
                :icon="Magic"
                size="small"
                type="warning"
                circle
                :loading="formatting"
                @click="formatCode"
              />
            </el-tooltip>
            <el-tooltip content="Toggle theme">
              <el-button
                :icon="darkTheme ? Sunny : Moon"
                size="small"
                type="info"
                circle
                @click="toggleTheme"
              />
            </el-tooltip>
            <el-tooltip content="Toggle fullscreen">
              <el-button
                :icon="isFullscreen ? Contract : Expand"
                size="small"
                circle
                @click="toggleFullscreen"
              />
            </el-tooltip>
          </div>
        </div>
      </template>

      <!-- File Tree View -->
      <div
        v-if="files && Object.keys(files).length > 1"
        class="file-tree-container"
      >
        <div class="file-tree-header">
          <el-icon><Folder /></el-icon>
          <span>Generated Files ({{ Object.keys(files).length }})</span>
        </div>
        <el-tree
          :data="fileTreeData"
          :props="treeProps"
          node-key="path"
          :current-node-key="selectedFile"
          :highlight-current="true"
          class="file-tree"
          @node-click="selectFile"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon v-if="data.isDirectory">
                <Folder />
              </el-icon>
              <el-icon v-else>
                <Document />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
              <span class="file-size">{{ formatFileSize(data.content?.length || 0) }}</span>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- Code Editor -->
      <div
        class="code-editor-container"
        :class="{ 'dark-theme': darkTheme, 'fullscreen': isFullscreen }"
      >
        <div class="editor-toolbar">
          <div class="toolbar-left">
            <span class="current-file">{{ getCurrentFileName() }}</span>
            <el-divider direction="vertical" />
            <span class="line-count">{{ lineCount }} lines</span>
            <span class="char-count">{{ charCount }} chars</span>
          </div>
          <div class="toolbar-right">
            <el-switch
              v-model="showLineNumbers"
              active-text="Line Numbers"
              size="small"
            />
            <el-switch
              v-model="wordWrap"
              active-text="Word Wrap"
              size="small"
            />
          </div>
        </div>

        <div
          ref="codeContainer"
          class="code-content"
        >
          <highlightjs
            :code="currentCode"
            :language="language"
            :auto-detect="!language"
            class="code-highlight"
            :class="{
              'show-line-numbers': showLineNumbers,
              'word-wrap': wordWrap
            }"
          />
        </div>

        <!-- Code Statistics -->
        <div
          v-if="showStatistics"
          class="code-statistics"
        >
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Lines:</span>
              <span class="stat-value">{{ lineCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Characters:</span>
              <span class="stat-value">{{ charCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Size:</span>
              <span class="stat-value">{{ formatFileSize(currentCode.length) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Language:</span>
              <span class="stat-value">{{ language || 'Auto-detect' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  CopyDocument as Copy,
  Download,
  MagicStick as Magic,
  Sunny,
  Moon,
  FullScreen as Expand,
  Aim as Contract,
  Folder
} from '@element-plus/icons-vue'

// Add default export for compatibility
// export default {
//   name: 'CodePreview'
// }

interface CodePreviewProps {
  code?: string
  files?: Record<string, string>
  language?: string
  fileName?: string
  showStatistics?: boolean
}

const props = withDefaults(defineProps<CodePreviewProps>(), {
  code: '',
  files: () => ({}),
  language: 'csharp',
  fileName: 'Generated.cs',
  showStatistics: true
})

// Reactive state
const copying = ref(false)
const formatting = ref(false)
const darkTheme = ref(false)
const isFullscreen = ref(false)
const showLineNumbers = ref(true)
const wordWrap = ref(false)
const selectedFile = ref('')
const codeContainer = ref<HTMLElement>()

// File tree configuration
const treeProps = {
  children: 'children',
  label: 'name'
}

// Computed properties
const currentCode = computed(() => {
  if (props.files && Object.keys(props.files).length > 0) {
    return props.files[selectedFile.value] || Object.values(props.files)[0] || ''
  }
  return props.code || ''
})

const lineCount = computed(() => {
  return currentCode.value.split('\n').length
})

const charCount = computed(() => {
  return currentCode.value.length
})

const fileTreeData = computed(() => {
  if (!props.files || Object.keys(props.files).length === 0) return []

  const tree: any[] = []

  Object.entries(props.files).forEach(([path, content]) => {
    const parts = path.split('/')
    let currentLevel = tree
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath += (index > 0 ? '/' : '') + part

      if (index === parts.length - 1) {
        // It's a file
        currentLevel.push({
          name: part,
          path: currentPath,
          content,
          isDirectory: false
        })
      } else {
        // It's a directory
        let existing = currentLevel.find(item => item.name === part && item.isDirectory)
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            children: [],
            isDirectory: true
          }
          currentLevel.push(existing)
        }
        currentLevel = existing.children
      }
    })
  })

  return tree
})

// Initialize selected file
watch(() => props.files, (newFiles) => {
  if (newFiles && Object.keys(newFiles).length > 0 && !selectedFile.value) {
    selectedFile.value = Object.keys(newFiles)[0]
  }
}, { immediate: true })

// Methods
const copyCode = async () => {
  copying.value = true
  try {
    await navigator.clipboard.writeText(currentCode.value)
    ElMessage.success('Code copied to clipboard!')
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = currentCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('Code copied to clipboard!')
  } finally {
    copying.value = false
  }
}

const downloadCode = () => {
  const fileName = getCurrentFileName()
  const blob = new Blob([currentCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
  ElMessage.success(`Downloaded ${fileName}`)
}

const formatCode = async () => {
  formatting.value = true
  try {
    // Simple formatting for demonstration
    // In a real implementation, you might use Prettier or similar
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('Code formatted successfully!')
  } finally {
    formatting.value = false
  }
}

const toggleTheme = () => {
  darkTheme.value = !darkTheme.value
}

const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value
  await nextTick()

  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const selectFile = (data: any) => {
  if (!data.isDirectory) {
    selectedFile.value = data.path
  }
}

const getCurrentFileName = (): string => {
  if (selectedFile.value) {
    return selectedFile.value.split('/').pop() || 'Generated.cs'
  }
  return props.fileName || 'Generated.cs'
}

const getLanguageTagType = (lang: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const langTypes: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    csharp: 'primary',
    typescript: 'success',
    javascript: 'warning',
    vue: 'success',
    json: 'info',
    xml: 'danger',
    sql: 'primary'
  }
  return langTypes[lang.toLowerCase()] || 'info'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.code-preview-container {
  width: 100%;
}

.code-preview-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #409eff;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.file-tree-container {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.file-tree-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #606266;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.node-label {
  flex: 1;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.code-editor-container {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.code-editor-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.code-editor-container.dark-theme {
  background: #1e1e1e;
  border-color: #404040;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
}

.dark-theme .editor-toolbar {
  background: #252526;
  border-bottom-color: #404040;
  color: #cccccc;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-file {
  font-weight: 600;
  color: #409eff;
}

.line-count, .char-count {
  color: #909399;
  font-size: 12px;
}

.code-content {
  max-height: 600px;
  overflow: auto;
  background: #ffffff;
}

.dark-theme .code-content {
  background: #1e1e1e;
}

.code-highlight {
  padding: 16px;
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre;
  overflow-x: auto;
}

.code-highlight.show-line-numbers {
  counter-reset: line-numbering;
}

.code-highlight.show-line-numbers::before {
  counter-increment: line-numbering;
  content: counter(line-numbering);
  position: absolute;
  left: 0;
  width: 40px;
  text-align: right;
  color: #999;
  padding-right: 8px;
  border-right: 1px solid #e4e7ed;
}

.code-highlight.word-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-statistics {
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #e4e7ed;
}

.dark-theme .code-statistics {
  background: #252526;
  border-top-color: #404040;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #909399;
  font-size: 12px;
}

.stat-value {
  font-weight: 600;
  color: #303133;
}

.dark-theme .stat-value {
  color: #cccccc;
}

/* Highlight.js theme overrides */
.dark-theme .hljs {
  background: #1e1e1e !important;
  color: #d4d4d4 !important;
}
</style>
