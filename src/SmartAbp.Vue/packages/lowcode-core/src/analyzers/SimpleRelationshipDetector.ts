/**
 * 🎯 极简关系检测器 - 遵循D爷极简指示
 * 功能：正则表达式检测外键，一个函数搞定
 * 技术路线：几行代码，不搞复杂算法
 */

import type { DatabaseTable, RelationshipInfo } from '@smartabp/lowcode-core'

/**
 * 极简关系检测器 - 就几行代码
 */
export class SimpleRelationshipDetector {
  
  /**
   * 检测关系 - 极简实现
   */
  detectRelationships(tables: DatabaseTable[]): RelationshipInfo[] {
    const relationships: RelationshipInfo[] = []
    
    tables.forEach(table => {
      // 简单外键检测：字段名以Id结尾
      table.columns.forEach(column => {
        if (column.name.endsWith('Id') && column.name !== 'Id') {
          const referencedTable = column.name.replace('Id', '')
          
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
      })
    })
    
    return relationships
  }
}

/**
 * 工厂函数 - 创建检测器
 */
export function createRelationshipDetector(): SimpleRelationshipDetector {
  return new SimpleRelationshipDetector()
}

/**
 * 快速检测函数 - 一步到位
 */
export function detectTableRelationships(tables: DatabaseTable[]): RelationshipInfo[] {
  const detector = new SimpleRelationshipDetector()
  return detector.detectRelationships(tables)
}
