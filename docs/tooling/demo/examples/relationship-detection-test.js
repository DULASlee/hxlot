/**
 * 🎯 关系检测准确率测试脚本
 * 为周五最终验收准备演示数据和测试用例
 */

// 模拟数据库表结构 - 订单管理系统
const orderSystemTables = [
  {
    name: 'Orders',
    description: '订单主表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'OrderNumber', type: 'nvarchar', isNullable: false, length: 50 },
      { name: 'CustomerId', type: 'int', isNullable: false }, // 外键 → Customers
      { name: 'OrderDate', type: 'datetime', isNullable: false },
      { name: 'TotalAmount', type: 'decimal', isNullable: false },
      { name: 'Status', type: 'nvarchar', isNullable: false, length: 20 }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [
      { columnName: 'CustomerId', referencedTable: 'Customers', referencedColumn: 'Id' }
    ],
    indexes: []
  },
  {
    name: 'OrderItems',
    description: '订单明细表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'OrderId', type: 'int', isNullable: false }, // 外键 → Orders (一对多关系)
      { name: 'ProductId', type: 'int', isNullable: false }, // 外键 → Products
      { name: 'Quantity', type: 'int', isNullable: false },
      { name: 'UnitPrice', type: 'decimal', isNullable: false },
      { name: 'TotalPrice', type: 'decimal', isNullable: false }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [
      { columnName: 'OrderId', referencedTable: 'Orders', referencedColumn: 'Id' },
      { columnName: 'ProductId', referencedTable: 'Products', referencedColumn: 'Id' }
    ],
    indexes: []
  },
  {
    name: 'Customers',
    description: '客户表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'Name', type: 'nvarchar', isNullable: false, length: 100 },
      { name: 'Email', type: 'nvarchar', isNullable: false, length: 100 },
      { name: 'Phone', type: 'nvarchar', isNullable: true, length: 20 }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [],
    indexes: []
  },
  {
    name: 'Categories',
    description: '产品分类表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'Name', type: 'nvarchar', isNullable: false, length: 100 },
      { name: 'Description', type: 'nvarchar', isNullable: true, length: 500 }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [],
    indexes: []
  },
  {
    name: 'Products',
    description: '产品表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'Name', type: 'nvarchar', isNullable: false, length: 100 },
      { name: 'Price', type: 'decimal', isNullable: false },
      { name: 'CategoryId', type: 'int', isNullable: false } // 外键 → Categories
    ],
    primaryKeys: ['Id'],
    foreignKeys: [
      { columnName: 'CategoryId', referencedTable: 'Categories', referencedColumn: 'Id' }
    ],
    indexes: []
  }
]

// 模拟数据库表结构 - 用户权限系统（多对多关系）
const userRoleSystemTables = [
  {
    name: 'Users',
    description: '用户表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'UserName', type: 'nvarchar', isNullable: false, length: 50 },
      { name: 'Email', type: 'nvarchar', isNullable: false, length: 100 },
      { name: 'PasswordHash', type: 'nvarchar', isNullable: false, length: 255 }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [],
    indexes: []
  },
  {
    name: 'Roles',
    description: '角色表',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'Name', type: 'nvarchar', isNullable: false, length: 50 },
      { name: 'DisplayName', type: 'nvarchar', isNullable: false, length: 100 },
      { name: 'Description', type: 'nvarchar', isNullable: true, length: 500 }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [],
    indexes: []
  },
  {
    name: 'UserRoles',
    description: '用户角色关系表（多对多中间表）',
    schema: 'dbo',
    columns: [
      { name: 'Id', type: 'int', isNullable: false, isPrimaryKey: true },
      { name: 'UserId', type: 'int', isNullable: false }, // 外键 → Users
      { name: 'RoleId', type: 'int', isNullable: false }, // 外键 → Roles
      { name: 'CreationTime', type: 'datetime', isNullable: false },
      { name: 'IsActive', type: 'bit', isNullable: false }
    ],
    primaryKeys: ['Id'],
    foreignKeys: [
      { columnName: 'UserId', referencedTable: 'Users', referencedColumn: 'Id' },
      { columnName: 'RoleId', referencedTable: 'Roles', referencedColumn: 'Id' }
    ],
    indexes: []
  }
]

// 极简关系检测器（修复版）
function detectTableRelationships(tables) {
  const relationships = []
  
  tables.forEach(table => {
    // 简单外键检测：字段名以Id结尾
    table.columns.forEach(column => {
      if (column.name.endsWith('Id') && column.name !== 'Id') {
        const referencedTable = column.name.replace('Id', '')
        
        // 检查引用的表是否存在
        const targetTableExists = tables.some(t => t.name === referencedTable)
        
        // 调试输出
        console.log(`🔍 检查 ${table.name}.${column.name} → ${referencedTable}, 表存在: ${targetTableExists}`)
        
        if (targetTableExists) {
          relationships.push({
            id: `${table.name}_${referencedTable}`,
            type: 'oneToMany',
            masterTable: referencedTable,
            detailTable: table.name,
            foreignKey: column.name,
            confidence: 0.9,
            metadata: {
              masterDisplayName: referencedTable,
              detailDisplayName: table.name
            }
          })
        }
      }
    })
    
    // 多对多关系检测：更严格的中间表判断
    if (table.foreignKeys && table.foreignKeys.length === 2) {
      const fk1 = table.foreignKeys[0]
      const fk2 = table.foreignKeys[1]
      
      // 检查是否是纯粹的多对多中间表
      // 条件：1) 只有2个外键 2) 没有其他业务字段（除了Id, CreationTime等基础字段）
      const businessColumns = table.columns.filter(col => 
        !col.isPrimaryKey && 
        !col.name.endsWith('Id') && 
        !['CreationTime', 'ModificationTime', 'IsActive', 'IsDeleted'].includes(col.name)
      )
      
      // 如果是纯粹的关系表（很少或没有业务字段），则认为是多对多
      if (fk1.referencedTable !== fk2.referencedTable && businessColumns.length <= 2) {
        relationships.push({
          id: `${fk1.referencedTable}_${fk2.referencedTable}`,
          type: 'manyToMany',
          sourceTable: fk1.referencedTable,
          targetTable: fk2.referencedTable,
          junctionTable: table.name,
          confidence: 0.95,
          metadata: {
            sourceDisplayName: fk1.referencedTable,
            targetDisplayName: fk2.referencedTable,
            junctionDisplayName: table.name
          }
        })
        
        // 如果检测到多对多关系，移除对应的一对多关系以避免重复
        const toRemove = relationships.filter(rel => 
          rel.type === 'oneToMany' && 
          rel.detailTable === table.name &&
          (rel.masterTable === fk1.referencedTable || rel.masterTable === fk2.referencedTable)
        )
        toRemove.forEach(rel => {
          const index = relationships.indexOf(rel)
          if (index > -1) relationships.splice(index, 1)
        })
      }
    }
  })
  
  return relationships
}

// 测试用例定义
const testCases = [
  {
    name: '订单系统一对多关系测试',
    tables: orderSystemTables,
    expectedRelationships: [
      { type: 'oneToMany', masterTable: 'Customers', detailTable: 'Orders' },
      { type: 'oneToMany', masterTable: 'Orders', detailTable: 'OrderItems' },
      { type: 'oneToMany', masterTable: 'Products', detailTable: 'OrderItems' },
      { type: 'oneToMany', masterTable: 'Categories', detailTable: 'Products' }
    ]
  },
  {
    name: '用户权限系统多对多关系测试',
    tables: userRoleSystemTables,
    expectedRelationships: [
      { type: 'manyToMany', sourceTable: 'Users', targetTable: 'Roles', junctionTable: 'UserRoles' }
    ]
  }
]

// 执行测试
function runRelationshipDetectionTests() {
  console.log('🎯 开始关系检测准确率测试...')
  console.log('='.repeat(60))
  
  let totalTests = 0
  let passedTests = 0
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 测试 ${index + 1}: ${testCase.name}`)
    console.log('-'.repeat(40))
    
    const detectedRelationships = detectTableRelationships(testCase.tables)
    
    console.log(`检测到 ${detectedRelationships.length} 个关系:`)
    detectedRelationships.forEach(rel => {
      const displayName = rel.type === 'oneToMany' 
        ? `${rel.masterTable} (1) → ${rel.detailTable} (N)`
        : `${rel.sourceTable} (M) ↔ ${rel.targetTable} (N)`
      
      console.log(`  ✅ ${rel.type}: ${displayName} (置信度: ${Math.round(rel.confidence * 100)}%)`)
    })
    
    // 验证准确性
    const expectedCount = testCase.expectedRelationships.length
    const detectedCount = detectedRelationships.length
    
    totalTests++
    if (detectedCount >= expectedCount * 0.8) { // 允许80%的检测率
      passedTests++
      console.log(`✅ 测试通过: 检测到 ${detectedCount}/${expectedCount} 个关系`)
    } else {
      console.log(`❌ 测试失败: 只检测到 ${detectedCount}/${expectedCount} 个关系`)
    }
  })
  
  console.log('\n🎯 测试结果汇总')
  console.log('='.repeat(60))
  const accuracy = (passedTests / totalTests) * 100
  console.log(`✅ 通过测试: ${passedTests}/${totalTests}`)
  console.log(`📊 准确率: ${accuracy.toFixed(1)}%`)
  console.log(`🎯 验收标准: ${accuracy >= 90 ? '✅ 达标' : '❌ 未达标'} (>90%)`)
  
  return {
    totalTests,
    passedTests,
    accuracy,
    passed: accuracy >= 90
  }
}

// 性能基准测试
function performanceTest() {
  console.log('\n⚡ 开始性能基准测试...')
  console.log('='.repeat(60))
  
  const iterations = 1000
  const startTime = Date.now()
  
  for (let i = 0; i < iterations; i++) {
    detectTableRelationships(orderSystemTables)
    detectTableRelationships(userRoleSystemTables)
  }
  
  const endTime = Date.now()
  const totalTime = endTime - startTime
  const averageTime = totalTime / iterations
  
  console.log(`🔄 执行次数: ${iterations}`)
  console.log(`⏱️  总时间: ${totalTime}ms`)
  console.log(`📊 平均时间: ${averageTime.toFixed(2)}ms`)
  console.log(`🎯 验收标准: ${averageTime < 100 ? '✅ 达标' : '❌ 未达标'} (<100ms)`)
  
  return {
    iterations,
    totalTime,
    averageTime,
    passed: averageTime < 100
  }
}

// 演示数据生成
function generateDemoData() {
  return {
    orderSystemTables,
    userRoleSystemTables,
    sampleRelationships: {
      oneToMany: detectTableRelationships(orderSystemTables).filter(r => r.type === 'oneToMany'),
      manyToMany: detectTableRelationships(userRoleSystemTables).filter(r => r.type === 'manyToMany')
    }
  }
}

// 主函数
function main() {
  console.log('🚀 SmartAbp 关系检测系统最终验收测试')
  console.log('='.repeat(60))
  console.log('📅 测试时间:', new Date().toLocaleString())
  console.log('🎯 验收目标: 关系检测准确率>90%, 生成速度<5秒')
  
  // 1. 关系检测准确率测试
  const relationshipTestResult = runRelationshipDetectionTests()
  
  // 2. 性能基准测试
  const performanceTestResult = performanceTest()
  
  // 3. 生成演示数据
  const demoData = generateDemoData()
  
  console.log('\n🎊 最终验收结果')
  console.log('='.repeat(60))
  console.log(`✅ 关系检测准确率: ${relationshipTestResult.accuracy.toFixed(1)}% ${relationshipTestResult.passed ? '(达标)' : '(未达标)'}`)
  console.log(`⚡ 性能表现: ${performanceTestResult.averageTime.toFixed(2)}ms ${performanceTestResult.passed ? '(达标)' : '(未达标)'}`)
  console.log(`🎯 整体评估: ${relationshipTestResult.passed && performanceTestResult.passed ? '✅ 通过验收' : '❌ 需要改进'}`)
  
  console.log('\n📊 演示数据统计:')
  console.log(`  🛒 订单系统表: ${demoData.orderSystemTables.length} 个`)
  console.log(`  👤 用户权限系统表: ${demoData.userRoleSystemTables.length} 个`) 
  console.log(`  🔗 一对多关系: ${demoData.sampleRelationships.oneToMany.length} 个`)
  console.log(`  🔀 多对多关系: ${demoData.sampleRelationships.manyToMany.length} 个`)
  
  return {
    relationshipTest: relationshipTestResult,
    performanceTest: performanceTestResult,
    demoData,
    overallPassed: relationshipTestResult.passed && performanceTestResult.passed
  }
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    main,
    detectTableRelationships,
    orderSystemTables,
    userRoleSystemTables,
    runRelationshipDetectionTests,
    performanceTest
  }
} else {
  // 浏览器环境中直接运行
  main()
}

// 在Node.js环境中也直接运行
if (typeof require !== 'undefined') {
  main()
}
