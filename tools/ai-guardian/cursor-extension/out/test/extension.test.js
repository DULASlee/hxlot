"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
const extension_1 = require("../extension");
// 模拟VSCode API
const mockVscode = {
    window: {
        createStatusBarItem: () => ({
            text: '',
            tooltip: '',
            show: () => { },
            hide: () => { },
            dispose: () => { }
        }),
        showInformationMessage: (message) => Promise.resolve(message),
        showWarningMessage: (message, ...items) => Promise.resolve(items[0]),
        showErrorMessage: (message) => Promise.resolve(message)
    },
    workspace: {
        workspaceFolders: [{
                uri: { fsPath: 'D:\\BAOBAB\\Baobab.SmartAbp\\hxlot' },
                name: 'hxlot',
                index: 0
            }],
        fs: {
            stat: (uri) => {
                // 模拟文件存在检查
                if (uri.fsPath.includes('00_执行引擎.mdc')) {
                    return Promise.resolve({ type: vscode.FileType.File, ctime: 0, mtime: 0, size: 1000 });
                }
                return Promise.reject(new Error('File not found'));
            }
        },
        openTextDocument: (path) => Promise.resolve({
            uri: { fsPath: path },
            fileName: path,
            languageId: 'markdown'
        })
    },
    commands: {
        executeCommand: (command) => Promise.resolve()
    },
    env: {
        clipboard: {
            writeText: (text) => Promise.resolve()
        }
    },
    lm: {
        selectChatModels: () => Promise.resolve([{
                name: 'test-model',
                sendRequest: () => ({
                    text: (async function* () {
                        yield '🔥 专家模式已激活！九重爆雷连环启动！';
                        yield 'AI编程铁律自动执行引擎已启动';
                    })()
                })
            }])
    },
    StatusBarAlignment: {
        Left: 1,
        Right: 2
    },
    FileType: {
        File: 1,
        Directory: 2
    },
    CancellationTokenSource: class {
        constructor() {
            this.token = { isCancellationRequested: false };
        }
        cancel() { }
        dispose() { }
    },
    LanguageModelChatMessage: {
        User: (content) => ({ role: 'user', content })
    },
    Uri: {
        file: (path) => ({ fsPath: path })
    }
};
// 替换vscode模块
global.vscode = mockVscode;
suite('AI Guardian Extension Tests', () => {
    let extension;
    let mockContext;
    setup(() => {
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve()
            }
        };
        extension = new extension_1.AIGuardianExtension(mockContext);
    });
    teardown(() => {
        if (extension) {
            extension.dispose();
        }
    });
    suite('AI状态监控功能测试', () => {
        test('应该正确初始化AI状态', () => {
            const initialState = extension.aiState;
            assert.strictEqual(initialState.isOnline, true, 'AI初始状态应该为在线');
            assert.strictEqual(initialState.lastActivity, 0, '最后活动时间应该为0');
            assert.strictEqual(initialState.activityCount, 0, '活动计数初始应该为0');
            assert.strictEqual(initialState.engineLoaded, false, '执行引擎初始状态应该为未加载');
            assert.strictEqual(initialState.lastEngineCheck, 0, '最后引擎检查时间应该为0');
        });
        test('应该能够记录AI活动', () => {
            extension.recordActivity();
            const state = extension.aiState;
            assert.notStrictEqual(state.lastActivity, 0, '记录活动后lastActivity应该不为0');
            assert.strictEqual(state.isOnline, true, '记录活动后AI应该为在线状态');
        });
        test('应该能够检测AI离线状态', async () => {
            // 模拟AI长时间无活动
            const state = extension.aiState;
            state.lastActivity = Date.now() - 11 * 60 * 1000; // 11分钟前
            const isOffline = await extension.isAIOffline();
            assert.strictEqual(isOffline, true, '11分钟无活动应该被检测为离线');
        });
        test('应该能够检测AI在线状态', async () => {
            extension.recordActivity(); // 记录当前活动
            const isOffline = await extension.isAIOffline();
            assert.strictEqual(isOffline, false, '刚记录活动应该被检测为在线');
        });
    });
    suite('执行引擎检查功能测试', () => {
        test('应该能够检查执行引擎文件', async () => {
            await extension.checkExecutionEngine();
            const state = extension.aiState;
            // 由于模拟环境中文件存在，engineLoaded应该为true
            assert.strictEqual(state.engineLoaded, true, '检查后执行引擎应该为已加载状态');
            assert.notStrictEqual(state.lastEngineCheck, 0, '检查后lastEngineCheck应该不为0');
        });
        test('应该能够测试引擎文件存在性', async () => {
            const result = await extension.testEngineFiles();
            assert.strictEqual(result, true, '模拟环境中引擎文件应该存在');
        });
    });
    suite('Language Model API交互功能测试', () => {
        test('应该能够与Language Model API交互', async () => {
            const result = await extension.testWithLanguageModelAPI();
            assert.strictEqual(result, true, 'Language Model API交互应该成功');
        });
        test('应该能够检测AI响应中的执行引擎标志', async () => {
            const result = await extension.testEngineResponse();
            assert.strictEqual(result, true, '应该能够检测到执行引擎标志');
        });
    });
    suite('自动恢复机制测试', () => {
        test('应该能够手动触发恢复', async () => {
            // 这个测试主要验证方法能够被调用而不抛出异常
            await extension.manualRecover();
            // 验证AI状态被重置为在线
            const state = extension.aiState;
            assert.strictEqual(state.isOnline, true, '手动恢复后AI应该为在线状态');
        });
        test('应该能够自动恢复', async () => {
            // 模拟AI离线状态
            const state = extension.aiState;
            state.isOnline = false;
            state.lastActivity = Date.now() - 15 * 60 * 1000; // 15分钟前
            await extension.autoRecover();
            // 验证恢复逻辑被执行（不会抛出异常）
            assert.ok(true, '自动恢复应该能够执行');
        });
        test('应该能够发送恢复消息', async () => {
            await extension.sendRecoveryMessage();
            // 验证方法能够执行完成
            assert.ok(true, '发送恢复消息应该能够执行');
        });
    });
    suite('状态栏更新功能测试', () => {
        test('应该能够更新状态栏显示', () => {
            extension.recordActivity(); // 确保有活动记录
            extension.updateStatusBar();
            const statusBarItem = extension.statusBarItem;
            assert.ok(statusBarItem.text.includes('AI'), '状态栏应该包含AI信息');
        });
        test('应该根据AI状态显示不同的状态栏文本', () => {
            // 测试在线状态
            extension.recordActivity();
            extension.updateStatusBar();
            let statusBarItem = extension.statusBarItem;
            assert.ok(statusBarItem.text.includes('🟢'), '在线状态应该显示绿色圆点');
            // 测试离线状态
            const state = extension.aiState;
            state.isOnline = false;
            extension.updateStatusBar();
            statusBarItem = extension.statusBarItem;
            assert.ok(statusBarItem.text.includes('🔴'), '离线状态应该显示红色圆点');
        });
        test('应该根据执行引擎状态显示不同的状态栏文本', async () => {
            // 设置引擎已加载状态
            await extension.checkExecutionEngine();
            extension.updateStatusBar();
            const statusBarItem = extension.statusBarItem;
            assert.ok(statusBarItem.text.includes('已加载'), '引擎已加载状态应该显示在状态栏');
        });
    });
    suite('生命周期管理测试', () => {
        test('应该能够启动监控', () => {
            extension.startMonitoring();
            // 验证定时器被创建
            const monitorTimer = extension.monitorTimer;
            const engineCheckTimer = extension.engineCheckTimer;
            assert.ok(monitorTimer, '应该创建AI状态监控定时器');
            assert.ok(engineCheckTimer, '应该创建执行引擎检查定时器');
        });
        test('应该能够正确清理资源', () => {
            extension.startMonitoring();
            // 验证dispose能够正常执行
            extension.dispose();
            // 验证定时器被清理
            const monitorTimer = extension.monitorTimer;
            const engineCheckTimer = extension.engineCheckTimer;
            assert.strictEqual(monitorTimer, undefined, 'dispose后监控定时器应该被清理');
            assert.strictEqual(engineCheckTimer, undefined, 'dispose后引擎检查定时器应该被清理');
        });
    });
});
suite('集成测试', () => {
    test('完整工作流程测试', async () => {
        const mockContext = {
            subscriptions: [],
            workspaceState: {
                get: () => undefined,
                update: () => Promise.resolve()
            },
            globalState: {
                get: () => undefined,
                update: () => Promise.resolve()
            }
        };
        const extension = new extension_1.AIGuardianExtension(mockContext);
        try {
            // 1. 启动监控
            extension.startMonitoring();
            // 2. 记录活动
            extension.recordActivity();
            // 3. 检查执行引擎
            await extension.checkExecutionEngine();
            // 4. 手动恢复测试
            await extension.manualRecover();
            // 5. 验证状态
            const state = extension.aiState;
            assert.strictEqual(state.isOnline, true, '完整流程后AI应该在线');
            assert.strictEqual(state.engineLoaded, true, '完整流程后执行引擎应该已加载');
            console.log('✅ 完整工作流程测试通过');
        }
        finally {
            extension.dispose();
        }
    });
});
//# sourceMappingURL=extension.test.js.map