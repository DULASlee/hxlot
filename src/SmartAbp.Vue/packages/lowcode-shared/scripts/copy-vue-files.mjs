#!/usr/bin/env node

/**
 * 复制.vue文件到dist目录
 * 因为tsc不处理.vue文件，需要手动复制
 */

import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const srcDir = join(projectRoot, 'src')
const distEsmDir = join(projectRoot, 'dist/esm')
const distCjsDir = join(projectRoot, 'dist/cjs')

/**
 * 递归复制.vue文件
 */
function copyVueFiles(srcPath, esmPath, cjsPath) {
    const entries = readdirSync(srcPath)

    for (const entry of entries) {
        const srcFilePath = join(srcPath, entry)
        const esmFilePath = join(esmPath, entry)
        const cjsFilePath = join(cjsPath, entry)
        const stat = statSync(srcFilePath)

        if (stat.isDirectory()) {
            // 创建目录
            mkdirSync(esmFilePath, { recursive: true })
            mkdirSync(cjsFilePath, { recursive: true })
            // 递归处理子目录
            copyVueFiles(srcFilePath, esmFilePath, cjsFilePath)
        } else if (entry.endsWith('.vue')) {
            // 复制.vue文件
            copyFileSync(srcFilePath, esmFilePath)
            copyFileSync(srcFilePath, cjsFilePath)
            console.log(`✅ Copied: ${entry}`)
        }
    }
}

// 执行复制
console.log('🚀 Copying Vue files...')
copyVueFiles(srcDir, distEsmDir, distCjsDir)
console.log('✅ Vue files copied successfully!')

