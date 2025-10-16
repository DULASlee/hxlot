<!--
  代码对比查看器组件 v2.0

  功能特性：
  - Monaco Editor双栏对比
  - 语法高亮
  - 差异高亮显示
  - 内联差异和并排差异
  - 滚动同步
  - 导航到差异

  @author SmartAbp架构师团队
  @version 2.0.0
  @date 2025-10-16
-->

<template>
  <div class="code-diff-viewer">
    <!-- 工具栏 -->
    <div class="diff-toolbar">
      <div class="toolbar-left">
        <span class="compare-info">
          <el-tag type="danger" size="small">原始版本</el-tag>
          <el-icon><Right /></el-icon>
          <el-tag type="success" size="small">当前版本</el-tag>
        </span>
      </div>

      <div class="toolbar-right">
        <!-- 视图模式切换 -->
        <el-radio-group v-model="viewMode" size="small" @change="updateViewMode">
          <el-radio-button value="inline">内联</el-radio-button>
          <el-radio-button value="sidebyside">并排</el-radio-button>
        </el-radio-group>

        <!-- 差异导航 -->
        <el-button
          :icon="ArrowUp"
          size="small"
          text
          :disabled="currentDiffIndex <= 0"
          @click="gotoPreviousDiff"
        >
          上一个
        </el-button>

        <span class="diff-counter">
          {{ currentDiffIndex + 1 }} / {{ diffCount }}
        </span>

        <el-button
          :icon="ArrowDown"
          size="small"
          text
          :disabled="currentDiffIndex >= diffCount - 1"
          @click="gotoNextDiff"
        >
          下一个
        </el-button>

        <!-- 主题切换 -->
        <el-tooltip content="切换主题">
          <el-button
            :icon="theme === 'vs-dark' ? Sunny : Moon"
            size="small"
            text
            @click="toggleTheme"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- Monaco Diff Editor -->
    <div ref="diffEditorContainer" class="diff-editor-container" />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>正在对比代码...</span>
    </div>

    <!-- 无差异提示 -->
    <div v-if="!loading && diffCount === 0" class="no-diff-message">
      <el-icon><CircleCheck /></el-icon>
      <span>两个版本完全相同，无差异</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import {
  ArrowUp,
  ArrowDown,
  Right,
  Sunny,
  Moon,
  Loading,
  CircleCheck
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import type { editor } from 'monaco-editor'

/**
 * 组件Props
 */
interface Props {
  /**
   * 原始代码
   */
  originalCode: string

  /**
   * 修改后的代码
   */
  modifiedCode: string

  /**
   * 编程语言
   */
  language?: string

  /**
   * 是否只读
   */
  readonly?: boolean

  /**
   * 加载状态
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript',
  readonly: true,
  loading: false
})

/**
 * 组件Emits
 */
interface Emits {
  (e: 'diff-count-change', count: number): void
}

const emit = defineEmits<Emits>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const diffEditorContainer = ref<HTMLElement>()
let diffEditorInstance: editor.IStandaloneDiffEditor | null = null

const theme = ref<'vs' | 'vs-dark'>('vs-dark')
const viewMode = ref<'inline' | 'sidebyside'>('sidebyside')
const currentDiffIndex = ref(0)
const diffCount = ref(0)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Computed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 是否有差异
 */
const hasDiff = computed(() => diffCount.value > 0)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 初始化Monaco Diff Editor
 */
const initMonacoDiffEditor = () => {
  if (!diffEditorContainer.value) return

  diffEditorInstance = monaco.editor.createDiffEditor(diffEditorContainer.value, {
    theme: theme.value,
    readOnly: props.readonly,
    renderSideBySide: viewMode.value === 'sidebyside',
    automaticLayout: true,
    fontSize: 14,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: true
    },
    renderWhitespace: 'selection',
    enableSplitViewResizing: true,
    originalEditable: false,
    diffWordWrap: 'on'
  })

  // 设置模型
  const originalModel = monaco.editor.createModel(props.originalCode, props.language)
  const modifiedModel = monaco.editor.createModel(props.modifiedCode, props.language)

  diffEditorInstance.setModel({
    original: originalModel,
    modified: modifiedModel
  })

  // 计算差异数量
  updateDiffCount()
}

/**
 * 更新视图模式
 */
const updateViewMode = () => {
  if (diffEditorInstance) {
    diffEditorInstance.updateOptions({
      renderSideBySide: viewMode.value === 'sidebyside'
    })
  }
}

/**
 * 切换主题
 */
const toggleTheme = () => {
  theme.value = theme.value === 'vs-dark' ? 'vs' : 'vs-dark'
  if (diffEditorInstance) {
    // Monaco Diff Editor不支持通过updateOptions更新主题
    // 需要重新设置全局主题
    monaco.editor.setTheme(theme.value)
  }
}

/**
 * 更新差异数量
 */
const updateDiffCount = () => {
  if (!diffEditorInstance) return

  const changes = diffEditorInstance.getLineChanges() || []
  diffCount.value = changes.length
  emit('diff-count-change', diffCount.value)
}

/**
 * 跳转到上一个差异
 */
const gotoPreviousDiff = () => {
  if (currentDiffIndex.value > 0) {
    currentDiffIndex.value--
    revealDiff(currentDiffIndex.value)
  }
}

/**
 * 跳转到下一个差异
 */
const gotoNextDiff = () => {
  if (currentDiffIndex.value < diffCount.value - 1) {
    currentDiffIndex.value++
    revealDiff(currentDiffIndex.value)
  }
}

/**
 * 显示指定差异
 */
const revealDiff = (index: number) => {
  if (!diffEditorInstance) return

  const changes = diffEditorInstance.getLineChanges()
  if (!changes || index >= changes.length) return

  const change = changes[index]
  if (!change) return

  const modifiedEditor = diffEditorInstance.getModifiedEditor()

  // 滚动到差异位置
  modifiedEditor.revealLineInCenter(change.modifiedStartLineNumber || 1)

  // 设置选区
  modifiedEditor.setSelection({
    startLineNumber: change.modifiedStartLineNumber || 1,
    startColumn: 1,
    endLineNumber: change.modifiedEndLineNumber || 1,
    endColumn: Number.MAX_VALUE
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Watchers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 监听代码变化
 */
watch([() => props.originalCode, () => props.modifiedCode], () => {
  if (diffEditorInstance) {
    const originalModel = monaco.editor.createModel(props.originalCode, props.language)
    const modifiedModel = monaco.editor.createModel(props.modifiedCode, props.language)

    diffEditorInstance.setModel({
      original: originalModel,
      modified: modifiedModel
    })

    updateDiffCount()
    currentDiffIndex.value = 0
  }
})

/**
 * 监听语言变化
 */
watch(() => props.language, (newLanguage) => {
  if (diffEditorInstance) {
    const model = diffEditorInstance.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model.original, newLanguage)
      monaco.editor.setModelLanguage(model.modified, newLanguage)
    }
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(() => {
  initMonacoDiffEditor()
})

onBeforeUnmount(() => {
  // 清理编辑器实例
  if (diffEditorInstance) {
    diffEditorInstance.dispose()
    diffEditorInstance = null
  }
})
</script>

<style scoped lang="scss">
.code-diff-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.diff-toolbar {
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
}

.compare-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-counter {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  padding: 0 8px;
}

.diff-editor-container {
  flex: 1;
  min-height: 300px;
  position: relative;
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

.no-diff-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .el-icon {
    font-size: 48px;
    color: var(--el-color-success);
  }

  span {
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }
}
</style>

