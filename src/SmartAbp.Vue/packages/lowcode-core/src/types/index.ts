export interface LowCodeKernel {
  version: string
  init: (config?: any) => Promise<void>
  registerPlugin: (plugin: any) => void
  unregisterPlugin: (pluginId: string) => void
  getPlugins: () => any[]
  execute: (command: string, params?: any) => Promise<any>
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
  emit: (event: string, data?: any) => void
  destroy: () => void
}

export interface Plugin {
  id: string
  name: string
  version: string
  install: (kernel: LowCodeKernel) => Promise<void>
  uninstall: () => void
  execute: (command: string, params?: any) => Promise<any>
}

export interface Vue3Plugin extends Plugin {
  component: any
  directives?: Record<string, any>
  composables?: Record<string, Function>
  provide?: Record<string, any>
}

// 数据库表结构相关类型
export interface DatabaseColumn {
  name: string
  type: string
  isNullable: boolean
  isPrimaryKey?: boolean
  isUnique?: boolean
  length?: number
  defaultValue?: any
  comment?: string
}

export interface DatabaseTable {
  name: string
  displayName?: string
  description?: string
  schema?: string
  columns: DatabaseColumn[]
  primaryKeys: string[]
  foreignKeys: DatabaseForeignKey[]
  indexes?: DatabaseIndex[]
  comment?: string
}

export interface DatabaseForeignKey {
  columnName: string
  referencedTable: string
  referencedColumn: string
  constraintName?: string
}

export interface DatabaseIndex {
  name: string
  columns: string[]
  isUnique: boolean
}

// 关系检测相关类型
export type RelationshipType = 'oneToMany' | 'manyToMany' | 'oneToOne'

export interface RelationshipInfo {
  id: string
  type: RelationshipType
  confidence: number
  
  // 一对多关系属性
  masterTable?: string
  detailTable?: string
  foreignKey?: string
  masterEntity?: string
  detailEntity?: string
  
  // 多对多关系属性
  sourceTable?: string
  targetTable?: string
  junctionTable?: string
  sourceForeignKey?: string
  targetForeignKey?: string
  sourceEntity?: string
  targetEntity?: string
  
  // 元数据
  metadata?: {
    [key: string]: any
    masterDisplayName?: string
    detailDisplayName?: string
    sourceDisplayName?: string
    targetDisplayName?: string
    junctionTableName?: string
    hasRelationshipProperties?: boolean
    relationshipProperties?: RelationshipProperty[]
  }
}

export interface RelationshipProperty {
  name: string
  type: string
  displayName: string
  isRequired: boolean
}

// 模板相关类型
export interface TemplateInfo {
  templatePath: string
  storeTemplatePath?: string
  backendTemplatePath?: string
  requiredComponents?: string[]
  supportedRelations?: RelationshipType[]
}
