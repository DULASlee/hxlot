<template>
  <div class="code-preview-panel">
    <div class="preview-header">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="实时预览" name="preview">
          <template #label>
            <el-icon><View /></el-icon>
            <span>实时预览</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="代码查看" name="code">
          <template #label>
            <el-icon><Document /></el-icon>
            <span>代码查看</span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="质量报告" name="quality">
          <template #label>
            <el-icon><DataAnalysis /></el-icon>
            <span>质量报告</span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="preview-actions">
        <el-button-group>
          <el-button :icon="Refresh" size="small" @click="refreshPreview">
            刷新
          </el-button>
          <el-button :icon="CopyDocument" size="small" @click="copyCode">
            复制
          </el-button>
          <el-button :icon="Download" size="small" @click="downloadCode">
            下载
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="preview-content">
      <!-- 实时预览面板 -->
      <div v-show="activeTab === 'preview'" class="preview-iframe-container">
        <div class="device-selector">
          <el-radio-group v-model="previewDevice" size="small">
            <el-radio-button label="desktop">
              <el-icon><Monitor /></el-icon>
              桌面
            </el-radio-button>
            <el-radio-button label="tablet">
              <el-icon><Iphone /></el-icon>
              平板
            </el-radio-button>
            <el-radio-button label="mobile">
              <el-icon><Cellphone /></el-icon>
              手机
            </el-radio-button>
          </el-radio-group>
        </div>

        <div :class="['preview-frame', 'device-' + previewDevice]">
          <iframe
            ref="previewIframe"
            :srcdoc="previewHtml"
            sandbox="allow-scripts allow-same-origin"
            @load="handleIframeLoad"
          />
        </div>

        <div v-if="previewError" class="preview-error">
          <el-alert type="error" :title="previewError" :closable="false" />
        </div>
      </div>

      <!-- 代码查看面板 -->
      <div v-show="activeTab === 'code'" class="code-view-container">
        <el-tabs v-model="activeCodeTab" type="card">
          <el-tab-pane
            v-for="file in generatedFiles"
            :key="file.path"
            :label="file.path"
            :name="file.path"
          >
            <div class="code-editor">
              <pre><code :class="'language-' + file.type">{{ file.content }}</code></pre>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 质量报告面板 -->
      <div v-show="activeTab === 'quality'" class="quality-report-container">
        <el-card v-if="qualityReport" class="quality-card">
          <template #header>
            <div class="quality-header">
              <span>代码质量评分</span>
              <el-tag :type="getScoreType(qualityReport.score)" size="large">
                {{ qualityReport.score }}/100
              </el-tag>
            </div>
          </template>

          <div class="quality-metrics">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic title="复杂度" :value="qualityReport.metrics.complexity">
                  <template #suffix>/100</template>
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-statistic title="可维护性" :value="qualityReport.metrics.maintainability">
                  <template #suffix>/100</template>
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-statistic title="可测试性" :value="qualityReport.metrics.testability">
                  <template #suffix>/100</template>
                </el-statistic>
              </el-col>
            </el-row>
          </div>

          <el-divider />

          <div v-if="qualityReport.issues.length > 0" class="quality-issues">
            <h4>问题列表</h4>
            <el-table :data="qualityReport.issues" stripe>
              <el-table-column label="严重程度" width="100">
                <template #default="{ row }">
                  <el-tag :type="getSeverityType(row.severity)" size="small">
                    {{ getSeverityLabel(row.severity) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="问题描述" />
              <el-table-column prop="line" label="行号" width="80" />
            </el-table>
          </div>

          <el-divider />

          <div v-if="qualityReport.suggestions.length > 0" class="quality-suggestions">
            <h4>优化建议</h4>
            <ul>
              <li v-for="(suggestion, index) in qualityReport.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </el-card>

        <el-empty v-else description="暂无质量报告" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  View, Document, DataAnalysis, Refresh, CopyDocument, Download,
  Monitor, Iphone, Cellphone
} from '@element-plus/icons-vue'
import type { CodeQualityReport } from '../core/TemplateEngine'

interface GeneratedFile {
  path: string
  content: string
  type: 'cs' | 'vue' | 'ts' | 'js' | 'yml' | 'json'
}

interface Props {
  generatedFiles?: GeneratedFile[]
  qualityReport?: CodeQualityReport
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  generatedFiles: () => [],
  autoRefresh: true
})

const emit = defineEmits<{
  refresh: []
  copy: [content: string]
  download: [files: GeneratedFile[]]
}>()

// 状态
const activeTab = ref<'preview' | 'code' | 'quality'>('preview')
const activeCodeTab = ref('')
const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const previewIframe = ref<HTMLIFrameElement>()
const previewError = ref('')

// 生成预览HTML
const previewHtml = computed(() => {
  const vueFile = props.generatedFiles.find(f => f.type === 'vue')
  if (!vueFile) {
    return '<html><body><p>暂无可预览内容</p></body></html>'
  }

  // 简化的Vue组件预览（实际需要完整的Vue运行时）
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>组件预览</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <script src="https://unpkg.com/element-plus"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const { createApp } = Vue;
    const app = createApp({
      template: \`${extractTemplate(vueFile.content)}\`,
      setup() {
        ${extractScript(vueFile.content)}
      }
    });
    app.use(ElementPlus);
    app.mount('#app');
  </script>
</body>
</html>
  `
})

// 提取Vue模板
function extractTemplate(vueContent: string): string {
  const match = vueContent.match(/<template>([\s\S]*?)<\/template>/)
  return match ? match[1].trim() : '<div>无模板内容</div>'
}

// 提取Vue脚本
function extractScript(vueContent: string): string {
  const match = vueContent.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)
  return match ? match[1].trim() : 'return {}'
}

// 处理Tab切换
const handleTabChange = (tabName: string | number) => {
  if (tabName === 'code' && props.generatedFiles.length > 0) {
    activeCodeTab.value = props.generatedFiles[0].path
  }
}

// 刷新预览
const refreshPreview = () => {
  previewError.value = ''
  emit('refresh')
  ElMessage.success('预览已刷新')
}

// 复制代码
const copyCode = async () => {
  const content = activeTab.value === 'code' && activeCodeTab.value
    ? props.generatedFiles.find(f => f.path === activeCodeTab.value)?.content || ''
    : previewHtml.value

  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('代码已复制到剪贴板')
    emit('copy', content)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载代码
const downloadCode = () => {
  emit('download', props.generatedFiles)
  ElMessage.success('下载已开始')
}

// 处理iframe加载
const handleIframeLoad = () => {
  try {
    const iframe = previewIframe.value
    if (iframe?.contentWindow) {
      // 监听iframe中的错误
      iframe.contentWindow.addEventListener('error', (event) => {
        previewError.value = `预览错误: ${event.message}`
      })
    }
  } catch (error) {
    console.error('iframe加载错误:', error)
  }
}

// 获取评分类型
const getScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

// 获取严重程度类型
const getSeverityType = (severity: string) => {
  switch (severity) {
    case 'error': return 'danger'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return ''
  }
}

// 获取严重程度标签
const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'error': return '错误'
    case 'warning': return '警告'
    case 'info': return '信息'
    default: return severity
  }
}

// 监听文件变化，自动刷新预览
watch(() => props.generatedFiles, () => {
  if (props.autoRefresh) {
    nextTick(() => {
      previewError.value = ''
    })
  }
}, { deep: true })

// 初始化
if (props.generatedFiles.length > 0) {
  activeCodeTab.value = props.generatedFiles[0].path
}
</script>

<style scoped lang="scss">
.code-preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid var(--el-border-color-light);

  :deep(.el-tabs__header) {
    margin: 0;
  }

  .preview-actions {
    flex-shrink: 0;
  }
}

.preview-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.preview-iframe-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .device-selector {
    margin-bottom: 20px;
    text-align: center;
  }

  .preview-frame {
    flex: 1;
    background: #fff;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;
    margin: 0 auto;
    transition: all 0.3s;

    &.device-desktop {
      width: 100%;
      max-width: 1200px;
    }

    &.device-tablet {
      width: 768px;
      max-width: 100%;
    }

    &.device-mobile {
      width: 375px;
      max-width: 100%;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }

  .preview-error {
    margin-top: 20px;
  }
}

.code-view-container {
  height: 100%;
  overflow: auto;

  .code-editor {
    height: calc(100vh - 200px);
    overflow: auto;
    background: #282c34;
    padding: 20px;

    pre {
      margin: 0;
      color: #abb2bf;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.6;

      code {
        display: block;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
  }
}

.quality-report-container {
  height: 100%;
  overflow: auto;
  padding: 20px;

  .quality-card {
    .quality-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .quality-metrics {
      margin: 20px 0;
    }

    .quality-issues,
    .quality-suggestions {
      h4 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>

