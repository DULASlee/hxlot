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
 * 画布Props接口
 */
export interface VisualDesignCanvasProps {
  pageData?: Record<string, any>
  entityData?: Record<string, any>
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
