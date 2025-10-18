/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
/**
 * 列定义
 */
export type SmartAbp_Domain_Entities_LowCode_ColumnDefinition = {
    /**
     * 列属性名
     */
    prop: string;
    /**
     * 列标签
     */
    label: string;
    /**
     * 列宽度（px）
     */
    width?: number | null;
    /**
     * 是否可排序
     */
    sortable?: boolean;
    /**
     * 是否可筛选
     */
    filterable?: boolean;
    /**
     * 是否可搜索
     */
    searchable?: boolean;
    /**
     * 格式化器（函数名称）
     */
    formatter?: string | null;
};

