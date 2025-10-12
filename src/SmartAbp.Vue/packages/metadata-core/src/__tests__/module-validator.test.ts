/**
 * @smartabp/metadata-core
 * 模块验证器单元测试
 * 
 * 测试覆盖：
 * - 基础验证（10个用例）
 * - 路由验证（10个用例）
 * - Store验证（8个用例）
 * - 生命周期验证（7个用例）
 * - 边界条件测试（5个用例）
 * 
 * 总计：40个测试用例
 */

import { describe, expect, it } from 'vitest'
import type { ModuleMetadata } from '../types/index.js'
import {
    getModuleMetadataErrors,
    ModuleMetadataSchema,
    safeValidateModuleMetadata,
    validateModuleMetadata,
    validateModuleMetadataAsync
} from './validators/module-validator'

// ========================================
// 测试数据工厂
// ========================================

function createValidModule(overrides?: Partial<ModuleMetadata>): ModuleMetadata {
    return {
        name: 'Library',
        displayName: '图书馆模块',
        version: '1.0.0',
        description: '图书管理模块',
        author: 'SmartAbp Team',
        abpStyle: true,
        order: 1,
        dependsOn: [],
        routes: [
            {
                path: '/library',
                name: 'Library',
                component: 'LibraryLayout'
            }
        ],
        stores: [
            {
                name: 'bookStore',
                type: 'entity',
                entityName: 'Book'
            }
        ],
        policies: ['Library.Read', 'Library.Write'],
        ...overrides
    }
}

// ========================================
// 基础验证测试（10个用例）
// ========================================

describe('ModuleValidator - 基础验证', () => {
    it('1.1 应该接受完整有效的模块元数据', () => {
        const module = createValidModule()
        const result = ModuleMetadataSchema.safeParse(module)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.name).toBe('Library')
            expect(result.data.routes).toHaveLength(1)
        }
    })

    it('1.2 应该拒绝缺少name的模块', () => {
        const module = createValidModule()
        delete (module as any).name

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('模块名称不能为空')
    })

    it('1.3 应该拒绝name不是PascalCase', () => {
        const module = createValidModule({ name: 'library' })

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('模块名称必须是PascalCase格式（首字母大写）')
    })

    it('1.4 应该拒绝缺少version', () => {
        const module = createValidModule()
        delete (module as any).version

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('模块版本不能为空')
    })

    it('1.5 应该拒绝无效的version格式', () => {
        const module = createValidModule({ version: 'v1.0' })

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('模块版本必须遵循语义化版本格式（如1.0.0）')
    })

    it('1.6 应该接受有效的语义化版本', () => {
        const validVersions = ['1.0.0', '1.2.3', '10.20.30', '1.0.0-alpha', '1.0.0+build.123']

        validVersions.forEach(version => {
            const module = createValidModule({ version })
            const result = ModuleMetadataSchema.safeParse(module)
            expect(result.success).toBe(true)
        })
    })

    it('1.7 应该接受可选字段', () => {
        const module = createValidModule({
            displayName: '图书馆',
            description: '图书管理系统',
            author: 'Team'
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('1.8 应该正确设置abpStyle标志', () => {
        const module = createValidModule({ abpStyle: false })
        const result = ModuleMetadataSchema.safeParse(module)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.abpStyle).toBe(false)
        }
    })

    it('1.9 应该接受有效的order值', () => {
        const orders = [1, 10, 100, 999]

        orders.forEach(order => {
            const module = createValidModule({ order })
            const result = ModuleMetadataSchema.safeParse(module)
            expect(result.success).toBe(true)
        })
    })

    it('1.10 应该接受空的dependsOn数组', () => {
        const module = createValidModule({ dependsOn: [] })
        const result = ModuleMetadataSchema.safeParse(module)

        expect(result.success).toBe(true)
    })
})

// ========================================
// 路由验证测试（10个用例）
// ========================================

describe('ModuleValidator - 路由验证', () => {
    it('2.1 应该接受有效的简单路由', () => {
        const module = createValidModule({
            routes: [
                { path: '/books', name: 'Books', component: 'BookList' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('2.2 应该拒绝path不以/开头', () => {
        const module = createValidModule({
            routes: [
                { path: 'books', name: 'Books', component: 'BookList' }
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors.some(e => e.includes('路径必须以/开头'))).toBe(true)
    })

    it('2.3 应该拒绝name不是PascalCase', () => {
        const module = createValidModule({
            routes: [
                { path: '/books', name: 'books', component: 'BookList' }
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors.some(e => e.includes('PascalCase'))).toBe(true)
    })

    it('2.4 应该接受嵌套路由（递归）', () => {
        const module = createValidModule({
            routes: [
                {
                    path: '/library',
                    name: 'Library',
                    component: 'LibraryLayout',
                    children: [
                        { path: 'books', name: 'Books', component: 'BookList' },
                        {
                            path: 'authors',
                            name: 'Authors',
                            component: 'AuthorLayout',
                            children: [
                                { path: ':id', name: 'AuthorDetail', component: 'AuthorDetail' }
                            ]
                        }
                    ]
                }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('2.5 应该接受路由元信息meta', () => {
        const module = createValidModule({
            routes: [
                {
                    path: '/books',
                    name: 'Books',
                    component: 'BookList',
                    meta: {
                        title: '图书列表',
                        requiresAuth: true,
                        permissions: ['Library.Read']
                    }
                }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('2.6 应该接受动态路由参数', () => {
        const module = createValidModule({
            routes: [
                { path: '/books/:id', name: 'BookDetail', component: 'BookDetail' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('2.7 应该接受可选的路由组件', () => {
        const module = createValidModule({
            routes: [
                { path: '/redirect', name: 'Redirect' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('2.8 应该拒绝重复的路由名称', () => {
        const module = createValidModule({
            routes: [
                { path: '/books', name: 'Books', component: 'BookList' },
                { path: '/authors', name: 'Books', component: 'AuthorList' }
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('路由名称不能重复: Books')
    })

    it('2.9 应该拒绝重复的路由路径', () => {
        const module = createValidModule({
            routes: [
                { path: '/books', name: 'Books1', component: 'BookList' },
                { path: '/books', name: 'Books2', component: 'BookList2' }
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('路由路径不能重复: /books')
    })

    it('2.10 应该接受多级嵌套路由', () => {
        const module = createValidModule({
            routes: [
                {
                    path: '/library',
                    name: 'Library',
                    children: [
                        {
                            path: 'management',
                            name: 'Management',
                            children: [
                                {
                                    path: 'books',
                                    name: 'BookManagement',
                                    children: [
                                        { path: 'list', name: 'BookList' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })
})

// ========================================
// Store验证测试（8个用例）
// ========================================

describe('ModuleValidator - Store验证', () => {
    it('3.1 应该接受entity类型的Store', () => {
        const module = createValidModule({
            stores: [
                { name: 'bookStore', type: 'entity', entityName: 'Book' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('3.2 应该接受ui类型的Store', () => {
        const module = createValidModule({
            stores: [
                { name: 'uiStore', type: 'ui' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('3.3 应该接受global类型的Store', () => {
        const module = createValidModule({
            stores: [
                { name: 'globalStore', type: 'global' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('3.4 应该拒绝Store name不是camelCase', () => {
        const module = createValidModule({
            stores: [
                { name: 'BookStore', type: 'entity', entityName: 'Book' }
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors.some(e => e.includes('camelCase'))).toBe(true)
    })

    it('3.5 应该拒绝entity类型Store缺少entityName', () => {
        const module = createValidModule({
            stores: [
                { name: 'bookStore', type: 'entity' } as any
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors.some(e => e.includes('entityName'))).toBe(true)
    })

    it('3.6 应该接受多个不同类型的Store', () => {
        const module = createValidModule({
            stores: [
                { name: 'bookStore', type: 'entity', entityName: 'Book' },
                { name: 'uiStore', type: 'ui' },
                { name: 'globalStore', type: 'global' }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('3.7 应该拒绝重复的Store名称', () => {
        const module = createValidModule({
            stores: [
                { name: 'bookStore', type: 'entity', entityName: 'Book' },
                { name: 'bookStore', type: 'ui' }
            ]
        })

        const errors = getModuleMetadataErrors(module)
        expect(errors).toContain('Store名称不能重复: bookStore')
    })

    it('3.8 应该接受空的stores数组', () => {
        const module = createValidModule({ stores: [] })
        const result = ModuleMetadataSchema.safeParse(module)

        expect(result.success).toBe(true)
    })
})

// ========================================
// 生命周期验证测试（7个用例）
// ========================================

describe('ModuleValidator - 生命周期验证', () => {
    it('4.1 应该接受完整的lifecycle配置', () => {
        const module = createValidModule({
            lifecycle: {
                onBeforeMount: 'initializeModule',
                onMounted: 'loadData',
                onBeforeUnmount: 'cleanup'
            }
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('4.2 应该接受部分lifecycle配置', () => {
        const module = createValidModule({
            lifecycle: {
                onMounted: 'loadData'
            }
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('4.3 应该接受空的lifecycle', () => {
        const module = createValidModule({ lifecycle: {} })
        const result = ModuleMetadataSchema.safeParse(module)

        expect(result.success).toBe(true)
    })

    it('4.4 应该接受缺少lifecycle字段', () => {
        const module = createValidModule()
        delete (module as any).lifecycle

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('4.5 应该接受features配置', () => {
        const module = createValidModule({
            features: {
                enableCache: true,
                maxPageSize: 100,
                theme: 'dark'
            }
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('4.6 应该接受menuConfig配置', () => {
        const module = createValidModule({
            menuConfig: {
                title: '图书馆',
                icon: 'book',
                order: 1,
                children: [
                    { title: '图书管理', icon: 'book-open' },
                    { title: '作者管理', icon: 'user' }
                ]
            }
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('4.7 应该接受嵌套的menuConfig', () => {
        const module = createValidModule({
            menuConfig: {
                title: '根菜单',
                children: [
                    {
                        title: '子菜单1',
                        children: [
                            {
                                title: '子菜单1-1',
                                children: [
                                    { title: '子菜单1-1-1' }
                                ]
                            }
                        ]
                    }
                ]
            }
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })
})

// ========================================
// 边界条件测试（5个用例）
// ========================================

describe('ModuleValidator - 边界条件', () => {
    it('5.1 应该接受最小有效模块', () => {
        const module: ModuleMetadata = {
            name: 'MinModule',
            version: '1.0.0',
            abpStyle: false,
            order: 1,
            dependsOn: [],
            routes: [],
            stores: [],
            policies: []
        }

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('5.2 应该接受大量依赖', () => {
        const dependsOn = Array.from({ length: 50 }, (_, i) => `Module${i}`)
        const module = createValidModule({ dependsOn })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('5.3 应该接受大量路由', () => {
        const routes = Array.from({ length: 100 }, (_, i) => ({
            path: `/route${i}`,
            name: `Route${i}`,
            component: `Component${i}`
        }))
        const module = createValidModule({ routes })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('5.4 应该接受大量policies', () => {
        const policies = Array.from({ length: 100 }, (_, i) => `Policy${i}`)
        const module = createValidModule({ policies })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })

    it('5.5 应该处理复杂的嵌套结构', () => {
        const module = createValidModule({
            routes: [
                {
                    path: '/level1',
                    name: 'Level1',
                    children: Array.from({ length: 10 }, (_, i) => ({
                        path: `level2-${i}`,
                        name: `Level2_${i}`,
                        children: Array.from({ length: 5 }, (_, j) => ({
                            path: `level3-${j}`,
                            name: `Level3_${i}_${j}`
                        }))
                    }))
                }
            ]
        })

        const result = ModuleMetadataSchema.safeParse(module)
        expect(result.success).toBe(true)
    })
})

// ========================================
// 验证API测试
// ========================================

describe('ModuleValidator - 验证API', () => {
    it('API.1 validateModuleMetadata应该抛出异常', () => {
        const module = createValidModule({ name: 'invalid' })

        expect(() => validateModuleMetadata(module)).toThrow()
    })

    it('API.2 safeValidateModuleMetadata应该返回SafeParseReturnType', () => {
        const module = createValidModule()
        const result = safeValidateModuleMetadata(module)

        expect(result.success).toBe(true)
    })

    it('API.3 getModuleMetadataErrors应该返回错误数组', () => {
        const module = createValidModule({ version: 'invalid' })
        const errors = getModuleMetadataErrors(module)

        expect(Array.isArray(errors)).toBe(true)
        expect(errors.length).toBeGreaterThan(0)
    })

    it('API.4 validateModuleMetadataAsync应该支持异步验证', async () => {
        const module = createValidModule()
        const result = await validateModuleMetadataAsync(module)

        expect(result).toBe(true)
    })

    it('API.5 validateModuleMetadataAsync应该拒绝无效数据', async () => {
        const module = createValidModule({ version: 'invalid' })

        await expect(validateModuleMetadataAsync(module)).rejects.toThrow()
    })
})

