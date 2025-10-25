// 🔍 一键生成按钮调试脚本
// 在浏览器控制台运行此脚本，检查哪些字段缺失

console.log('🔍 检查一键生成按钮状态...\n');

// 1. 检查按钮元素
const btn = document.querySelector('.generate-btn');
if (!btn) {
    console.error('❌ 未找到生成按钮！请确认页面已加载。');
} else {
    console.log('✅ 找到生成按钮');
    console.log('   - 是否禁用:', btn.disabled);
    console.log('   - 类名:', btn.className);
    console.log('   - 按钮文本:', btn.textContent.trim());
}

console.log('\n📋 检查必填字段：');

// 2. 检查表选择
const tableSelect = document.querySelector('.config-form .el-select .el-select__selected-item, .config-form .el-select input');
const selectedTable = tableSelect?.textContent?.trim() || tableSelect?.value || '';
console.log('1. 数据库表:', selectedTable || '❌ 未选择');

// 3. 检查系统名称
const systemNameInput = document.querySelector('input[placeholder*="请输入系统名称"], input[placeholder*="SystemName"]');
const systemName = systemNameInput?.value || '';
console.log('2. 系统名称:', systemName || '❌ 未填写');

// 4. 检查模块名称
const moduleNameInput = document.querySelector('input[placeholder*="请输入模块名称"], input[placeholder*="ModuleName"]');
const moduleName = moduleNameInput?.value || '';
console.log('3. 模块名称:', moduleName || '❌ 未填写');

// 5. 检查显示名称
const displayNameInput = document.querySelector('input[placeholder*="请输入显示名称"], input[placeholder*="DisplayName"]');
const displayName = displayNameInput?.value || '';
console.log('4. 显示名称:', displayName || '❌ 未填写');

// 6. 检查架构模式
const architectureSelects = document.querySelectorAll('.config-form .el-select');
let architecture = '';
if (architectureSelects.length > 1) {
    const archText = architectureSelects[1]?.querySelector('.el-select__selected-item, input');
    architecture = archText?.textContent?.trim() || archText?.value || '';
}
console.log('5. 架构模式:', architecture || '❌ 未选择');

// 7. 检查数据库提供者
let dbProvider = '';
if (architectureSelects.length > 2) {
    const dbText = architectureSelects[2]?.querySelector('.el-select__selected-item, input');
    dbProvider = dbText?.textContent?.trim() || dbText?.value || '';
}
console.log('6. 数据库提供者:', dbProvider || '❌ 未选择');

// 8. 检查父菜单ID
let parentMenu = '';
if (architectureSelects.length > 3) {
    const menuText = architectureSelects[3]?.querySelector('.el-select__selected-item, input');
    parentMenu = menuText?.textContent?.trim() || menuText?.value || '';
}
console.log('7. 父菜单ID:', parentMenu || '❌ 未选择');

// 总结
console.log('\n📊 总结：');
const allValid = selectedTable && systemName && moduleName && displayName && architecture && dbProvider && parentMenu;
if (allValid) {
    console.log('✅ 所有字段已填写，按钮应该可用');
    if (btn?.disabled) {
        console.warn('⚠️ 但按钮仍被禁用，可能是其他原因');
        console.log('   - 检查是否正在生成中 (generating)');
        console.log('   - 检查是否已生成完成 (generationComplete)');
    }
} else {
    console.error('❌ 有字段未填写，请填写后再试');
    console.log('\n💡 提示：');
    if (!selectedTable) console.log('   - 请选择数据库表');
    if (!systemName) console.log('   - 请填写系统名称（如：TenantManagement）');
    if (!moduleName) console.log('   - 请填写模块名称（如：SmartTenant）');
    if (!displayName) console.log('   - 请填写显示名称（如：租户管理）');
    if (!architecture) console.log('   - 请选择架构模式（如：DDD）');
    if (!dbProvider) console.log('   - 请选择数据库提供者（如：SqlServer）');
    if (!parentMenu) console.log('   - 请选择父菜单（如：系统管理）');
}

console.log('\n🔧 修复建议：');
console.log('1. 检查上方列出的缺失字段');
console.log('2. 填写所有必填字段');
console.log('3. 如果字段已填写但仍无法点击，请清除浏览器缓存（Ctrl+Shift+R）');

