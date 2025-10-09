/**
 * SmartAbp Enterprise Low-Code Platform - Packages Component Auto-Import Resolver
 *
 * Automatically identify and resolve Vue components in packages directory, supporting:
 * - Auto-scan packages/star/src/components directories
 * - Component name prefix rules (avoid conflicts)
 * - TypeScript type safety
 * - Perfect integration with unplugin-vue-components
 *
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
/**
 * Packages组件命名规范配置
 *
 * @description
 * 为不同的package定义组件前缀，避免组件名冲突
 * 参考：Element Plus的El前缀规范
 */
export const PACKAGES_NAMING_RULES = {
    'lowcode-shared': 'Ls', // LsButton, LsTable, LsForm
    'lowcode-core': 'Lc', // LcEditor, LcCanvas, LcToolbar
    'lowcode-designer': 'Ld', // LdPanel, LdProperties, LdTree
    'lowcode-api': 'La', // LaClient, LaRequest
    'lowcode-tools': 'Lt', // LtValidator, LtFormatter
    'metadata-core': 'Mc', // McSchema, McValidator
};
/**
 * Packages组件目录配置
 */
export const PACKAGES_COMPONENT_DIRS = [
    'lowcode-shared/src/components',
    'lowcode-core/src/components',
    'lowcode-designer/src/components',
    'lowcode-api/src/components',
    'lowcode-tools/src/components',
    'metadata-core/src/components',
];
/**
 * 组件路径缓存
 * 提升性能，避免重复文件系统查询
 */
const componentPathCache = new Map();
/**
 * 创建Packages组件解析器
 *
 * @description
 * 自动识别packages目录下的组件，支持：
 * 1. 带前缀的组件名（如LsButton）
 * 2. 不带前缀的组件名（自动尝试所有前缀）
 * 3. 深度搜索组件目录
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { createPackagesResolver } from '@/utils/vite/packagesResolver'
 *
 * Components({
 *   resolvers: [
 *     createPackagesResolver()
 *   ]
 * })
 * ```
 *
 * @param options - 解析器配置选项
 * @returns ComponentResolver 组件解析器
 */
export function createPackagesResolver(options) {
    const { packagesRoot = 'packages', enableCache = true, debug = false } = options || {};
    return {
        type: 'component',
        resolve: (componentName) => {
            // 检查缓存
            if (enableCache && componentPathCache.has(componentName)) {
                const cachedPath = componentPathCache.get(componentName);
                if (debug) {
                    console.log(`[PackagesResolver] 缓存命中: ${componentName} -> ${cachedPath}`);
                }
                return cachedPath;
            }
            // 提取组件前缀和基础名称
            const { prefix, baseName } = extractComponentInfo(componentName);
            // 情况1: 带前缀的组件名（如LsButton）
            if (prefix) {
                const packageName = getPackageNameByPrefix(prefix);
                if (packageName) {
                    const componentPath = resolveComponentPath(packagesRoot, packageName, baseName);
                    if (componentPath) {
                        if (enableCache) {
                            componentPathCache.set(componentName, componentPath);
                        }
                        if (debug) {
                            console.log(`[PackagesResolver] 解析成功（带前缀）: ${componentName} -> ${componentPath}`);
                        }
                        return componentPath;
                    }
                }
            }
            // 情况2: 不带前缀的组件名（尝试所有package）
            for (const dir of PACKAGES_COMPONENT_DIRS) {
                const packageName = dir.split('/')[0] || '';
                const componentPath = resolveComponentPath(packagesRoot, packageName, componentName);
                if (componentPath) {
                    if (enableCache) {
                        componentPathCache.set(componentName, componentPath);
                    }
                    if (debug) {
                        console.log(`[PackagesResolver] 解析成功（无前缀）: ${componentName} -> ${componentPath}`);
                    }
                    return componentPath;
                }
            }
            // 未找到组件
            if (debug) {
                console.log(`[PackagesResolver] 未找到组件: ${componentName}`);
            }
            return undefined;
        }
    };
}
/**
 * 提取组件前缀和基础名称
 *
 * @example
 * extractComponentInfo('LsButton') // { prefix: 'Ls', baseName: 'Button' }
 * extractComponentInfo('Button')   // { prefix: null, baseName: 'Button' }
 */
function extractComponentInfo(componentName) {
    // 检查是否匹配已知前缀
    for (const [_, prefix] of Object.entries(PACKAGES_NAMING_RULES)) {
        if (componentName.startsWith(prefix)) {
            return {
                prefix,
                baseName: componentName.slice(prefix.length)
            };
        }
    }
    return {
        prefix: null,
        baseName: componentName
    };
}
/**
 * 根据前缀获取package名称
 */
function getPackageNameByPrefix(prefix) {
    for (const [packageName, packagePrefix] of Object.entries(PACKAGES_NAMING_RULES)) {
        if (packagePrefix === prefix) {
            return packageName;
        }
    }
    return null;
}
/**
 * 解析组件文件路径
 *
 * @description
 * 按照以下优先级查找组件：
 * 1. components/${ComponentName}.vue
 * 2. components/${ComponentName}/index.vue
 * 3. components/${component-name}/${ComponentName}.vue
 */
function resolveComponentPath(packagesRoot, packageName, componentBaseName) {
    const searchPaths = [
        // 1. components/${ComponentName}.vue
        resolve(packagesRoot, packageName, 'src', 'components', `${componentBaseName}.vue`),
        // 2. components/${ComponentName}/index.vue
        resolve(packagesRoot, packageName, 'src', 'components', componentBaseName, 'index.vue'),
        // 3. components/${component-name}/${ComponentName}.vue
        resolve(packagesRoot, packageName, 'src', 'components', kebabCase(componentBaseName), `${componentBaseName}.vue`),
    ];
    for (const path of searchPaths) {
        if (existsSync(path)) {
            // ✅ D爷混合方案：返回别名路径，依赖Vite的alias解析
            // 
            // 优点：
            // 1. npm包发布兼容（别名可重定向到node_modules/@smartabp/xxx）
            // 2. 可移植性强（不依赖文件系统绝对路径）
            // 3. Monorepo友好（其他团队可直接引用）
            // 
            // 关键：路径格式必须与vite.config.ts中的alias配置匹配
            // 例如: @smartabp/lowcode-core -> ./packages/lowcode-core
            //       则应返回: @smartabp/lowcode-core/src/components/XXX
            // 
            // 检测：别名配置指向 ./packages/lowcode-core (无/src)
            //       所以需要加上 /src 前缀
            return `@smartabp/${packageName}/src/components/${componentBaseName}`;
        }
    }
    return null;
}
/**
 * 转换为kebab-case
 *
 * @example
 * kebabCase('MyComponent') // 'my-component'
 */
function kebabCase(str) {
    return str
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
}
/**
 * 清空组件路径缓存
 *
 * @description
 * 在开发环境热更新时，可能需要清空缓存
 */
export function clearComponentPathCache() {
    componentPathCache.clear();
}
/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
    return {
        size: componentPathCache.size,
        keys: Array.from(componentPathCache.keys())
    };
}
