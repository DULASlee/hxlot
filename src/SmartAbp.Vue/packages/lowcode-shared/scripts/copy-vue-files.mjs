/**
 * 复制Vue文件到dist目录
 * 
 * 为什么需要这个脚本？
 * - tsc不会复制非.ts文件
 * - Vue组件文件需要在运行时可用
 * - ESM和CJS都需要Vue文件
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const srcDir = join(__dirname, '../src')
const esmDir = join(__dirname, '../dist/esm')
const cjsDir = join(__dirname, '../dist/cjs')

/**
 * 递归复制Vue文件
 */
function copyVueFiles(sourceDir, targetDir) {
    if (!existsSync(sourceDir)) {
        return
    }

    const entries = readdirSync(sourceDir)

    for (const entry of entries) {
        const sourcePath = join(sourceDir, entry)
        const targetPath = join(targetDir, entry)

        const stat = statSync(sourcePath)

        if (stat.isDirectory()) {
            // 递归处理子目录
            if (!existsSync(targetPath)) {
                mkdirSync(targetPath, { recursive: true })
            }
            copyVueFiles(sourcePath, targetPath)
        } else if (entry.endsWith('.vue')) {
            // 复制Vue文件
            if (!existsSync(dirname(targetPath))) {
                mkdirSync(dirname(targetPath), { recursive: true })
            }
            copyFileSync(sourcePath, targetPath)
            console.log(`✅ 复制: ${sourcePath} -> ${targetPath}`)
        }
    }
}

console.log('📦 开始复制Vue文件...')

// 复制到ESM目录
if (existsSync(esmDir)) {
    copyVueFiles(srcDir, esmDir)
    console.log('✅ ESM目录Vue文件复制完成')
}

// 复制到CJS目录
if (existsSync(cjsDir)) {
    copyVueFiles(srcDir, cjsDir)
    console.log('✅ CJS目录Vue文件复制完成')
}

console.log('🎉 Vue文件复制完成！')
