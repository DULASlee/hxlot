// src/SmartAbp.Vue/packages/lowcode-core/src/components/SmartFormBuilder/types/smart-form-types.ts
/**
 * @file smart-form-types.ts
 * @description SmartAbp表单扩展类型定义（基于form-create）
 * @author SmartAbp Team
 * @version 2.0.0
 * 
 * 🎯 核心作用:
 * 1. 定义SmartAbp特有的MES/IoT表单字段类型
 * 2. 扩展form-create以支持企业级功能
 * 3. 提供数据字典、设备参数等业务特定组件
 */

import type { FormCreateRule } from './form-create-types'
import type { UnifiedValidationRule } from '@smartabp/lowcode-shared'

/**
 * @interface BaseFormItem
 * @description 基础表单项接口
 */
interface BaseFormItem {
  id: string
  type: string
  label: string
  field: string
  defaultValue?: any
  placeholder?: string
  span?: number
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  rules?: UnifiedValidationRule[]
  options?: Array<{ label: string; value: any; disabled?: boolean }>
  props?: Record<string, any>
  children?: BaseFormItem[]
}

/**
 * @enum SmartFieldType
 * @description SmartAbp扩展字段类型枚举
 */
export enum SmartFieldType {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏭 MES制造领域专用字段（10种）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 设备参数字段 - 用于设备配置、参数管理 */
  DeviceParameter = 'deviceParameter',
  
  /** 质检字段 - 用于质量检验、缺陷记录 */
  QualityInspection = 'qualityInspection',
  
  /** 工单字段 - 用于工单信息、生产任务 */
  WorkOrder = 'workOrder',
  
  /** 条码扫描字段 - 用于扫码录入、批次追溯 */
  BarcodeScanner = 'barcodeScanner',
  
  /** 传感器数据字段 - 用于实时数据采集 */
  SensorData = 'sensorData',
  
  /** 生产线选择字段 - 用于生产线、工作中心选择 */
  ProductionLine = 'productionLine',
  
  /** 物料字段 - 用于物料选择、BOM配置 */
  Material = 'material',
  
  /** 工艺参数字段 - 用于工艺路线、工艺参数配置 */
  ProcessParameter = 'processParameter',
  
  /** 班次字段 - 用于班次管理、人员排班 */
  Shift = 'shift',
  
  /** 设备状态字段 - 用于设备状态监控、故障记录 */
  DeviceStatus = 'deviceStatus',
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 通用业务字段（扩展Element Plus）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 数据字典字段 - 用于字典数据选择 */
  Dictionary = 'dictionary',
  
  /** 组织机构字段 - 用于部门、组织选择 */
  Organization = 'organization',
  
  /** 用户选择字段 - 用于人员选择 */
  UserPicker = 'userPicker',
  
  /** 角色选择字段 - 用于角色权限配置 */
  RolePicker = 'rolePicker',
  
  /** 地址级联字段 - 用于省市区选择 */
  AddressCascader = 'addressCascader',
  
  /** JSON编辑器字段 - 用于复杂数据编辑 */
  JsonEditor = 'jsonEditor',
  
  /** 代码编辑器字段 - 用于脚本、规则编辑 */
  CodeEditor = 'codeEditor',
  
  /** 签名字段 - 用于电子签名 */
  Signature = 'signature'
}

/**
 * @interface DeviceParameterField
 * @description 设备参数字段配置
 */
export interface DeviceParameterField extends BaseFormItem {
  type: SmartFieldType.DeviceParameter
  props: {
    /** 设备类型 */
    deviceType?: string
    /** 参数类别 */
    parameterCategory?: 'operational' | 'alarm' | 'diagnostic' | 'configuration'
    /** 数据类型 */
    dataType?: 'number' | 'string' | 'boolean' | 'enum'
    /** 单位 */
    unit?: string
    /** 取值范围 */
    range?: { min: number; max: number }
    /** 精度 */
    precision?: number
    /** 是否实时采集 */
    realtime?: boolean
    /** 采集频率（秒） */
    sampleRate?: number
    [key: string]: any
  }
}

/**
 * @interface QualityInspectionField
 * @description 质检字段配置
 */
export interface QualityInspectionField extends BaseFormItem {
  type: SmartFieldType.QualityInspection
  props: {
    /** 检验项目 */
    inspectionItems?: Array<{
      code: string
      name: string
      standard: string
      method: string
      required: boolean
    }>
    /** 缺陷类型 */
    defectTypes?: Array<{
      code: string
      name: string
      severity: 'critical' | 'major' | 'minor'
    }>
    /** 判定标准 */
    acceptanceCriteria?: string
    /** 是否需要拍照 */
    requirePhoto?: boolean
    /** 最多拍照数量 */
    maxPhotos?: number
    [key: string]: any
  }
}

/**
 * @interface WorkOrderField
 * @description 工单字段配置
 */
export interface WorkOrderField extends BaseFormItem {
  type: SmartFieldType.WorkOrder
  props: {
    /** 工单类型 */
    orderType?: 'production' | 'maintenance' | 'quality' | 'logistics'
    /** 工单状态 */
    statusOptions?: Array<{
      value: string
      label: string
      color: string
    }>
    /** 优先级 */
    priorityOptions?: Array<{
      value: number
      label: string
      color: string
    }>
    /** 是否关联设备 */
    linkToDevice?: boolean
    /** 是否关联物料 */
    linkToMaterial?: boolean
    [key: string]: any
  }
}

/**
 * @interface BarcodeScannerField
 * @description 条码扫描字段配置
 */
export interface BarcodeScannerField extends BaseFormItem {
  type: SmartFieldType.BarcodeScanner
  props: {
    /** 条码类型 */
    barcodeType?: 'qr' | 'code128' | 'code39' | 'ean13' | 'datamatrix'
    /** 扫描模式 */
    scanMode?: 'camera' | 'scanner' | 'both'
    /** 是否自动解析 */
    autoParse?: boolean
    /** 解析规则 */
    parseRule?: string | RegExp
    /** 扫描后回调 */
    onScanned?: (data: string) => void | Promise<void>
    /** 是否连续扫描 */
    continuousScan?: boolean
    /** 最大扫描数量 */
    maxScans?: number
    [key: string]: any
  }
}

/**
 * @interface SensorDataField
 * @description 传感器数据字段配置
 */
export interface SensorDataField extends BaseFormItem {
  type: SmartFieldType.SensorData
  props: {
    /** 传感器类型 */
    sensorType?: 'temperature' | 'pressure' | 'humidity' | 'vibration' | 'flow' | 'level' | 'custom'
    /** 数据源 */
    dataSource?: {
      protocol: 'mqtt' | 'opcua' | 'modbus' | 'http' | 'websocket'
      endpoint: string
      topic?: string
      [key: string]: any
    }
    /** 数据单位 */
    unit?: string
    /** 显示格式 */
    displayFormat?: 'value' | 'gauge' | 'chart' | 'trend'
    /** 告警阈值 */
    alarmThreshold?: {
      high?: number
      low?: number
      highHigh?: number
      lowLow?: number
    }
    /** 刷新间隔（毫秒） */
    refreshInterval?: number
    [key: string]: any
  }
}

/**
 * @interface ProductionLineField
 * @description 生产线字段配置
 */
export interface ProductionLineField extends BaseFormItem {
  type: SmartFieldType.ProductionLine
  props: {
    /** 车间过滤 */
    workshopFilter?: string[]
    /** 是否显示设备列表 */
    showDevices?: boolean
    /** 是否显示产能信息 */
    showCapacity?: boolean
    /** 是否显示实时状态 */
    showStatus?: boolean
    /** 状态颜色映射 */
    statusColorMap?: Record<string, string>
    [key: string]: any
  }
}

/**
 * @interface MaterialField
 * @description 物料字段配置
 */
export interface MaterialField extends BaseFormItem {
  type: SmartFieldType.Material
  props: {
    /** 物料类型过滤 */
    materialTypes?: string[]
    /** 是否显示库存 */
    showInventory?: boolean
    /** 是否显示价格 */
    showPrice?: boolean
    /** 是否多选 */
    multiple?: boolean
    /** 是否可输入数量 */
    allowQuantity?: boolean
    /** 默认数量 */
    defaultQuantity?: number
    [key: string]: any
  }
}

/**
 * @interface DictionaryField
 * @description 数据字典字段配置
 */
export interface DictionaryField extends BaseFormItem {
  type: SmartFieldType.Dictionary
  props: {
    /** 字典编码 */
    dictCode: string
    /** 是否缓存 */
    cache?: boolean
    /** 缓存时间（秒） */
    cacheTime?: number
    /** 是否显示编码 */
    showCode?: boolean
    /** 是否多选 */
    multiple?: boolean
    [key: string]: any
  }
}

/**
 * @type SmartFormItem
 * @description SmartAbp扩展表单项联合类型
 */
export type SmartFormItem = 
  | DeviceParameterField
  | QualityInspectionField
  | WorkOrderField
  | BarcodeScannerField
  | SensorDataField
  | ProductionLineField
  | MaterialField
  | DictionaryField
  | BaseFormItem // 标准FormItem

/**
 * @interface SmartFormCreateRule
 * @description SmartAbp扩展的form-create规则
 */
export interface SmartFormCreateRule extends FormCreateRule {
  /** SmartAbp扩展字段类型 */
  smartType?: SmartFieldType
  
  /** 业务元数据 */
  businessMeta?: {
    /** 数据来源 */
    dataSource?: 'local' | 'api' | 'mqtt' | 'opcua'
    /** API端点 */
    apiEndpoint?: string
    /** 数据转换器 */
    transformer?: (data: any) => any
    /** 权限控制 */
    permissions?: string[]
    [key: string]: any
  }
}

// 所有SmartAbp扩展类型已在声明时导出，无需重复export

