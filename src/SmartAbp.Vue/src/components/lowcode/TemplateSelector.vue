<template>
  <div class="template-selector">
    <el-card>
      <template #header>
        <span>模板选择器</span>
      </template>

      <div class="content">
        <!-- 搜索栏 -->
        <div class="template-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <i class="el-icon-search" />
            </template>
          </el-input>
        </div>

        <!-- 分类筛选 -->
        <div class="template-categories">
          <el-radio-group
            v-model="selectedCategory"
            @change="handleCategoryChange"
          >
            <el-radio-button label="all">
              全部
            </el-radio-button>
            <el-radio-button label="admin">
              管理后台
            </el-radio-button>
            <el-radio-button label="business">
              业务应用
            </el-radio-button>
            <el-radio-button label="mobile">
              移动端
            </el-radio-button>
            <el-radio-button label="component">
              组件
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 模板列表 -->
        <div class="templates-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplate?.id === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="template-preview">
              <img
                :src="template.preview"
                :alt="template.name"
              />
              <div class="template-overlay">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="previewTemplate(template)"
                >
                  预览
                </el-button>
              </div>
            </div>
            <div class="template-info">
              <h4 class="template-title">
                {{ template.name }}
              </h4>
              <p class="template-description">
                {{ template.description }}
              </p>
              <div class="template-meta">
                <el-tag
                  :type="getCategoryType(template.category)"
                  size="mini"
                >
                  {{ getCategoryName(template.category) }}
                </el-tag>
                <span class="template-downloads">
                  <i class="el-icon-download" />
                  {{ template.downloads }}
                </span>
              </div>
            </div>
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
              @click="resetSearch"
            >
              清空搜索
            </el-button>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Template {
  id: string
  name: string
  description: string
  category: string
  preview: string
  downloads: number
}

interface Props {
  templates?: Template[]
}

defineProps<Props>()

const emit = defineEmits<{
  'template-selected': [template: Template]
  'template-preview': [template: Template]
}>()

// 响应式数据
const searchKeyword = ref('')
const selectedCategory = ref('all')
const selectedTemplate = ref<Template | null>(null)

// 模板数据
const allTemplates = ref<Template[]>([
  {
    id: 'admin-dashboard',
    name: '管理后台仪表板',
    description: '完整的管理后台模板，包含用户管理、数据统计等功能',
    category: 'admin',
    preview: '/templates/admin-dashboard.png',
    downloads: 1250
  },
  {
    id: 'crm-system',
    name: 'CRM客户管理系统',
    description: '客户关系管理系统，包含客户信息、销售跟进、报表分析',
    category: 'business',
    preview: '/templates/crm-system.png',
    downloads: 890
  },
  {
    id: 'mobile-app',
    name: '移动应用模板',
    description: '响应式移动端应用模板，支持PWA和离线功能',
    category: 'mobile',
    preview: '/templates/mobile-app.png',
    downloads: 650
  },
  {
    id: 'data-table',
    name: '数据表格组件',
    description: '功能完整的数据表格组件，支持排序、筛选、分页',
    category: 'component',
    preview: '/templates/data-table.png',
    downloads: 2100
  },
  {
    id: 'user-center',
    name: '用户中心',
    description: '用户个人中心页面模板，包含个人信息、设置等',
    category: 'business',
    preview: '/templates/user-center.png',
    downloads: 780
  },
  {
    id: 'ecommerce-shop',
    name: '电商商城',
    description: '完整的电商商城模板，包含商品展示、购物车、订单管理',
    category: 'business',
    preview: '/templates/ecommerce-shop.png',
    downloads: 1420
  }
])

// 计算属性
const filteredTemplates = computed(() => {
  let templates = allTemplates.value

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    templates = templates.filter(t => t.category === selectedCategory.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    templates = templates.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.description.toLowerCase().includes(keyword)
    )
  }

  return templates.sort((a, b) => b.downloads - a.downloads)
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleCategoryChange = () => {
  // 分类变更逻辑已在计算属性中处理
}

const selectTemplate = (template: Template) => {
  selectedTemplate.value = template
  emit('template-selected', template)
}

const previewTemplate = (template: Template) => {
  emit('template-preview', template)
}

const resetSearch = () => {
  searchKeyword.value = ''
  selectedCategory.value = 'all'
}

const getCategoryType = (category: string) => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    business: 'primary',
    mobile: 'success',
    component: 'warning'
  }
  return typeMap[category] || 'info'
}

const getCategoryName = (category: string) => {
  const nameMap: Record<string, string> = {
    admin: '管理后台',
    business: '业务应用',
    mobile: '移动端',
    component: '组件'
  }
  return nameMap[category] || category
}
</script>

<style scoped>
.template-selector {
  height: 100%;
}

.content {
  padding: 20px;
}

/* 搜索栏 */
.template-search {
  margin-bottom: 20px;
}

/* 分类筛选 */
.template-categories {
  margin-bottom: 24px;
  text-align: center;
}

/* 模板网格 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* 模板卡片 */
.template-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-bg-color);
}

.template-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.template-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 预览图片 */
.template-preview {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: var(--el-fill-color-light);
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.template-card:hover .template-preview img {
  transform: scale(1.05);
}

.template-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.template-card:hover .template-overlay {
  opacity: 1;
}

/* 模板信息 */
.template-info {
  padding: 16px;
}

.template-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.template-description {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-downloads {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.template-downloads i {
  font-size: 14px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .template-categories {
    margin-bottom: 16px;
  }

  .template-categories .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
}

@media (max-width: 992px) {
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
