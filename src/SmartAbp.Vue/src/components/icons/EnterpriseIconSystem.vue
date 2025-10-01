<!--
🏢 SmartAbp 企业级图标系统核心组件
🎯 统一的图标管理和使用规范
⚡ 高性能加载和缓存策略
🎨 企业级视觉设计标准
-->
<template>
  <component
    :is="iconComponent"
    :class="iconClasses"
    :style="iconStyles"
    v-bind="componentProps"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { Component } from 'vue'

// 🎯 图标系统接口定义
export interface IconProps {
  /** 图标名称 */
  name: string
  /** 图标大小 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  /** 图标颜色主题 */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | string
  /** 图标变体 */
  variant?: 'filled' | 'outlined' | 'round' | 'sharp'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可点击 */
  clickable?: boolean
  /** 自定义类名 */
  class?: string
  /** 图标动画 */
  animation?: 'spin' | 'pulse' | 'bounce' | 'fade' | 'none'
  /** 是否显示工具提示 */
  tooltip?: string
}

// 🏢 企业级图标映射表
const ENTERPRISE_ICONS = {
  // 🏠 工作台相关
  'dashboard': { component: 'DashboardIcon', fallback: 'fas fa-tachometer-alt' },
  'workspace': { component: 'WorkspaceIcon', fallback: 'fas fa-desktop' },
  'overview': { component: 'OverviewIcon', fallback: 'fas fa-chart-line' },
  'quickstart': { component: 'QuickstartIcon', fallback: 'fas fa-rocket' },
  
  // 💼 业务管理
  'business': { component: 'BusinessIcon', fallback: 'fas fa-briefcase' },
  'project': { component: 'ProjectIcon', fallback: 'fas fa-project-diagram' },
  'order': { component: 'OrderIcon', fallback: 'fas fa-shopping-cart' },
  'customer': { component: 'CustomerIcon', fallback: 'fas fa-users' },
  'contract': { component: 'ContractIcon', fallback: 'fas fa-file-contract' },
  'invoice': { component: 'InvoiceIcon', fallback: 'fas fa-file-invoice' },
  
  // 📊 数据管理
  'database': { component: 'DatabaseIcon', fallback: 'fas fa-database' },
  'table': { component: 'TableIcon', fallback: 'fas fa-table' },
  'chart': { component: 'ChartIcon', fallback: 'fas fa-chart-bar' },
  'analytics': { component: 'AnalyticsIcon', fallback: 'fas fa-analytics' },
  'report': { component: 'ReportIcon', fallback: 'fas fa-file-alt' },
  
  // 👥 用户权限
  'user': { component: 'UserIcon', fallback: 'fas fa-user' },
  'users': { component: 'UsersIcon', fallback: 'fas fa-users' },
  'role': { component: 'RoleIcon', fallback: 'fas fa-user-tag' },
  'permission': { component: 'PermissionIcon', fallback: 'fas fa-shield-alt' },
  'security': { component: 'SecurityIcon', fallback: 'fas fa-lock' },
  
  // ⚙️ 系统设置
  'settings': { component: 'SettingsIcon', fallback: 'fas fa-cogs' },
  'config': { component: 'ConfigIcon', fallback: 'fas fa-sliders-h' },
  'logs': { component: 'LogsIcon', fallback: 'fas fa-history' },
  'monitor': { component: 'MonitorIcon', fallback: 'fas fa-desktop' },
  'backup': { component: 'BackupIcon', fallback: 'fas fa-hdd' },
  
  // 🛠️ 开发工具
  'code': { component: 'CodeIcon', fallback: 'fas fa-code' },
  'lowcode': { component: 'LowCodeIcon', fallback: 'fas fa-magic' },
  'generator': { component: 'GeneratorIcon', fallback: 'fas fa-cog' },
  'template': { component: 'TemplateIcon', fallback: 'fas fa-file-code' },
  'api': { component: 'ApiIcon', fallback: 'fas fa-plug' },
  
  // 📋 操作动作
  'add': { component: 'AddIcon', fallback: 'fas fa-plus' },
  'edit': { component: 'EditIcon', fallback: 'fas fa-edit' },
  'delete': { component: 'DeleteIcon', fallback: 'fas fa-trash' },
  'search': { component: 'SearchIcon', fallback: 'fas fa-search' },
  'filter': { component: 'FilterIcon', fallback: 'fas fa-filter' },
  'refresh': { component: 'RefreshIcon', fallback: 'fas fa-sync' },
  'save': { component: 'SaveIcon', fallback: 'fas fa-save' },
  'cancel': { component: 'CancelIcon', fallback: 'fas fa-times' },
  'confirm': { component: 'ConfirmIcon', fallback: 'fas fa-check' },
  'upload': { component: 'UploadIcon', fallback: 'fas fa-upload' },
  'download': { component: 'DownloadIcon', fallback: 'fas fa-download' },
  'export': { component: 'ExportIcon', fallback: 'fas fa-file-export' },
  'import': { component: 'ImportIcon', fallback: 'fas fa-file-import' },
  
  // 📁 导航控制
  'expand': { component: 'ExpandIcon', fallback: 'fas fa-chevron-down' },
  'collapse': { component: 'CollapseIcon', fallback: 'fas fa-chevron-up' },
  'next': { component: 'NextIcon', fallback: 'fas fa-chevron-right' },
  'prev': { component: 'PrevIcon', fallback: 'fas fa-chevron-left' },
  'close': { component: 'CloseIcon', fallback: 'fas fa-times' },
  'menu': { component: 'MenuIcon', fallback: 'fas fa-bars' },
  
  // 🔔 状态提示
  'success': { component: 'SuccessIcon', fallback: 'fas fa-check-circle' },
  'warning': { component: 'WarningIcon', fallback: 'fas fa-exclamation-triangle' },
  'error': { component: 'ErrorIcon', fallback: 'fas fa-times-circle' },
  'info': { component: 'InfoIcon', fallback: 'fas fa-info-circle' },
  'loading': { component: 'LoadingIcon', fallback: 'fas fa-spinner' },
  
  // 📱 通用图标
  'home': { component: 'HomeIcon', fallback: 'fas fa-home' },
  'folder': { component: 'FolderIcon', fallback: 'fas fa-folder' },
  'file': { component: 'FileIcon', fallback: 'fas fa-file' },
  'link': { component: 'LinkIcon', fallback: 'fas fa-link' },
  'calendar': { component: 'CalendarIcon', fallback: 'fas fa-calendar' },
  'clock': { component: 'ClockIcon', fallback: 'fas fa-clock' },
  'bell': { component: 'BellIcon', fallback: 'fas fa-bell' },
  'email': { component: 'EmailIcon', fallback: 'fas fa-envelope' },
  'phone': { component: 'PhoneIcon', fallback: 'fas fa-phone' },
  'location': { component: 'LocationIcon', fallback: 'fas fa-map-marker-alt' }
}

// 🎨 图标样式主题
const ICON_THEMES = {
  primary: 'var(--el-color-primary)',
  success: 'var(--el-color-success)', 
  warning: 'var(--el-color-warning)',
  danger: 'var(--el-color-danger)',
  info: 'var(--el-color-info)',
  text: 'var(--el-text-color-regular)'
}

// 📏 图标尺寸映射
const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24
}

// Props 定义
const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
  color: 'text',
  variant: 'filled',
  disabled: false,
  clickable: false,
  animation: 'none'
})

// Emits 定义
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 🔍 图标组件解析
const iconComponent = computed<Component | string>(() => {
  const iconConfig = ENTERPRISE_ICONS[props.name as keyof typeof ENTERPRISE_ICONS]
  
  if (!iconConfig) {
    console.warn(`🚨 未找到图标: ${props.name}`)
    return 'i' // 返回空的 i 标签
  }
  
  // 尝试加载自定义图标组件，如果不存在则使用FontAwesome回退
  try {
    return defineAsyncComponent(() => 
      import(`./enterprise/${iconConfig.component}.vue`).catch(() => {
        // 如果自定义图标不存在，使用 FontAwesome 回退
        console.info(`📦 使用FontAwesome回退: ${iconConfig.fallback} for ${props.name}`)
        return Promise.resolve({
          template: `<i class="${iconConfig.fallback}" style="font-size: inherit; color: inherit;"></i>`
        })
      })
    )
  } catch {
    // 最终回退方案
    return 'i'
  }
})

// 🎨 动态样式计算
const iconClasses = computed(() => {
  const classes = ['enterprise-icon']
  
  // 添加自定义类名
  if (props.class) {
    classes.push(props.class)
  }
  
  // 添加状态类名
  if (props.disabled) {
    classes.push('enterprise-icon--disabled')
  }
  
  if (props.clickable) {
    classes.push('enterprise-icon--clickable')
  }
  
  // 添加动画类名
  if (props.animation !== 'none') {
    classes.push(`enterprise-icon--${props.animation}`)
  }
  
  // 添加变体类名
  classes.push(`enterprise-icon--${props.variant}`)
  
  return classes
})

// 📐 动态样式对象
const iconStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 设置尺寸
  const size = typeof props.size === 'number' 
    ? props.size 
    : ICON_SIZES[props.size]
  
  styles.width = `${size}px`
  styles.height = `${size}px`
  styles.fontSize = `${size}px`
  
  // 设置颜色
  if (props.color in ICON_THEMES) {
    styles.color = ICON_THEMES[props.color as keyof typeof ICON_THEMES]
  } else {
    styles.color = props.color
  }
  
  return styles
})

// 🔧 组件属性传递
const componentProps = computed(() => {
  return {
    size: props.size,
    disabled: props.disabled,
    title: props.tooltip
  }
})

// 🖱️ 点击事件处理
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 🎨 企业级图标基础样式 */
.enterprise-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  vertical-align: middle;
  flex-shrink: 0;
}

/* 🖱️ 可点击状态 */
.enterprise-icon--clickable {
  cursor: pointer;
}

.enterprise-icon--clickable:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

/* 🚫 禁用状态 */
.enterprise-icon--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 🎭 图标变体样式 */
.enterprise-icon--filled {
  /* 填充样式 */
}

.enterprise-icon--outlined {
  /* 描边样式 */
  filter: brightness(0) saturate(100%);
}

.enterprise-icon--round {
  /* 圆角样式 */
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.04);
  padding: 2px;
}

.enterprise-icon--sharp {
  /* 尖锐样式 */
  filter: contrast(1.2);
}

/* 🎬 动画效果 */
.enterprise-icon--spin {
  animation: enterprise-icon-spin 1s linear infinite;
}

.enterprise-icon--pulse {
  animation: enterprise-icon-pulse 1.5s ease-in-out infinite;
}

.enterprise-icon--bounce {
  animation: enterprise-icon-bounce 1s ease-in-out infinite;
}

.enterprise-icon--fade {
  animation: enterprise-icon-fade 2s ease-in-out infinite;
}

/* 🎞️ 关键帧动画 */
@keyframes enterprise-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes enterprise-icon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes enterprise-icon-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-3px); }
}

@keyframes enterprise-icon-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 🌓 暗色主题支持 */
.dark .enterprise-icon {
  filter: brightness(1.2);
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .enterprise-icon {
    /* 移动端适配 */
    transform-origin: center;
  }
}

/* ♿ 无障碍支持 */
.enterprise-icon:focus {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* 🔧 高对比度模式 */
@media (prefers-contrast: high) {
  .enterprise-icon {
    filter: contrast(1.5);
  }
}

/* 🎨 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  .enterprise-icon,
  .enterprise-icon--spin,
  .enterprise-icon--pulse,
  .enterprise-icon--bounce,
  .enterprise-icon--fade {
    animation: none !important;
    transition: none !important;
  }
}
</style>
