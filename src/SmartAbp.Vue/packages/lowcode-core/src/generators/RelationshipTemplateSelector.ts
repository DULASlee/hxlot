/**
 * 🎯 极简模板选择器 - 遵循D爷极简指示
 * 功能：直接映射关系到模板，一个函数搞定
 * 技术路线：简单映射，不搞复杂策略
 */

import type { RelationshipInfo, TemplateInfo } from '@smartabp/lowcode-core'

/**
 * 极简模板选择器 - 直接映射
 */
export class RelationshipTemplateSelector {
  
  /**
   * 选择模板 - 直接映射，不搞复杂逻辑
   */
  selectTemplate(relationship: RelationshipInfo): TemplateInfo {
    // 一对多 → 使用扩展的CRUD模板
    if (relationship.type === 'oneToMany') {
      return {
        templatePath: 'templates/frontend/components/OneToManyCrudManagement.template.vue',
        storeTemplatePath: 'templates/frontend/stores/EntityStore.template.ts',
        backendTemplatePath: 'templates/backend/application/CrudAppService.template.cs'
      }
    }
    
    // 多对多 → 使用穿梭框模板  
    if (relationship.type === 'manyToMany') {
      return {
        templatePath: 'templates/frontend/components/ManyToManyCrudManagement.template.vue',
        storeTemplatePath: 'templates/frontend/stores/EntityStore.template.ts',
        backendTemplatePath: 'templates/backend/application/CrudAppService.template.cs'
      }
    }
    
    // 默认 → 标准CRUD模板
    return {
      templatePath: 'templates/frontend/components/CrudManagement.template.vue',
      storeTemplatePath: 'templates/frontend/stores/EntityStore.template.ts', 
      backendTemplatePath: 'templates/backend/application/CrudAppService.template.cs'
    }
  }
}

/**
 * 工厂函数 - 创建选择器
 */
export function createTemplateSelector(): RelationshipTemplateSelector {
  return new RelationshipTemplateSelector()
}

/**
 * 快速选择函数 - 一步到位
 */
export function selectTemplateForRelationship(relationship: RelationshipInfo): TemplateInfo {
  const selector = new RelationshipTemplateSelector()
  return selector.selectTemplate(relationship)
}
