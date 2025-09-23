<template>
  <div class="template-selector">
    <!-- 模板筛选器 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-input
          v-model="searchText"
          placeholder="搜索模板..."
          prefix-icon="el-icon-search"
          size="small"
          clearable
          style="width: 200px;"
        />
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          size="small"
          style="width: 150px; margin-left: 12px;"
        >
          <el-option
            label="全部分类"
            value=""
          />
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="store.isLoading"
      class="loading-state"
    >
      <el-skeleton
        :rows="3"
        animated
      />
    </div>

    <!-- 错误状态 -->
    <div
      v-if="store.error"
      class="error-state"
    >
      <el-empty description="加载模板失败">
        <el-button
          type="primary"
          @click="store.fetchTemplates()"
        >
          重试
        </el-button>
      </el-empty>
    </div>

    <!-- 模板列表 -->
    <div
      v-if="!store.isLoading && !store.error"
      class="templates-content"
    >
      <!-- 权限管理模板（特别展示） -->
      <div
        v-if="permissionTemplates.length > 0"
        class="template-category"
      >
        <div class="category-header">
          <h3>
            <i class="el-icon-lock" />
            权限管理系统模板
          </h3>
          <el-tag
            type="success"
            size="small"
          >
            推荐
          </el-tag>
        </div>
        <div class="template-grid">
          <el-card
            v-for="template in permissionTemplates"
            :key="template.id"
            shadow="hover"
            class="template-card permission-template"
            @click="selectTemplate(template)"
          >
            <template #header>
              <div class="card-header">
                <div class="template-title">
                  <i class="el-icon-shield" />
                  {{ template.name }}
                </div>
                <el-tag
                  type="primary"
                  size="small"
                >
                  企业级
                </el-tag>
              </div>
            </template>
            <div class="template-content">
              <p class="template-description">
                {{ template.description }}
              </p>
              <div
                v-if="template.features"
                class="template-features"
              >
                <el-tag
                  v-for="feature in template.features"
                  :key="feature"
                  size="small"
                  type="info"
                  class="feature-tag"
                >
                  {{ feature }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 其他分类模板 -->
      <div
        v-for="categoryGroup in otherCategoryGroups"
        :key="categoryGroup.category"
        class="template-category"
      >
        <div class="category-header">
          <h3>
            <i :class="getCategoryIcon(categoryGroup.category)" />
            {{ getCategoryLabel(categoryGroup.category) }}
          </h3>
          <span class="template-count">{{ categoryGroup.templates.length }}个模板</span>
        </div>
        <div class="template-grid">
          <el-card
            v-for="template in categoryGroup.templates"
            :key="template.id"
            shadow="hover"
            class="template-card"
            @click="selectTemplate(template)"
          >
            <template #header>
              <div class="card-header">
                <div class="template-title">
                  <i :class="getTemplateIcon(template.category || 'general')" />
                  {{ template.name }}
                </div>
                <el-tag 
                  :type="getCategoryTagType(template.category || 'general')" 
                  size="small"
                >
                  {{ getCategoryLabel(template.category || 'general') }}
                </el-tag>
              </div>
            </template>
            <div class="template-content">
              <p class="template-description">
                {{ template.description }}
              </p>
              <div
                v-if="template.features"
                class="template-features"
              >
                <el-tag
                  v-for="feature in template.features"
                  :key="feature"
                  size="small"
                  type="info"
                  class="feature-tag"
                >
                  {{ feature }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredTemplates.length === 0"
        class="empty-state"
      >
        <el-empty description="没有找到匹配的模板">
          <el-button
            type="primary"
            @click="clearFilters"
          >
            清除筛选条件
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useTemplatesStore } from "@/stores/lowcode/templates"
import { ElCard, ElInput, ElSelect, ElOption, ElTag, ElButton, ElEmpty, ElSkeleton } from "element-plus"
import type { Template } from "@smartabp/lowcode-api/types"

const emit = defineEmits<{
  select: [template: Template]
}>()

const store = useTemplatesStore()

// 筛选状态
const searchText = ref("")
const selectedCategory = ref("")

// 分类定义
const categories = [
  { value: "permission-system", label: "权限管理" },
  { value: "general", label: "通用模块" },
  { value: "component", label: "组件" },
  { value: "visualization", label: "可视化" },
  { value: "report", label: "报表" },
  { value: "workflow", label: "工作流" },
  { value: "security", label: "安全" },
  { value: "communication", label: "通讯" },
  { value: "storage", label: "存储" },
  { value: "system", label: "系统" }
]

// 计算属性
const filteredTemplates = computed(() => {
  let templates = store.templates

  // 文本搜索
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    templates = templates.filter((t: Template) => 
      t.name.toLowerCase().includes(search) || 
      (t.description && t.description.toLowerCase().includes(search))
    )
  }

  // 分类筛选
  if (selectedCategory.value) {
    templates = templates.filter((t: Template) => t.category === selectedCategory.value)
  }

  return templates
})

const permissionTemplates = computed(() => 
  filteredTemplates.value.filter((t: Template) => t.category === "permission-system")
)

const otherCategoryGroups = computed(() => {
  const templates = filteredTemplates.value.filter((t: Template) => t.category !== "permission-system")
  const groups: Record<string, Template[]> = {}
  
  templates.forEach((template: Template) => {
    const category = template.category || "general"
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(template)
  })

  return Object.keys(groups).map(category => ({
    category,
    templates: groups[category]
  }))
})

// 方法
const selectTemplate = (template: Template) => {
  emit("select", template)
}

const clearFilters = () => {
  searchText.value = ""
  selectedCategory.value = ""
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    "permission-system": "el-icon-lock",
    "general": "el-icon-menu",
    "component": "el-icon-postcard",
    "visualization": "el-icon-pie-chart",
    "report": "el-icon-document",
    "workflow": "el-icon-share",
    "security": "el-icon-shield",
    "communication": "el-icon-message",
    "storage": "el-icon-folder",
    "system": "el-icon-setting"
  }
  return icons[category] || "el-icon-menu"
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    "permission-system": "权限管理",
    "general": "通用模块",
    "component": "组件",
    "visualization": "可视化",
    "report": "报表",
    "workflow": "工作流",
    "security": "安全",
    "communication": "通讯",
    "storage": "存储",
    "system": "系统"
  }
  return labels[category] || category
}

const getTemplateIcon = (category: string) => {
  return getCategoryIcon(category)
}

const getCategoryTagType = (category: string): "primary" | "success" | "info" | "warning" | "danger" | undefined => {
  const types: Record<string, "primary" | "success" | "info" | "warning" | "danger"> = {
    "permission-system": "primary",
    "general": "success",
    "component": "info",
    "visualization": "warning",
    "report": "danger",
    "workflow": "primary",
    "security": "danger",
    "communication": "info",
    "storage": "warning",
    "system": "success"
  }
  return types[category]
}

onMounted(() => {
  if (store.templates.length === 0) {
    store.fetchTemplates()
  }
})
</script>

<style scoped>
.template-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-section {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.filter-row {
  display: flex;
  align-items: center;
}

.loading-state {
  flex: 1;
  padding: 24px;
}

.error-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.templates-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.template-category {
  margin-bottom: 32px;
}

.template-category:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8e8e8;
}

.category-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-count {
  font-size: 12px;
  color: #909399;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.template-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: fit-content;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.permission-template {
  border: 2px solid #409eff;
}

.permission-template:hover {
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #303133;
}

.template-content {
  padding: 0;
}

.template-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  line-height: 1.5;
  color: #606266;
}

.template-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag {
  font-size: 11px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>