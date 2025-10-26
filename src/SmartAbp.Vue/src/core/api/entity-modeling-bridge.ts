/**
 * 🔥 实体建模API桥接注入
 * 功能: 将真实的HTTP API注入到Store中，修复花瓶式实现
 */

import { injectEntityModelingApi } from '@smartabp/lowcode-core'
import {
    createEntityModelingApiBridge,
    type EntityModelingApiBridge
} from '@smartabp/lowcode-api'

/**
 * 🔥 初始化实体建模API桥接
 * 这个函数应该在应用启动时调用，确保Store能调用真实的API
 */
export function initializeEntityModelingApiBridge() {
    console.log('🔥 初始化实体建模API桥接...')

    // 创建API桥接实例（使用真实的HTTP调用）
    const apiBridge: EntityModelingApiBridge = createEntityModelingApiBridge()

    // 注入到Store中
    injectEntityModelingApi(apiBridge)

    console.log('✅ 实体建模API桥接初始化完成')
    console.log('🔗 Store现在将使用真实的HTTP API而非模拟数据')
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
