#!/usr/bin/env node
// 简单的测试运行脚本 - 绕过终端问题
const { spawn } = require('child_process')
const path = require('path')

console.log('🧪 SmartAbp TDD测试运行器启动')
console.log('📁 工作目录:', process.cwd())

// 切换到前端目录
const frontendDir = path.join(process.cwd(), 'src', 'SmartAbp.Vue')
console.log('🎯 目标目录:', frontendDir)

// 运行测试覆盖率
const child = spawn('npm', ['run', 'test:coverage'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
})

child.on('close', (code) => {
  console.log(`\n🏁 测试完成，退出码: ${code}`)
  if (code === 0) {
    console.log('✅ 测试通过！')
  } else {
    console.log('❌ 测试失败，请检查输出')
  }
  process.exit(code)
})

child.on('error', (err) => {
  console.error('❌ 测试运行错误:', err.message)
  process.exit(1)
})
