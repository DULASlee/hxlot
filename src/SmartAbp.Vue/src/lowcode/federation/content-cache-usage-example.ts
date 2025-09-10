/**
 * 内容寻址缓存使用示例
 *
 * 演示SmartAbp低代码引擎中如何使用增量编译缓存
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */

import {
  ContentAddressableCache,
  IncrementalCompilationCache,
  globalCompilationCache
} from './content-cache'
import {
  CachedPluginWrapper,
  CacheManager,
  enableCacheDebug
} from './content-cache-integration'

/**
 * 示例1: 基础内容寻址缓存使用
 */
async function basicContentCacheExample() {
  console.log('=== 基础内容寻址缓存示例 ===')

  const cache = new ContentAddressableCache()

  // 1. 计算内容哈希并缓存
  const content1 = 'console.log("Hello World")'
  const content2 = 'console.log("Hello SmartAbp")'
  const content3 = 'console.log("Hello World")' // 与content1相同

  const hash1 = await cache.keyOf(content1)
  const hash2 = await cache.keyOf(content2)
  const hash3 = await cache.keyOf(content3)

  console.log(`内容1哈希: ${hash1}`)
  console.log(`内容2哈希: ${hash2}`)
  console.log(`内容3哈希: ${hash3}`)
  console.log(`内容1和3哈希相同: ${hash1 === hash3}`) // true，内容相同

  // 2. 存储和获取
  cache.set(hash1, new TextEncoder().encode(content1))
  cache.set(hash2, new TextEncoder().encode(content2))

  const retrieved1 = cache.getWithStats(hash1)
  const retrieved3 = cache.getWithStats(hash3) // 使用相同的哈希

  console.log(`检索成功: ${retrieved1 !== undefined}`)
  console.log(`去重效果: ${retrieved1 === retrieved3}`) // 实际上是引用相同的缓存

  // 3. 缓存统计
  const stats = cache.getStats()
  console.log(`缓存统计:`, {
    总条目数: stats.totalEntries,
    总大小: `${stats.totalSizeBytes} bytes`,
    平均大小: `${Math.round(stats.averageEntrySize)} bytes/条目`,
    总访问次数: stats.totalAccessCount
  })
}

/**
 * 示例2: 增量编译缓存使用
 */
async function incrementalCompilationExample() {
  console.log('\n=== 增量编译缓存示例 ===')

  const compilationCache = new IncrementalCompilationCache()

  // 1. 模拟schema和编译过程
  const userFormSchema = {
    type: 'form',
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'password', type: 'password', required: true }
    ],
    submitAction: 'create-user'
  }

  const pluginVersion = '1.0.0'
  const compilationOptions = {
    target: 'vue3',
    typescript: true,
    cssFramework: 'tailwind'
  }

  // 2. 第一次编译（缓存未命中）
  console.log('第一次编译...')
  let cached = await compilationCache.checkCompilation(userFormSchema, pluginVersion, compilationOptions)
  console.log(`缓存命中: ${cached !== null}`) // false

  // 模拟编译过程
  const compiledCode = `
    // 编译生成的Vue组件代码
    export default {
      name: 'UserForm',
      setup() {
        const username = ref('')
        const email = ref('')
        const password = ref('')

        const submit = async () => {
          await createUser({ username: username.value, email: email.value, password: password.value })
        }

        return { username, email, password, submit }
      }
    }
  `

  const cacheKey = await compilationCache.cacheCompilation(
    userFormSchema,
    pluginVersion,
    compiledCode,
    {
      componentCount: 1,
      dependencyCount: 3,
      buildTime: 156
    },
    compilationOptions
  )
  console.log(`编译完成，缓存键: ${cacheKey}`)

  // 3. 第二次编译（相同schema，缓存命中）
  console.log('\n第二次编译相同schema...')
  cached = await compilationCache.checkCompilation(userFormSchema, pluginVersion, compilationOptions)
  console.log(`缓存命中: ${cached !== null}`) // true
  console.log(`从缓存获取的代码长度: ${cached?.code.length} 字符`)
  console.log(`编译时间: ${cached?.compiledAt}`)

  // 4. 修改schema后编译（缓存未命中）
  const modifiedSchema = {
    ...userFormSchema,
    fields: [
      ...userFormSchema.fields,
      { name: 'phone', type: 'tel', required: false } // 添加新字段
    ]
  }

  console.log('\n编译修改后的schema...')
  cached = await compilationCache.checkCompilation(modifiedSchema, pluginVersion, compilationOptions)
  console.log(`缓存命中: ${cached !== null}`) // false，schema发生变化

  // 5. 缓存统计
  const stats = compilationCache.getStats()
  console.log('\n编译缓存统计:', {
    编译条目数: stats.compilationEntries,
    命中率: `${(stats.hitRatio * 100).toFixed(1)}%`,
    内存使用: `${(stats.memoryUsageBytes / 1024).toFixed(1)} KB`
  })
}

/**
 * 示例3: 插件缓存包装器使用
 */
async function pluginWrapperExample() {
  console.log('\n=== 插件缓存包装器示例 ===')

  // 模拟一个Vue3代码生成插件
  const mockVue3Plugin = {
    metadata: {
      name: 'vue3-generator',
      version: '2.1.0',
      target: ['vue3' as import('../kernel/types').FrameworkTarget],
      dependencies: [],
      peerDependencies: [],
      capabilities: [] as import('../kernel/types').PluginCapability[] // 简化处理，使用空数组
    },
    canHandle: async () => true,
    generate: async (schema: any) => {
      // 模拟编译延迟
      await new Promise(resolve => setTimeout(resolve, 100))

      return {
        code: `// Generated Vue 3 component for ${schema.name}\nexport default { name: '${schema.name}' }`,
        dependencies: ['vue'],
        metadata: {
          framework: 'vue3' as import('../kernel/types').FrameworkTarget,
          language: 'typescript' as 'typescript' | 'javascript',
          generatedAt: Date.now(),
          checksum: 'mock-checksum',
          size: 150
        }
      }
    }
  }

  // 使用缓存包装器
  const cachedPlugin = new CachedPluginWrapper(mockVue3Plugin, true)

  const mockContext = {
    logger: {
      info: console.log,
      warn: console.warn,
      error: console.error
    }
  }

  const componentSchema = {
    id: 'user-profile-component',
    version: '1.0.0',
    metadata: {
      name: 'UserProfile',
      type: 'component',
      description: 'User profile component'
    },
    name: 'UserProfile',
    type: 'component' as 'component' | 'page' | 'layout' | 'module',
    props: ['userId'],
    template: '<div>User Profile</div>'
  }

  // 第一次生成（执行实际编译）
  console.log('第一次生成...')
  const startTime1 = Date.now()
  const result1 = await cachedPlugin.generate(componentSchema, {}, mockContext as any)
  const time1 = Date.now() - startTime1
  console.log(`生成时间: ${time1}ms`)
  console.log(`代码长度: ${result1.code.length} 字符`)

  // 第二次生成（从缓存获取）
  console.log('\n第二次生成相同schema...')
  const startTime2 = Date.now()
  const result2 = await cachedPlugin.generate(componentSchema, {}, mockContext as any)
  const time2 = Date.now() - startTime2
  console.log(`生成时间: ${time2}ms (应该更快)`)
  console.log(`代码相同: ${result1.code === result2.code}`)

  // 缓存统计
  const cacheStats = cachedPlugin.getCacheStats()
  console.log('\n插件缓存统计:', {
    编译条目: cacheStats.compilationEntries,
    内容条目: cacheStats.contentCacheStats.totalEntries,
    命中率: `${(cacheStats.hitRatio * 100).toFixed(1)}%`
  })
}

/**
 * 示例4: 缓存管理和健康监控
 */
async function cacheManagementExample() {
  console.log('\n=== 缓存管理示例 ===')

  // 健康度报告
  const healthReport = CacheManager.getHealthReport()
  console.log('缓存健康度报告:', {
    总条目数: healthReport.totalEntries,
    内存使用率: `${(healthReport.memoryUsage.utilization * 100).toFixed(1)}%`,
    命中率: `${(healthReport.performance.hitRatio * 100).toFixed(1)}%`,
    平均条目大小: `${(healthReport.performance.averageEntrySize / 1024).toFixed(2)} KB`,
    建议: healthReport.recommendations
  })

  // 缓存清理
  console.log('\n执行缓存清理...')
  const cleanupStats = await CacheManager.cleanup()
  console.log('清理统计:', {
    移除编译缓存: cleanupStats.removedCompilations,
    移除内容缓存: cleanupStats.removedContent,
    释放内存: `${(cleanupStats.memoryFreed / 1024).toFixed(1)} KB`
  })
}

/**
 * 示例5: 开发调试功能
 */
function developmentDebuggingExample() {
  console.log('\n=== 开发调试功能示例 ===')

  // 启用缓存调试
  enableCacheDebug()

  console.log('缓存调试已启用！')
  console.log('在浏览器控制台中使用以下命令:')
  console.log('- __smartabp_cache__.getStats() // 获取缓存统计')
  console.log('- __smartabp_cache__.cleanup() // 执行缓存清理')
  console.log('- __smartabp_cache__.healthReport() // 获取健康报告')
}

/**
 * 主函数：运行所有示例
 */
export async function runContentCacheExamples() {
  console.log('🚀 SmartAbp内容寻址缓存示例\n')

  try {
    await basicContentCacheExample()
    await incrementalCompilationExample()
    await pluginWrapperExample()
    await cacheManagementExample()
    developmentDebuggingExample()

    console.log('\n✅ 所有示例执行完成！')
    console.log('\n📊 最终全局缓存统计:')
    const finalStats = globalCompilationCache.getStats()
    console.log({
      编译缓存条目: finalStats.compilationEntries,
      内容缓存条目: finalStats.contentCacheStats.totalEntries,
      总内存使用: `${(finalStats.memoryUsageBytes / 1024).toFixed(1)} KB`,
      估计命中率: `${(finalStats.hitRatio * 100).toFixed(1)}%`
    })

  } catch (error) {
    console.error('❌ 示例执行失败:', error)
  }
}

// 便捷的直接执行函数
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 在开发环境下可以直接调用
  // runContentCacheExamples()
}
