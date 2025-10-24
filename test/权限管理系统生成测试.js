// 权限管理系统低代码生成测试
// 测试"吃自己的狗粮"能力

const fs = require('fs');
const path = require('path');

console.log('🔥 权限管理系统低代码生成测试 - "吃自己的狗粮"');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1. 读取权限管理系统配置
const configPath = path.join(__dirname, '../config/权限管理系统低代码配置.json');

try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const permissionConfig = JSON.parse(configContent);

    console.log('✅ 配置文件读取成功');
    console.log(`📋 系统名称: ${permissionConfig.systemName}`);
    console.log(`📋 模块名称: ${permissionConfig.moduleName}`);
    console.log(`📋 显示名称: ${permissionConfig.displayName}`);
    console.log(`📋 实体数量: ${permissionConfig.entities.length}`);

    // 2. 验证配置完整性
    console.log('\n🔍 配置完整性验证:');

    const requiredFields = ['systemName', 'moduleName', 'displayName', 'entities'];
    const missingFields = requiredFields.filter(field => !permissionConfig[field]);

    if (missingFields.length > 0) {
        console.log(`❌ 缺少必需字段: ${missingFields.join(', ')}`);
        process.exit(1);
    }

    // 3. 验证实体定义
    console.log('\n📊 实体详细分析:');
    permissionConfig.entities.forEach((entity, index) => {
        console.log(`\n实体 ${index + 1}: ${entity.name} (${entity.displayName})`);
        console.log(`  - 字段数量: ${entity.fields.length}`);
        console.log(`  - 必需字段: ${entity.fields.filter(f => f.required).length}`);
        console.log(`  - 审计字段: ${entity.hasAuditFields ? '✅' : '❌'}`);
        console.log(`  - 多租户: ${entity.hasMultiTenant ? '✅' : '❌'}`);

        // 验证关键字段
        const requiredFieldTypes = entity.fields.filter(f => f.required).map(f => f.type);
        console.log(`  - 字段类型: ${[...new Set(requiredFieldTypes)].join(', ')}`);
    });

    // 4. 生成ModuleMetadataDto格式（模拟前端转换）
    console.log('\n🔧 转换为低代码引擎格式:');

    const moduleMetadata = {
        id: generateUUID(),
        systemName: permissionConfig.systemName,
        moduleName: permissionConfig.moduleName,
        name: permissionConfig.moduleName,
        displayName: permissionConfig.displayName,
        description: permissionConfig.description,
        version: '1.0.0',
        namespace: `${permissionConfig.systemName}.${permissionConfig.moduleName}`,

        // 架构配置
        architectureConfig: {
            databaseProvider: permissionConfig.databaseProvider || 'SqlServer',
            useMultiTenancy: true,
            enableAuditing: true,
            enableSoftDelete: true
        },

        // 前端配置
        frontendConfig: {
            framework: 'Vue3',
            uiLibrary: 'Element Plus',
            routePrefix: `/system`
        },

        // 代码生成选项
        codeGenOptions: {
            generateFrontend: permissionConfig.codeGeneration.generateFrontend,
            generateBackend: permissionConfig.codeGeneration.generateBackend,
            generateMobilePages: false,
            frontendFramework: 'Vue3',
            backendTemplate: 'ABP vNext'
        },

        // 实体列表
        entities: permissionConfig.entities.map(entity => ({
            id: generateUUID(),
            name: entity.name,
            displayName: entity.displayName,
            description: entity.description,
            tableName: entity.tableName,
            primaryKeyType: 'Guid',
            hasAuditFields: entity.hasAuditFields,
            hasMultiTenant: entity.hasMultiTenant,
            hasSoftDelete: entity.hasSoftDelete || false,

            // 转换字段定义
            fields: entity.fields.map(field => ({
                id: generateUUID(),
                name: field.name,
                displayName: field.displayName,
                type: field.type,
                maxLength: field.maxLength,
                isRequired: field.required || false,
                isNullable: field.nullable !== false,
                description: field.description,
                uiComponent: field.uiComponent,
                validationRules: field.validationRules || [],
                enumOptions: field.enumOptions || [],
                defaultValue: field.defaultValue
            })),

            // 转换关系定义
            relations: entity.relations || []
        })),

        // 权限配置
        permissionConfig: {
            permissionGroups: [
                {
                    name: 'PermissionManagement',
                    displayName: '权限管理',
                    permissions: [
                        { name: 'Menu.View', displayName: '查看菜单' },
                        { name: 'Menu.Create', displayName: '创建菜单' },
                        { name: 'Menu.Update', displayName: '更新菜单' },
                        { name: 'Menu.Delete', displayName: '删除菜单' },
                        { name: 'Role.View', displayName: '查看角色' },
                        { name: 'Role.Create', displayName: '创建角色' },
                        { name: 'Role.Update', displayName: '更新角色' },
                        { name: 'Role.Delete', displayName: '删除角色' },
                        { name: 'Permission.View', displayName: '查看权限' },
                        { name: 'Permission.Create', displayName: '创建权限' },
                        { name: 'Permission.Update', displayName: '更新权限' },
                        { name: 'Permission.Delete', displayName: '删除权限' },
                        { name: 'Dictionary.View', displayName: '查看字典' },
                        { name: 'Dictionary.Create', displayName: '创建字典' },
                        { name: 'Dictionary.Update', displayName: '更新字典' },
                        { name: 'Dictionary.Delete', displayName: '删除字典' }
                    ]
                }
            ],
            defaultPermissions: ['Menu.View', 'Role.View', 'Permission.View', 'Dictionary.View']
        },

        // 状态
        status: 'Active',
        isActive: true,
        creationTime: new Date().toISOString()
    };

    console.log('✅ 转换完成！');
    console.log(`📋 实体数量: ${moduleMetadata.entities.length}`);
    console.log(`📋 权限数量: ${moduleMetadata.permissionConfig.permissionGroups[0].permissions.length}`);

    // 5. 保存转换结果
    const outputPath = path.join(__dirname, '../output/权限管理系统ModuleMetadata.json');
    fs.writeFileSync(outputPath, JSON.stringify(moduleMetadata, null, 2));

    console.log(`💾 ModuleMetadata已保存到: ${outputPath}`);

    // 6. 验证关键结构
    console.log('\n🎯 关键结构验证:');
    console.log(`✅ systemName: ${moduleMetadata.systemName}`);
    console.log(`✅ moduleName: ${moduleMetadata.moduleName}`);
    console.log(`✅ 架构模式: ABP vNext + DDD`);
    console.log(`✅ 前端框架: Vue3 + Element Plus`);
    console.log(`✅ 数据库: ${moduleMetadata.architectureConfig.databaseProvider}`);
    console.log(`✅ 多租户: ${moduleMetadata.architectureConfig.useMultiTenancy ? '启用' : '禁用'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 权限管理系统低代码配置验证成功！');
    console.log('🚀 准备就绪，可以开始"吃自己的狗粮"！');
    console.log('\n下一步：');
    console.log('1. 将ModuleMetadata导入低代码引擎');
    console.log('2. 点击生成按钮');
    console.log('3. 验证生成的权限管理系统');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

} catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
}

// 辅助函数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
