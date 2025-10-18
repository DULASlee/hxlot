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
};

