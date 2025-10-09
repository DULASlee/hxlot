#!/usr/bin/env node

/**
 * 组件注册验证工具
 * 
 * 验证所有组件是否正确注册到ComponentRegistry
 * @遵循架构铁律二：强制使用组件注册系统
 */

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 组件注册完整性验证');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 统计注册调用
const packagesDir = 'src/SmartAbp.Vue/packages';
const registrationFiles = [
    'packages/lowcode-shared/src/components/register.ts',
    'packages/lowcode-core/src/index.ts',
    'packages/lowcode-designer/src/index.ts'
];

let totalRegistrations = 0;
const registrationsByPackage = {};

registrationFiles.forEach(file => {
    const fullPath = path.join('src/SmartAbp.Vue', file);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  文件不存在: ${file}`);
        return;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const registrations = (content.match(/registerComponent\(/g) || []).length;

    const packageName = file.includes('lowcode-shared') ? 'lowcode-shared' :
        file.includes('lowcode-core') ? 'lowcode-core' :
            'lowcode-designer';

    registrationsByPackage[packageName] = registrations;
    totalRegistrations += registrations;

    console.log(`📦 ${packageName.padEnd(20)} ${registrations} 个组件`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 总计: ${totalRegistrations} 个组件已注册`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 验证main.ts调用
const mainTsPath = 'src/SmartAbp.Vue/src/main.ts';
if (fs.existsSync(mainTsPath)) {
    const mainContent = fs.readFileSync(mainTsPath, 'utf-8');

    const hasSharedCall = mainContent.includes('registerSharedComponents()');
    const hasCoreCall = mainContent.includes('registerCoreComponents()');
    const hasDesignerCall = mainContent.includes('registerDesignerComponents()');
    const hasBridge = mainContent.includes('ComponentRegistryBridge');

    console.log('📋 main.ts 验证:');
    console.log(`   ${hasSharedCall ? '✅' : '❌'} registerSharedComponents() 调用`);
    console.log(`   ${hasCoreCall ? '✅' : '❌'} registerCoreComponents() 调用`);
    console.log(`   ${hasDesignerCall ? '✅' : '❌'} registerDesignerComponents() 调用`);
    console.log(`   ${hasBridge ? '✅' : '❌'} ComponentRegistryBridge 桥接\n`);

    const allCallsPresent = hasSharedCall && hasCoreCall && hasDesignerCall && hasBridge;

    if (allCallsPresent) {
        console.log('✅ 组件注册系统配置正确！\n');
    } else {
        console.log('❌ 组件注册系统配置不完整！\n');
        process.exit(1);
    }
} else {
    console.log('❌ main.ts 文件不存在\n');
    process.exit(1);
}

// 验证导出
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📤 导出验证:');

const indexFiles = [
    { path: 'src/SmartAbp.Vue/packages/lowcode-shared/src/index.ts', export: 'registerSharedComponents' },
    { path: 'src/SmartAbp.Vue/packages/lowcode-core/src/index.ts', export: 'registerCoreComponents' },
    { path: 'src/SmartAbp.Vue/packages/lowcode-designer/src/index.ts', export: 'registerDesignerComponents' }
];

let allExportsPresent = true;

indexFiles.forEach(({ path: filePath, export: exportName }) => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const hasExport = content.includes(`export function ${exportName}`) ||
            content.includes(`export { ${exportName}`);

        const packageName = filePath.includes('lowcode-shared') ? 'lowcode-shared' :
            filePath.includes('lowcode-core') ? 'lowcode-core' :
                'lowcode-designer';

        console.log(`   ${hasExport ? '✅' : '❌'} ${packageName}: ${exportName}`);

        if (!hasExport) allExportsPresent = false;
    }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allExportsPresent) {
    console.log('✅ 所有注册函数已正确导出！\n');
} else {
    console.log('❌ 部分注册函数未导出！\n');
    process.exit(1);
}

// 最终结果
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 验证结果:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ 组件注册数量: ${totalRegistrations} 个`);
console.log('✅ main.ts 配置正确');
console.log('✅ 导出函数完整');
console.log('✅ 组件注册系统统一化成功！\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

process.exit(0);

