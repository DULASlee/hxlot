/**
 * 🎯 lowcode-api 包导出文件
 * 🎯 低代码引擎核心功能 - 专注基础实现
 * ❌ 严禁添加AI智能辅助功能
 * ❌ 严禁添加多人协作功能
 * 📦 遵循packages目录架构 - 支持独立发包
 */
// 🔌 代码生成API客户端
export const codeGenerationApi = {
    // 🏗️ 生成完整模块代码
    async generateModule(config) {
        // TODO: 调用后端CodeGenerationAppService
        console.log('生成模块配置:', config);
        return {
            success: true,
            files: [],
            message: '代码生成完成'
        };
    },
    // 📊 获取数据库表列表
    async getDatabaseTables(connectionName = 'Default') {
        // TODO: 调用后端获取数据库表
        console.log('获取数据库表，连接:', connectionName);
        return [
            { name: 'Users', description: '用户表', schema: 'dbo' },
            { name: 'Projects', description: '项目表', schema: 'dbo' },
            { name: 'Orders', description: '订单表', schema: 'dbo' },
            { name: 'Products', description: '产品表', schema: 'dbo' }
        ];
    },
    // 🔍 读取表结构
    async readTableSchema(tableName, connectionName = 'Default') {
        // TODO: 调用后端读取表结构
        console.log('读取表结构:', tableName, '连接:', connectionName);
        return {
            tableName,
            columns: [],
            foreignKeys: [],
            indexes: []
        };
    }
};
// 🗃️ 数据库API
export const databaseApi = {
    async getAllTableNames(connectionName = 'Default') {
        const tables = await codeGenerationApi.getDatabaseTables(connectionName);
        return tables.map(table => table.name);
    },
    async readTableSchema(tableName, connectionName = 'Default') {
        return await codeGenerationApi.readTableSchema(tableName, connectionName);
    },
    // 📋 获取可用模板
    async getTemplates() {
        // TODO: 调用后端获取模板列表
        console.log('获取模板列表');
        return [
            {
                id: "crud-template",
                name: "CRUD模板",
                description: "标准增删改查模板"
            },
            {
                id: "form-template",
                name: "表单模板",
                description: "通用表单模板"
            }
        ];
    }
};
// 🔗 关系管理API (预留)
export const relationshipApi = {
    async createRelationship(data) {
        // TODO: 创建关系
        console.log('创建关系:', data);
    },
    async removeRelationship(leftId, rightId) {
        // TODO: 移除关系
        console.log('移除关系:', leftId, rightId);
    },
    async createRelationshipsBatch(data) {
        // TODO: 批量创建关系
        console.log('批量创建关系:', data.length, '个');
    }
};
