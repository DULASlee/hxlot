<template>
  <div class="code-generation-view">
    <!-- 代码生成器头部 -->
    <div class="generation-header">
      <div class="header-left">
        <h2>
          <i class="el-icon-cpu" />
          代码生成 - 企业级全栈代码生成器
        </h2>
        <div class="generation-stats">
          <span>已准备实体: {{ availableEntities.length }}个</span>
          <el-divider direction="vertical" />
          <span>已设计页面: {{ availablePages.length }}个</span>
          <el-divider direction="vertical" />
          <span>预计生成: {{ estimatedFiles }}个文件</span>
        </div>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            icon="el-icon-magic-stick"
            :loading="generating"
            @click="generateAllCode"
          >
            一键生成全部代码
          </el-button>
          <el-button 
            type="success" 
            icon="el-icon-view" 
            @click="previewCode"
          >
            预览代码
          </el-button>
          <el-button 
            type="warning" 
            icon="el-icon-download" 
            @click="downloadCode"
          >
            下载代码包
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主体生成区域 -->
    <div class="generation-body">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-tabs v-model="activeConfigTab" type="card">
          <!-- 实体选择 -->
          <el-tab-pane label="实体选择" name="entities">
            <div class="entity-selection">
              <div class="selection-header">
                <el-checkbox 
                  v-model="selectAllEntities" 
                  :indeterminate="isIndeterminate"
                  @change="handleSelectAll"
                >
                  全选实体 ({{ selectedEntities.length }}/{{ availableEntities.length }})
                </el-checkbox>
                <el-button size="small" @click="refreshEntities">
                  <i class="el-icon-refresh" /> 刷新
                </el-button>
              </div>
              
              <div class="entity-list">
                <el-checkbox-group v-model="selectedEntities" @change="updateGeneration">
                  <div 
                    v-for="entity in availableEntities" 
                    :key="entity.id"
                    class="entity-item"
                  >
                    <el-checkbox :label="entity.id" class="entity-checkbox">
                      <div class="entity-content">
                        <div class="entity-info">
                          <div class="entity-name">{{ entity.name }}</div>
                          <div class="entity-details">
                            <span>表: {{ entity.tableName }}</span>
                            <span>字段: {{ entity.fields.length }}</span>
                          </div>
                        </div>
                        <el-tag 
                          :type="entity.category === 'core' ? 'primary' : 'info'" 
                          size="small"
                        >
                          {{ getCategoryLabel(entity.category) }}
                        </el-tag>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </div>
          </el-tab-pane>

          <!-- 代码配置 -->
          <el-tab-pane label="代码配置" name="config">
            <div class="code-config">
              <el-form :model="codeConfig" label-width="120px">
                <el-form-item label="项目名称">
                  <el-input v-model="codeConfig.projectName" placeholder="SmartAbp.PermissionSystem" />
                </el-form-item>
                <el-form-item label="命名空间">
                  <el-input v-model="codeConfig.namespace" placeholder="SmartAbp.PermissionSystem" />
                </el-form-item>
                <el-form-item label="数据库类型">
                  <el-select v-model="codeConfig.databaseType">
                    <el-option label="SQL Server" value="SqlServer" />
                    <el-option label="MySQL" value="MySQL" />
                    <el-option label="PostgreSQL" value="PostgreSQL" />
                    <el-option label="Oracle" value="Oracle" />
                  </el-select>
                </el-form-item>
                <el-form-item label="前端框架">
                  <el-select v-model="codeConfig.frontendFramework">
                    <el-option label="Vue 3 + TypeScript" value="Vue3TS" />
                    <el-option label="React + TypeScript" value="ReactTS" />
                    <el-option label="Angular" value="Angular" />
                  </el-select>
                </el-form-item>
                <el-form-item label="启用功能">
                  <el-checkbox-group v-model="codeConfig.features">
                    <el-checkbox label="audit">审计日志</el-checkbox>
                    <el-checkbox label="cache">分布式缓存</el-checkbox>
                    <el-checkbox label="permission">权限控制</el-checkbox>
                    <el-checkbox label="validation">数据验证</el-checkbox>
                    <el-checkbox label="localization">多语言</el-checkbox>
                    <el-checkbox label="testing">单元测试</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧预览和生成区域 -->
      <div class="preview-panel">
        <div class="panel-header">
          <h3>代码预览和生成</h3>
          <div class="header-actions">
            <el-button-group size="small">
              <el-button 
                :type="previewMode === 'tree' ? 'primary' : ''"
                @click="previewMode = 'tree'"
              >
                <i class="el-icon-menu" /> 文件树
              </el-button>
              <el-button 
                :type="previewMode === 'code' ? 'primary' : ''"
                @click="previewMode = 'code'"
              >
                <i class="el-icon-document" /> 代码预览
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 文件树预览 -->
        <div v-if="previewMode === 'tree'" class="file-tree-preview">
          <div class="tree-header">
            <span>预计生成文件结构</span>
            <el-tag type="info" size="small">{{ estimatedFiles }} 个文件</el-tag>
          </div>
          <el-tree
            :data="fileTreeData"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            class="file-tree"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <i :class="getFileIcon(data.type)" />
                <span class="node-label">{{ data.name }}</span>
                <span v-if="data.size" class="file-size">{{ data.size }}</span>
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 代码预览 -->
        <div v-if="previewMode === 'code'" class="code-preview">
          <div class="preview-tabs">
            <el-tabs v-model="activePreviewFile" type="card">
              <el-tab-pane 
                v-for="file in previewFiles" 
                :key="file.id"
                :label="file.name" 
                :name="file.id"
              >
                <div class="code-content">
                  <div class="code-header">
                    <div class="file-info">
                      <span class="file-path">{{ file.path }}</span>
                      <el-tag :type="getFileTypeTag(file.type)" size="small">
                        {{ file.type }}
                      </el-tag>
                    </div>
                    <div class="code-actions">
                      <el-button size="small" @click="copyCode(file.content)">
                        <i class="el-icon-document-copy" /> 复制
                      </el-button>
                      <el-button size="small" @click="downloadFile(file)">
                        <i class="el-icon-download" /> 下载
                      </el-button>
                    </div>
                  </div>
                  <div class="code-editor">
                    <pre class="code-block"><code :class="`language-${getLanguageClass(file.type)}`">{{ file.content }}</code></pre>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 生成进度 -->
        <div v-if="generating" class="generation-progress">
          <div class="progress-header">
            <h4>代码生成进度</h4>
            <el-tag :type="generationStatus === 'success' ? 'success' : 'info'">
              {{ getStatusText() }}
            </el-tag>
          </div>
          <el-progress 
            :percentage="generationPercentage" 
            :status="generationStatus"
            :stroke-width="8"
          />
          <div class="progress-details">
            <div class="current-task">
              当前任务: {{ currentGenerationTask }}
            </div>
            <div class="task-stats">
              已完成: {{ completedTasks }}/{{ totalTasks }} 个任务
            </div>
          </div>
        </div>

        <!-- 生成结果 -->
        <div v-if="generationResult" class="generation-result">
          <div class="result-header">
            <h4>生成结果</h4>
            <el-tag :type="generationResult.success ? 'success' : 'danger'">
              {{ generationResult.success ? '生成成功' : '生成失败' }}
            </el-tag>
          </div>
          <div class="result-summary">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-statistic title="生成文件" :value="generationResult.fileCount" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="代码行数" :value="generationResult.lineCount" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="耗时" :value="generationResult.duration" suffix="秒" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="文件大小" :value="generationResult.totalSize" suffix="KB" />
              </el-col>
            </el-row>
          </div>
          <div class="result-actions">
            <el-button type="primary" @click="downloadGeneratedCode">
              <i class="el-icon-download" /> 下载生成的代码
            </el-button>
            <el-button @click="openOutputDirectory">
              <i class="el-icon-folder-opened" /> 打开输出目录
            </el-button>
            <el-button @click="generateAgain">
              <i class="el-icon-refresh" /> 重新生成
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { ElMessage } from "element-plus"
import { useEntityModelingStore } from "@/stores/lowcode/entityModeling"
import { usePageDesignStore } from "@/stores/lowcode/pageDesign"

// Stores
const entityStore = useEntityModelingStore()
const pageStore = usePageDesignStore()

// 响应式数据
const activeConfigTab = ref("entities")
const previewMode = ref<"tree" | "code">("tree")
const activePreviewFile = ref("")
const generating = ref(false)
const generationPercentage = ref(0)
const generationStatus = ref<"" | "success" | "exception">("")
const currentGenerationTask = ref("")
const completedTasks = ref(0)
const totalTasks = ref(0)

// 选择状态
const selectedEntities = ref<string[]>([])
const selectAllEntities = ref(false)

// 配置数据
const codeConfig = ref({
  projectName: "SmartAbp.PermissionSystem",
  namespace: "SmartAbp.PermissionSystem",
  databaseType: "SqlServer",
  frontendFramework: "Vue3TS",
  features: ["audit", "cache", "permission", "validation", "testing"]
})

// 生成结果
const generationResult = ref<any>(null)

// 预览文件数据
const previewFiles = ref([
  {
    id: "user-entity",
    name: "User.cs",
    path: "src/Domain/Users/User.cs",
    type: "csharp",
    content: `using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SmartAbp.PermissionSystem.Users
{
    public class User : FullAuditedAggregateRoot<Guid>
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        
        protected User()
        {
        }
        
        public User(Guid id, string userName, string email) : base(id)
        {
            UserName = userName;
            Email = email;
            IsActive = true;
        }
    }
}`
  },
  {
    id: "user-service",
    name: "UserAppService.cs",
    path: "src/Application/Users/UserAppService.cs",
    type: "csharp",
    content: `using System;
using SmartAbp.PermissionSystem.Permissions;
using Volo.Abp.Application.Services;

namespace SmartAbp.PermissionSystem.Users
{
    public class UserAppService : CrudAppService<User, UserDto, Guid>
    {
        public UserAppService(IRepository<User, Guid> repository) : base(repository)
        {
        }
    }
}`
  }
])

// 计算属性
const availableEntities = computed(() => entityStore.entities)
const availablePages = computed(() => pageStore.pages)

const isIndeterminate = computed(() => 
  selectedEntities.value.length > 0 && selectedEntities.value.length < availableEntities.value.length
)

const estimatedFiles = computed(() => {
  return selectedEntities.value.length * 10 // 简化估算：每个实体10个文件
})

const fileTreeData = computed(() => {
  return [
    {
      id: "root",
      name: codeConfig.value.projectName,
      type: "folder",
      children: [
        {
          id: "src",
          name: "src",
          type: "folder",
          children: [
            {
              id: "domain",
              name: "Domain",
              type: "folder",
              children: selectedEntities.value.map(entityId => {
                const entity = availableEntities.value.find(e => e.id === entityId)
                return {
                  id: `domain-${entityId}`,
                  name: entity?.name || "Entity",
                  type: "folder",
                  children: [
                    { id: `${entityId}-entity`, name: `${entity?.name}.cs`, type: "csharp", size: "2.5KB" }
                  ]
                }
              })
            }
          ]
        }
      ]
    }
  ]
})

// 方法
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    core: "核心",
    relation: "关联", 
    config: "配置",
    log: "日志"
  }
  return labels[category] || category
}

const handleSelectAll = (checked: string | number | boolean) => {
  if (checked) {
    selectedEntities.value = availableEntities.value.map(e => e.id)
  } else {
    selectedEntities.value = []
  }
}

const updateGeneration = () => {
  console.log("更新生成配置", selectedEntities.value)
}

const refreshEntities = () => {
  entityStore.loadFromLocalStorage()
  ElMessage.success("实体数据已刷新")
}

const getFileIcon = (type: string) => {
  const icons: Record<string, string> = {
    folder: "el-icon-folder",
    csharp: "el-icon-document",
    vue: "el-icon-postcard"
  }
  return icons[type] || "el-icon-document"
}

const getFileTypeTag = (type: string): "primary" | "success" | "info" | "warning" | "danger" | undefined => {
  const types: Record<string, "primary" | "success" | "info" | "warning" | "danger"> = {
    csharp: "primary",
    vue: "success"
  }
  return types[type]
}

const getLanguageClass = (type: string) => {
  return type
}

const copyCode = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success("代码已复制到剪贴板")
  } catch {
    ElMessage.error("复制失败")
  }
}

const downloadFile = (file: any) => {
  const blob = new Blob([file.content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = file.name
  link.click()
  URL.revokeObjectURL(url)
}

const generateAllCode = async () => {
  if (selectedEntities.value.length === 0) {
    ElMessage.warning("请至少选择一个实体")
    return
  }

  generating.value = true
  generationPercentage.value = 0
  totalTasks.value = estimatedFiles.value
  completedTasks.value = 0

  // 模拟生成过程
  const interval = setInterval(() => {
    if (generationPercentage.value < 100) {
      generationPercentage.value += 10
      completedTasks.value = Math.floor((generationPercentage.value / 100) * totalTasks.value)
      currentGenerationTask.value = `生成第${completedTasks.value}个文件...`
    } else {
      clearInterval(interval)
      generationStatus.value = "success"
      generationResult.value = {
        success: true,
        fileCount: estimatedFiles.value,
        lineCount: estimatedFiles.value * 50,
        duration: 5.2,
        totalSize: estimatedFiles.value * 2.5
      }
      generating.value = false
      ElMessage.success("代码生成成功！")
    }
  }, 500)
}

const previewCode = () => {
  previewMode.value = "code"
  if (previewFiles.value.length > 0) {
    activePreviewFile.value = previewFiles.value[0].id
  }
}

const downloadCode = () => {
  ElMessage.info("下载代码包功能")
}

const downloadGeneratedCode = () => {
  ElMessage.success("开始下载生成的代码")
}

const openOutputDirectory = () => {
  ElMessage.info("打开输出目录")
}

const generateAgain = () => {
  generationResult.value = null
  generateAllCode()
}

const getStatusText = () => {
  if (generationStatus.value === "success") return "生成成功"
  if (generationStatus.value === "exception") return "生成失败"
  return "生成中..."
}

// 初始化
onMounted(() => {
  entityStore.loadFromLocalStorage()
  pageStore.loadFromLocalStorage()
  
  if (availableEntities.value.length > 0) {
    selectedEntities.value = [availableEntities.value[0].id]
  }
  
  if (previewFiles.value.length > 0) {
    activePreviewFile.value = previewFiles.value[0].id
  }
})
</script>

<style scoped>
.code-generation-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.generation-header {
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

.generation-stats {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.generation-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.config-panel {
  width: 400px;
  background: white;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.entity-selection {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.entity-list {
  flex: 1;
  overflow-y: auto;
}

.entity-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.2s;
}

.entity-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.entity-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entity-checkbox {
  flex: 1;
}

.entity-info {
  margin-left: 8px;
}

.entity-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.entity-details {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  gap: 12px;
}

.code-config {
  padding: 24px;
  overflow-y: auto;
}

.preview-panel {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
}

.preview-panel .panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-panel .panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.file-tree-preview {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.file-tree {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-node i {
  color: #606266;
}

.node-label {
  flex: 1;
}

.file-size {
  font-size: 12px;
  color: #8c8c8c;
}

.code-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.code-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.code-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-path {
  font-size: 12px;
  color: #606266;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.code-editor {
  flex: 1;
  overflow: auto;
  background: #fafafa;
}

.code-block {
  margin: 0;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: #fafafa;
  border: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.generation-progress {
  padding: 24px;
  border-top: 1px solid #e8e8e8;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.progress-details {
  margin-top: 12px;
  font-size: 12px;
  color: #606266;
}

.current-task {
  margin-bottom: 4px;
}

.generation-result {
  padding: 24px;
  border-top: 1px solid #e8e8e8;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.result-summary {
  margin-bottom: 24px;
}

.result-actions {
  display: flex;
  gap: 8px;
}
</style>
