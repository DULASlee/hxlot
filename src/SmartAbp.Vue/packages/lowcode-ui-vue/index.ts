// 🎨 SmartAbp 低代码UI组件库 - Vue3组件导出

// ===== UI组件导出 =====
export { default as MDIContainer } from './src/components/ui/MDIContainer.vue'
export { default as TabsContainer } from './src/components/ui/TabsContainer.vue'

// ===== 类型定义导出 =====
export type { MDIWindowConfig, TabConfig } from './src/types/ui'

// 默认导出
export default {
  version: '1.0.0',
  name: 'SmartAbp LowCode UI Vue Components'
}
