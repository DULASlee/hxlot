<template>
  <div class="theme-customization-view">
    <!-- 主题定制头部 -->
    <div class="theme-header">
      <div class="header-left">
        <h2>
          <i class="el-icon-brush" />
          主题定制 - 企业级设计系统
        </h2>
        <div class="theme-info">
          <span>当前主题: {{ currentThemeName }}</span>
          <el-divider direction="vertical" />
          <span>WCAG合规状态: {{ wcagStatus }}</span>
        </div>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-view"
            @click="togglePreview"
          >
            {{ showPreview ? '隐藏预览' : '显示预览' }}
          </el-button>
          <el-button
            type="success"
            icon="el-icon-download"
            @click="exportTheme"
          >
            导出主题
          </el-button>
          <el-button
            type="warning"
            icon="el-icon-upload"
            @click="showImportDialog = true"
          >
            导入主题
          </el-button>
          <el-button
            type="info"
            icon="el-icon-refresh"
            @click="resetTheme"
          >
            重置默认
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="theme-body">
      <!-- 左侧主题编辑器 -->
      <div class="theme-editor-panel">
        <EnhancedThemeEditor @theme-changed="handleThemeChange" />
      </div>

      <!-- 右侧预览面板 -->
      <div
        v-if="showPreview"
        class="theme-preview-panel"
      >
        <div class="preview-header">
          <h3>实时预览</h3>
          <el-select
            v-model="previewMode"
            size="small"
          >
            <el-option
              label="组件预览"
              value="components"
            />
            <el-option
              label="页面预览"
              value="pages"
            />
            <el-option
              label="完整应用"
              value="full"
            />
          </el-select>
        </div>

        <div class="preview-content">
          <!-- 组件预览模式 -->
          <div
            v-if="previewMode === 'components'"
            class="components-preview"
          >
            <div class="preview-section">
              <h4>按钮组件</h4>
              <div class="button-group">
                <el-button type="primary">
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
                <el-button type="info">
                  信息按钮
                </el-button>
              </div>
            </div>

            <div class="preview-section">
              <h4>表单组件</h4>
              <el-form label-width="80px">
                <el-form-item label="输入框">
                  <el-input
                    v-model="previewData.input"
                    placeholder="请输入内容"
                  />
                </el-form-item>
                <el-form-item label="选择器">
                  <el-select
                    v-model="previewData.select"
                    placeholder="请选择"
                  >
                    <el-option
                      label="选项1"
                      value="1"
                    />
                    <el-option
                      label="选项2"
                      value="2"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="开关">
                  <el-switch v-model="previewData.switch" />
                </el-form-item>
              </el-form>
            </div>

            <div class="preview-section">
              <h4>数据展示</h4>
              <el-table
                :data="previewData.tableData"
                style="width: 100%"
              >
                <el-table-column
                  prop="name"
                  label="名称"
                />
                <el-table-column
                  prop="status"
                  label="状态"
                >
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template #default>
                    <el-button
                      size="small"
                      type="primary"
                    >
                      编辑
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="preview-section">
              <h4>导航组件</h4>
              <el-menu
                mode="horizontal"
                :default-active="'1'"
              >
                <el-menu-item index="1">
                  工作台
                </el-menu-item>
                <el-menu-item index="2">
                  用户管理
                </el-menu-item>
                <el-menu-item index="3">
                  系统设置
                </el-menu-item>
                <el-sub-menu index="4">
                  <template #title>
                    更多功能
                  </template>
                  <el-menu-item index="4-1">
                    权限管理
                  </el-menu-item>
                  <el-menu-item index="4-2">
                    角色管理
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
            </div>

            <div class="preview-section">
              <h4>反馈组件</h4>
              <div class="feedback-group">
                <el-alert
                  title="成功提示"
                  type="success"
                  show-icon
                />
                <el-alert
                  title="信息提示"
                  type="info"
                  show-icon
                />
                <el-alert
                  title="警告提示"
                  type="warning"
                  show-icon
                />
                <el-alert
                  title="错误提示"
                  type="error"
                  show-icon
                />
              </div>
            </div>
          </div>

          <!-- 页面预览模式 -->
          <div
            v-if="previewMode === 'pages'"
            class="pages-preview"
          >
            <el-tabs
              v-model="previewPageTab"
              type="card"
            >
              <el-tab-pane
                label="登录页面"
                name="login"
              >
                <div class="page-preview">
                  <div class="login-preview">
                    <el-card style="width: 400px; margin: 20px auto;">
                      <template #header>
                        <div style="text-align: center;">
                          <h2>系统登录</h2>
                        </div>
                      </template>
                      <el-form label-width="0">
                        <el-form-item>
                          <el-input
                            placeholder="用户名"
                            prefix-icon="el-icon-user"
                          />
                        </el-form-item>
                        <el-form-item>
                          <el-input
                            placeholder="密码"
                            type="password"
                            prefix-icon="el-icon-lock"
                          />
                        </el-form-item>
                        <el-form-item>
                          <el-button
                            type="primary"
                            style="width: 100%;"
                          >
                            登录
                          </el-button>
                        </el-form-item>
                      </el-form>
                    </el-card>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane
                label="工作台"
                name="dashboard"
              >
                <div class="page-preview">
                  <div class="dashboard-preview">
                    <el-row :gutter="20">
                      <el-col :span="6">
                        <el-card>
                          <el-statistic
                            title="用户总数"
                            :value="1234"
                          />
                        </el-card>
                      </el-col>
                      <el-col :span="6">
                        <el-card>
                          <el-statistic
                            title="在线用户"
                            :value="89"
                          />
                        </el-card>
                      </el-col>
                      <el-col :span="6">
                        <el-card>
                          <el-statistic
                            title="系统访问"
                            :value="5678"
                          />
                        </el-card>
                      </el-col>
                      <el-col :span="6">
                        <el-card>
                          <el-statistic
                            title="数据总量"
                            :value="9876"
                            suffix="条"
                          />
                        </el-card>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane
                label="数据表格"
                name="table"
              >
                <div class="page-preview">
                  <el-card>
                    <template #header>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>用户管理</span>
                        <el-button
                          type="primary"
                          size="small"
                        >
                          添加用户
                        </el-button>
                      </div>
                    </template>
                    <el-table :data="previewData.tableData">
                      <el-table-column
                        prop="name"
                        label="用户名"
                      />
                      <el-table-column
                        prop="email"
                        label="邮箱"
                      />
                      <el-table-column
                        prop="role"
                        label="角色"
                      />
                      <el-table-column
                        prop="status"
                        label="状态"
                      >
                        <template #default="scope">
                          <el-tag :type="scope.row.status === '正常' ? 'success' : 'warning'">
                            {{ scope.row.status }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-card>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 完整应用预览模式 -->
          <div
            v-if="previewMode === 'full'"
            class="full-preview"
          >
            <iframe
              :src="fullPreviewUrl"
              style="width: 100%; height: 600px; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 导入主题对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入主题配置"
      width="500px"
    >
      <div class="import-content">
        <el-upload
          drag
          accept=".json"
          :before-upload="handleImportTheme"
          :show-file-list="false"
        >
          <i
            class="el-icon-upload"
            style="font-size: 67px; color: #C0C4CC;"
          />
          <div style="color: #606266;">
            将主题配置文件拖到此处，或<em>点击上传</em>
          </div>
          <div style="color: #909399; font-size: 12px; margin-top: 8px;">
            支持.json格式的主题配置文件
          </div>
        </el-upload>

        <el-divider>或者</el-divider>

        <el-input
          v-model="importThemeText"
          type="textarea"
          :rows="8"
          placeholder="请粘贴主题配置JSON..."
        />
      </div>
      <template #footer>
        <el-button @click="showImportDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="!importThemeText"
          @click="importThemeFromText"
        >
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import EnhancedThemeEditor from '@smartabp/lowcode-designer/components/EnhancedThemeEditor.vue'
import { useEnhancedThemeStore } from '@smartabp/lowcode-core'
import { logger } from '@smartabp/lowcode-tools'

// Store
const themeStore = useEnhancedThemeStore()

// 响应式数据
const showPreview = ref(true)
const previewMode = ref<"components" | "pages" | "full">("components")
const previewPageTab = ref("login")
const showImportDialog = ref(false)
const importThemeText = ref("")

// 预览数据
const previewData = ref({
  input: "",
  select: "",
  switch: false,
  tableData: [
    { name: "张三", email: "zhangsan@example.com", role: "管理员", status: "正常" },
    { name: "李四", email: "lisi@example.com", role: "用户", status: "正常" },
    { name: "王五", email: "wangwu@example.com", role: "用户", status: "禁用" }
  ]
})

// 计算属性
const currentThemeName = computed(() => themeStore.currentTheme || "默认主题")
const wcagStatus = computed(() => {
  const warnings = themeStore.contrastWarnings
  return warnings.length === 0 ? "✅ 合规" : `⚠️ ${warnings.length}项警告`
})
const fullPreviewUrl = computed(() => {
  // 这里可以返回完整应用的预览URL
  return "/dashboard?preview=true"
})

// 方法
const handleThemeChange = (themeData: any) => {
  // 主题变更时的处理逻辑
  logger?.info("主题变更", { themeName: themeData.name })
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const exportTheme = () => {
  try {
    const themeConfig = themeStore.exportTheme()
    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], {
      type: "application/json"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `theme-${currentThemeName.value}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success("主题配置已导出")
  } catch (error) {
    ElMessage.error("导出主题配置失败")
    logger?.error("主题导出错误", { error: String(error) })
  }
}

const resetTheme = () => {
  ElMessageBox.confirm(
    "确定要重置为默认主题吗？这将丢失当前的所有自定义配置。",
    "重置主题",
    {
      confirmButtonText: "确定重置",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    themeStore.resetToDefault()
    ElMessage.success("已重置为默认主题")
  }).catch(() => {
    // 用户取消
  })
}

const handleImportTheme = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const themeConfig = JSON.parse(content)
      themeStore.importTheme(themeConfig)
      ElMessage.success("主题导入成功")
      showImportDialog.value = false
    } catch (error) {
      ElMessage.error("主题文件格式错误")
      logger?.error("主题导入错误", { error: String(error) })
    }
  }
  reader.readAsText(file)
  return false // 阻止自动上传
}

const importThemeFromText = () => {
  try {
    const themeConfig = JSON.parse(importThemeText.value)
    themeStore.importTheme(themeConfig)
    ElMessage.success("主题导入成功")
    showImportDialog.value = false
    importThemeText.value = ""
  } catch (error) {
    ElMessage.error("主题配置格式错误")
    logger?.error("主题文本导入错误", { error: String(error) })
  }
}

// 初始化
onMounted(() => {
  // 初始化主题数据
  themeStore.loadFromLocalStorage()
})
</script>

<style scoped>
.theme-customization-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.theme-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.theme-info {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.theme-body {
  flex: 1;
  display: flex;
  gap: 1px;
  min-height: 0;
}

.theme-editor-panel {
  flex: 1;
  background: white;
  min-width: 0;
}

.theme-preview-panel {
  width: 600px;
  background: white;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.components-preview .preview-section {
  margin-bottom: 32px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feedback-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pages-preview .page-preview {
  min-height: 400px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
}

.login-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard-preview {
  padding: 20px;
}

.import-content {
  padding: 20px 0;
}

.import-content .el-upload-dragger {
  width: 100%;
}
</style>
