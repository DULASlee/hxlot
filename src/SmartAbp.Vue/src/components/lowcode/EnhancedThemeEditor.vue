<template>
  <div class="enhanced-theme-editor">
    <!-- 主题预设选择 -->
    <el-card class="theme-presets-card">
      <template #header>
        <span>主题预设</span>
      </template>
      <div
        class="theme-presets"
        data-testid="theme-preset-selector"
      >
        <div
          v-for="(name, themeId) in themeStore.themePresets"
          :key="themeId"
          class="theme-option"
          :class="{ active: themeStore.currentTheme === themeId }"
          :data-testid="`theme-option-${themeId.replace('theme-', '')}`"
          @click="themeStore.switchTheme(themeId)"
        >
          <div class="theme-preview">
            <div
              class="preview-color primary"
              :style="getThemePreviewStyle(themeId, 'primary')"
            />
            <div
              class="preview-color success"
              :style="getThemePreviewStyle(themeId, 'success')"
            />
            <div
              class="preview-color warning"
              :style="getThemePreviewStyle(themeId, 'warning')"
            />
            <div
              class="preview-color danger"
              :style="getThemePreviewStyle(themeId, 'danger')"
            />
          </div>
          <span class="theme-name">{{ name }}</span>
        </div>
      </div>
    </el-card>

    <!-- 主题编辑标签页 -->
    <el-tabs
      v-model="activeTab"
      class="theme-editor-tabs"
    >
      <!-- 颜色调整 -->
      <el-tab-pane
        label="颜色"
        name="colors"
      >
        <div
          class="adjustment-section"
          data-testid="color-section"
        >
          <div class="color-row">
            <div class="color-item">
              <label>主色</label>
              <el-color-picker
                v-model="primaryColor"
                data-testid="primary-color-picker"
                @change="onColorChange('--theme-brand-primary', $event || '')"
              />
            </div>
            <div class="color-item">
              <label>成功色</label>
              <el-color-picker
                v-model="successColor"
                data-testid="success-color-picker"
                @change="onColorChange('--theme-brand-success', $event || '')"
              />
            </div>
            <div class="color-item">
              <label>警告色</label>
              <el-color-picker
                v-model="warningColor"
                data-testid="warning-color-picker"
                @change="onColorChange('--theme-brand-warning', $event || '')"
              />
            </div>
            <div class="color-item">
              <label>危险色</label>
              <el-color-picker
                v-model="dangerColor"
                data-testid="danger-color-picker"
                @change="onColorChange('--theme-brand-danger', $event || '')"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 间距调整 -->
      <el-tab-pane
        label="间距"
        name="spacing"
      >
        <div
          class="adjustment-section"
          data-testid="spacing-section"
        >
          <div class="spacing-grid">
            <div
              v-for="level in 8"
              :key="level"
              class="spacing-item"
            >
              <label>间距-{{ level }}</label>
              <el-slider
                :model-value="getSpacingValue(level)"
                :data-testid="`spacing-slider-${level}`"
                :min="0"
                :max="64"
                :step="4"
                @change="onSpacingChange(level, Array.isArray($event) ? $event[0] : $event)"
              />
              <span class="value-display">{{ getSpacingDisplay(level) }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 字体调整 -->
      <el-tab-pane
        label="字体"
        name="typography"
      >
        <div
          class="adjustment-section"
          data-testid="typography-section"
        >
          <div class="typography-controls">
            <div class="typography-item">
              <label>基础字号</label>
              <el-slider
                :model-value="baseFontSize"
                data-testid="base-font-size-slider"
                :min="12"
                :max="20"
                :step="1"
                @change="onFontSizeChange(Array.isArray($event) ? $event[0] : $event)"
              />
              <span class="value-display">{{ baseFontSize }}px</span>
            </div>

            <div class="typography-item">
              <label>字重</label>
              <el-select
                :model-value="fontWeight"
                data-testid="font-weight-selector"
                @change="onFontWeightChange($event)"
              >
                <el-option
                  label="细体 (300)"
                  value="300"
                />
                <el-option
                  label="正常 (400)"
                  value="400"
                />
                <el-option
                  label="中等 (500)"
                  value="500"
                />
                <el-option
                  label="粗体 (600)"
                  value="600"
                />
                <el-option
                  label="极粗 (700)"
                  value="700"
                />
              </el-select>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 圆角调整 -->
      <el-tab-pane
        label="圆角"
        name="radius"
      >
        <div
          class="adjustment-section"
          data-testid="radius-section"
        >
          <div class="radius-grid">
            <div
              v-for="level in ['sm', 'base', 'lg', 'xl']"
              :key="level"
              class="radius-item"
            >
              <label>圆角-{{ level.toUpperCase() }}</label>
              <el-slider
                :model-value="getRadiusValue(level)"
                :data-testid="`radius-slider-${level}`"
                :min="0"
                :max="20"
                :step="1"
                @change="onRadiusChange(level, Array.isArray($event) ? $event[0] : $event)"
              />
              <span class="value-display">{{ getRadiusDisplay(level) }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 阴影调整 -->
      <el-tab-pane
        label="阴影"
        name="shadows"
      >
        <div
          class="adjustment-section"
          data-testid="shadow-section"
        >
          <div class="shadow-grid">
            <div
              v-for="level in ['sm', 'md', 'lg', 'xl']"
              :key="level"
              class="shadow-item"
            >
              <label>阴影-{{ level.toUpperCase() }}</label>
              <div
                class="shadow-control"
                :data-testid="`shadow-control-${level}`"
              >
                <div
                  class="shadow-preview"
                  :style="getShadowPreviewStyle(level)"
                >
                  预览
                </div>
                <div class="shadow-inputs">
                  <el-slider
                    :model-value="getShadowOpacity(level)"
                    :min="0"
                    :max="100"
                    @change="onShadowOpacityChange(level, Array.isArray($event) ? $event[0] : $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 对比度检查 -->
      <el-tab-pane
        label="对比度"
        name="contrast"
      >
        <div
          class="adjustment-section"
          data-testid="contrast-section"
        >
          <div class="contrast-checks">
            <div
              v-for="(ratio, key) in themeStore.contrastRatios"
              :key="key"
              class="contrast-item"
              :data-testid="`${key}-contrast`"
            >
              <div class="contrast-label">
                {{ getContrastLabel(key) }}
              </div>
              <div
                class="contrast-value"
                :class="getContrastClass(ratio)"
              >
                {{ ratio.toFixed(2) }}:1
              </div>
              <div class="contrast-status">
                {{ ratio >= 4.5 ? '✓ WCAG AA' : '✗ 不合规' }}
              </div>
            </div>
          </div>

          <!-- 对比度警告 -->
          <div
            v-if="themeStore.contrastWarnings.length > 0"
            class="contrast-warnings"
            data-testid="contrast-warning"
          >
            <el-alert
              title="对比度警告"
              type="warning"
              :closable="false"
            >
              <div
                v-for="warning in themeStore.contrastWarnings"
                :key="warning.key"
              >
                {{ getContrastLabel(warning.key) }}对比度不足：{{ warning.ratio.toFixed(2) }}:1
                (需要 ≥{{ warning.required }}:1)
              </div>
            </el-alert>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 实时预览面板 -->
    <el-card
      class="preview-panel"
      data-testid="theme-preview-panel"
    >
      <template #header>
        <span>实时预览</span>
      </template>
      <div class="preview-content">
        <el-button
          type="primary"
          data-testid="preview-button"
        >
          主要按钮
        </el-button>
        <el-button type="success">
          成功按钮
        </el-button>
        <el-button type="warning">
          警告按钮
        </el-button>
        <el-button type="danger">
          危险按钮
        </el-button>

        <el-card
          class="preview-card"
          data-testid="preview-card"
          style="margin-top: 16px;"
        >
          <p data-testid="preview-text">
            这是预览文本，展示当前主题效果。
          </p>
          <p>间距、圆角、阴影都会实时更新。</p>
        </el-card>
      </div>
    </el-card>

    <!-- 快照管理 -->
    <el-card class="snapshot-panel">
      <template #header>
        <div class="snapshot-header">
          <span>主题快照</span>
          <el-button
            type="primary"
            size="small"
            data-testid="create-snapshot-btn"
            @click="createSnapshot"
          >
            创建快照
          </el-button>
        </div>
      </template>
      <div
        class="snapshots-list"
        data-testid="snapshot-list"
      >
        <div
          v-for="snapshot in themeStore.snapshots"
          :key="snapshot.id"
          class="snapshot-item"
          :data-testid="`snapshot-item-${snapshot.id}`"
        >
          <div class="snapshot-info">
            <div class="snapshot-name">
              {{ snapshot.name }}
            </div>
            <div class="snapshot-time">
              {{ formatTime(snapshot.timestamp) }}
            </div>
            <div class="snapshot-desc">
              {{ snapshot.description }}
            </div>
          </div>
          <div class="snapshot-actions">
            <el-button
              size="small"
              data-testid="restore-snapshot-btn"
              @click="restoreSnapshot(snapshot.id)"
            >
              恢复
            </el-button>
            <el-button
              size="small"
              type="danger"
              data-testid="delete-snapshot-btn"
              @click="deleteSnapshot(snapshot.id)"
            >
              删除
            </el-button>
          </div>
        </div>

        <div
          v-if="themeStore.snapshots.length === 0"
          class="empty-snapshots"
        >
          暂无快照，点击"创建快照"保存当前主题
        </div>
      </div>
    </el-card>

    <!-- 导出导入 -->
    <el-card class="export-import-panel">
      <template #header>
        <span>导出导入</span>
      </template>
      <div class="export-import-actions">
        <el-button
          data-testid="export-theme-btn"
          @click="exportTheme"
        >
          导出主题
        </el-button>
        <el-button
          data-testid="import-theme-btn"
          @click="triggerImport"
        >
          导入主题
        </el-button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none;"
          @change="importTheme"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useEnhancedThemeStore } from "@/stores/lowcode/enhancedTheme"
import { logger } from "@/utils/logging"

const themeStore = useEnhancedThemeStore()

// === 响应式状态 ===
const activeTab = ref("colors")
const fileInput = ref<HTMLInputElement>()

// 颜色绑定
const primaryColor = computed({
  get: () => themeStore.themeVariables["--theme-brand-primary"],
  set: (value) => themeStore.debouncedUpdate("--theme-brand-primary", value)
})

const successColor = computed({
  get: () => themeStore.themeVariables["--theme-brand-success"],
  set: (value) => themeStore.debouncedUpdate("--theme-brand-success", value)
})

const warningColor = computed({
  get: () => themeStore.themeVariables["--theme-brand-warning"],
  set: (value) => themeStore.debouncedUpdate("--theme-brand-warning", value)
})

const dangerColor = computed({
  get: () => themeStore.themeVariables["--theme-brand-danger"],
  set: (value) => themeStore.debouncedUpdate("--theme-brand-danger", value)
})

// 字体绑定
const baseFontSize = computed(() => {
  const fontSize = themeStore.themeVariables["--font-size-base"]
  return parseInt(fontSize.replace('rem', '')) * 16 // 转换为px显示
})

const fontWeight = computed(() => {
  return themeStore.themeVariables["--font-weight-normal"]
})

// === 事件处理 ===

// 颜色变化处理
const onColorChange = (variable: string, color: string | null) => {
  if (color) {
    themeStore.debouncedUpdate(variable, color)
    logger.debug(`Color changed: ${variable} = ${color}`)
  }
}

// 间距变化处理
const onSpacingChange = (level: number, value: number | number[]) => {
  if (Array.isArray(value)) value = value[0] ?? 0
  const remValue = `${value / 16}rem`
  themeStore.debouncedUpdate(`--spacing-${level}`, remValue)
}

const getSpacingValue = (level: number): number => {
  const remValue = themeStore.themeVariables[`--spacing-${level}`]
  return parseFloat(remValue.replace('rem', '')) * 16
}

const getSpacingDisplay = (level: number): string => {
  return themeStore.themeVariables[`--spacing-${level}`]
}

// 字体变化处理
const onFontSizeChange = (size: number | number[]) => {
  if (Array.isArray(size)) size = size[0] ?? 16
  const remValue = `${size / 16}rem`
  themeStore.debouncedUpdate("--font-size-base", remValue)
}

const onFontWeightChange = (weight: string | number) => {
  weight = String(weight)
  themeStore.debouncedUpdate("--font-weight-normal", weight)
}

// 圆角变化处理
const onRadiusChange = (level: string, value: number | number[]) => {
  if (Array.isArray(value)) value = value[0] ?? 0
  const remValue = `${value / 16}rem`
  themeStore.debouncedUpdate(`--radius-${level}`, remValue)
}

const getRadiusValue = (level: string): number => {
  const remValue = themeStore.themeVariables[`--radius-${level}`]
  return parseFloat(remValue.replace('rem', '')) * 16
}

const getRadiusDisplay = (level: string): string => {
  return themeStore.themeVariables[`--radius-${level}`]
}

// 阴影处理
const onShadowOpacityChange = (level: string, opacity: number | number[]) => {
  if (Array.isArray(opacity)) opacity = opacity[0] ?? 10
  // 这里简化处理，实际需要解析和修改阴影字符串中的透明度
  const shadowVar = `--shadow-${level}`
  const currentShadow = themeStore.themeVariables[shadowVar]

  // 简单的透明度替换（实际应该用正则表达式）
  const newShadow = currentShadow.replace(
    /rgba\(0, 0, 0, [\d.]+\)/g,
    `rgba(0, 0, 0, ${opacity / 100})`
  )

  themeStore.debouncedUpdate(shadowVar, newShadow)
}

const getShadowOpacity = (level: string): number => {
  const shadow = themeStore.themeVariables[`--shadow-${level}`]
  const match = shadow.match(/rgba\(0, 0, 0, ([\d.]+)\)/)
  return match ? parseFloat(match[1]) * 100 : 10
}

const getShadowPreviewStyle = (level: string) => {
  return {
    boxShadow: `var(--shadow-${level})`
  }
}

// 主题预设预览样式
const getThemePreviewStyle = (themeId: string, colorType: string) => {
  const colorMap: Record<string, Record<string, string>> = {
    'theme-tech-blue': {
      primary: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    },
    'theme-deep-green': {
      primary: '#059669',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    },
    'theme-light-purple': {
      primary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    },
    'theme-dark': {
      primary: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171'
    }
  }

  return {
    backgroundColor: colorMap[themeId]?.[colorType] || '#ccc'
  }
}

// 对比度相关
const getContrastLabel = (key: string): string => {
  const labels: Record<string, string> = {
    'primary-bg': '主色/背景',
    'text-bg': '文本/背景',
    'success-bg': '成功色/背景',
    'warning-bg': '警告色/背景',
    'danger-bg': '危险色/背景'
  }
  return labels[key] || key
}

const getContrastClass = (ratio: number): string => {
  if (ratio >= 7) return 'contrast-excellent'
  if (ratio >= 4.5) return 'contrast-good'
  if (ratio >= 3) return 'contrast-poor'
  return 'contrast-fail'
}

// 快照管理
const createSnapshot = async () => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入快照名称', '创建主题快照', {
      inputValue: `主题快照 ${new Date().toLocaleString()}`,
      confirmButtonText: '创建',
      cancelButtonText: '取消',
    })

    if (name) {
      themeStore.createSnapshot(name)
      ElMessage.success('快照创建成功')
    }
  } catch {
    // 用户取消
  }
}

const restoreSnapshot = (snapshotId: string) => {
  const success = themeStore.restoreSnapshot(snapshotId)
  if (success) {
    ElMessage.success('快照恢复成功')
  } else {
    ElMessage.error('快照恢复失败')
  }
}

const deleteSnapshot = async (snapshotId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个快照吗？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })

    const success = themeStore.deleteSnapshot(snapshotId)
    if (success) {
      ElMessage.success('快照删除成功')
    } else {
      ElMessage.error('快照删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 导出导入
const exportTheme = () => {
  themeStore.exportTheme()
  ElMessage.success('主题导出成功')
}

const triggerImport = () => {
  fileInput.value?.click()
}

const importTheme = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const success = await themeStore.importTheme(file)
    if (success) {
      ElMessage.success('主题导入成功')
    } else {
      ElMessage.error('主题导入失败')
    }
  } catch {
    ElMessage.error('主题导入出错')
  }

  // 清空input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 工具方法
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  logger.info("EnhancedThemeEditor mounted")
})
</script>

<style scoped>
.enhanced-theme-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-width: 1200px;
}

/* 主题预设 */
.theme-presets-card {
  margin-bottom: 16px;
}

.theme-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option:hover {
  border-color: var(--el-color-primary);
}

.theme-option.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.theme-preview {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.preview-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.theme-name {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 调整区域 */
.adjustment-section {
  padding: 16px 0;
}

.color-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-item label {
  width: 60px;
  font-size: 14px;
}

/* 间距网格 */
.spacing-grid,
.radius-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.spacing-item,
.radius-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spacing-item label,
.radius-item label {
  width: 80px;
  font-size: 14px;
}

.spacing-item .el-slider,
.radius-item .el-slider {
  flex: 1;
}

.value-display {
  width: 50px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 字体控制 */
.typography-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.typography-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.typography-item label {
  width: 80px;
  font-size: 14px;
}

.typography-item .el-slider {
  flex: 1;
}

.typography-item .el-select {
  width: 150px;
}

/* 阴影网格 */
.shadow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.shadow-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shadow-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shadow-preview {
  width: 100%;
  height: 40px;
  background: white;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 对比度检查 */
.contrast-checks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.contrast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.contrast-label {
  flex: 1;
  font-size: 14px;
}

.contrast-value {
  font-weight: bold;
  min-width: 60px;
}

.contrast-value.contrast-excellent {
  color: #00c851;
}

.contrast-value.contrast-good {
  color: #28a745;
}

.contrast-value.contrast-poor {
  color: #ffc107;
}

.contrast-value.contrast-fail {
  color: #dc3545;
}

.contrast-status {
  font-size: 12px;
  min-width: 80px;
}

.contrast-warnings {
  margin-top: 16px;
}

/* 预览面板 */
.preview-panel {
  margin-top: 16px;
}

.preview-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-card {
  width: 100%;
  margin-top: 16px;
}

/* 快照管理 */
.snapshot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.snapshots-list {
  max-height: 300px;
  overflow-y: auto;
}

.snapshot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  margin-bottom: 8px;
}

.snapshot-info {
  flex: 1;
}

.snapshot-name {
  font-weight: bold;
  font-size: 14px;
}

.snapshot-time {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.snapshot-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.snapshot-actions {
  display: flex;
  gap: 8px;
}

.empty-snapshots {
  text-align: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

/* 导出导入 */
.export-import-actions {
  display: flex;
  gap: 12px;
}
</style>
