<!--
  代码预览面板组件 v2.0
  
  功能特性：
  - 实时代码预览
  - Monaco Editor语法高亮
  - 多语言支持（TypeScript、C#、Vue等）
  - 复制和下载功能
  - 全屏模式
  - 主题切换（明暗主题）
  
  @author SmartAbp架构师团队
  @version 2.0.0
  @date 2025-10-16
-->

<template>
  <div class="code-preview-panel">
    <!-- 工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <span class="file-name">{{ fileName }}</span>
        <el-tag :type="languageTagType" size="small">{{ language.toUpperCase() }}</el-tag>
        <el-tag v-if="fileSize" type="info" size="small">{{ formatFileSize(fileSize) }}</el-tag>
      </div>
      
      <div class="toolbar-right">
        <!-- 主题切换 -->
        <el-tooltip content="切换主题">
          <el-button
            :icon="theme === 'vs-dark' ? Sunny : Moon"
            size="small"
            text
            @click="toggleTheme"
          />
        </el-tooltip>
        
        <!-- 复制代码 -->
        <el-tooltip content="复制代码">
          <el-button
            :icon="DocumentCopy"
            size="small"
            text
            :loading="copying"
            @click="handleCopy"
          />
        </el-tooltip>
        
        <!-- 下载代码 -->
        <el-tooltip content="下载文件">
          <el-button
            :icon="Download"
            size="small"
            text
            @click="handleDownload"
          />
        </el-tooltip>
        
        <!-- 全屏 -->
        <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
          <el-button
            :icon="isFullscreen ? CloseBold : FullScreen"
            size="small"
            text
            @click="toggleFullscreen"
          />
        </el-tooltip>
      </div>
    </div>
    
    <!-- Monaco Editor -->
    <div
      ref="editorContainer"
      class="editor-container"
      :class="{ 'fullscreen': isFullscreen }"
    />
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentCopy,
  Download,
  FullScreen,
  CloseBold,
  Sunny,
  Moon,
  Loading
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import type { editor } from 'monaco-editor'

/**
 * 组件Props
 */
interface Props {
  /**
   * 代码内容
   */
  code: string
  
  /**
   * 编程语言
   */
  language?: string
  
  /**
   * 文件名
   */
  fileName?: string
  
  /**
   * 是否只读
   */
  readonly?: boolean
  
  /**
   * 是否显示行号
   */
  lineNumbers?: boolean
  
  /**
   * 是否自动换行
   */
  wordWrap?: boolean
  
  /**
   * 加载状态
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript',
  fileName: 'untitled',
  readonly: true,
  lineNumbers: true,
  wordWrap: true,
  loading: false
})

/**
 * 组件Emits
 */
interface Emits {
  (e: 'code-change', code: string): void
  (e: 'copy-success'): void
  (e: 'download-success', fileName: string): void
}

const emit = defineEmits<Emits>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const editorContainer = ref<HTMLElement>()
let editorInstance: editor.IStandaloneCodeEditor | null = null

const theme = ref<'vs' | 'vs-dark'>('vs-dark')
const copying = ref(false)
const isFullscreen = ref(false)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 文件大小
 */
const fileSize = computed(() => {
  return new Blob([props.code]).size
})

/**
 * 语言标签类型
 */
const languageTagType = computed(() => {
  const typeMap: Record<string, any> = {
    typescript: 'primary',
    javascript: 'warning',
    csharp: 'success',
    vue: 'success',
    json: 'info',
    html: 'danger',
    css: 'warning'
  }
  return typeMap[props.language] || 'info'
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 初始化Monaco Editor
 */
const initMonacoEditor = () => {
  if (!editorContainer.value) return

  editorInstance = monaco.editor.create(editorContainer.value, {
    value: props.code,
    language: props.language,
    theme: theme.value,
    readOnly: props.readonly,
    lineNumbers: props.lineNumbers ? 'on' : 'off',
    wordWrap: props.wordWrap ? 'on' : 'off',
    minimap: {
      enabled: true
    },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    tabSize: 2,
    folding: true,
    renderWhitespace: 'selection',
    bracketPairColorization: {
      enabled: true
    }
  })

  // 监听内容变化
  if (!props.readonly) {
    editorInstance.onDidChangeModelContent(() => {
      const value = editorInstance?.getValue() || ''
      emit('code-change', value)
    })
  }
}

/**
 * 切换主题
 */
const toggleTheme = () => {
  theme.value = theme.value === 'vs-dark' ? 'vs' : 'vs-dark'
  if (editorInstance) {
    monaco.editor.setTheme(theme.value)
  }
}

/**
 * 复制代码
 */
const handleCopy = async () => {
  try {
    copying.value = true
    await navigator.clipboard.writeText(props.code)
    ElMessage.success('代码已复制到剪贴板')
    emit('copy-success')
  } catch (error) {
    ElMessage.error('复制失败，请重试')
  } finally {
    copying.value = false
  }
}

/**
 * 下载代码
 */
const handleDownload = () => {
  try {
    const blob = new Blob([props.code], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = props.fileName
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('文件下载成功')
    emit('download-success', props.fileName)
  } catch (error) {
    ElMessage.error('下载失败，请重试')
  }
}

/**
 * 切换全屏
 */
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Watchers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 监听代码变化
 */
watch(() => props.code, (newCode) => {
  if (editorInstance && newCode !== editorInstance.getValue()) {
    editorInstance.setValue(newCode)
  }
})

/**
 * 监听语言变化
 */
watch(() => props.language, (newLanguage) => {
  if (editorInstance) {
    const model = editorInstance.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  initMonacoEditor()
})

onBeforeUnmount(() => {
  // 清理编辑器实例
  if (editorInstance) {
    editorInstance.dispose()
    editorInstance = null
  }
  
  // 恢复body样式
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped lang="scss">
.code-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.editor-container {
  flex: 1;
  min-height: 300px;
  position: relative;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    min-height: 100vh;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  
  .el-icon {
    font-size: 32px;
    color: var(--el-color-primary);
  }
  
  span {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}
</style>

