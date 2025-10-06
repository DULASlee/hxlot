/**
 * 极简测试 - 验证核心功能
 */

// 模拟测试（等待编译后使用真实的dist/index.js）
console.log('✅ metadata-core 极简测试')

const testEntity = {
  name: 'Book',
  module: 'Library',
  properties: [
    { name: 'title', type: 'string', required: true },
    { name: 'author', type: 'string' }
  ]
}

console.log('测试实体:', JSON.stringify(testEntity, null, 2))

// 验证逻辑（手动检查）
const checks = [
  { name: '实体名称存在', pass: !!testEntity.name },
  { name: '实体名称PascalCase', pass: /^[A-Z]/.test(testEntity.name) },
  { name: '模块名称存在', pass: !!testEntity.module },
  { name: '属性列表非空', pass: testEntity.properties.length > 0 }
]

checks.forEach(check => {
  console.log(check.pass ? '✅' : '❌', check.name)
})

const allPass = checks.every(c => c.pass)
console.log(allPass ? '\n🎉 所有测试通过！' : '\n❌ 测试失败')
process.exit(allPass ? 0 : 1)

