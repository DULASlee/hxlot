export interface DesignerComponent {
  id: string;
  name: string;
  type: string;
  children?: DesignerComponent[];
  props?: Record<string, any>;
  position?: { x: number; y: number };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 VisualDesignCanvas 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 画布组件接口
 */
export interface CanvasComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  style: CanvasComponentStyle
  children: CanvasComponent[]
}

/**
 * 画布组件样式接口
 */
export interface CanvasComponentStyle {
  position: 'absolute' | 'relative' | 'fixed'
  left: string
  top: string
  width: string
  height: string
  zIndex?: number
  transform?: string
  transformOrigin?: string
  [key: string]: any
}

/**
 * 辅助线接口
 */
export interface GuideLine {
  id: string
  type: 'vertical' | 'horizontal'
  style: Record<string, string | undefined>
}

/**
 * 画布历史记录接口
 */
export interface CanvasHistory {
  timestamp: number
  components: CanvasComponent[]
}

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

/**
 * 画布模式
 */
export type CanvasMode = 'design' | 'preview' | 'code'

/**
 * 移动方向
 */
export type MoveDirection = 'up' | 'down'

/**
 * 调整大小方向
 */
export type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw'

/**
 * 组件属性类型
 */
export type ComponentPropertyType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'select'
  | 'json'

/**
 * 组件属性定义
 */
export interface ComponentProperty {
  name: string
  label: string
  type: ComponentPropertyType
  value: any
  options?: Array<{ label: string; value: any }>
  description?: string
}

/**
 * 画布Props接口
 */
export interface VisualDesignCanvasProps {
  pageData?: Record<string, any>
  entityData?: Record<string, any>
  showPropertyPanel?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ EntityDesigner 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 实体字段类型
 */
export type EntityFieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'enum' 
  | 'reference' 
  | 'array'

/**
 * 字段验证规则类型
 */
export type ValidationRuleType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'numeric'
  | 'integer'
  | 'min'
  | 'max'
  | 'custom'

/**
 * 字段验证规则
 */
export interface FieldValidationRule {
  id: string
  type: ValidationRuleType
  value?: any
  message: string
  customValidator?: string
}

/**
 * 实体字段接口
 */
export interface EntityField {
  id: string
  name: string
  displayName: string
  type: EntityFieldType
  isRequired: boolean
  isUnique: boolean
  isIndexed: boolean
  defaultValue?: any
  maxLength?: number
  minLength?: number
  pattern?: string
  enumValues?: string[]
  referenceEntity?: string
  description?: string
  validationRules?: FieldValidationRule[]
}

/**
 * 实体关系类型
 */
export type EntityRelationType = 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'

/**
 * 实体关系接口
 */
export interface EntityRelation {
  id: string
  name: string
  type: EntityRelationType
  targetEntity: string
  foreignKey?: string
  inverseForeignKey?: string
  cascadeDelete?: boolean
}

/**
 * 实体定义接口
 */
export interface EntityDefinition {
  id: string
  name: string
  displayName: string
  tableName?: string
  description?: string
  fields: EntityField[]
  relations: EntityRelation[]
  isAuditEnabled?: boolean
  isSoftDelete?: boolean
  isMultiTenant?: boolean
}

/**
 * EntityDesigner Props接口
 */
export interface EntityDesignerProps {
  modelValue?: EntityDefinition
  readonly?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 TemplateManager 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 模板类型
 */
export type TemplateType = 'entity' | 'service' | 'controller' | 'view' | 'component' | 'workflow' | 'custom'

/**
 * 模板分类
 */
export type TemplateCategory = 'frontend' | 'backend' | 'fullstack' | 'database' | 'devops'

/**
 * 模板标签
 */
export interface TemplateTag {
  id: string
  name: string
  color?: string
}

/**
 * 模板变量
 */
export interface TemplateVariable {
  name: string
  displayName: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue?: any
  required: boolean
  description?: string
}

/**
 * 模板文件（扩展版 - 用于TemplateEngine）
 */
export interface TemplateFile {
  id: string
  name: string
  description: string
  category: string
  filePath: string
  path?: string // 兼容简化版
  content: string
  language?: string // 兼容简化版
  metadata?: any // TemplateMetadata
  fileExtension?: string
  targetFramework?: 'backend' | 'frontend' | 'lowcode'
  tags: string[]
  version?: string
}

/**
 * 模板定义
 */
export interface TemplateDefinition {
  id: string
  name: string
  displayName: string
  description: string
  type: TemplateType
  category: TemplateCategory
  version: string
  author: string
  tags: TemplateTag[]
  variables: TemplateVariable[]
  files: TemplateFile[]
  preview?: string
  icon?: string
  isBuiltIn: boolean
  isPublic: boolean
  usageCount: number
  rating: number
  createdAt: string
  updatedAt: string
}

/**
 * TemplateManager Props接口
 */
export interface TemplateManagerProps {
  selectedTemplate?: TemplateDefinition
  readonly?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 BusinessRulesEngine 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 规则条件操作符
 */
export type RuleOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'in' 
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty'

/**
 * 规则条件
 */
export interface RuleCondition {
  id: string
  field: string
  operator: RuleOperator
  value: any
  logicalOperator?: 'and' | 'or'
}

/**
 * 规则动作类型
 */
export type RuleActionType = 
  | 'setValue' 
  | 'showField' 
  | 'hideField' 
  | 'enableField' 
  | 'disableField'
  | 'showMessage'
  | 'callApi'
  | 'runScript'

/**
 * 规则动作
 */
export interface RuleAction {
  id: string
  type: RuleActionType
  target?: string
  value?: any
  message?: string
  apiUrl?: string
  script?: string
}

/**
 * 业务规则
 */
export interface BusinessRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: number
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdAt: string
  updatedAt: string
}

/**
 * BusinessRulesEngine Props接口
 */
export interface BusinessRulesEngineProps {
  entityName?: string
  readonly?: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 VisualComponentPalette 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 组件分类
 */
export type ComponentPaletteCategory = 
  | 'basic'
  | 'form'
  | 'data'
  | 'layout'
  | 'navigation'
  | 'feedback'
  | 'chart'
  | 'custom'

/**
 * 组件面板项
 */
export interface PaletteComponent {
  id: string
  name: string
  displayName: string
  category: ComponentPaletteCategory
  icon: string
  description: string
  props?: Record<string, any>
  defaultStyle?: Record<string, any>
  previewImage?: string
  isCustom: boolean
  tags: string[]
}

/**
 * VisualComponentPalette Props接口
 */
export interface VisualComponentPaletteProps {
  selectedCategory?: ComponentPaletteCategory
  searchable?: boolean
  draggable?: boolean
}
