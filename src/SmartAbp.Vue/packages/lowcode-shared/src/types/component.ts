/**
 * 🏗️ 组件类型系统 - 统一类型定义
 * 
 * @description 避免循环依赖，所有组件相关类型在此集中定义
 * @packageDocumentation
 */

/**
 * 组件分类枚举
 * 
 * @description
 * 用于组件注册系统和AI智能分析系统的统一分类标准
 * 确保类型一致性，避免重复定义
 */
export type ComponentCategory =
    // 基础组件
    | 'basic'         // 基础UI组件
    | 'layout'        // 布局组件
    | 'form'          // 表单组件
    | 'data'          // 数据组件
    | 'chart'         // 图表组件
    | 'advanced'      // 高级组件

    // 业务组件
    | 'business'      // 业务组件
    | 'workflow'      // 工作流组件
    | 'utility'       // 工具组件

    // 设计器组件
    | 'designer'      // 设计器组件
    | 'inspector'     // 检查器组件
    | 'preview'       // 预览组件

    // 监控与模板
    | 'monitor'       // 监控组件
    | 'template'      // 模板组件

    // 代码生成
    | 'codegen'       // 代码生成组件

    // Aspire与安全
    | 'aspire'        // Aspire组件
    | 'security'      // 安全组件

    // 主题与建模
    | 'theme'         // 主题组件
    | 'modeling'      // 建模组件

    // 质量与方案
    | 'quality'       // 质量组件
    | 'solution'      // 解决方案组件
    | 'wizard'        // 向导组件

    // DevOps相关
    | 'resilience'    // 弹性组件
    | 'devops'        // DevOps组件
    | 'git'           // Git组件
    | 'cicd'          // CI/CD组件
    | 'code'          // 代码组件

    // 混沌与可观测
    | 'chaos'         // 混沌工程组件
    | 'observability' // 可观测性组件

    // 视图
    | 'view'          // 视图组件

/**
 * 加载优先级
 */
export type LoadPriority = 'high' | 'medium' | 'low'

/**
 * 组件加载策略
 */
export type LoadStrategy = 'eager' | 'lazy' | 'preload'

/**
 * 组件状态
 */
export type ComponentStatus =
    | 'pending'      // 待加载
    | 'loading'      // 加载中
    | 'loaded'       // 已加载
    | 'error'        // 加载失败
    | 'unloading'    // 卸载中
    | 'unloaded'     // 已卸载

/**
 * 组件基础元数据接口
 */
export interface ComponentBaseMetadata {
    /** 组件唯一名称 */
    name: string
    /** 组件显示名称 */
    displayName?: string
    /** 组件分类 */
    category: ComponentCategory
    /** 加载优先级 */
    priority?: LoadPriority
    /** 组件描述 */
    description?: string
    /** 组件标签 */
    tags?: string[]
    /** 组件版本 */
    version?: string
}

