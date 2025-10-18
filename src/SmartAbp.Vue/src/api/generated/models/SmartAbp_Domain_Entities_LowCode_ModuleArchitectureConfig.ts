/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 模块架构配置
 */
export type SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig = {
    /**
     * 架构模式：Crud | DDD | CQRS
     */
    pattern?: string | null;
    /**
     * 数据库提供程序：SqlServer | PostgreSQL | MySQL
     */
    databaseProvider?: string | null;
    /**
     * 连接字符串名称
     */
    connectionString?: string | null;
    /**
     * 数据库Schema名称
     */
    schema?: string | null;
    /**
     * 数据库表前缀
     * Phase 3新增：后端SSOT完整性
     */
    tablePrefix?: string | null;
    /**
     * 代码生成作者
     * Phase 3新增：后端SSOT完整性
     */
    author?: string | null;
    /**
     * 是否使用多租户
     * Phase 3新增：后端SSOT完整性
     */
    isMultiTenant?: boolean;
    /**
     * 是否使用软删除
     * Phase 3新增：后端SSOT完整性
     */
    useSoftDelete?: boolean;
    /**
     * 是否启用审计日志
     * Phase 3新增：后端SSOT完整性
     */
    enableAuditLog?: boolean;
};

