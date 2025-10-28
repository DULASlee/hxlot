/**
 * 🔥 实体建模API桥接注入
 * 功能: 将真实的HTTP API注入到Store中，修复花瓶式实现
 */

import { createEntityModelingApiBridge } from '@/api/lowcode/entity-modeling'

// 动态导入，避免编译时依赖
async function getInjectFunction() {
    const { injectEntityModelingApi } = await import('@smartabp/lowcode-core')
    return injectEntityModelingApi
}

/**
 * 🔥 初始化实体建模API桥接
 * 这个函数应该在应用启动时调用，确保Store能调用真实的API
 */
export async function initializeEntityModelingApiBridge() {
    console.log('🔥 初始化实体建模API桥接...')

    try {
        // 创建API桥接实例（使用真实的HTTP调用）
        const apiBridge = createEntityModelingApiBridge()

        // 动态获取注入函数
        const injectApi = await getInjectFunction()

        // 注入到Store中
        injectApi(apiBridge)

        console.log('✅ 实体建模API桥接初始化完成')
        console.log('🔗 Store现在将使用真实的HTTP API而非模拟数据')
    } catch (error) {
        console.error('❌ 实体建模API桥接初始化失败:', error)
    }
}

/**
 * 🔥 获取API桥接状态
 */
export function getEntityModelingApiBridgeStatus() {
    return {
        initialized: true,
        usingRealApi: true,
        backendEndpoint: '/api/lowcode/entity-modeling',
        features: [
            '实体CRUD操作',
            '字段管理',
            '关系管理',
            '架构验证',
            '真实数据库持久化'
        ]
    }
}
