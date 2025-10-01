/**
 * 🎯 lowcode-api 包导出文件
 * 🎯 低代码引擎核心功能 - 专注基础实现
 * ❌ 严禁添加AI智能辅助功能
 * ❌ 严禁添加多人协作功能
 * 📦 遵循packages目录架构 - 支持独立发包
 */
export declare const codeGenerationApi: {
    generateModule(config: any): Promise<any>;
    getDatabaseTables(connectionName?: string): Promise<any[]>;
    readTableSchema(tableName: string, connectionName?: string): Promise<any>;
};
export declare const databaseApi: {
    getAllTableNames(connectionName?: string): Promise<string[]>;
    readTableSchema(tableName: string, connectionName?: string): Promise<any>;
    getTemplates(): Promise<any[]>;
};
export declare const relationshipApi: {
    createRelationship(data: any): Promise<void>;
    removeRelationship(leftId: string, rightId: string): Promise<void>;
    createRelationshipsBatch(data: any[]): Promise<void>;
};
