/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Domain_Entities_LowCode_DataSourceConfig } from './SmartAbp_Domain_Entities_LowCode_DataSourceConfig';
import type { SmartAbp_Domain_Entities_LowCode_FormFieldConfig } from './SmartAbp_Domain_Entities_LowCode_FormFieldConfig';
import type { SmartAbp_Domain_Entities_LowCode_ListFieldConfig } from './SmartAbp_Domain_Entities_LowCode_ListFieldConfig';
/**
 * 属性UI配置（JSON存储）
 * Phase 1A 调整：保留在 Domain 层，通过 NSwag 配置扫描
 */
export type SmartAbp_Domain_Entities_LowCode_PropertyUIConfig = {
    /**
     * 列表页是否显示
     */
    listVisible?: boolean;
    /**
     * 表单页是否显示
     */
    formVisible?: boolean;
    /**
     * 详情页是否显示
     */
    detailVisible?: boolean;
    /**
     * 是否可搜索
     */
    searchable?: boolean;
    /**
     * 是否可排序
     */
    sortable?: boolean;
    /**
     * 是否可筛选
     */
    filterable?: boolean;
    /**
     * 控件类型（input, select, date, datetime, textarea, switch, radio, checkbox, upload, editor）
     */
    controlType: string;
    /**
     * 控件属性配置（如：{placeholder: "请输入", disabled: false}）
     */
    controlProps?: Record<string, any> | null;
    /**
     * 数据源配置（下拉框、单选框等需要）
     */
    dataSource?: SmartAbp_Domain_Entities_LowCode_DataSourceConfig | null;
    /**
     * 列表列配置
     */
    list?: SmartAbp_Domain_Entities_LowCode_ListFieldConfig | null;
    /**
     * 表单字段配置
     */
    form?: SmartAbp_Domain_Entities_LowCode_FormFieldConfig | null;
    /**
     * 显示格式化（如：{date} -> YYYY-MM-DD）
     */
    displayFormat?: string | null;
    /**
     * 前缀（如：¥、$）
     */
    prefix?: string | null;
    /**
     * 后缀（如：元、美元）
     */
    suffix?: string | null;
};

