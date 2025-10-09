/**
 * 实体建模Store桥接层
 * 
 * 解决循环依赖：lowcode-core ⇄ lowcode-api
 * 方案：将API调用逻辑移到lowcode-api，由lowcode-core通过接口调用
 * 
 * @遵循架构铁律三：严格架构层级（api不应被core直接导入）
 */

import {
    createEntity as createEntityApi,
    deleteEntity as deleteEntityApi,
    getAllEntities,
    getAllRelations,
    updateEntity as updateEntityApi
} from './entity-modeling.js'

/**
 * 实体建模API桥接函数
 * 供lowcode-core使用，避免直接导入循环依赖
 */
export const entityModelingApiBridge = {
    createEntity: createEntityApi,
    deleteEntity: deleteEntityApi,
    updateEntity: updateEntityApi,
    getAllEntities,
    getAllRelations
}

export type EntityModelingApiBridge = typeof entityModelingApiBridge

