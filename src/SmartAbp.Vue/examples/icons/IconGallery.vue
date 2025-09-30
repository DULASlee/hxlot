<!--
🏢 SmartAbp 企业级图标展示库
🎯 完整的图标预览和管理界面
🔍 支持搜索、分类、主题切换
🎨 企业级视觉设计标准
-->
<template>
  <div class="enterprise-icon-gallery">
    <!-- 🎯 图标库标题和统计 -->
    <div class="gallery-header">
      <div class="header-info">
        <h2 class="gallery-title">
          <EnterpriseIcon name="dashboard" size="lg" />
          SmartAbp 企业级图标库
        </h2>
        <div class="gallery-stats">
          <el-tag type="info" size="small">
            总计 {{ stats.totalIcons }} 个图标
          </el-tag>
          <el-tag type="success" size="small">
            已加载 {{ stats.loadedIcons }} 个
          </el-tag>
        </div>
      </div>
      
      <!-- 🎨 主题切换器 -->
      <div class="theme-controls">
        <el-button-group>
          <el-button 
            @click="toggleDarkMode"
            :icon="isDarkMode ? 'sunny' : 'moon'"
            size="small"
          >
            {{ isDarkMode ? '亮色' : '暗色' }}
          </el-button>
          <el-button 
            @click="resetTheme"
            icon="refresh"
            size="small"
          >
            重置主题
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 🔍 搜索和筛选工具栏 -->
    <div class="gallery-toolbar">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图标名称或标签..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
        
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          @change="handleCategoryChange"
          class="category-select"
        >
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          >
            <EnterpriseIcon :name="category.icon" size="sm" />
            {{ category.label }}
          </el-option>
        </el-select>
      </div>
      
      <div class="view-controls">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="grid">网格</el-radio-button>
          <el-radio-button value="list">列表</el-radio-button>
        </el-radio-group>
        
        <el-select v-model="iconSize" placeholder="图标大小" size="small">
          <el-option label="小" value="sm" />
          <el-option label="中" value="md" />
          <el-option label="大" value="lg" />
          <el-option label="超大" value="xl" />
        </el-select>
      </div>
    </div>
    
    <!-- 📊 分类统计概览 -->
    <div class="category-overview" v-if="!searchQuery">
      <div class="category-stats">
        <div
          v-for="(count, category) in stats.categoryStats"
          :key="category"
          class="category-stat-item"
          @click="selectedCategory = category"
          :class="{ active: selectedCategory === category }"
        >
          <EnterpriseIcon :name="getCategoryIcon(category)" size="md" />
          <div class="stat-info">
            <span class="stat-label">{{ getCategoryLabel(category) }}</span>
            <span class="stat-count">{{ count }} 个</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 🎯 图标展示区域 -->
    <div class="gallery-content" v-loading="isSearching">
      <!-- 🔍 搜索结果提示 -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-results-info">
        <el-alert
          :title="`找到 ${totalResults} 个图标`"
          type="success"
          :closable="false"
          show-icon
        />
      </div>
      
      <!-- ❌ 无结果提示 -->
      <div v-if="displayIcons.length === 0" class="no-results">
        <el-empty
          description="未找到匹配的图标"
          :image-size="120"
        >
          <el-button type="primary" @click="clearFilters">
            清除筛选条件
          </el-button>
        </el-empty>
      </div>
      
      <!-- 📋 图标网格视图 -->
      <div 
        v-else-if="viewMode === 'grid'"
        class="icon-grid"
        :class="`icon-grid--${iconSize}`"
      >
        <div
          v-for="icon in displayIcons"
          :key="icon.name"
          class="icon-grid-item"
          @click="selectIcon(icon)"
          :class="{ active: selectedIcon?.name === icon.name }"
        >
          <div class="icon-preview">
            <EnterpriseIcon
              :name="icon.name"
              :size="iconSize"
              :animated="true"
              class="preview-icon"
            />
          </div>
          <div class="icon-info">
            <div class="icon-name">{{ icon.name }}</div>
            <div class="icon-tags">
              <el-tag
                v-for="tag in icon.tags.slice(0, 2)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          
          <!-- 🎯 图标操作菜单 -->
          <div class="icon-actions">
            <el-button-group size="small">
              <el-button @click.stop="copyIconCode(icon)" icon="Document">
                复制
              </el-button>
              <el-button @click.stop="previewIcon(icon)" icon="View">
                预览
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
      
      <!-- 📋 图标列表视图 -->
      <div v-else class="icon-list">
        <div
          v-for="icon in displayIcons"
          :key="icon.name"
          class="icon-list-item"
          @click="selectIcon(icon)"
          :class="{ active: selectedIcon?.name === icon.name }"
        >
          <div class="list-icon">
            <EnterpriseIcon
              :name="icon.name"
              :size="iconSize"
              class="preview-icon"
            />
          </div>
          
          <div class="list-info">
            <div class="list-primary">
              <span class="icon-name">{{ icon.name }}</span>
              <el-tag :type="getCategoryType(icon.category)" size="small">
                {{ getCategoryLabel(icon.category) }}
              </el-tag>
            </div>
            <div class="list-secondary">
              <span class="icon-description">{{ icon.description }}</span>
              <div class="icon-tags">
                <el-tag
                  v-for="tag in icon.tags"
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="list-actions">
            <el-button @click.stop="copyIconCode(icon)" icon="Document" size="small">
              复制代码
            </el-button>
            <el-button @click.stop="previewIcon(icon)" icon="View" size="small">
              预览
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 🎯 图标预览弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="`图标预览 - ${selectedIcon?.name}`"
      width="600px"
      center
    >
      <div v-if="selectedIcon" class="icon-preview-dialog">
        <!-- 🎨 图标预览区 -->
        <div class="preview-section">
          <div class="preview-showcase">
            <EnterpriseIcon
              :name="selectedIcon.name"
              size="xl"
              :animated="true"
              class="showcase-icon"
            />
          </div>
          
          <!-- 🎛️ 预览控制 -->
          <div class="preview-controls">
            <div class="control-group">
              <label>大小:</label>
              <el-radio-group v-model="previewSize">
                <el-radio value="sm">小</el-radio>
                <el-radio value="md">中</el-radio>
                <el-radio value="lg">大</el-radio>
                <el-radio value="xl">超大</el-radio>
              </el-radio-group>
            </div>
            
            <div class="control-group">
              <label>颜色:</label>
              <el-radio-group v-model="previewColor">
                <el-radio value="primary">主色</el-radio>
                <el-radio value="success">成功</el-radio>
                <el-radio value="warning">警告</el-radio>
                <el-radio value="danger">危险</el-radio>
              </el-radio-group>
            </div>
            
            <div class="control-group">
              <el-checkbox v-model="previewAnimated">启用动画</el-checkbox>
            </div>
          </div>
        </div>
        
        <!-- 📝 图标信息 -->
        <div class="icon-details">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="图标名称">
              {{ selectedIcon.name }}
            </el-descriptions-item>
            <el-descriptions-item label="分类">
              {{ getCategoryLabel(selectedIcon.category) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
              {{ selectedIcon.description }}
            </el-descriptions-item>
            <el-descriptions-item label="版本">
              {{ selectedIcon.version }}
            </el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag
                v-for="tag in selectedIcon.tags"
                :key="tag"
                size="small"
                style="margin-right: 8px;"
              >
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 💻 代码示例 */
        <div class="code-examples">
          <el-tabs>
            <el-tab-pane label="Vue 组件" name="vue">
              <el-input
                type="textarea"
                :rows="3"
                :value="getVueCode()"
                readonly
                class="code-textarea"
              />
            </el-tab-pane>
            <el-tab-pane label="HTML" name="html">
              <el-input
                type="textarea"
                :rows="3"
                :value="getHtmlCode()"
                readonly
                class="code-textarea"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyIconCode(selectedIcon!)">
          复制代码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useIconSearch, useIconStats, useIconTheme } from '@/composables/useEnterpriseIcon'
import { IconCategory, type IconConfig } from '@/components/icons/IconManager'
import EnterpriseIcon from './EnterpriseIconSystem.vue'

// 🎯 响应式状态
const searchQuery = ref('')
const selectedCategory = ref<string>('')
const viewMode = ref<'grid' | 'list'>('grid')
const iconSize = ref<'sm' | 'md' | 'lg' | 'xl'>('md')
const selectedIcon = ref<IconConfig | null>(null)
const previewDialogVisible = ref(false)
const isDarkMode = ref(false)

// 🎛️ 预览控制
const previewSize = ref<'sm' | 'md' | 'lg' | 'xl'>('lg')
const previewColor = ref<'primary' | 'success' | 'warning' | 'danger'>('primary')
const previewAnimated = ref(true)

// 🔧 组合式函数
const { searchIcons, searchResults, totalResults, isSearching, getAllIcons } = useIconSearch()
const { stats, updateStats } = useIconStats()
const { toggleDarkMode, resetTheme } = useIconTheme()

// 📋 分类配置
const categories = [
  { value: IconCategory.BUSINESS, label: '业务管理', icon: 'business' },
  { value: IconCategory.SYSTEM, label: '系统管理', icon: 'settings' },
  { value: IconCategory.USER, label: '用户权限', icon: 'user' },
  { value: IconCategory.DATA, label: '数据管理', icon: 'database' },
  { value: IconCategory.ACTION, label: '操作动作', icon: 'add' },
  { value: IconCategory.NAVIGATION, label: '导航控制', icon: 'menu' },
  { value: IconCategory.STATUS, label: '状态提示', icon: 'success' },
  { value: IconCategory.TOOL, label: '开发工具', icon: 'code' },
  { value: IconCategory.COMMON, label: '通用图标', icon: 'home' }
]

// 💻 计算属性
const displayIcons = computed(() => {
  if (searchQuery.value) {
    return searchResults.value
  }
  
  const allIcons = getAllIcons()
  
  if (selectedCategory.value) {
    return allIcons.filter(icon => icon.category === selectedCategory.value)
  }
  
  return allIcons
})

// 🎯 方法定义
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await searchIcons({
      query: searchQuery.value,
      category: selectedCategory.value as IconCategory,
      enterpriseOnly: true
    })
  }
}

const handleCategoryChange = () => {
  if (searchQuery.value) {
    handleSearch()
  }
}

const selectIcon = (icon: IconConfig) => {
  selectedIcon.value = icon
}

const previewIcon = (icon: IconConfig) => {
  selectedIcon.value = icon
  previewDialogVisible.value = true
}

const copyIconCode = async (icon: IconConfig) => {
  const code = `<EnterpriseIcon name="${icon.name}" size="${iconSize.value}" />`
  
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success(`已复制图标代码: ${icon.name}`)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
}

const getCategoryIcon = (category: string) => {
  const categoryConfig = categories.find(c => c.value === category)
  return categoryConfig?.icon || 'folder'
}

const getCategoryLabel = (category: string) => {
  const categoryConfig = categories.find(c => c.value === category)
  return categoryConfig?.label || category
}

const getCategoryType = (category: string) => {
  const typeMap: Record<string, string> = {
    [IconCategory.BUSINESS]: 'primary',
    [IconCategory.SYSTEM]: 'warning',
    [IconCategory.USER]: 'success',
    [IconCategory.DATA]: 'info',
    [IconCategory.ACTION]: 'danger',
    [IconCategory.NAVIGATION]: 'primary',
    [IconCategory.STATUS]: 'warning',
    [IconCategory.TOOL]: 'success',
    [IconCategory.COMMON]: 'info'
  }
  return typeMap[category] || 'info'
}

const getVueCode = () => {
  if (!selectedIcon.value) return ''
  
  return `<EnterpriseIcon 
  name="${selectedIcon.value.name}"
  size="${previewSize.value}"
  color="${previewColor.value}"
  ${previewAnimated.value ? 'animated' : ''}
/>`
}

const getHtmlCode = () => {
  if (!selectedIcon.value) return ''
  
  return `<div class="enterprise-icon enterprise-icon--${previewSize.value}">
  <!-- ${selectedIcon.value.description} -->
</div>`
}

// 🎯 生命周期
onMounted(() => {
  updateStats()
  isDarkMode.value = document.documentElement.classList.contains('dark')
})

// 🔍 监听搜索变化
watch(searchQuery, () => {
  if (!searchQuery.value) {
    selectedCategory.value = ''
  }
})
</script>

<style scoped>
/* 🎨 图标库样式 */
.enterprise-icon-gallery {
  padding: 24px;
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

/* 📋 标题区域 */
.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gallery-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.gallery-stats {
  display: flex;
  gap: 8px;
}

/* 🔍 工具栏样式 */
.gallery-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.search-section {
  display: flex;
  gap: 12px;
  flex: 1;
}

.search-input {
  width: 300px;
}

.category-select {
  width: 150px;
}

.view-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 📊 分类概览 */
.category-overview {
  margin-bottom: 24px;
}

.category-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.category-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-stat-item:hover,
.category-stat-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.stat-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 🎯 内容区域 */
.gallery-content {
  min-height: 400px;
}

.search-results-info {
  margin-bottom: 16px;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 📋 网格视图 */
.icon-grid {
  display: grid;
  gap: 16px;
}

.icon-grid--sm {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.icon-grid--md {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.icon-grid--lg {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

.icon-grid--xl {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.icon-grid-item {
  position: relative;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.icon-grid-item:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-grid-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.icon-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  margin-bottom: 12px;
}

.icon-info {
  text-align: center;
  margin-bottom: 12px;
}

.icon-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.icon-tags {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.icon-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.icon-grid-item:hover .icon-actions {
  opacity: 1;
}

/* 📋 列表视图 */
.icon-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icon-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-list-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.icon-list-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
}

.list-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
}

.list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-primary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-secondary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.icon-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.list-actions {
  display: flex;
  gap: 8px;
}

/* 🎯 预览弹窗 */
.icon-preview-dialog {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section {
  display: flex;
  gap: 24px;
}

.preview-showcase {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  background: var(--el-bg-color-page);
  border: 2px dashed var(--el-border-color);
  border-radius: 12px;
}

.showcase-icon {
  font-size: 64px !important;
}

.preview-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.code-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .gallery-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .gallery-toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-section {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .category-stats {
    grid-template-columns: 1fr;
  }
  
  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .preview-section {
    flex-direction: column;
  }
}

/* 🌓 暗色主题 */
.dark .enterprise-icon-gallery {
  background: var(--el-bg-color-page);
}

.dark .icon-grid-item,
.dark .icon-list-item {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}

.dark .category-stat-item {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}
</style>
