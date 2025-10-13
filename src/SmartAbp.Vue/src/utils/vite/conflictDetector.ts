import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import type { Plugin } from 'vite'

export interface ConflictDetectorOptions {
    packagesRoot: string
    packageComponentDirs: readonly string[]
    namingRules: Record<string, string>
    includeMainApp?: boolean
    mainComponentsDir?: string
    failOnConflict?: boolean
    largeFileLineThreshold?: number
    /** 可选：排除的目录（相对于 packagesRoot），这些目录下的 .vue 文件将被忽略 */
    excludeDirs?: readonly string[]
}

interface ScannedComponentInfo {
    name: string
    fullName: string | null
    packageName: string | null
    filePath: string
    lines: number
}

export function createComponentConflictDetector(options: ConflictDetectorOptions): Plugin {
    const {
        packagesRoot,
        packageComponentDirs,
        namingRules,
        includeMainApp = false,
        mainComponentsDir = 'src/components',
        failOnConflict = true,
        largeFileLineThreshold = 300,
        excludeDirs = [],
    } = options

    return {
        name: 'smartabp-component-conflict-detector',
        enforce: 'pre',
        async buildStart() {
            const components: ScannedComponentInfo[] = []
            const absExcludeDirs = excludeDirs.map(rel => join(process.cwd(), packagesRoot, rel))

            // 扫描packages内组件
            for (const relDir of packageComponentDirs) {
                const packageName = relDir.split('/')[0]
                if (!packageName) {
                    continue
                }
                const absDir = join(process.cwd(), packagesRoot, relDir)
                if (!existsSync(absDir)) {
                    // 目录不存在，忽略
                    continue
                }
                const prefix = namingRules[packageName]
                if (!prefix) {
                    continue
                }
                scanVueFiles(absDir).forEach(filePath => {
                    // 排除在 excludeDirs 下的文件
                    if (absExcludeDirs.some(ex => filePath.startsWith(ex))) {
                        return
                    }
                    const compName = inferComponentName(filePath)
                    const fullName = `${prefix}${compName}`
                    components.push({
                        name: compName,
                        fullName: fullName || null,
                        packageName,
                        filePath,
                        lines: countLines(filePath),
                    })
                })
            }

            // 可选：扫描主应用组件（不带前缀，仅用于大文件告警，不参与冲突判断）
            if (includeMainApp) {
                const absMain = join(process.cwd(), mainComponentsDir)
                if (existsSync(absMain)) {
                    scanVueFiles(absMain).forEach(filePath => {
                        const compName = inferComponentName(filePath)
                        components.push({
                            name: compName,
                            fullName: compName,
                            packageName: null,
                            filePath,
                            lines: countLines(filePath),
                        })
                    })
                }
            }

            // 冲突检测（同一fullName在多个文件中出现）
            const map = new Map<string, ScannedComponentInfo[]>()
            for (const c of components) {
                // 仅对带前缀组件进行冲突检测（packages）
                if (c.packageName && c.fullName) {
                    const list = map.get(c.fullName) || []
                    list.push(c)
                    map.set(c.fullName, list)
                }
            }

            const conflicts: Array<{ name: string; files: string[] }> = []
            for (const [name, list] of map.entries()) {
                // 认为>=2即冲突（同包重复或跨包重名）
                if (list.length >= 2) {
                    conflicts.push({ name, files: list.map(i => i.filePath) })
                }
            }

            // 大文件检测（仅告警）
            const largeFiles = components.filter(c => c.lines > largeFileLineThreshold)
            if (largeFiles.length > 0) {
                const lines = [
                    '⚠️ 检测到大型组件文件(> ' + largeFileLineThreshold + ' 行):',
                    ...largeFiles.slice(0, 20).map(c => `   • ${c.fullName}  (${c.lines}行)  ${c.filePath}`),
                    largeFiles.length > 20 ? `   ... 以及 ${largeFiles.length - 20} 个更多` : '',
                ].filter(Boolean)
                this.warn('\n' + lines.join('\n') + '\n')
            }

            if (conflicts.length > 0) {
                const msg = [
                    '🔴 组件名冲突检测失败：发现重复的组件标识（前缀+名称）',
                    ...conflicts.map(c => `   • ${c.name}\n${c.files.map(f => '      - ' + f).join('\n')}`),
                ].join('\n')
                if (failOnConflict) {
                    this.error('\n' + msg + '\n')
                } else {
                    this.warn('\n' + msg + '\n')
                }
            }
        },
    }
}

function scanVueFiles(root: string): string[] {
    const results: string[] = []
    const stack: string[] = [root]
    while (stack.length) {
        const dir = stack.pop() as string
        const entries = readdirSync(dir, { withFileTypes: true })
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '__tests__' || e.name === 'examples') {
                continue
            }
            const fp = join(dir, e.name)
            if (e.isDirectory()) {
                stack.push(fp)
            } else if (e.isFile() && extname(e.name) === '.vue') {
                results.push(fp)
            }
        }
    }
    return results
}

function inferComponentName(filePath: string): string {
    const file = basename(filePath)
    if (file.toLowerCase() === 'index.vue') {
        // index.vue 取父目录名作为组件名
        return basename(dirname(filePath))
    }
    return file.replace(/\.vue$/i, '')
}

function countLines(filePath: string): number {
    try {
        const content = readFileSync(filePath, 'utf-8')
        return content.split('\n').length
    } catch {
        return 0
    }
}


