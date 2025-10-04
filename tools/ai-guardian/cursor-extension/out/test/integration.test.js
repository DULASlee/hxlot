"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
// 验证插件核心功能的集成测试
describe('AI Guardian 插件集成验证', function () {
    this.timeout(10000); // 设置10秒超时
    describe('插件基础架构验证', function () {
        it('应该能够加载插件主文件', function () {
            const fs = require('fs');
            const path = require('path');
            const mainFile = path.join(__dirname, '..', 'extension.js');
            assert.ok(fs.existsSync(mainFile), '主文件extension.js应该存在');
            const content = fs.readFileSync(mainFile, 'utf8');
            assert.ok(content.includes('AIGuardianExtension'), '主文件应该包含AIGuardianExtension类');
            assert.ok(content.includes('activate'), '主文件应该包含activate函数');
            assert.ok(content.includes('deactivate'), '主文件应该包含deactivate函数');
        });
        it('应该包含所有必需的依赖', function () {
            const fs = require('fs');
            const path = require('path');
            const packageFile = path.join(__dirname, '..', '..', 'package.json');
            assert.ok(fs.existsSync(packageFile), 'package.json应该存在');
            const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
            assert.strictEqual(pkg.name, 'ai-guardian', '插件名称应该正确');
            assert.strictEqual(pkg.main, './out/extension.js', '主入口应该正确');
            assert.ok(pkg.contributes, '应该有contributes配置');
            assert.ok(pkg.contributes.commands, '应该有命令配置');
            assert.ok(pkg.contributes.statusBarItems, '应该有状态栏配置');
        });
    });
    describe('插件功能模块验证', function () {
        it('应该包含AI状态监控功能', function () {
            const fs = require('fs');
            const path = require('path');
            const mainFile = path.join(__dirname, '..', 'extension.js');
            const content = fs.readFileSync(mainFile, 'utf8');
            assert.ok(content.includes('recordActivity'), '应该包含recordActivity方法');
            assert.ok(content.includes('onAIOffline'), '应该包含onAIOffline方法');
            assert.ok(content.includes('checkAIStatus'), '应该包含checkAIStatus方法');
        });
        it('应该包含执行引擎检查功能', function () {
            const fs = require('fs');
            const path = require('path');
            const mainFile = path.join(__dirname, '..', 'extension.js');
            const content = fs.readFileSync(mainFile, 'utf8');
            assert.ok(content.includes('checkExecutionEngine'), '应该包含checkExecutionEngine方法');
            assert.ok(content.includes('testEngineResponse'), '应该包含testEngineResponse方法');
            assert.ok(content.includes('loadExecutionEngine'), '应该包含loadExecutionEngine方法');
        });
        it('应该包含自动恢复功能', function () {
            const fs = require('fs');
            const path = require('path');
            const mainFile = path.join(__dirname, '..', 'extension.js');
            const content = fs.readFileSync(mainFile, 'utf8');
            assert.ok(content.includes('manualRecover'), '应该包含manualRecover方法');
            assert.ok(content.includes('autoRecover'), '应该包含autoRecover方法');
            assert.ok(content.includes('sendRecoveryMessage'), '应该包含sendRecoveryMessage方法');
        });
        it('应该包含Language Model API集成', function () {
            const fs = require('fs');
            const path = require('path');
            const mainFile = path.join(__dirname, '..', 'extension.js');
            const content = fs.readFileSync(mainFile, 'utf8');
            assert.ok(content.includes('testWithLanguageModelAPI'), '应该包含Language Model API测试');
            assert.ok(content.includes('selectChatModels'), '应该包含模型选择功能');
            assert.ok(content.includes('sendRequest'), '应该包含请求发送功能');
        });
    });
    describe('插件配置验证', function () {
        it('应该有正确的命令配置', function () {
            const fs = require('fs');
            const path = require('path');
            const packageFile = path.join(__dirname, '..', '..', 'package.json');
            const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
            const commands = pkg.contributes.commands;
            assert.ok(Array.isArray(commands), '命令应该是数组');
            assert.ok(commands.length >= 4, '应该至少有4个命令');
            const commandIds = commands.map(cmd => cmd.command);
            assert.ok(commandIds.includes('aiGuardian.start'), '应该包含启动命令');
            assert.ok(commandIds.includes('aiGuardian.recover'), '应该包含恢复命令');
            assert.ok(commandIds.includes('aiGuardian.checkEngine'), '应该包含引擎检查命令');
            assert.ok(commandIds.includes('aiGuardian.loadEngine'), '应该包含引擎加载命令');
        });
        it('应该有正确的状态栏配置', function () {
            const fs = require('fs');
            const path = require('path');
            const packageFile = path.join(__dirname, '..', '..', 'package.json');
            const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
            const statusBarItems = pkg.contributes.statusBarItems;
            assert.ok(Array.isArray(statusBarItems), '状态栏项应该是数组');
            assert.ok(statusBarItems.length >= 1, '应该至少有1个状态栏项');
            const statusBarItem = statusBarItems[0];
            assert.strictEqual(statusBarItem.id, 'aiGuardian.status', '状态栏ID应该正确');
            assert.strictEqual(statusBarItem.alignment, 'right', '状态栏对齐应该正确');
        });
        it('应该有正确的API权限配置', function () {
            const fs = require('fs');
            const path = require('path');
            const packageFile = path.join(__dirname, '..', '..', 'package.json');
            const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
            assert.ok(pkg.enabledApiProposals, '应该有API权限配置');
            assert.ok(pkg.enabledApiProposals.includes('languageModels'), '应该包含Language Model API权限');
        });
    });
    describe('插件性能验证', function () {
        it('主文件大小应该合理', function () {
            const fs = require('fs');
            const path = require('path');
            const mainFile = path.join(__dirname, '..', 'extension.js');
            const stats = fs.statSync(mainFile);
            // 主文件应该小于100KB
            assert.ok(stats.size < 100 * 1024, `主文件大小应该小于100KB，当前：${Math.round(stats.size / 1024)}KB`);
            console.log(`✅ 主文件大小：${Math.round(stats.size / 1024)}KB`);
        });
        it('编译输出应该包含源映射', function () {
            const fs = require('fs');
            const path = require('path');
            const mapFile = path.join(__dirname, '..', 'extension.js.map');
            assert.ok(fs.existsSync(mapFile), '应该存在源映射文件');
            const mapContent = fs.readFileSync(mapFile, 'utf8');
            const sourceMap = JSON.parse(mapContent);
            assert.ok(sourceMap.sources, '源映射应该包含源文件信息');
            assert.ok(sourceMap.sources.length > 0, '应该至少有一个源文件');
        });
    });
});
console.log('🔍 AI Guardian 插件集成验证启动...');
//# sourceMappingURL=integration.test.js.map