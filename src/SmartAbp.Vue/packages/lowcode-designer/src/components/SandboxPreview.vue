<template>
  <div class="sandbox-preview">
    <!-- 🔥 新增：预览工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <el-button-group size="small">
          <el-button 
            :type="viewMode === 'preview' ? 'primary' : 'default'" 
            @click="viewMode = 'preview'"
          >
            <i class="el-icon-view" /> 预览
          </el-button>
          <el-button 
            :type="viewMode === 'code' ? 'primary' : 'default'" 
            @click="viewMode = 'code'"
          >
            <i class="el-icon-document" /> 代码
          </el-button>
          <el-button 
            :type="viewMode === 'split' ? 'primary' : 'default'" 
            @click="viewMode = 'split'"
          >
            <i class="el-icon-files" /> 分割
          </el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-button size="small" @click="refreshPreview">
          <i class="el-icon-refresh" /> 刷新
        </el-button>
        <el-button size="small" @click="copyCode">
          <i class="el-icon-document-copy" /> 复制
        </el-button>
        <el-button size="small" @click="downloadCode">
          <i class="el-icon-download" /> 下载
        </el-button>
      </div>
    </div>

    <!-- 🔥 优化：支持多种预览模式 -->
    <div class="preview-content" :class="'mode-' + viewMode">
      <!-- 预览模式：显示渲染结果 -->
      <div v-if="viewMode === 'preview' || viewMode === 'split'" class="preview-panel">
        <iframe
          ref="iframeRef"
          :srcdoc="htmlContent"
          sandbox="allow-scripts allow-same-origin"
          @load="onIframeLoad"
        />
      </div>

      <!-- 代码模式：显示源代码 -->
      <div v-if="viewMode === 'code' || viewMode === 'split'" class="code-panel">
        <div class="code-content">
          <pre><code v-html="highlightedCode" /></pre>
        </div>
      </div>
    </div>

    <!-- 🔥 新增：加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>预览加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"  
import { ElMessage } from "element-plus"
import { Loading } from '@element-plus/icons-vue'

const props = defineProps<{
  code: string
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const htmlContent = ref("")
const viewMode = ref<'preview' | 'code' | 'split'>('preview')  // 🔥 新增：视图模式
const loading = ref(false)  // 🔥 新增：加载状态

// 🔥 新增：语法高亮的代码
const highlightedCode = computed(() => {
  // 简单的HTML代码高亮（实际项目中建议使用Prism.js或highlight.js）
  return props.code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(".*?")/g, '<span style="color: #22863a;">$1</span>')  // 字符串
    .replace(/(&lt;[/?][\w\s="/.':;#-/?]+&gt;)/g, '<span style="color: #0366d6;">$1</span>')  // HTML标签
})

const updateIframeContent = () => {
  loading.value = true
  
  // 🔥 优化：增强预览HTML内容
  htmlContent.value = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>代码预览</title>
        <style>
          /* 🔥 增强：更好的预览样式 */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
          }
          
          .generation-result {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            max-width: 100%;
            overflow-x: auto;
          }
          
          .generation-result h2 {
            color: #67C23A;
            margin-bottom: 20px;
            border-bottom: 2px solid #f0f9ff;
            padding-bottom: 10px;
          }
          
          .stats {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #409EFF;
          }
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
          }
          
          .stat-item .label {
            font-weight: 600;
            color: #606266;
          }
          
          .stat-item .value {
            color: #409EFF;
            font-weight: 500;
          }
          
          .file-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #DCDFE6;
            border-radius: 6px;
          }
          
          .file-item {
            background: #fff;
            border-bottom: 1px solid #f5f7fa;
            padding: 12px;
            transition: background-color 0.2s;
          }
          
          .file-item:hover {
            background: #f8f9fa;
          }
          
          .file-item:last-child {
            border-bottom: none;
          }
          
          .file-path {
            font-weight: 600;
            color: #409EFF;
            margin-bottom: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
          }
          
          .file-content {
            background: #f5f7fa;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 12px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            overflow-x: auto;
            white-space: pre-wrap;
            line-height: 1.4;
            color: #2c3e50;
          }
          
          /* 🔥 新增：响应式设计 */
          @media (max-width: 768px) {
            body {
              padding: 10px;
            }
            .generation-result {
              padding: 15px;
            }
            .stat-item {
              flex-direction: column;
              gap: 4px;
            }
          }
        </style>
      </head>
      <body>
        ${props.code}
        <script>
          // 🔥 新增：预览交互增强
          console.log('[SandboxPreview] Content loaded');
          
          // 通知父窗口加载完成
          window.parent?.postMessage({ type: 'preview-loaded' }, '*');
        </` + `script>
      </body>
    </html>
  `
}

const onIframeLoad = () => {
  loading.value = false
  console.log('[SandboxPreview] Iframe loaded successfully')
}

// 🔥 新增：工具栏功能方法
const refreshPreview = () => {
  updateIframeContent()
  ElMessage.success('预览刷新成功')
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    console.error('Copy failed:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

const downloadCode = () => {
  try {
    const blob = new Blob([props.code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated-code-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('代码下载成功')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('下载失败')
  }
}

// 🔥 优化：响应式更新
watch(() => props.code, () => {
  if (props.code) {
    updateIframeContent()
  }
}, { immediate: true })

// 🔥 新增：监听来自iframe的消息
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'preview-loaded') {
      loading.value = false
    }
  })
}
</script>

<style scoped>
/* 🔥 优化：增强样式系统 */
.sandbox-preview {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

/* 🔥 新增：工具栏样式 */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  min-height: 52px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 🔥 新增：预览内容区域 */
.preview-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 预览模式：全屏预览 */
.preview-content.mode-preview {
  flex-direction: column;
}

.preview-content.mode-preview .preview-panel {
  flex: 1;
}

/* 代码模式：全屏代码 */
.preview-content.mode-code {
  flex-direction: column;
}

.preview-content.mode-code .code-panel {
  flex: 1;
}

/* 分割模式：左右分割 */
.preview-content.mode-split {
  flex-direction: row;
}

.preview-content.mode-split .preview-panel,
.preview-content.mode-split .code-panel {
  flex: 1;
}

.preview-content.mode-split .preview-panel {
  border-right: 1px solid var(--el-border-color-light);
}

/* 🔥 新增：预览面板样式 */
.preview-panel {
  position: relative;
  background: #fff;
  overflow: hidden;
}

.preview-panel iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

/* 🔥 新增：代码面板样式 */
.code-panel {
  background: var(--el-fill-color-darker);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.code-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.code-content pre {
  margin: 0;
  padding: 0;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-content code {
  font-family: inherit;
  color: inherit;
}

/* 🔥 新增：加载遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 1000;
}

.loading-overlay .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.loading-overlay span {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 🔥 新增：响应式设计 */
@media (max-width: 768px) {
  .preview-toolbar {
    padding: 8px 12px;
    min-height: 48px;
  }
  
  .toolbar-left,
  .toolbar-right {
    gap: 4px;
  }
  
  /* 移动端强制为垂直布局 */
  .preview-content.mode-split {
    flex-direction: column;
  }
  
  .preview-content.mode-split .preview-panel {
    border-right: none;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  .preview-content.mode-split .preview-panel,
  .preview-content.mode-split .code-panel {
    flex: 1;
    max-height: 50%;
  }
  
  .code-content {
    padding: 12px;
  }
  
  .code-content pre {
    font-size: 12px;
  }
}

/* 🔥 新增：按钮组优化 */
.el-button-group .el-button {
  font-size: 12px;
  padding: 6px 12px;
}

.el-button-group .el-button i {
  margin-right: 4px;
}

/* 🔥 新增：滚动条优化 */
.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
}

.code-content::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}
</style>
