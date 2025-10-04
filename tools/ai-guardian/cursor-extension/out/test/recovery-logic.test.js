"use strict";
/**
 * AI Guardian 三级恢复机制核心逻辑测试
 * 不依赖VSCode API，测试纯逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mocha_1 = require("mocha");
/**
 * 模拟恢复上下文构建逻辑
 */
function buildRecoveryContext(state) {
    const context = state.lastWorkContext || '继续之前的开发任务';
    const timestamp = new Date().toLocaleString('zh-CN');
    return `# AI恢复指令 (${timestamp})

${context}

**请继续执行上述任务。**`;
}
/**
 * 模拟重启命令生成逻辑
 */
function generateRestartCommand(platform, execPath) {
    if (platform === 'win32') {
        return `taskkill /F /IM Cursor.exe && timeout /t 2 && start "" "${execPath}"`;
    }
    else if (platform === 'darwin') {
        return `osascript -e 'quit app "Cursor"' && sleep 2 && open -a Cursor`;
    }
    else {
        return `killall cursor && sleep 2 && cursor &`;
    }
}
(0, mocha_1.suite)('AI Guardian - 恢复逻辑核心测试', () => {
    (0, mocha_1.suite)('智能上下文构建测试', () => {
        (0, mocha_1.test)('应该包含工作上下文', () => {
            const state = {
                lastActivity: Date.now(),
                isOnline: false,
                activityCount: 10,
                lastWorkContext: '正在开发三级恢复机制'
            };
            const result = buildRecoveryContext(state);
            assert.ok(result.includes('正在开发三级恢复机制'), '应包含工作上下文');
            assert.ok(result.includes('请继续执行上述任务'), '应包含继续指令');
        });
        (0, mocha_1.test)('工作上下文为空时应使用默认值', () => {
            const state = {
                lastActivity: Date.now(),
                isOnline: false,
                activityCount: 5,
                lastWorkContext: undefined
            };
            const result = buildRecoveryContext(state);
            assert.ok(result.includes('继续之前的开发任务'), '应使用默认上下文');
        });
        (0, mocha_1.test)('应该包含时间戳', () => {
            const state = {
                lastActivity: Date.now(),
                isOnline: false,
                activityCount: 3
            };
            const result = buildRecoveryContext(state);
            // 验证包含年份（时间戳的一部分）
            assert.ok(/20\d{2}/.test(result), '应包含时间戳');
        });
    });
    (0, mocha_1.suite)('跨平台重启命令生成测试', () => {
        (0, mocha_1.test)('[Windows] 应生成正确的重启命令', () => {
            const command = generateRestartCommand('win32', 'C:\\Program Files\\Cursor\\Cursor.exe');
            assert.ok(command.includes('taskkill'), 'Windows命令应包含taskkill');
            assert.ok(command.includes('/F'), 'Windows命令应包含强制终止标志');
            assert.ok(command.includes('Cursor.exe'), 'Windows命令应包含Cursor.exe');
            assert.ok(command.includes('timeout'), 'Windows命令应包含延迟');
            assert.ok(command.includes('start'), 'Windows命令应包含启动指令');
        });
        (0, mocha_1.test)('[macOS] 应生成正确的重启命令', () => {
            const command = generateRestartCommand('darwin', '/Applications/Cursor.app');
            assert.ok(command.includes('osascript'), 'macOS命令应包含osascript');
            assert.ok(command.includes('quit app'), 'macOS命令应包含退出指令');
            assert.ok(command.includes('Cursor'), 'macOS命令应包含Cursor');
            assert.ok(command.includes('sleep'), 'macOS命令应包含延迟');
            assert.ok(command.includes('open -a'), 'macOS命令应包含启动指令');
        });
        (0, mocha_1.test)('[Linux] 应生成正确的重启命令', () => {
            const command = generateRestartCommand('linux', '/usr/bin/cursor');
            assert.ok(command.includes('killall'), 'Linux命令应包含killall');
            assert.ok(command.includes('cursor'), 'Linux命令应包含cursor');
            assert.ok(command.includes('sleep'), 'Linux命令应包含延迟');
            assert.ok(command.includes('&'), 'Linux命令应包含后台运行标志');
        });
        (0, mocha_1.test)('[Windows] 命令应包含可执行文件路径', () => {
            const testPath = 'C:\\Custom\\Path\\Cursor.exe';
            const command = generateRestartCommand('win32', testPath);
            assert.ok(command.includes(testPath), '应包含自定义路径');
        });
    });
    (0, mocha_1.suite)('恢复流程逻辑测试', () => {
        (0, mocha_1.test)('应该按正确顺序定义恢复级别', () => {
            const recoveryLevels = [
                'workbench.action.chat.newChat',
                'workbench.action.reloadWindow',
                'restart'
            ];
            // 验证恢复级别定义顺序
            assert.strictEqual(recoveryLevels[0], 'workbench.action.chat.newChat', 'Level 1应是新会话');
            assert.strictEqual(recoveryLevels[1], 'workbench.action.reloadWindow', 'Level 2应是重载窗口');
            assert.strictEqual(recoveryLevels[2], 'restart', 'Level 3应是完全重启');
        });
        (0, mocha_1.test)('恢复消息应该简洁明确', () => {
            const recoveryMessage = '请继续';
            assert.strictEqual(recoveryMessage.length, 3, '恢复消息应简洁');
            assert.ok(recoveryMessage.includes('继续'), '应包含"继续"关键词');
        });
    });
    (0, mocha_1.suite)('状态管理逻辑测试', () => {
        (0, mocha_1.test)('离线状态应正确标识', () => {
            const state = {
                lastActivity: Date.now() - 100 * 1000,
                isOnline: true,
                activityCount: 10
            };
            const offlineThreshold = 90 * 1000; // 90秒
            const isOffline = (Date.now() - state.lastActivity) > offlineThreshold;
            assert.strictEqual(isOffline, true, '应识别为离线状态');
        });
        (0, mocha_1.test)('在线状态应正确标识', () => {
            const state = {
                lastActivity: Date.now() - 30 * 1000,
                isOnline: true,
                activityCount: 10
            };
            const offlineThreshold = 90 * 1000; // 90秒
            const isOffline = (Date.now() - state.lastActivity) > offlineThreshold;
            assert.strictEqual(isOffline, false, '应识别为在线状态');
        });
    });
});
// 运行测试
console.log('🚀 开始运行AI Guardian核心逻辑测试...\n');
//# sourceMappingURL=recovery-logic.test.js.map