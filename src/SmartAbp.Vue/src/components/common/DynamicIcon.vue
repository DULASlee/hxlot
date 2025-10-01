<!--
  🎨 SmartAbp 动态图标组件
  
  功能：
  - 根据图标键名自动渲染对应图标风格
  - 响应式切换图标风格（无需刷新）
  - 自动处理 emoji 和图标类的不同渲染方式
  - 配置驱动，符合开闭原则
  - 支持多种图标库（Font Awesome, Element Plus Icons, Carbon, Material）
  
  使用示例：
  <DynamicIcon icon="dashboard" />
  <DynamicIcon icon="user" :size="24" />
-->
<template>
  <!-- 🛡️ 错误fallback：图标加载失败时显示 -->
  <el-icon
    v-if="iconLoadError"
    class="dynamic-icon dynamic-icon--error"
    :style="iconStyle"
    :title="`图标加载失败: ${props.icon}`"
  >
    <QuestionFilled />
  </el-icon>
  
  <!-- Emoji 图标 -->
  <span
    v-else-if="isEmoji"
    class="dynamic-icon dynamic-icon--emoji"
    :style="iconStyle"
  >
    {{ iconValue }}
  </span>
  
  <!-- Element Plus 图标组件 -->
  <el-icon
    v-else-if="isElementPlusIcon"
    class="dynamic-icon dynamic-icon--el"
    :style="iconStyle"
  >
    <component
      :is="elementIconComponent"
      @error="handleIconError"
    />
  </el-icon>
  
  <!-- Iconify 渲染（carbon / material），统一走主题样式token -->
  <Icon
    v-else-if="isIconifyIcon && iconifyName"
    :icon="iconifyName"
    :style="iconStyle"
    class="dynamic-icon dynamic-icon--iconify"
  />
  
  <!-- Font Awesome / 其他字体图标 -->
  <i
    v-else
    :class="['dynamic-icon', 'dynamic-icon--font', iconValue]"
    :style="iconStyle"
  />
</template>

<script setup lang="ts">
import { computed, markRaw, ref, watch } from 'vue'
import { useIconStyleStore } from '@/stores'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

// 🎯 组件属性
interface Props {
  /** 图标键名（如 'dashboard', 'user', 'settings'） */
  icon?: string
  /** 图标大小（px），默认继承父元素 */
  size?: number | string
  /** 图标颜色，默认继承父元素 */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '', // 默认空字符串，会在 getIcon 中处理
  size: undefined,
  color: undefined
})

// 🏪 图标风格 Store
const iconStyleStore = useIconStyleStore()

// 🛡️ 错误状态
const iconLoadError = ref(false)

// 🎨 获取当前图标值
const iconValue = computed(() => {
  // 处理空值情况
  if (!props.icon) {
    return iconStyleStore.currentStyle === 'emoji' ? '🔘' : 'fa-solid fa-circle'
  }
  
  try {
    return iconStyleStore.getIcon(props.icon) || ''
  } catch (error) {
    console.warn(`⚠️ 图标获取失败: ${props.icon}`, error)
    return ''
  }
})

// 🎭 判断是否为 Emoji
const isEmoji = computed(() => {
  return iconStyleStore.currentStyle === 'emoji'
})

// 🎨 判断是否为 Element Plus 图标
const isElementPlusIcon = computed(() => {
  return iconStyleStore.currentStyle === 'element-plus'
})

// 🎨 判断是否为 Iconify 图标（carbon / material）
const isIconifyIcon = computed(() => {
  return iconStyleStore.currentStyle === 'carbon' || iconStyleStore.currentStyle === 'material'
})

// 🎯 Element Plus 图标名称映射（个别别名覆盖）
const elementIconNameMap: Record<string, string> = {
  // 兼容：旧类名解析后直接是键名（fa-chart-line → chart-line → ep-data-line）
  'chart-line': 'DataLine',
  'dashboard': 'DataLine',
  'ep-data-line': 'DataLine',
  'ep-pie-chart': 'PieChart',
  'ep-histogram': 'Histogram',
  'ep-user': 'User',
  'ep-user-filled': 'UserFilled',
  'ep-avatar': 'Avatar',
  'ep-folder': 'Folder',
  'ep-document-checked': 'DocumentChecked',
  'ep-document': 'Document',
  'ep-document-blank': 'DocumentBlank',
  'ep-menu': 'Menu',
  'ep-view': 'View',
  'ep-setting': 'Setting',
  'ep-key': 'Key',
  'ep-orange': 'Orange',
  'ep-test-tube': 'TestTube',
  'ep-warning': 'Warning',
  'ep-connection': 'Connection',
  'ep-box': 'Box',
  'ep-document-copy': 'DocumentCopy',
  'ep-magic-stick': 'MagicStick',
  'ep-pointer': 'Pointer',
  'ep-coin': 'Coin',
  'ep-brush': 'Brush',
  'ep-home-filled': 'HomeFilled',
  'ep-question-filled': 'QuestionFilled',
  'ep-picture': 'Picture',
  'ep-odometer': 'Odometer',
  'ep-right': 'Right',
  'ep-plus': 'Plus',
  'ep-edit': 'Edit',
  'ep-delete': 'Delete',
  'ep-search': 'Search',
  'ep-refresh': 'Refresh',
}

// 将 ep-user-filled / ep-user → UserFilled / User
const toElementPlusPascal = (epName: string): string | null => {
  const match = epName.match(/^ep-(.+)$/)
  const base = match ? match[1] : epName
  if (!base) return null
  return base
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

// 🎨 动态加载 Element Plus 图标组件（纯计算，无副作用）
const elementIconComponent = computed(() => {
  if (!isElementPlusIcon.value) return null
  
  // 优先使用显式映射；否则基于命名规则自动推断组件名
  const explicit = elementIconNameMap[iconValue.value]
  const inferred = toElementPlusPascal(iconValue.value)
  const iconName = explicit || inferred
  if (!iconName) return markRaw(QuestionFilled)
  
  const IconComponent = (ElementPlusIcons as any)[iconName]
  if (!IconComponent) {
    console.warn(`⚠️ Element Plus 图标组件不存在: ${iconName}`)
    return markRaw(QuestionFilled)
  }
  
  return markRaw(IconComponent)
})

// 🔄 规范化 Iconify 图标名（配置驱动：从映射值派生，不改业务配置）
const iconifyName = computed(() => {
  const value = iconValue.value
  if (!value) return ''
  if (value.includes(':')) return value
  // 支持 "carbon-xxx" / "mdi-xxx" 转换为 "carbon:xxx" / "mdi:xxx"
  if (value.startsWith('carbon-')) return value.replace(/^carbon-/, 'carbon:')
  if (value.startsWith('mdi-')) return value.replace(/^mdi-/, 'mdi:')
  return value
})

// 🛡️ 错误处理函数
const handleIconError = () => {
  console.warn(`⚠️ 图标加载失败，显示fallback: ${props.icon}`)
  iconLoadError.value = true
}

// 📐 图标样式
const iconStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.size) {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
    style.fontSize = sizeValue
    if (isEmoji.value) {
      style.width = sizeValue
      style.height = sizeValue
    }
  }
  
  if (props.color) {
    style.color = props.color
  }
  
  return style
})

// 🛡️ 监听图标加载错误（副作用在watcher中处理，而非computed）
watch([iconValue, elementIconComponent], ([icon, component]) => {
  // 重置错误状态
  iconLoadError.value = false
  
  // 检查iconValue是否为空（可能是getIcon失败）
  if (!icon && props.icon) {
    iconLoadError.value = true
    return
  }
  
  // 检查Element Plus图标组件是否是fallback
  if (isElementPlusIcon.value && component?.type?.name === 'QuestionFilled') {
    iconLoadError.value = true
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.dynamic-icon {
  display: inline-block;
  line-height: 1;
  transition: all 0.3s ease;
}

.dynamic-icon--emoji {
  text-align: center;
  font-style: normal;
  user-select: none;
}

.dynamic-icon--font {
  /* 图标字体样式继承 */
}
</style>

