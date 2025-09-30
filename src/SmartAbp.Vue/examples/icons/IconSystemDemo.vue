<!--
🏢 SmartAbp 企业级图标系统演示页面
🎯 展示完整的图标使用方式和最佳实践
🎨 企业级设计标准示例
-->
<template>
  <div class="icon-system-demo">
    <!-- 🎯 页面标题 -->
    <div class="demo-header">
      <h1 class="demo-title">
        <EnterpriseIcon
          name="home"
          size="lg"
          color="primary"
        />
        SmartAbp 企业级图标系统演示
      </h1>
      <p class="demo-description">
        展示企业级图标系统的完整功能和使用方式，包括图标组件、主题切换、动画效果等。
      </p>
    </div>

    <!-- 📊 图标系统统计 -->
    <el-row
      :gutter="24"
      class="stats-section"
    >
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <EnterpriseIcon
              name="dashboard"
              size="xl"
              color="primary"
            />
            <div class="stat-text">
              <div class="stat-number">
                {{ iconStats.totalIcons }}
              </div>
              <div class="stat-label">
                总图标数
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <EnterpriseIcon
              name="success"
              size="xl"
              color="success"
            />
            <div class="stat-text">
              <div class="stat-number">
                {{ iconStats.loadedIcons }}
              </div>
              <div class="stat-label">
                已加载
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <EnterpriseIcon
              name="loading"
              size="xl"
              color="warning"
              animated
            />
            <div class="stat-text">
              <div class="stat-number">
                {{ performanceStats.cacheHitRate }}%
              </div>
              <div class="stat-label">
                缓存命中率
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <EnterpriseIcon
              name="settings"
              size="xl"
              color="info"
            />
            <div class="stat-text">
              <div class="stat-number">
                {{ performanceStats.averageLoadTime.toFixed(1) }}ms
              </div>
              <div class="stat-label">
                平均加载时间
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 🎨 图标尺寸演示 -->
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="expand" />
          图标尺寸规范
        </div>
      </template>
      
      <div class="size-demo">
        <div
          v-for="size in iconSizes"
          :key="size.name"
          class="size-item"
        >
          <EnterpriseIcon 
            name="user" 
            :size="size.value" 
            color="primary" 
          />
          <div class="size-label">
            <span class="size-name">{{ size.name }}</span>
            <span class="size-value">{{ size.value }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 🎨 图标颜色主题演示 -->
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="settings" />
          颜色主题规范
        </div>
      </template>
      
      <div class="color-demo">
        <div
          v-for="color in iconColors"
          :key="color.name"
          class="color-item"
        >
          <EnterpriseIcon 
            name="success" 
            size="lg" 
            :color="color.value"
          />
          <div class="color-label">
            <span class="color-name">{{ color.name }}</span>
            <span class="color-code">{{ color.code }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 🎭 图标变体演示 */
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="dashboard" />
          图标变体样式
        </div>
      </template>
      
      <div class="variant-demo">
        <div class="variant-item" v-for="variant in iconVariants" :key="variant.name">
          <EnterpriseIcon 
            name="user" 
            size="lg" 
            color="primary"
            :variant="variant.value"
          />
          <div class="variant-label">{{ variant.name }}</div>
        </div>
      </div>
    </el-card>

    <!-- 🎬 图标动画演示 -->
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon
            name="loading"
            animated
          />
          动画效果演示
        </div>
      </template>
      
      <div class="animation-demo">
        <div
          v-for="animation in iconAnimations"
          :key="animation.name"
          class="animation-item"
        >
          <EnterpriseIcon 
            name="refresh" 
            size="lg" 
            color="primary"
            :animation="animation.value"
          />
          <div class="animation-label">
            {{ animation.name }}
          </div>
          <el-button 
            size="small" 
            @click="toggleAnimation(animation.value)"
          >
            {{ animationStates[animation.value] ? '停止' : '播放' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 📋 业务场景示例 */
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="business" />
          业务场景示例
        </div>
      </template>
      
      <div class="business-demo">
        <!-- 🎯 菜单示例 -->
    <div class="business-example">
      <h4>导航菜单</h4>
      <ul class="menu-example">
        <li
          v-for="menu in businessMenus"
          :key="menu.key"
          class="menu-item"
        >
          <EnterpriseIcon 
            :name="menu.icon" 
            size="md" 
            color="text"
            class="menu-icon" 
          />
          <span>{{ menu.title }}</span>
        </li>
      </ul>
    </div>

    <!-- 🔔 操作按钮示例 -->
    <div class="business-example">
      <h4>操作按钮</h4>
      <div class="button-example">
        <el-button 
          v-for="action in businessActions" 
          :key="action.key"
          :type="action.type"
          @click="handleAction(action.key)"
        >
          <EnterpriseIcon 
            :name="action.icon" 
            size="sm" 
            style="margin-right: 6px;" 
          />
          {{ action.title }}
        </el-button>
      </div>
    </div>

    <!-- 📊 状态指示示例 */
        <div class="business-example">
          <h4>状态指示</h4>
          <div class="status-example">
            <div 
              v-for="status in businessStatuses" 
              :key="status.key"
              class="status-item"
            >
              <EnterpriseIcon 
                :name="status.icon" 
                size="md" 
                :color="status.color"
              />
              <span>{{ status.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 🔧 主题控制面板 */
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="config" />
          主题控制面板
        </div>
      </template>
      
      <div class="theme-control">
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="control-group">
              <h4>主题模式</h4>
              <el-radio-group v-model="themeMode" @change="handleThemeChange">
                <el-radio value="light">
                  <EnterpriseIcon name="success" size="sm" />
                  亮色主题
                </el-radio>
                <el-radio value="dark">
                  <EnterpriseIcon name="warning" size="sm" />
                  暗色主题
                </el-radio>
              </el-radio-group>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="control-group">
              <h4>主色调</h4>
              <div class="color-picker-group">
                <el-color-picker 
                  v-model="customTheme.primary"
                  @change="updateCustomTheme"
                />
                <span>主色调</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 🧩 图标搜索演示 */
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="search" />
          图标搜索功能
        </div>
      </template>
      
      <div class="search-demo">
        <div class="search-controls">
          <el-input
            v-model="searchQuery"
            placeholder="搜索图标..."
            @input="handleIconSearch"
            clearable
          >
            <template #prefix>
              <EnterpriseIcon name="search" size="sm" />
            </template>
          </el-input>
          
          <el-select 
            v-model="searchCategory"
            placeholder="选择分类"
            clearable
            @change="handleIconSearch"
          >
            <el-option
              v-for="category in searchCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </div>
        
        <div class="search-results" v-if="searchResults.length > 0">
          <div class="results-header">
            <span>找到 {{ searchResults.length }} 个图标</span>
          </div>
          <div class="results-grid">
            <div 
              v-for="icon in searchResults.slice(0, 12)" 
              :key="icon.name"
              class="result-item"
              @click="copyIconUsage(icon.name)"
            >
              <EnterpriseIcon 
                :name="icon.name" 
                size="lg" 
                color="primary"
              />
              <span class="result-name">{{ icon.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 💻 代码示例 */
    <el-card class="demo-section">
      <template #header>
        <div class="section-header">
          <EnterpriseIcon name="code" />
          使用代码示例
        </div>
      </template>
      
      <el-tabs>
        <el-tab-pane label="基础用法" name="basic">
          <highlightjs 
            language="vue" 
            :code="codeExamples.basic"
            class="code-block"
          />
        </el-tab-pane>
        
        <el-tab-pane label="高级用法" name="advanced">
          <highlightjs 
            language="vue" 
            :code="codeExamples.advanced"
            class="code-block"
          />
        </el-tab-pane>
        
        <el-tab-pane label="Composable" name="composable">
          <highlightjs 
            language="typescript" 
            :code="codeExamples.composable"
            class="code-block"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  useIconSearch, 
  useIconStats, 
  useIconTheme,
  useEnterpriseIcon
} from '@/composables/useEnterpriseIcon'
import { IconCategory } from '@/components/icons/IconManager'
import { iconSystemMonitor } from '@/plugins/enterpriseIcons'
import EnterpriseIcon from '@/components/icons/EnterpriseIconSystem.vue'

// 🎯 图标系统数据
const { stats: iconStats, updateStats } = useIconStats()
const { updateTheme } = useIconTheme()
const { searchIcons, searchResults } = useIconSearch()

// 📊 性能统计
const performanceStats = computed(() => iconSystemMonitor.getMetrics())

// 🎨 界面状态
const themeMode = ref('light')
const searchQuery = ref('')
const searchCategory = ref('')
const animationStates = reactive<Record<string, boolean>>({})

// 🎨 自定义主题
const customTheme = reactive({
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C'
})

// 🎯 预览弹窗状态
const previewDialogVisible = ref(false)
const selectedIcon = ref<any>(null)
const previewSize = ref<'sm' | 'md' | 'lg' | 'xl'>('lg')
const previewColor = ref<'primary' | 'success' | 'warning' | 'danger'>('primary')
const previewAnimated = ref(true)

// 📏 图标尺寸配置
const iconSizes = [
  { name: '超小', value: 'xs' },
  { name: '小号', value: 'sm' },
  { name: '中号', value: 'md' },
  { name: '大号', value: 'lg' },
  { name: '超大', value: 'xl' }
]

// 🎨 图标颜色配置
const iconColors = [
  { name: '主色调', value: 'primary', code: '#409EFF' },
  { name: '成功色', value: 'success', code: '#67C23A' },
  { name: '警告色', value: 'warning', code: '#E6A23C' },
  { name: '危险色', value: 'danger', code: '#F56C6C' },
  { name: '信息色', value: 'info', code: '#909399' },
  { name: '文本色', value: 'text', code: '#303133' }
]

// 🎭 图标变体配置
const iconVariants = [
  { name: '填充', value: 'filled' },
  { name: '描边', value: 'outlined' },
  { name: '圆角', value: 'round' },
  { name: '尖锐', value: 'sharp' }
]

// 🎬 图标动画配置
const iconAnimations = [
  { name: '旋转', value: 'spin' },
  { name: '脉冲', value: 'pulse' },
  { name: '弹跳', value: 'bounce' },
  { name: '闪烁', value: 'fade' }
]

// 💼 业务菜单示例
const businessMenus = [
  { key: 'dashboard', title: '工作台', icon: 'dashboard' },
  { key: 'users', title: '用户管理', icon: 'users' },
  { key: 'projects', title: '项目管理', icon: 'project' },
  { key: 'orders', title: '订单管理', icon: 'order' },
  { key: 'settings', title: '系统设置', icon: 'settings' }
]

// 🔔 业务操作示例
const businessActions = [
  { key: 'add', title: '新增', icon: 'add', type: 'primary' },
  { key: 'edit', title: '编辑', icon: 'edit', type: 'success' },
  { key: 'delete', title: '删除', icon: 'delete', type: 'danger' },
  { key: 'export', title: '导出', icon: 'export', type: 'info' }
]

// 📊 业务状态示例
const businessStatuses = [
  { key: 'online', title: '在线', icon: 'success', color: 'success' },
  { key: 'processing', title: '处理中', icon: 'loading', color: 'warning' },
  { key: 'error', title: '错误', icon: 'error', color: 'danger' },
  { key: 'offline', title: '离线', icon: 'info', color: 'info' }
]

// 🔍 搜索分类配置
const searchCategories = [
  { label: '业务管理', value: IconCategory.BUSINESS },
  { label: '系统管理', value: IconCategory.SYSTEM },
  { label: '用户权限', value: IconCategory.USER },
  { label: '操作动作', value: IconCategory.ACTION },
  { label: '通用图标', value: IconCategory.COMMON }
]

// 💻 代码示例
const codeExamples = {
  basic: `<!-- 基础用法 -->
    <template>
      <EnterpriseIcon
        name="dashboard"
        size="lg"
        color="primary"
      />
      <EnterpriseIcon
        name="user"
        size="md"
        color="success"
      />
      <EnterpriseIcon
        name="settings"
        size="sm"
        animated
      />
    </template>`,
  
    advanced: `<!-- 高级用法 -->
    <template>
      <EnterpriseIcon 
        name="loading"
        size="xl"
        color="primary"
        variant="round"
        animation="spin"
        clickable
        @click="() => console.log('图标被点击')"
      />
    </template>`,
  
    composable: `// Composable 用法
    import { useEnterpriseIcon } from '@/composables/useEnterpriseIcon'

    const { 
    iconComponent, 
    iconStyles, 
    isLoaded 
    } = useEnterpriseIcon({
    name: 'dashboard',
    size: 'lg',
    color: 'primary',
    animated: true
    })`
    }

    // 🎯 方法定义
    const handleThemeChange = (mode: string) => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  
    if (mode === 'dark') {
    updateTheme({
    name: 'enterprise-dark',
    colors: {
    primary: '#529de6',
    success: '#7cd95a',
    warning: '#e8b563',
    danger: '#f78989',
    info: '#a6a9ad',
    text: '#e4e7ed'
    }
    })
    } else {
    updateTheme({
    name: 'enterprise-light',
    colors: {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399',
    text: '#303133'
    }
    })
    }
    }

    const handleAction = (action: string) => {
    ElMessage.success(`执行操作: ${action}`)
    }

    const handleIconClick = () => {
    console.log('图标被点击')
    }

    const updateCustomTheme = () => {
    updateTheme({
    colors: {
    primary: customTheme.primary
    }
    })
    }

    const toggleAnimation = (animation: string) => {
    animationStates[animation] = !animationStates[animation]
    }

    const handleIconSearch = async () => {
    if (searchQuery.value.trim()) {
    await searchIcons({
    query: searchQuery.value,
    category: searchCategory.value as IconCategory,
    enterpriseOnly: true,
    limit: 20
    })
    }
    }

    const copyIconUsage = async (iconName: string) => {
    const code = `<EnterpriseIcon
      name="${iconName}"
      size="md"
      color="primary"
    />`
  
    try {
    await navigator.clipboard.writeText(code)
    ElMessage.success(`已复制图标用法: ${iconName}`)
    } catch {
    ElMessage.error('复制失败')
    }
    }

    const selectIcon = (icon: any) => {
    selectedIcon.value = icon
    }

    const previewIcon = (icon: any) => {
    selectedIcon.value = icon
    previewDialogVisible.value = true
    }

    const clearFilters = () => {
    searchQuery.value = ''
    searchCategory.value = ''
    }

    const getCategoryIcon = (category: string) => {
    const categoryConfig = searchCategories.find(c => c.value === category)
    return categoryConfig?.label?.toLowerCase() || 'folder'
    }

    const getCategoryLabel = (category: string) => {
    const categoryConfig = searchCategories.find(c => c.value === category)
    return categoryConfig?.label || category
    }

    const getCategoryType = (category: string) => {
    const typeMap: Record<string, string>
      = {
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
        ${previewAnimated.value
        ?
        'animated'
        :
        ''}
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
      })
      </script>

      <style scoped>
        .icon-system-demo {
        padding: 24px;
        background: var(--el-bg-color-page);
        }

        /* 📋 页面标题 */
        .demo-header {
        margin-bottom: 32px;
        text-align: center;
        }

        .demo-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin: 0 0 16px 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        }

        .demo-description {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        line-height: 1.6;
        max-width: 600px;
        margin: 0 auto;
        }

        /* 📊 统计卡片 */
        .stats-section {
        margin-bottom: 32px;
        }

        .stat-card {
        height: 100%;
        }

        .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        }

        .stat-text {
        flex: 1;
        }

        .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        }

        .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        }

        /* 🎯 演示区域 */
        .demo-section {
        margin-bottom: 24px;
        }

        .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        }

        /* 📏 尺寸演示 */
        .size-demo {
        display: flex;
        gap: 32px;
        align-items: center;
        flex-wrap: wrap;
        }

        .size-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background: var(--el-bg-color);
        }

        .size-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        }

        .size-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        }

        .size-value {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        }

        /* 🎨 颜色演示 */
        .color-demo {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
        }

        .color-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background: var(--el-bg-color);
        }

        .color-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        }

        .color-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        }

        .color-code {
        font-size: 12px;
        font-family: monospace;
        color: var(--el-text-color-secondary);
        }

        /* 🎭 变体演示 */
        .variant-demo {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        }

        .variant-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background: var(--el-bg-color);
        }

        .variant-label {
        font-weight: 500;
        color: var(--el-text-color-primary);
        }

        /* 🎬 动画演示 */
        .animation-demo {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        }

        .animation-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background: var(--el-bg-color);
        }

        .animation-label {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        }

        /* 💼 业务演示 */
        .business-demo {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        }

        .business-example h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        }

        .menu-example {
        list-style: none;
        padding: 0;
        margin: 0;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        overflow: hidden;
        }

        .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        transition: background-color 0.3s;
        }

        .menu-item:last-child {
        border-bottom: none;
        }

        .menu-item:hover {
        background-color: var(--el-bg-color-page);
        }

        .menu-icon {
        flex-shrink: 0;
        }

        .button-example {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        }

        .status-example {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        }

        .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 6px;
        background: var(--el-bg-color);
        }

        /* 🔧 主题控制 */
        .theme-control {
        padding: 16px 0;
        }

        .control-group h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        }

        .color-picker-group {
        display: flex;
        align-items: center;
        gap: 8px;
        }

        /* 🔍 搜索演示 */
        .search-demo {
        display: flex;
        flex-direction: column;
        gap: 16px;
        }

        .search-controls {
        display: flex;
        gap: 12px;
        }

        .search-controls .el-input {
        flex: 1;
        }

        .search-controls .el-select {
        width: 200px;
        }

        .results-header {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 16px;
        }

        .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
        }

        .result-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background: var(--el-bg-color);
        cursor: pointer;
        transition: all 0.3s;
        }

        .result-item:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .result-name {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        text-align: center;
        }

        /* 💻 代码块 */
        .code-block {
        border-radius: 8px;
        overflow: hidden;
        }

        /* 📱 响应式 */
        @media (max-width: 768px) {
        .demo-title {
        font-size: 24px;
        flex-direction: column;
        gap: 8px;
        }
  
        .size-demo,
        .variant-demo {
        justify-content: center;
        }
  
        .business-demo {
        grid-template-columns: 1fr;
        }
  
        .search-controls {
        flex-direction: column;
        }
  
        .search-controls .el-select {
        width: 100%;
        }
        }
      </style>
    </string,>
  </div>
</template>