// 测试API请求脚本
const axios = require('axios');

const testData = {
    id: "test-123",
    systemName: "TenantManagement",
    name: "SmartTenant",
    displayName: "租户管理",
    description: "租户管理 模块",
    version: "1.0.0",
    architecturePattern: "Crud",
    namespace: "TenantManagement.SmartTenant",
    author: "SmartAbp Generator",

    databaseInfo: {
        connectionStringName: "Default",
        schema: "dbo",
        provider: "SqlServer"
    },

    featureManagement: {
        enableAdvancedQuery: true,
        enableBatchOperations: true,
        enableImportExport: true,
        enableVersioning: false
    },

    frontend: {
        parentId: "business",
        routePrefix: "/smarttenant"
    },

    generateMobilePages: false,
    dependencies: [],

    entities: [{
        id: "entity-123",
        name: "SM_SmartTenants",
        displayName: "SM_SmartTenants",
        description: "SM_SmartTenants 实体",
        properties: []
    }],

    menuConfig: [{
        id: "menu-123",
        name: "租户管理",
        path: "/smarttenant",
        icon: "database",
        parentId: "business",
        sort: 100,
        permissions: []
    }],

    permissionConfig: {
        permissionGroups: [],
        defaultPermissions: []
    }
};

axios.post('http://localhost:9002/api/code-generator/generate-module', testData, {
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(response => {
        console.log('✅ 成功:', response.data);
    })
    .catch(error => {
        console.error('❌ 错误:', error.response?.data || error.message);
        console.error('完整错误:', JSON.stringify(error.response?.data, null, 2));
    });

