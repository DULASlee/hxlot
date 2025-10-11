/**
 * SmartAbp Packages 集成测试套件
 * 
 * 测试目的：
 * 1. 验证各包功能正确实现
 * 2. 验证架构三大铁律执行
 * 3. 验证包间依赖关系
 * 4. 验证编译产物完整性
 * 
 * @author SmartAbp Team
 * @date 2025-10-12
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const PACKAGES_DIR = join(__dirname, '..')

/**
 * 辅助函数：检查包编译产物
 */
function checkPackageBuild(packageName: string) {
    const packageDir = join(PACKAGES_DIR, packageName)
    const packageJsonPath = join(packageDir, 'package.json')

    // 读取package.json以获取types字段
    let typesPath = 'dist/esm/index.d.ts' // 默认路径
    if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        if (packageJson.types) {
            typesPath = packageJson.types.replace(/^\.\//, '')
        }
    }

    return {
        hasEsmDist: existsSync(join(packageDir, 'dist/esm')),
        hasCjsDist: existsSync(join(packageDir, 'dist/cjs')),
        hasTypes: existsSync(join(packageDir, typesPath)),
        hasEsmIndex: existsSync(join(packageDir, 'dist/esm/index.js')),
        hasCjsIndex: existsSync(join(packageDir, 'dist/cjs/index.js'))
    }
}

/**
 * 辅助函数：检查package.json
 */
function checkPackageJson(packageName: string) {
    const packageJsonPath = join(PACKAGES_DIR, packageName, 'package.json')
    if (!existsSync(packageJsonPath)) {
        return null
    }
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    return {
        name: packageJson.name,
        version: packageJson.version,
        hasExports: !!packageJson.exports,
        hasTypes: !!packageJson.types,
        hasMain: !!packageJson.main,
        hasModule: !!packageJson.module
    }
}

describe('Packages 集成测试', () => {
    describe('架构层级验证', () => {
        it('Layer -1: metadata-core (零依赖)', () => {
            const pkg = checkPackageJson('metadata-core')
            expect(pkg).not.toBeNull()
            expect(pkg?.name).toBe('@smartabp/metadata-core')

            // 检查编译产物
            const build = checkPackageBuild('metadata-core')
            expect(build.hasEsmDist).toBe(true)
            expect(build.hasCjsDist).toBe(true)
            expect(build.hasTypes).toBe(true)
        })

        it('Layer 0: lowcode-shared (依赖metadata-core)', () => {
            const pkg = checkPackageJson('lowcode-shared')
            expect(pkg).not.toBeNull()
            expect(pkg?.name).toBe('@smartabp/lowcode-shared')

            // 检查编译产物
            const build = checkPackageBuild('lowcode-shared')
            expect(build.hasEsmDist).toBe(true)
            expect(build.hasCjsDist).toBe(true)
            expect(build.hasTypes).toBe(true)
        })

        it('Layer 1: lowcode-api (依赖shared+metadata)', () => {
            const pkg = checkPackageJson('lowcode-api')
            expect(pkg).not.toBeNull()
            expect(pkg?.name).toBe('@smartabp/lowcode-api')

            const build = checkPackageBuild('lowcode-api')
            expect(build.hasEsmDist).toBe(true)
            expect(build.hasCjsDist).toBe(true)
        })

        it('Layer 1: lowcode-core (依赖shared+metadata)', () => {
            const pkg = checkPackageJson('lowcode-core')
            expect(pkg).not.toBeNull()
            expect(pkg?.name).toBe('@smartabp/lowcode-core')

            const build = checkPackageBuild('lowcode-core')
            expect(build.hasEsmDist).toBe(true)
            expect(build.hasCjsDist).toBe(true)
        })

        it('Layer 2: lowcode-designer (依赖core)', () => {
            const pkg = checkPackageJson('lowcode-designer')
            expect(pkg).not.toBeNull()
            expect(pkg?.name).toBe('@smartabp/lowcode-designer')

            const build = checkPackageBuild('lowcode-designer')
            expect(build.hasEsmDist).toBe(true)
            expect(build.hasCjsDist).toBe(true)
        })
    })

    describe('1️⃣ metadata-core 功能测试', () => {
        describe('类型导出', () => {
            it('应该导出核心类型', async () => {
                const metadataCore = await import('../metadata-core/dist/esm/index.js')

                // 验证关键导出存在
                expect(metadataCore).toBeDefined()
                expect(metadataCore.VERSION).toBeDefined()
                expect(metadataCore.SCHEMA_VERSION).toBeDefined()
            })
        })

        describe('Schema验证', () => {
            it('应该有完整的validator导出', async () => {
                const validators = await import('../metadata-core/dist/esm/validators/index.js')
                expect(validators).toBeDefined()
            })
        })

        describe('转换器', () => {
            it('应该有完整的converter导出', async () => {
                const converters = await import('../metadata-core/dist/esm/converters/index.js')
                expect(converters).toBeDefined()
            })
        })
    })

    describe('2️⃣ lowcode-shared 功能测试', () => {
        describe('组件注册系统 (架构铁律二)', () => {
            it('应该导出ComponentRegistry', async () => {
                const shared = await import('../lowcode-shared/dist/esm/index.js')
                expect(shared.globalComponentRegistry).toBeDefined()
                expect(shared.registerComponent).toBeDefined()
            })

            it('应该能注册组件', async () => {
                const { globalComponentRegistry, registerComponent } = await import('../lowcode-shared/dist/esm/index.js')

                // 注册测试组件
                const testComponent = {
                    name: 'TestComponent',
                    displayName: '测试组件',
                    component: { template: '<div>Test</div>' },
                    category: 'form' as const,
                    bundle: 'test-bundle',
                    version: '1.0.0' // 添加version字段
                }

                await registerComponent(testComponent)

                // 验证注册成功
                const registered = globalComponentRegistry.getMetadata('TestComponent')
                expect(registered).toBeDefined()
                expect(registered?.name).toBe('TestComponent')
                expect(registered?.displayName).toBe('测试组件')
            })
        })

        describe('统一类型系统 (架构铁律一)', () => {
            it('应该导出UnifiedSchema类型', () => {
                // 验证类型导出
                const typesPath = join(PACKAGES_DIR, 'lowcode-shared/dist/esm/types/index.d.ts')
                expect(existsSync(typesPath)).toBe(true)

                const content = readFileSync(typesPath, 'utf-8')
                expect(content).toContain('UnifiedSchema')
                expect(content).toContain('UnifiedEntityDefinition')
                expect(content).toContain('UnifiedModuleMetadata')
            })
        })

        describe('架构守护系统 (架构铁律三)', () => {
            it('应该导出guards', async () => {
                const shared = await import('../lowcode-shared/dist/esm/index.js')
                expect(shared.ArchitectureGuardian).toBeDefined()
                expect(shared.TypeSystemGuard).toBeDefined()
                expect(shared.ComponentRegistryGuard).toBeDefined()
                expect(shared.DependencyLayerGuard).toBeDefined()
            })
        })

        describe('验证系统', () => {
            it('应该导出unified-validator', async () => {
                const validation = await import('../lowcode-shared/dist/esm/validation/index.js')
                expect(validation.unifiedValidator).toBeDefined()
            })
        })

        describe('缓存系统', () => {
            it('应该导出cache模块', async () => {
                const cache = await import('../lowcode-shared/dist/esm/cache/index.js')
                expect(cache.Cache).toBeDefined()
            })
        })

        describe('事件系统', () => {
            it('应该导出events模块', async () => {
                const events = await import('../lowcode-shared/dist/esm/events/index.js')
                expect(events.EventBus).toBeDefined()
            })
        })
    })

    describe('3️⃣ lowcode-api 功能测试', () => {
        describe('代码生成器', () => {
            it('应该导出generators模块', async () => {
                const generators = await import('../lowcode-api/dist/esm/generators/index.js')
                expect(generators).toBeDefined()
            })
        })

        describe('HTTP客户端', () => {
            it('应该导出http-client', async () => {
                const httpClient = await import('../lowcode-api/dist/esm/http-client.js')
                expect(httpClient.http).toBeDefined()
            })
        })

        describe('Composables', () => {
            it('应该导出composables模块', async () => {
                const composables = await import('../lowcode-api/dist/esm/composables/index.js')
                expect(composables).toBeDefined()
            })
        })
    })

    describe('4️⃣ lowcode-core 功能测试', () => {
        describe('初始化函数', () => {
            it('应该导出initializeLowCodeCore', async () => {
                const core = await import('../lowcode-core/dist/esm/index.js')
                expect(core.initializeLowCodeCore).toBeDefined()
                expect(core.registerCoreComponents).toBeDefined()
            })
        })

        describe('代码生成器', () => {
            it('应该导出generators模块', async () => {
                const generators = await import('../lowcode-core/dist/esm/generators/index.js')
                expect(generators).toBeDefined()
            })
        })

        describe('安全模块', () => {
            it('应该导出security模块', async () => {
                const security = await import('../lowcode-core/dist/esm/security/index.js')
                expect(security).toBeDefined()
            })
        })
    })

    describe('5️⃣ lowcode-designer 功能测试', () => {
        describe('初始化函数', () => {
            it('应该导出initializeDesigner', async () => {
                const designer = await import('../lowcode-designer/dist/esm/index.js')
                expect(designer.initializeDesigner).toBeDefined()
                expect(designer.registerDesignerComponents).toBeDefined()
            })
        })

        describe('组件模块', () => {
            it('应该导出components模块', async () => {
                const components = await import('../lowcode-designer/dist/esm/components/index.js')
                expect(components).toBeDefined()
            })
        })

        describe('视图模块', () => {
            it('应该导出views模块', async () => {
                const views = await import('../lowcode-designer/dist/esm/views/index.js')
                expect(views).toBeDefined()
            })
        })
    })

    describe('package.json配置验证', () => {
        const packages = [
            'metadata-core',
            'lowcode-shared',
            'lowcode-api',
            'lowcode-core',
            'lowcode-designer'
        ]

        packages.forEach(pkgName => {
            describe(`${pkgName} package.json`, () => {
                it('应该有正确的exports配置', () => {
                    const pkg = checkPackageJson(pkgName)
                    expect(pkg).not.toBeNull()
                    expect(pkg?.hasExports).toBe(true)
                })

                it('应该有types字段', () => {
                    const pkg = checkPackageJson(pkgName)
                    expect(pkg?.hasTypes).toBe(true)
                })

                it('应该有main字段', () => {
                    const pkg = checkPackageJson(pkgName)
                    expect(pkg?.hasMain).toBe(true)
                })

                it('应该有module字段', () => {
                    const pkg = checkPackageJson(pkgName)
                    expect(pkg?.hasModule).toBe(true)
                })
            })
        })
    })

    describe('编译产物完整性', () => {
        const packages = [
            'metadata-core',
            'lowcode-shared',
            'lowcode-api',
            'lowcode-core',
            'lowcode-designer'
        ]

        packages.forEach(pkgName => {
            describe(`${pkgName} 编译产物`, () => {
                it('应该有ESM产物', () => {
                    const build = checkPackageBuild(pkgName)
                    expect(build.hasEsmDist).toBe(true)
                    expect(build.hasEsmIndex).toBe(true)
                })

                it('应该有CJS产物', () => {
                    const build = checkPackageBuild(pkgName)
                    expect(build.hasCjsDist).toBe(true)
                    expect(build.hasCjsIndex).toBe(true)
                })

                it('应该有类型声明文件', () => {
                    const build = checkPackageBuild(pkgName)
                    expect(build.hasTypes).toBe(true)
                })
            })
        })
    })

    describe('架构三大铁律验证', () => {
        describe('铁律一：统一类型系统', () => {
            it('所有类型应该在metadata-core或lowcode-shared/types定义', () => {
                // 验证metadata-core types存在
                const metadataTypesPath = join(PACKAGES_DIR, 'metadata-core/dist/esm/types')
                expect(existsSync(metadataTypesPath)).toBe(true)

                // 验证lowcode-shared types存在
                const sharedTypesPath = join(PACKAGES_DIR, 'lowcode-shared/dist/esm/types')
                expect(existsSync(sharedTypesPath)).toBe(true)
            })
        })

        describe('铁律二：组件注册系统', () => {
            it('ComponentRegistry应该正确导出', async () => {
                const shared = await import('../lowcode-shared/dist/esm/index.js')
                expect(shared.globalComponentRegistry).toBeDefined()
                expect(shared.registerComponent).toBeDefined()
                expect(shared.ComponentRegistry).toBeDefined()
            })
        })

        describe('铁律三：架构层级依赖', () => {
            it('架构守护系统应该正确导出', async () => {
                const shared = await import('../lowcode-shared/dist/esm/index.js')
                expect(shared.ArchitectureGuardian).toBeDefined()
                expect(shared.DependencyLayerGuard).toBeDefined()
            })
        })
    })
})

/**
 * 性能测试
 */
describe('Packages 性能测试', () => {
    it('metadata-core导入应该快速', async () => {
        const start = Date.now()
        await import('../metadata-core/dist/esm/index.js')
        const end = Date.now()

        const loadTime = end - start
        expect(loadTime).toBeLessThan(100) // 应该在100ms内加载
    })

    it('lowcode-shared导入应该快速', async () => {
        const start = Date.now()
        await import('../lowcode-shared/dist/esm/index.js')
        const end = Date.now()

        const loadTime = end - start
        expect(loadTime).toBeLessThan(200) // 应该在200ms内加载
    })
})

/**
 * 内存测试
 */
describe('Packages 内存测试', () => {
    it('多次导入不应该导致内存泄漏', async () => {
        const initialMemory = process.memoryUsage().heapUsed

        // 多次导入
        for (let i = 0; i < 100; i++) {
            await import('../lowcode-shared/dist/esm/index.js')
        }

        // 强制垃圾回收
        if (global.gc) {
            global.gc()
        }

        const finalMemory = process.memoryUsage().heapUsed
        const memoryIncrease = finalMemory - initialMemory

        // 内存增长应该小于10MB
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
})

