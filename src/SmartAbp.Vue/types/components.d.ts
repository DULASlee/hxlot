/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🌟 虚拟程序集 - TypeScript类型声明（自动生成）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * ⚠️  警告：此文件自动生成，请勿手动修改！
 * 
 * 生成时间: 2025-10-09T17:00:00.000Z
 * 组件数量: 示例（实际数量由生成器自动更新）
 * 生成器版本: 2.0.0
 * 
 * 使用方式：
 * ```typescript
 * import { Components } from '@smartabp/lowcode-shared'
 * 
 * const SmartForm = Components.SmartForm  // ✅ 自动类型提示
 * ```
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

declare module '@smartabp/lowcode-shared' {
  import type { Component } from 'vue'

  /**
   * 全局组件接口
   * 
   * 通过虚拟程序集访问所有组件：
   * ```typescript
   * import { Components } from '@smartabp/lowcode-shared'
   * const form = Components.SmartForm
   * ```
   */
  export interface GlobalComponents {
    /** 基础按钮组件 */
    BaseButton: Component
    /** 基础输入框组件 */
    BaseInput: Component
    /** 基础选择器组件 */
    BaseSelect: Component
    /** 基础表单组件 */
    BaseForm: Component
    /** 基础表格组件 */
    BaseTable: Component
    /** 基础对话框组件 */
    BaseDialog: Component
    /** 基础加载组件 */
    BaseLoading: Component
    
    // 注意：实际组件列表由TypeDefinitionGenerator自动生成
    // 上面是示例组件，生成器会自动替换为实际注册的组件
  }

  /**
   * 虚拟程序集 - 全局组件代理对象
   * 
   * 特性：
   * - ✅ 零配置自动加载
   * - ✅ LRU缓存优化
   * - ✅ 完整类型支持
   * - ✅ 按需加载
   */
  export const Components: GlobalComponents
}

/**
 * Vue全局组件类型增强
 * 
 * 使Vue模板中可以直接使用组件名
 */
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    BaseButton: typeof import('@smartabp/lowcode-shared').Components.BaseButton
    BaseInput: typeof import('@smartabp/lowcode-shared').Components.BaseInput
    BaseSelect: typeof import('@smartabp/lowcode-shared').Components.BaseSelect
    BaseForm: typeof import('@smartabp/lowcode-shared').Components.BaseForm
    BaseTable: typeof import('@smartabp/lowcode-shared').Components.BaseTable
    BaseDialog: typeof import('@smartabp/lowcode-shared').Components.BaseDialog
    BaseLoading: typeof import('@smartabp/lowcode-shared').Components.BaseLoading
    
    // 注意：实际组件列表由TypeDefinitionGenerator自动生成
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📖 使用示例
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 示例1：基础使用
 * ```vue
 * <script setup lang="ts">
 * import { Components } from '@smartabp/lowcode-shared'
 * 
 * const SmartForm = Components.SmartForm
 * const DataTable = Components.DataTable
 * </script>
 * 
 * <template>
 *   <SmartForm />
 *   <DataTable />
 * </template>
 * ```
 * 
 * 示例2：动态组件
 * ```vue
 * <script setup lang="ts">
 * import { ref, computed } from 'vue'
 * import { Components } from '@smartabp/lowcode-shared'
 * 
 * const componentName = ref('SmartForm')
 * const DynamicComponent = computed(() => Components[componentName.value])
 * </script>
 * 
 * <template>
 *   <component :is="DynamicComponent" />
 * </template>
 * ```
 * 
 * 示例3：条件渲染
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { Components } from '@smartabp/lowcode-shared'
 * 
 * const showForm = ref(false)
 * </script>
 * 
 * <template>
 *   <component v-if="showForm" :is="Components.SmartForm" />
 * </template>
 * ```
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

