/**
 * 🚀 Vue Router自动加载机制
 * 
 * 功能：自动扫描并加载router/modules目录下的所有路由模块
 * 目的：解决代码生成后需要手动import路由的问题
 * 
 * 使用方式：
 * import { autoLoadModuleRoutes } from './auto-load'
 * const routes = autoLoadModuleRoutes()
 */

import type { RouteRecordRaw } from 'vue-router'

/**
 * 自动加载所有路由模块
 * 使用Vite的glob导入功能动态加载router/modules下的所有.ts文件
 * 
 * @returns 所有路由模块的合并数组
 */
export function autoLoadModuleRoutes(): RouteRecordRaw[] {
  console.log('🔄 开始自动加载路由模块...')
  
  // ✅ 使用Vite的import.meta.glob进行动态导入
  // eager: true 表示立即加载，不使用懒加载
  const modules = import.meta.glob<{ default: RouteRecordRaw[] }>('./modules/*.ts', { 
    eager: true 
  })
  
  const routes: RouteRecordRaw[] = []
  let loadedCount = 0
  
  // 遍历所有模块并提取路由
  Object.entries(modules).forEach(([path, module]) => {
    try {
      const routeModule = module.default
      
      if (!routeModule) {
        console.warn(`⚠️ 路由模块 ${path} 没有默认导出`)
        return
      }
      
      if (Array.isArray(routeModule)) {
        routes.push(...routeModule)
        loadedCount += routeModule.length
        console.log(`✅ 加载路由模块: ${path} (${routeModule.length}个路由)`)
      } else {
        console.warn(`⚠️ 路由模块 ${path} 的默认导出不是数组:`, routeModule)
      }
    } catch (error) {
      console.error(`❌ 加载路由模块失败: ${path}`, error)
    }
  })
  
  console.log(`✅ 路由自动加载完成: 共加载 ${loadedCount} 个路由，来自 ${Object.keys(modules).length} 个模块`)
  
  return routes
}

/**
 * 获取所有已加载的路由模块信息（用于调试）
 * 
 * @returns 路由模块信息数组
 */
export function getLoadedModuleInfo(): Array<{ path: string; routeCount: number; routes: string[] }> {
  const modules = import.meta.glob<{ default: RouteRecordRaw[] }>('./modules/*.ts', { 
    eager: true 
  })
  
  return Object.entries(modules).map(([path, module]) => {
    const routeModule = module.default || []
    const routes = Array.isArray(routeModule) 
      ? routeModule.map(r => r.path || r.name?.toString() || 'unnamed')
      : []
    
    return {
      path,
      routeCount: routes.length,
      routes
    }
  })
}

/**
 * 开发模式：打印路由加载信息
 */
export function printRouteLoadInfo(): void {
  if (import.meta.env.DEV) {
    const info = getLoadedModuleInfo()
    console.table(info)
    
    console.log('📋 详细路由信息:')
    info.forEach(({ path, routes }) => {
      console.log(`  ${path}:`)
      routes.forEach(route => {
        console.log(`    - ${route}`)
      })
    })
  }
}
