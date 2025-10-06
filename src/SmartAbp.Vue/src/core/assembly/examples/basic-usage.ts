/**
 * 装配件系统基础使用示例
 */

import { 
  createAssemblyManager, 
  createAssemblyConfig,
  StorageAdapterFactory,
  DefaultPluginBundle
} from '../index'

/**
 * 示例1: 基础使用
 */
async function basicUsageExample() {
  console.log('=== 基础使用示例 ===')
  
  // 创建装配件管理器
  const manager = await createAssemblyManager({
    storage: StorageAdapterFactory.createLocalStorage(),
    enablePlugins: true,
    autoLoad: true
  })

  // 创建用户管理模块配置
  const userModuleConfig = createAssemblyConfig({
    name: 'user-management',
    version: '1.0.0',
    description: '用户管理功能模块',
    entry: '/modules/user-management.js',
    type: 'module',
    dependencies: ['core-utils'],
    config: {
      apiEndpoint: '/api/users',
      pageSize: 20
    }
  })

  // 创建核心工具模块配置
  const coreUtilsConfig = createAssemblyConfig({
    name: 'core-utils',
    version: '1.0.0',
    description: '核心工具函数',
    entry: '/modules/core-utils.js',
    type: 'module',
    config: {
      logging: true,
      cache: true
    }
  })

  // 注册装配件配置
  await manager.registerAssembly(coreUtilsConfig)
  await manager.registerAssembly(userModuleConfig)

  // 加载核心工具模块
  const coreUtils = await manager.loadAssembly('core-utils')
  console.log('核心工具模块加载状态:', coreUtils.loaded)

  // 加载用户管理模块（会自动加载依赖）
  const userModule = await manager.loadAssembly('user-management')
  console.log('用户管理模块加载状态:', userModule.loaded)

  // 检查健康状态
  const health = await manager.checkAssemblyHealth('user-management')
  console.log('用户管理模块健康状态:', health.status)

  return manager
}

/**
 * 示例2: 事件监听
 */
function eventListeningExample(manager: any) {
  console.log('\n=== 事件监听示例 ===')
  
  // 监听加载完成事件
  manager.on('loaded', (event: any) => {
    console.log(`装配件 ${event.assemblyName} 加载完成`)
  })

  // 监听错误事件
  manager.on('error', (event: any) => {
    console.error(`装配件 ${event.assemblyName} 发生错误:`, event.error)
  })

  // 监听所有事件
  manager.on('*', (event: any) => {
    console.log(`事件类型: ${event.type}, 装配件: ${event.assemblyName}`)
  })
}

/**
 * 示例3: 依赖管理
 */
async function dependencyManagementExample(manager: any) {
  console.log('\n=== 依赖管理示例 ===')
  
  // 构建依赖关系图
  const graph = manager.buildDependencyGraph()
  console.log('依赖关系图:', {
    totalNodes: graph.nodes.size,
    rootNodes: graph.roots.length,
    hasCycles: graph.hasCycles,
    topologicalOrder: graph.topologicalOrder
  })

  // 获取所有装配件配置
  const configs = manager.getAllAssemblyConfigs()
  console.log('已注册的装配件:', configs.map((c: any) => c.name))

  // 获取所有装配件实例
  const instances = manager.getAllAssemblyInstances()
  console.log('已加载的装配件:', instances.map((i: any) => i.name))
}

/**
 * 示例4: 插件使用
 */
function pluginUsageExample(manager: any) {
  console.log('\n=== 插件使用示例 ===')
  
  // 获取性能插件
  const performancePlugin = manager.pluginManager?.getPlugin('performance-plugin')
  if (performancePlugin) {
    const metrics = performancePlugin.getMetrics()
    console.log('性能指标:', metrics)
  }

  // 获取依赖分析插件
  const dependencyPlugin = manager.pluginManager?.getPlugin('dependency-analysis-plugin')
  if (dependencyPlugin) {
    const analysis = dependencyPlugin.analyzeDependencies()
    console.log('依赖分析结果:', analysis)
  }
}

/**
 * 示例5: 存储适配器
 */
async function storageAdapterExample() {
  console.log('\n=== 存储适配器示例 ===')
  
  // 内存存储适配器（测试用）
  const memoryStorage = StorageAdapterFactory.createMemoryStorage()
  
  const memoryManager = await createAssemblyManager({
    storage: memoryStorage,
    enablePlugins: false
  })

  const testConfig = createAssemblyConfig({
    name: 'test-module',
    version: '1.0.0',
    entry: '/modules/test.js',
    type: 'module'
  })

  await memoryManager.registerAssembly(testConfig)
  console.log('内存存储测试完成')

  // 索引数据库存储适配器（生产环境）
  if (typeof window !== 'undefined' && window.indexedDB) {
    const indexedDBStorage = StorageAdapterFactory.createIndexedDBStorage()
    const indexedDBManager = await createAssemblyManager({
      storage: indexedDBStorage
    })
    console.log('索引数据库存储适配器初始化完成')
  }
}

/**
 * 示例6: 错误处理
 */
async function errorHandlingExample(manager: any) {
  console.log('\n=== 错误处理示例 ===')
  
  try {
    // 尝试加载不存在的装配件
    await manager.loadAssembly('non-existent-module')
  } catch (error) {
    console.log('预期的错误处理:', error.message)
  }

  try {
    // 创建无效配置
    const invalidConfig = createAssemblyConfig({
      name: 'invalid-module',
      version: '1.0.0',
      entry: '', // 无效的入口
      type: 'module'
    })

    const validation = manager.validateAssembly(invalidConfig)
    console.log('配置验证结果:', validation)
  } catch (error) {
    // ✅ 修复: error类型为unknown,需要类型守卫
    console.log('配置验证错误:', error instanceof Error ? error.message : String(error))
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const manager = await basicUsageExample()
    eventListeningExample(manager)
    await dependencyManagementExample(manager)
    pluginUsageExample(manager)
    await storageAdapterExample()
    await errorHandlingExample(manager)
    
    console.log('\n=== 所有示例执行完成 ===')
  } catch (error) {
    console.error('示例执行失败:', error)
  }
}

// 导出示例函数供其他模块使用
export {
  basicUsageExample,
  eventListeningExample,
  dependencyManagementExample,
  pluginUsageExample,
  storageAdapterExample,
  errorHandlingExample,
  main
}

export default main