#!/usr/bin/env node
// 快速测试验证脚本
const { execSync } = require('child_process')
const path = require('path')

console.log('🚀 快速测试验证启动...')

try {
  // 检查Node和npm版本
  const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim()
  const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim()

  console.log(`Node: ${nodeVersion}`)
  console.log(`NPM: ${npmVersion}`)

  // 切换到前端目录并运行测试
  const frontendDir = path.join(__dirname, 'src', 'SmartAbp.Vue')
  console.log(`📁 前端目录: ${frontendDir}`)

  // 检查目录是否存在
  const fs = require('fs')
  if (!fs.existsSync(frontendDir)) {
    throw new Error(`前端目录不存在: ${frontendDir}`)
  }

  // 检查package.json是否存在
  const packageJsonPath = path.join(frontendDir, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json不存在: ${packageJsonPath}`)
  }

  console.log('✅ 目录和文件检查通过')

  // 运行测试（只显示前50行）
  console.log('🧪 运行测试覆盖率...')
  const testOutput = execSync('npm run test:coverage', {
    cwd: frontendDir,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  })

  // 只显示前100行
  const lines = testOutput.split('\n')
  const limitedOutput = lines.slice(0, 100).join('\n')

  console.log('📊 测试结果（前100行）:')
  console.log(limitedOutput)

  if (lines.length > 100) {
    console.log(`\n... (还有 ${lines.length - 100} 行输出被省略)`)
  }

  console.log('\n✅ 测试完成！')

} catch (error) {
  console.error('❌ 测试失败:', error.message)

  if (error.stdout) {
    console.log('\n📤 标准输出:')
    console.log(error.stdout.toString())
  }

  if (error.stderr) {
    console.log('\n📥 错误输出:')
    console.log(error.stderr.toString())
  }

  process.exit(1)
}
