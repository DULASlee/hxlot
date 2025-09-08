import { z } from 'zod'

// 路由配置 Schema
export const RouteSchema = z.object({
  name: z.string().min(1).regex(/^[A-Z][a-zA-Z0-9]+$/),
  path: z.string().startsWith('/'),
  component: z.string().startsWith('@/'),
  meta: z
    .object({
      title: z.string().optional(),
      icon: z.string().optional(),
      policy: z.string().optional(),
      keepAlive: z.boolean().optional(),
      hidden: z.boolean().optional(),
      order: z.number().int().optional()
    })
    .optional()
})

// Pinia Store 配置 Schema
export const StoreSchema = z.object({
  symbol: z.string().regex(/^use[A-Z]\w+Store$/),
  id: z.string().min(1).regex(/^[a-z][a-z0-9-]*$/),
  modulePath: z.string().startsWith('@/')
})

// 生命周期钩子路径 Schema
export const LifecycleSchema = z.object({
  preInit: z.string().startsWith('@/').optional(),
  init: z.string().startsWith('@/').optional(),
  postInit: z.string().startsWith('@/').optional(),
  beforeMount: z.string().startsWith('@/').optional(),
  mounted: z.string().startsWith('@/').optional()
})

// 权限策略 Schema
export const PolicySchema = z.string().regex(/^[A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*)?$/)

// 模块 Manifest Schema
export const ManifestSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().min(1).regex(/^[A-Z][a-zA-Z0-9]+$/),
  displayName: z.string().optional(),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  author: z.string().optional(),
  abpStyle: z.boolean().default(true),
  order: z.number().int().min(0).default(100),
  dependsOn: z.array(z.string()).default([]),
  routes: z.array(RouteSchema).default([]),
  stores: z.array(StoreSchema).default([]),
  policies: z.array(PolicySchema).default([]),
  lifecycle: LifecycleSchema.default({}),
  features: z
    .object({
      enableAuth: z.boolean().default(true),
      enableCache: z.boolean().default(true),
      enableI18n: z.boolean().default(true)
    })
    .optional()
})

// 类型导出
export type Manifest = z.infer<typeof ManifestSchema>
export type Route = z.infer<typeof RouteSchema>
export type Store = z.infer<typeof StoreSchema>
export type Lifecycle = z.infer<typeof LifecycleSchema>
