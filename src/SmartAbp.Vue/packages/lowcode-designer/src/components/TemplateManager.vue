<template>
  <div class="template-manager">
    <!-- 搜索和筛选栏 -->
    <el-card class="search-bar" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称、描述、标签..."
            prefix-icon="el-icon-search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="filterType"
            placeholder="模板类型"
            clearable
            @change="handleFilter"
          >
            <el-option label="实体模板" value="entity" />
            <el-option label="服务模板" value="service" />
            <el-option label="控制器模板" value="controller" />
            <el-option label="视图模板" value="view" />
            <el-option label="组件模板" value="component" />
            <el-option label="工作流模板" value="workflow" />
            <el-option label="自定义模板" value="custom" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="filterCategory"
            placeholder="分类"
            clearable
            @change="handleFilter"
          >
            <el-option label="前端" value="frontend" />
            <el-option label="后端" value="backend" />
            <el-option label="全栈" value="fullstack" />
            <el-option label="数据库" value="database" />
            <el-option label="DevOps" value="devops" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            @change="handleSort"
          >
            <el-option label="最新创建" value="createdAt" />
            <el-option label="最多使用" value="usageCount" />
            <el-option label="评分最高" value="rating" />
            <el-option label="名称排序" value="name" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button
            v-if="!readonly"
            type="primary"
            icon="el-icon-plus"
            @click="handleCreateTemplate"
          >
            新建模板
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模板列表 -->
    <div class="template-list">
      <el-row :gutter="20">
        <el-col
          v-for="template in filteredTemplates"
          :key="template.id"
          :span="6"
        >
          <el-card
            class="template-card"
            :class="{ selected: selectedTemplateId === template.id }"
            shadow="hover"
            @click="handleSelectTemplate(template)"
          >
            <div class="template-icon">
              <i v-if="template.icon" :class="template.icon" />
              <i v-else class="el-icon-document" />
            </div>

            <div class="template-header">
              <h3 class="template-name">{{ template.displayName }}</h3>
              <el-tag v-if="template.isBuiltIn" type="success" size="small">
                内置
              </el-tag>
            </div>

            <p class="template-description">{{ template.description }}</p>

            <div class="template-meta">
              <div class="meta-item">
                <el-tag size="small" :type="getCategoryType(template.category)">
                  {{ getCategoryLabel(template.category) }}
                </el-tag>
                <el-tag size="small" type="info">
                  {{ getTypeLabel(template.type) }}
                </el-tag>
              </div>

              <div class="meta-stats">
                <span class="stat-item">
                  <i class="el-icon-star-on" />
                  {{ template.rating.toFixed(1) }}
                </span>
                <span class="stat-item">
                  <i class="el-icon-view" />
                  {{ template.usageCount }}
                </span>
              </div>
            </div>

            <div class="template-tags">
              <el-tag
                v-for="tag in template.tags.slice(0, 3)"
                :key="tag.id"
                size="small"
                :color="tag.color"
              >
                {{ tag.name }}
              </el-tag>
            </div>

            <div class="template-actions">
              <el-button
                size="small"
                icon="el-icon-view"
                @click.stop="handlePreviewTemplate(template)"
              >
                预览
              </el-button>
              <el-button
                size="small"
                type="primary"
                icon="el-icon-download"
                @click.stop="handleUseTemplate(template)"
              >
                使用
              </el-button>
              <el-button
                v-if="!readonly && !template.isBuiltIn"
                size="small"
                icon="el-icon-edit"
                @click.stop="handleEditTemplate(template)"
              >
                编辑
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty
        v-if="filteredTemplates.length === 0"
        description="暂无模板"
      >
        <el-button
          v-if="!readonly"
          type="primary"
          @click="handleCreateTemplate"
        >
          创建第一个模板
        </el-button>
      </el-empty>
    </div>

    <!-- 模板预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="模板预览"
      width="80%"
      :fullscreen="isPreviewFullscreen"
    >
      <template #header>
        <div class="dialog-header">
          <span>模板预览 - {{ currentTemplate?.displayName }}</span>
          <el-button
            text
            :icon="isPreviewFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"
            @click="isPreviewFullscreen = !isPreviewFullscreen"
          />
        </div>
      </template>

      <div v-if="currentTemplate" class="template-preview">
        <!-- 模板信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">
            {{ currentTemplate.displayName }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">
            {{ currentTemplate.version }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ currentTemplate.author }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ getTypeLabel(currentTemplate.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryLabel(currentTemplate.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="评分">
            <el-rate v-model="currentTemplate.rating" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentTemplate.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 模板变量 -->
        <el-divider content-position="left">模板变量</el-divider>
        <el-table :data="currentTemplate.variables" border>
          <el-table-column prop="displayName" label="变量名" width="150" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column label="必填" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                {{ row.required ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="defaultValue" label="默认值" width="150" />
          <el-table-column prop="description" label="说明" />
        </el-table>

        <!-- 模板文件 -->
        <el-divider content-position="left">模板文件</el-divider>
        <el-tabs v-model="activeFileTab">
          <el-tab-pane
            v-for="file in currentTemplate.files"
            :key="file.id"
            :label="file.path"
            :name="file.id"
          >
            <div class="file-preview">
              <div class="file-header">
                <span class="file-path">{{ file.path }}</span>
                <el-tag size="small">{{ file.language }}</el-tag>
              </div>
              <pre class="file-content"><code>{{ file.content }}</code></pre>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleUseTemplate(currentTemplate!)">
          使用此模板
        </el-button>
      </template>
    </el-dialog>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isCreating ? '新建模板' : '编辑模板'"
      width="70%"
    >
      <el-form
        v-if="editingTemplate"
        :model="editingTemplate"
        label-width="120px"
      >
        <el-form-item label="模板名称" required>
          <el-input v-model="editingTemplate.displayName" />
        </el-form-item>

        <el-form-item label="模板标识" required>
          <el-input v-model="editingTemplate.name" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" required>
              <el-select v-model="editingTemplate.type" style="width: 100%">
                <el-option label="实体模板" value="entity" />
                <el-option label="服务模板" value="service" />
                <el-option label="控制器模板" value="controller" />
                <el-option label="视图模板" value="view" />
                <el-option label="组件模板" value="component" />
                <el-option label="工作流模板" value="workflow" />
                <el-option label="自定义模板" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" required>
              <el-select v-model="editingTemplate.category" style="width: 100%">
                <el-option label="前端" value="frontend" />
                <el-option label="后端" value="backend" />
                <el-option label="全栈" value="fullstack" />
                <el-option label="数据库" value="database" />
                <el-option label="DevOps" value="devops" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" required>
          <el-input
            v-model="editingTemplate.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本">
              <el-input v-model="editingTemplate.version" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者">
              <el-input v-model="editingTemplate.author" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="公开">
          <el-switch v-model="editingTemplate.isPublic" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTemplate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {
  TemplateManagerProps,
  TemplateDefinition,
  TemplateType,
  TemplateCategory
} from '@smartabp/lowcode-designer/types'

// Props
const props = withDefaults(defineProps<TemplateManagerProps>(), {
  readonly: false
})

// Emits
const emit = defineEmits<{
  'update:selectedTemplate': [template: TemplateDefinition]
  'use-template': [template: TemplateDefinition]
}>()

// 搜索和筛选
const searchKeyword = ref('')
const filterType = ref<TemplateType | ''>('')
const filterCategory = ref<TemplateCategory | ''>('')
const sortBy = ref('createdAt')

// 对话框状态
const previewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const isPreviewFullscreen = ref(false)
const isCreating = ref(false)

// 当前操作的模板
const currentTemplate = ref<TemplateDefinition | null>(null)
const editingTemplate = ref<TemplateDefinition | null>(null)
const selectedTemplateId = ref<string>('')
const activeFileTab = ref('')

// 模板列表（模拟数据）
const templates = ref<TemplateDefinition[]>([
  {
    id: 'tpl_001',
    name: 'crud-entity',
    displayName: 'CRUD实体模板',
    description: '标准的CRUD实体模板，包含增删改查功能',
    type: 'entity',
    category: 'fullstack',
    version: '1.0.0',
    author: 'SmartAbp Team',
    tags: [
      { id: 'tag_1', name: 'CRUD', color: '#409eff' },
      { id: 'tag_2', name: 'Entity', color: '#67c23a' }
    ],
    variables: [
      {
        name: 'entityName',
        displayName: '实体名称',
        type: 'string',
        required: true,
        description: '实体的名称（PascalCase）'
      },
      {
        name: 'tableName',
        displayName: '表名',
        type: 'string',
        required: false,
        description: '数据库表名'
      }
    ],
    files: [
      {
        id: 'file_1',
        path: 'Entity.cs',
        content: 'public class {{entityName}} : Entity<Guid> { }',
        language: 'csharp'
      }
    ],
    icon: 'el-icon-document',
    isBuiltIn: true,
    isPublic: true,
    usageCount: 1250,
    rating: 4.8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  }
])

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let result = templates.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      t =>
        t.displayName.toLowerCase().includes(keyword) ||
        t.description.toLowerCase().includes(keyword) ||
        t.tags.some(tag => tag.name.toLowerCase().includes(keyword))
    )
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(t => t.type === filterType.value)
  }

  // 分类过滤
  if (filterCategory.value) {
    result = result.filter(t => t.category === filterCategory.value)
  }

  // 排序
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'usageCount':
        return b.usageCount - a.usageCount
      case 'rating':
        return b.rating - a.rating
      case 'name':
        return a.displayName.localeCompare(b.displayName)
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return result
})

// 监听选中的模板
watch(
  () => props.selectedTemplate,
  newValue => {
    if (newValue) {
      selectedTemplateId.value = newValue.id
    }
  },
  { immediate: true }
)

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑已在computed中处理
}

// 排序处理
const handleSort = () => {
  // 排序逻辑已在computed中处理
}

// 选择模板
const handleSelectTemplate = (template: TemplateDefinition) => {
  selectedTemplateId.value = template.id
  emit('update:selectedTemplate', template)
}

// 预览模板
const handlePreviewTemplate = (template: TemplateDefinition) => {
  currentTemplate.value = template
  if (template.files.length > 0) {
    activeFileTab.value = template.files[0].id
  }
  previewDialogVisible.value = true
}

// 使用模板
const handleUseTemplate = (template: TemplateDefinition) => {
  emit('use-template', template)
  ElMessage.success(`已选择模板：${template.displayName}`)
  previewDialogVisible.value = false
}

// 创建模板
const handleCreateTemplate = () => {
  isCreating.value = true
  editingTemplate.value = {
    id: `tpl_${Date.now()}`,
    name: '',
    displayName: '',
    description: '',
    type: 'custom',
    category: 'frontend',
    version: '1.0.0',
    author: 'User',
    tags: [],
    variables: [],
    files: [],
    isBuiltIn: false,
    isPublic: false,
    usageCount: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  editDialogVisible.value = true
}

// 编辑模板
const handleEditTemplate = (template: TemplateDefinition) => {
  isCreating.value = false
  editingTemplate.value = { ...template }
  editDialogVisible.value = true
}

// 保存模板
const handleSaveTemplate = () => {
  if (!editingTemplate.value) return

  if (isCreating.value) {
    templates.value.push(editingTemplate.value)
    ElMessage.success('模板创建成功')
  } else {
    const index = templates.value.findIndex(t => t.id === editingTemplate.value!.id)
    if (index >= 0) {
      templates.value[index] = editingTemplate.value
      ElMessage.success('模板更新成功')
    }
  }

  editDialogVisible.value = false
  editingTemplate.value = null
}

// 获取分类标签
const getCategoryLabel = (category: TemplateCategory): string => {
  const labels: Record<TemplateCategory, string> = {
    frontend: '前端',
    backend: '后端',
    fullstack: '全栈',
    database: '数据库',
    devops: 'DevOps'
  }
  return labels[category]
}

// 获取分类类型
const getCategoryType = (category: TemplateCategory): string => {
  const types: Record<TemplateCategory, string> = {
    frontend: 'primary',
    backend: 'success',
    fullstack: 'warning',
    database: 'danger',
    devops: 'info'
  }
  return types[category]
}

// 获取类型标签
const getTypeLabel = (type: TemplateType): string => {
  const labels: Record<TemplateType, string> = {
    entity: '实体',
    service: '服务',
    controller: '控制器',
    view: '视图',
    component: '组件',
    workflow: '工作流',
    custom: '自定义'
  }
  return labels[type]
}
</script>

<style scoped lang="scss">
.template-manager {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .search-bar {
    margin-bottom: 20px;
  }

  .template-list {
    .template-card {
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      &.selected {
        border-color: #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
      }

      .template-icon {
        text-align: center;
        font-size: 48px;
        color: #409eff;
        margin-bottom: 16px;
      }

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .template-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .template-description {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 12px;
        min-height: 42px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .template-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .meta-item {
          display: flex;
          gap: 8px;
        }

        .meta-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #909399;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .template-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        min-height: 24px;
      }

      .template-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }

  .template-preview {
    .file-preview {
      .file-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px 4px 0 0;

        .file-path {
          font-weight: 600;
          color: #303133;
        }
      }

      .file-content {
        margin: 0;
        padding: 16px;
        background: #282c34;
        color: #abb2bf;
        border-radius: 0 0 4px 4px;
        overflow-x: auto;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>
