<!--
  SFC编译器演示页面
  展示Vue单文件组件的编译过程和结果
-->
<template>
  <div class="sfc-compiler-view">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-file-code" />
        SFC编译器演示
      </h1>
      <p class="page-description">
        Vue单文件组件编译器，支持实时预览和热更新
      </p>
    </div>

    <div class="compiler-workspace">
      <!-- 编译器控制面板 -->
      <div class="control-panel">
        <div class="panel-section">
          <h3>编译选项</h3>
          <div class="options-grid">
            <label class="option-item">
              <input
                v-model="compilerOptions.sourceMap"
                type="checkbox"
              >
              <span>生成 Source Map</span>
            </label>
            <label class="option-item">
              <input
                v-model="compilerOptions.optimizeImports"
                type="checkbox"
              >
              <span>优化导入</span>
            </label>
            <label class="option-item">
              <input
                v-model="compilerOptions.hoistStatic"
                type="checkbox"
              >
              <span>静态提升</span>
            </label>
            <label class="option-item">
              <input
                v-model="compilerOptions.inlineProps"
                type="checkbox"
              >
              <span>内联 Props</span>
            </label>
          </div>
        </div>

        <div class="panel-section">
          <h3>编译模式</h3>
          <select
            v-model="compilerMode"
            class="mode-selector"
          >
            <option value="development">
              开发模式
            </option>
            <option value="production">
              生产模式
            </option>
            <option value="test">
              测试模式
            </option>
          </select>
        </div>

        <div class="panel-section">
          <h3>快速操作</h3>
          <div class="quick-buttons">
            <button
              class="compile-btn"
              :disabled="compiling"
              @click="compileCode"
            >
              <i class="fas fa-play" />
              {{ compiling ? '编译中...' : '编译' }}
            </button>
            <button
              class="clear-btn"
              @click="clearResults"
            >
              <i class="fas fa-eraser" />
              清空结果
            </button>
            <button
              class="example-btn"
              @click="loadExample"
            >
              <i class="fas fa-file-import" />
              加载示例
            </button>
            <button
              class="export-btn"
              @click="exportResults"
            >
              <i class="fas fa-download" />
              导出结果
            </button>
          </div>
        </div>
      </div>

      <!-- 编辑器和结果展示 -->
      <div class="editor-results">
        <!-- 输入编辑器 -->
        <div class="editor-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fas fa-edit" />
              源代码编辑器
            </h2>
            <div class="editor-actions">
              <button
                class="format-btn"
                @click="formatCode"
              >
                <i class="fas fa-magic" />
                格式化
              </button>
              <button
                class="fullscreen-btn"
                @click="toggleFullscreen"
              >
                <i class="fas fa-expand" />
                全屏
              </button>
            </div>
          </div>
          <div class="code-editor">
            <textarea
              v-model="sourceCode"
              class="editor-textarea"
              placeholder="请输入Vue单文件组件代码..."
              spellcheck="false"
            />
          </div>
        </div>

        <!-- 编译结果展示 -->
        <div class="results-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fas fa-cogs" />
              编译结果
            </h2>
            <div class="result-tabs">
              <button
                v-for="tab in resultTabs"
                :key="tab.key"
                class="tab-btn"
                :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key"
              >
                <i :class="tab.icon" />
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="results-content">
            <!-- 编译统计 -->
            <div
              v-if="activeTab === 'stats'"
              class="stats-view"
            >
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-stopwatch" />
                  </div>
                  <div class="stat-content">
                    <h4>编译时间</h4>
                    <p>{{ compilationStats.duration }}ms</p>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-file-alt" />
                  </div>
                  <div class="stat-content">
                    <h4>输出大小</h4>
                    <p>{{ compilationStats.outputSize }} 字符</p>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle" />
                  </div>
                  <div class="stat-content">
                    <h4>警告数量</h4>
                    <p>{{ compilationStats.warnings }}</p>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="fas fa-times-circle" />
                  </div>
                  <div class="stat-content">
                    <h4>错误数量</h4>
                    <p class="error-count">
                      {{ compilationStats.errors }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 编译消息 -->
              <div
                v-if="compilationMessages.length > 0"
                class="compilation-messages"
              >
                <h3>编译消息</h3>
                <div class="message-list">
                  <div
                    v-for="message in compilationMessages"
                    :key="message.id"
                    class="message-item"
                    :class="'message-' + message.type"
                  >
                    <div class="message-icon">
                      <i :class="getMessageIcon(message.type)" />
                    </div>
                    <div class="message-content">
                      <p class="message-text">
                        {{ message.text }}
                      </p>
                      <p
                        v-if="message.location"
                        class="message-location"
                      >
                        {{ message.location }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 编译输出代码 -->
            <div
              v-if="activeTab === 'script'"
              class="code-view"
            >
              <div class="code-header">
                <h3>Script 编译结果</h3>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(compilationResult.script)"
                >
                  <i class="fas fa-copy" />
                  复制
                </button>
              </div>
              <pre class="code-output"><code>{{ compilationResult.script || '暂无编译结果' }}</code></pre>
            </div>

            <div
              v-if="activeTab === 'template'"
              class="code-view"
            >
              <div class="code-header">
                <h3>Template 编译结果</h3>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(compilationResult.template)"
                >
                  <i class="fas fa-copy" />
                  复制
                </button>
              </div>
              <pre class="code-output"><code>{{ compilationResult.template || '暂无编译结果' }}</code></pre>
            </div>

            <div
              v-if="activeTab === 'style'"
              class="code-view"
            >
              <div class="code-header">
                <h3>Style 编译结果</h3>
                <button
                  class="copy-btn"
                  @click="copyToClipboard(compilationResult.styles)"
                >
                  <i class="fas fa-copy" />
                  复制
                </button>
              </div>
              <pre class="code-output"><code>{{ compilationResult.styles || '暂无编译结果' }}</code></pre>
            </div>

            <!-- 实时预览 -->
            <div
              v-if="activeTab === 'preview'"
              class="preview-view"
            >
              <div class="preview-header">
                <h3>实时预览</h3>
                <div class="preview-controls">
                  <button
                    class="refresh-btn"
                    @click="refreshPreview"
                  >
                    <i class="fas fa-sync-alt" />
                    刷新
                  </button>
                  <button
                    class="mode-btn"
                    @click="togglePreviewMode"
                  >
                    <i class="fas fa-mobile-alt" />
                    {{ previewMode === 'desktop' ? '移动端' : '桌面端' }}
                  </button>
                </div>
              </div>
              <div
                class="preview-container"
                :class="'preview-' + previewMode"
              >
                <div class="preview-frame">
                  <div
                    v-if="previewError"
                    class="preview-error"
                  >
                    <i class="fas fa-exclamation-triangle" />
                    <p>预览失败: {{ previewError }}</p>
                  </div>
                  <div
                    v-else-if="!compilationResult.script"
                    class="preview-empty"
                  >
                    <i class="fas fa-eye-slash" />
                    <p>请先编译代码以查看预览</p>
                  </div>
                  <div
                    v-else
                    class="preview-content"
                  >
                    <!-- 这里将渲染编译后的组件 -->
                    <div class="preview-component">
                      <p>组件预览功能开发中...</p>
                      <div class="mock-component">
                        <button class="demo-button">
                          示例按钮
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { logger } from '@/utils/logging'

// 组件日志器
const componentLogger = logger.child({ component: 'SfcCompilerView' })

// 编译器状态
const compiling = ref(false)
const compilerMode = ref('development')

// 编译选项
const compilerOptions = ref({
  sourceMap: true,
  optimizeImports: true,
  hoistStatic: false,
  inlineProps: false
})

// 编辑器状态
const sourceCode = ref([
  '<template>',
  '  <div class="demo-component">',
  '    <h1>{{ title }}</h1>',
  '    <button @click="handleClick" class="demo-btn">',
  '      点击次数: {{ count }}',
  '    </button>',
  '  </div>',
  '</template>',
  '',
  '<' + 'script setup lang="ts">',
  'import { ref } from \'vue\'',
  '',
  'interface Props {',
  '  title?: string',
  '}',
  '',
  'const props = withDefaults(defineProps<Props>(), {',
  '  title: \'Demo 组件\'',
  '})',
  '',
  'const count = ref(0)',
  '',
  'const emit = defineEmits<{',
  '  click: [count: number]',
  '}>()',
  '',
  'const handleClick = () => {',
  '  count.value++',
  '  emit(\'click\', count.value)',
  '}',
  '</' + 'script>',
  '',
  '<style scoped>',
  '.demo-component {',
  '  padding: 20px;',
  '  border: 1px solid #ddd;',
  '  border-radius: 8px;',
  '  text-align: center;',
  '}',
  '',
  '.demo-btn {',
  '  padding: 8px 16px;',
  '  background: #007bff;',
  '  color: white;',
  '  border: none;',
  '  border-radius: 4px;',
  '  cursor: pointer;',
  '  transition: background 0.2s;',
  '}',
  '',
  '.demo-btn:hover {',
  '  background: #0056b3;',
  '}',
  '</style>'
].join('\n'))

// 结果展示
const activeTab = ref('stats')
const resultTabs = [
  { key: 'stats', label: '编译统计', icon: 'fas fa-chart-bar' },
  { key: 'script', label: 'Script', icon: 'fas fa-code' },
  { key: 'template', label: 'Template', icon: 'fas fa-file-code' },
  { key: 'style', label: 'Style', icon: 'fas fa-paint-brush' },
  { key: 'preview', label: '预览', icon: 'fas fa-eye' }
]

// 编译结果
const compilationResult = ref({
  script: '',
  template: '',
  styles: '',
  sourceMap: ''
})

// 编译统计
const compilationStats = ref({
  duration: 0,
  outputSize: 0,
  warnings: 0,
  errors: 0
})

// 编译消息
const compilationMessages = ref<Array<{
  id: string
  type: 'info' | 'warning' | 'error'
  text: string
  location?: string
}>>([])

// 预览相关
const previewMode = ref<'desktop' | 'mobile'>('desktop')
const previewError = ref('')

// 方法定义
const compileCode = async () => {
  compiling.value = true
  const startTime = Date.now()

  try {
    componentLogger.info('开始编译SFC组件', {
      codeLength: sourceCode.value.length,
      options: compilerOptions.value
    })

    // 清空之前的结果
    compilationMessages.value = []
    previewError.value = ''

    // 模拟编译过程 (实际应该调用SFC编译器)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // 模拟编译结果
    const duration = Date.now() - startTime

    compilationResult.value = {
      script: `// 编译后的 Script 部分\nimport { ref, defineProps, defineEmits } from 'vue'\n\nconst props = withDefaults(defineProps(), {\n  title: 'Demo 组件'\n})\n\nconst count = ref(0)\nconst emit = defineEmits(['click'])\n\nconst handleClick = () => {\n  count.value++\n  emit('click', count.value)\n}`,
      template: `// 编译后的 Template 部分\nfunction render() {\n  return h('div', { class: 'demo-component' }, [\n    h('h1', {}, props.title),\n    h('button', {\n      onClick: handleClick,\n      class: 'demo-btn'\n    }, '点击次数: ' + count.value)\n  ])\n}`,
      styles: `/* 编译后的 Style 部分 */\n.demo-component[data-v-12345] {\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  text-align: center;\n}\n\n.demo-btn[data-v-12345] {\n  padding: 8px 16px;\n  background: #007bff;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background 0.2s;\n}`,
      sourceMap: compilerOptions.value.sourceMap ? '// Source Map 数据...' : ''
    }

    const totalOutput = compilationResult.value.script.length +
                       compilationResult.value.template.length +
                       compilationResult.value.styles.length

    compilationStats.value = {
      duration,
      outputSize: totalOutput,
      warnings: Math.floor(Math.random() * 3),
      errors: 0
    }

    // 添加一些模拟的编译消息
    if (compilerOptions.value.optimizeImports) {
      compilationMessages.value.push({
        id: 'opt-1',
        type: 'info',
        text: '已优化未使用的导入',
        location: 'script, line 1'
      })
    }

    if (compilationStats.value.warnings > 0) {
      compilationMessages.value.push({
        id: 'warn-1',
        type: 'warning',
        text: '检测到未使用的变量',
        location: 'script, line 15'
      })
    }

    componentLogger.info('SFC编译完成', {
      duration,
      outputSize: totalOutput,
      warnings: compilationStats.value.warnings
    })

  } catch (error) {
    componentLogger.error('SFC编译失败', error as Error)

    compilationStats.value.errors = 1
    compilationMessages.value.push({
      id: 'error-1',
      type: 'error',
      text: error instanceof Error ? error.message : '编译失败',
      location: 'unknown'
    })

    previewError.value = '编译失败，无法预览'

  } finally {
    compiling.value = false
  }
}

const clearResults = () => {
  compilationResult.value = {
    script: '',
    template: '',
    styles: '',
    sourceMap: ''
  }

  compilationStats.value = {
    duration: 0,
    outputSize: 0,
    warnings: 0,
    errors: 0
  }

  compilationMessages.value = []
  previewError.value = ''

  componentLogger.info('编译结果已清空')
}

const loadExample = () => {
  sourceCode.value = [
    '<template>',
    '  <div class="card-component">',
    '    <div class="card-header">',
    '      <h2 class="card-title">{{ title }}</h2>',
    '      <span class="card-badge" :class="badgeType">{{ badge }}</span>',
    '    </div>',
    '    <div class="card-content">',
    '      <p>{{ description }}</p>',
    '      <div class="card-actions">',
    '        <button @click="onPrimary" class="btn-primary">{{ primaryText }}</button>',
    '        <button @click="onSecondary" class="btn-secondary">{{ secondaryText }}</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</template>',
    '',
    '<' + 'script setup lang="ts">',
    'interface Props {',
    '  title: string',
    '  badge?: string',
    '  badgeType?: \'success\' | \'warning\' | \'error\' | \'info\'',
    '  description: string',
    '  primaryText?: string',
    '  secondaryText?: string',
    '}',
    '',
    'const props = withDefaults(defineProps<Props>(), {',
    '  badge: \'\',',
    '  badgeType: \'info\',',
    '  primaryText: \'确认\',',
    '  secondaryText: \'取消\'',
    '})',
    '',
    'const emit = defineEmits<{',
    '  primary: []',
    '  secondary: []',
    '}>()',
    '',
    'const onPrimary = () => emit(\'primary\')',
    'const onSecondary = () => emit(\'secondary\')',
    '</' + 'script>',
    '',
    '<style scoped>',
    '.card-component {',
    '  max-width: 400px;',
    '  border: 1px solid var(--border-color);',
    '  border-radius: 8px;',
    '  overflow: hidden;',
    '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);',
    '}',
    '',
    '.card-header {',
    '  padding: 16px;',
    '  background: var(--header-bg);',
    '  display: flex;',
    '  justify-content: space-between;',
    '  align-items: center;',
    '}',
    '',
    '.card-title {',
    '  margin: 0;',
    '  font-size: 1.25rem;',
    '  font-weight: 600;',
    '}',
    '',
    '.card-badge {',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  font-size: 0.75rem;',
    '  font-weight: 500;',
    '}',
    '',
    '.card-badge.success { background: #d4edda; color: #155724; }',
    '.card-badge.warning { background: #fff3cd; color: #856404; }',
    '.card-badge.error { background: #f8d7da; color: #721c24; }',
    '.card-badge.info { background: #d1ecf1; color: #0c5460; }',
    '',
    '.card-content {',
    '  padding: 16px;',
    '}',
    '',
    '.card-actions {',
    '  margin-top: 16px;',
    '  display: flex;',
    '  gap: 8px;',
    '}',
    '',
    '.btn-primary, .btn-secondary {',
    '  padding: 8px 16px;',
    '  border: none;',
    '  border-radius: 4px;',
    '  cursor: pointer;',
    '  font-weight: 500;',
    '}',
    '',
    '.btn-primary {',
    '  background: #007bff;',
    '  color: white;',
    '}',
    '',
    '.btn-secondary {',
    '  background: #6c757d;',
    '  color: white;',
    '}',
    '</style>'
  ].join('\n')

  componentLogger.info('已加载示例代码')
}

const exportResults = () => {
  try {
    const exportData = {
      sourceCode: sourceCode.value,
      compilationResult: compilationResult.value,
      compilationStats: compilationStats.value,
      compilationMessages: compilationMessages.value,
      compilerOptions: compilerOptions.value,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sfc-compilation-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    componentLogger.info('编译结果导出成功')
  } catch (error) {
    componentLogger.error('导出失败', error as Error)
  }
}

const formatCode = () => {
  // 简单的代码格式化 (实际项目中应该使用 prettier 等工具)
  componentLogger.info('代码格式化功能开发中')
}

const toggleFullscreen = () => {
  componentLogger.info('全屏编辑功能开发中')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    componentLogger.info('代码已复制到剪贴板')
  } catch (error) {
    componentLogger.error('复制失败', error as Error)
  }
}

const refreshPreview = () => {
  previewError.value = ''
  componentLogger.info('预览已刷新')
}

const togglePreviewMode = () => {
  previewMode.value = previewMode.value === 'desktop' ? 'mobile' : 'desktop'
  componentLogger.info(`预览模式切换为${previewMode.value}`)
}

const getMessageIcon = (type: string) => {
  switch (type) {
    case 'error': return 'fas fa-times-circle'
    case 'warning': return 'fas fa-exclamation-triangle'
    case 'info': return 'fas fa-info-circle'
    default: return 'fas fa-info-circle'
  }
}

// 生命周期
onMounted(() => {
  componentLogger.info('SFC编译器演示页面加载完成')
})
</script>

<style scoped>
.sfc-compiler-view {
  padding: var(--spacing-6);
  background: var(--theme-bg-base);
  min-height: 100vh;
}

.page-header {
  margin-bottom: var(--spacing-8);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-2) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.page-title i {
  color: var(--theme-brand-primary);
}

.page-description {
  color: var(--theme-text-secondary);
  margin: 0;
}

/* 编译器工作区 */
.compiler-workspace {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-6);
  height: calc(100vh - 200px);
}

/* 控制面板 */
.control-panel {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  height: fit-content;
}

.panel-section {
  margin-bottom: var(--spacing-6);
}

.panel-section:last-child {
  margin-bottom: 0;
}

.panel-section h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-3) 0;
}

.options-grid {
  display: grid;
  gap: var(--spacing-2);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  color: var(--theme-text-primary);
  font-size: var(--font-size-sm);
}

.mode-selector {
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
}

.quick-buttons {
  display: grid;
  gap: var(--spacing-2);
}

.compile-btn, .clear-btn, .example-btn, .export-btn {
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.compile-btn {
  background: var(--theme-success);
  color: var(--theme-text-inverse);
}

.compile-btn:hover:not(:disabled) {
  background: var(--theme-success-hover);
}

.compile-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn, .example-btn, .export-btn {
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-base);
}

.clear-btn:hover, .example-btn:hover, .export-btn:hover {
  background: var(--theme-bg-hover);
}

/* 编辑器和结果 */
.editor-results {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: var(--spacing-4);
  height: 100%;
}

.editor-section, .results-section {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.editor-actions, .result-tabs {
  display: flex;
  gap: var(--spacing-2);
}

.format-btn, .fullscreen-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
}

.format-btn:hover, .fullscreen-btn:hover {
  background: var(--theme-bg-hover);
}

/* 编辑器 */
.code-editor {
  flex: 1;
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  padding: var(--spacing-3);
  border: none;
  background: var(--theme-bg-base);
  color: var(--theme-text-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  resize: none;
}

.editor-textarea:focus {
  outline: none;
  background: var(--theme-bg-base);
}

/* 结果标签页 */
.tab-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--theme-text-primary);
}

.tab-btn.active {
  color: var(--theme-brand-primary);
  border-bottom-color: var(--theme-brand-primary);
}

/* 结果内容 */
.results-content {
  flex: 1;
  overflow-y: auto;
}

/* 统计视图 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.stat-icon {
  font-size: var(--font-size-xl);
  color: var(--theme-text-secondary);
}

.stat-content h4 {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
  text-transform: uppercase;
}

.stat-content p {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
}

.error-count {
  color: var(--theme-error) !important;
}

/* 编译消息 */
.compilation-messages h3 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-md);
  color: var(--theme-text-primary);
}

.message-list {
  display: grid;
  gap: var(--spacing-2);
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--theme-bg-base);
  border-left: 4px solid transparent;
  border-radius: var(--radius-md);
}

.message-item.message-info {
  border-left-color: var(--theme-info);
}

.message-item.message-warning {
  border-left-color: var(--theme-warning);
}

.message-item.message-error {
  border-left-color: var(--theme-error);
}

.message-icon {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-1);
}

.message-item.message-info .message-icon {
  color: var(--theme-info);
}

.message-item.message-warning .message-icon {
  color: var(--theme-warning);
}

.message-item.message-error .message-icon {
  color: var(--theme-error);
}

.message-text {
  margin: 0 0 var(--spacing-1) 0;
  color: var(--theme-text-primary);
}

.message-location {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--theme-text-tertiary);
  font-family: var(--font-mono);
}

/* 代码视图 */
.code-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.code-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--theme-text-primary);
}

.copy-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
}

.copy-btn:hover {
  background: var(--theme-bg-hover);
}

.code-output {
  flex: 1;
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  overflow: auto;
  margin: 0;
}

.code-output code {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--theme-text-primary);
  white-space: pre-wrap;
  line-height: 1.5;
}

/* 预览视图 */
.preview-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.preview-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--theme-text-primary);
}

.preview-controls {
  display: flex;
  gap: var(--spacing-2);
}

.refresh-btn, .mode-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--theme-bg-base);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--theme-text-secondary);
}

.refresh-btn:hover, .mode-btn:hover {
  background: var(--theme-bg-hover);
}

.preview-container {
  flex: 1;
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.preview-container.preview-desktop {
  max-width: none;
}

.preview-container.preview-mobile {
  max-width: 375px;
  margin: 0 auto;
}

.preview-frame {
  height: 100%;
  background: var(--theme-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-error, .preview-empty {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--theme-text-secondary);
}

.preview-error i, .preview-empty i {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-3);
  display: block;
}

.preview-error {
  color: var(--theme-error);
}

.preview-content {
  padding: var(--spacing-4);
  width: 100%;
}

.mock-component {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  border: 2px dashed var(--theme-border-base);
  border-radius: var(--radius-lg);
}

.demo-button {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.demo-button:hover {
  background: var(--theme-brand-primary-hover);
}

@media (width <= 1024px) {
  .compiler-workspace {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
  }

  .control-panel {
    height: auto;
  }

  .editor-results {
    height: 800px;
  }
}

@media (width <= 768px) {
  .editor-results {
    grid-template-rows: 1fr;
    height: 600px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .result-tabs {
    flex-wrap: wrap;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
}
</style>
