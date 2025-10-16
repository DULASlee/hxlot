#!/usr/bin/env node
import { execSync } from 'node:child_process'

function run(cmd: string) {
  execSync(cmd, { stdio: 'inherit' })
}

const args = process.argv.slice(2)
const entity = args.includes('--entity') ? args[args.indexOf('--entity') + 1] : undefined
const apply = args.includes('--apply')

if (!entity) {
  console.error('用法: lowcode-tools codegen --entity <Name> [--apply]')
  process.exit(1)
}

console.log(`➡️  生成实体: ${entity}`)
// 这里仅占位：调用NSwag生成客户端（Phase 1），后续接入AST生成
try {
  run('npm -w src/SmartAbp.Vue/packages/lowcode-api run generate:api')
  if (apply) {
    // 质量门禁（最小集）
    run('npm run type-check --silent')
  }
  console.log('✅ 生成流程完成')
} catch (e) {
  console.error('❌ 生成失败')
  process.exit(1)
}


