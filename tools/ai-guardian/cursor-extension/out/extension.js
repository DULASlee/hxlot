"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.AIGuardianExtension = void 0;
const vscode = require("vscode");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class AIGuardianExtension {
    constructor(context) {
        this.context = context;
        this.config = vscode.workspace.getConfiguration('aiGuardian');
        this.outputChannel = vscode.window.createOutputChannel('AI Guardian');
        // 1. 加载持久化状态
        this.aiState = this.loadState();
        // 2. 如果是首次加载，确保lastActivity是最新的
        if (this.aiState.activityCount === 0) {
            this.aiState.lastActivity = Date.now();
        }
        // 创建状态栏
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.context.subscriptions.push(this.statusBarItem);
        this.statusBarItem.command = 'aiGuardian.status';
        this.statusBarItem.show();
        this.initialize();
    }
    loadState() {
        const defaultState = {
            lastActivity: Date.now(),
            isOnline: true,
            activityCount: 0,
            engineLoaded: false,
            lastEngineCheck: 0
        };
        try {
            const storedState = this.context.workspaceState.get(AIGuardianExtension.STATE_KEY);
            this.log('✅ 成功加载持久化状态');
            return storedState || defaultState;
        }
        catch (error) {
            this.log(`⚠️ 加载持久化状态失败: ${error}`);
            return defaultState;
        }
    }
    async saveState() {
        try {
            await this.context.workspaceState.update(AIGuardianExtension.STATE_KEY, this.aiState);
            this.log('💾 状态已保存');
        }
        catch (error) {
            this.log(`❌ 保存状态失败: ${error}`);
        }
    }
    initialize() {
        this.log('🛡️ AI Guardian 插件已启动');
        this.updateStatusBar();
        // 监听配置变更
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('aiGuardian')) {
                this.onConfigChange();
            }
        }));
        if (this.config.get('enabled', true)) {
            this.startMonitoring();
            this.startEngineCheck();
        }
        // 监听编辑器活动
        this.setupActivityListeners();
    }
    setupActivityListeners() {
        // 监听文档变化
        vscode.workspace.onDidChangeTextDocument(() => {
            this.recordActivity('文档编辑');
        });
        // 监听命令执行 - 注释掉不支持的API
        // vscode.commands.onDidExecuteCommand((command) => {
        //   if (command.command.includes('chat') || command.command.includes('ai')) {
        //     this.recordActivity(`AI命令: ${command.command}`);
        //   }
        // });
        // 监听窗口焦点
        this.context.subscriptions.push(vscode.window.onDidChangeWindowState((state) => {
            if (state.focused) {
                this.recordActivity('窗口激活');
            }
        }));
    }
    recordActivity(activity = 'user_activity') {
        this.aiState.lastActivity = Date.now();
        this.aiState.activityCount++;
        this.aiState.isOnline = true;
        // 如果正在恢复中，现在停止
        this.stopRecoveryPolling();
        this.log(`📝 活动记录: ${activity}`);
        this.updateStatusBar();
        this.saveState(); // 保存状态
    }
    onConfigChange() {
        this.log('⚙️ 配置已变更，正在重新加载...');
        this.config = vscode.workspace.getConfiguration('aiGuardian');
        // 停止并重启定时器
        if (this.monitorTimer)
            clearInterval(this.monitorTimer);
        if (this.engineCheckTimer)
            clearInterval(this.engineCheckTimer);
        if (this.config.get('enabled', true)) {
            this.startMonitoring();
            this.startEngineCheck();
        }
        else {
            this.log('🔴 AI Guardian 已禁用');
        }
    }
    startMonitoring() {
        const interval = this.config.get('checkInterval', 30) * 1000;
        this.monitorTimer = setInterval(() => {
            this.checkAIStatus();
        }, interval);
        this.context.subscriptions.push({ dispose: () => clearInterval(this.monitorTimer) });
        this.log(`🚀 开始监控 (间隔: ${interval / 1000}秒)`);
    }
    startEngineCheck() {
        const engineCheckInterval = this.config.get('engineCheckInterval', 30) * 60 * 1000;
        // 立即执行一次检查
        this.checkExecutionEngine();
        // 设置定时检查
        this.engineCheckTimer = setInterval(() => {
            this.checkExecutionEngine();
        }, engineCheckInterval);
        this.context.subscriptions.push({ dispose: () => clearInterval(this.engineCheckTimer) });
        this.log(`🔧 开始执行引擎检查 (间隔: ${engineCheckInterval / 60000}分钟)`);
    }
    async checkExecutionEngine() {
        try {
            this.log('🔍 检查AI编程铁律执行引擎...');
            // 检查方法1: 查找执行引擎规则文件
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                this.aiState.engineLoaded = false;
                return;
            }
            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const engineRulesPath = path.join(workspaceRoot, '.cursor', 'rules', '00_执行引擎.mdc');
            let engineFileExists = false;
            try {
                await vscode.workspace.fs.stat(vscode.Uri.file(engineRulesPath));
                engineFileExists = true;
            }
            catch {
                engineFileExists = false;
            }
            // 检查方法2: 发送测试消息检查AI响应
            const testPassed = await this.testEngineResponse();
            // 综合判断
            const engineLoaded = engineFileExists && testPassed;
            const wasLoaded = this.aiState.engineLoaded;
            this.aiState.engineLoaded = engineLoaded;
            this.aiState.lastEngineCheck = Date.now();
            this.saveState(); // 保存状态
            if (engineLoaded && !wasLoaded) {
                this.log('✅ 执行引擎已加载');
                vscode.window.showInformationMessage('✅ AI编程铁律执行引擎已加载');
            }
            else if (!engineLoaded && wasLoaded) {
                this.log('⚠️ 执行引擎未加载');
                await this.promptLoadEngine();
            }
            else if (!engineLoaded) {
                this.log('⚠️ 执行引擎检查失败');
                await this.promptLoadEngine();
            }
            this.updateStatusBar();
        }
        catch (error) {
            this.log(`❌ 执行引擎检查出错: ${error}`);
        }
    }
    async testEngineResponse() {
        try {
            this.log('🧪 开始交互式验证AI执行引擎...');
            // 方法1: 使用VSCode Language Model API
            const canUseLanguageModel = await this.testWithLanguageModelAPI();
            if (canUseLanguageModel !== null) {
                return canUseLanguageModel;
            }
            // 方法2: 备用检测 - 检查执行引擎相关文件和活动
            return await this.testEngineFiles();
        }
        catch (error) {
            this.log(`❌ 引擎响应测试失败: ${error}`);
            return false;
        }
    }
    async testWithLanguageModelAPI() {
        try {
            // 检查是否有可用的语言模型
            const models = await vscode.lm.selectChatModels();
            if (!models || models.length === 0) {
                this.log('⚠️ 未找到可用的语言模型');
                return null;
            }
            const model = models[0];
            this.log(`🤖 使用模型: ${model.name || 'Unknown'}`);
            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    // 发送测试指令
                    const testPrompt = '请开启专家模式';
                    const message = vscode.LanguageModelChatMessage.User(testPrompt);
                    this.log(`📤 发送测试指令: ${testPrompt}`);
                    // 创建取消令牌（5秒超时）
                    const cancellationSource = new vscode.CancellationTokenSource();
                    setTimeout(() => cancellationSource.cancel(), 5000);
                    const request = await model.sendRequest([message], {}, cancellationSource.token);
                    // 收集响应
                    let response = '';
                    for await (const fragment of request.text) {
                        response += fragment;
                        // 限制响应长度，避免过长
                        if (response.length > 1000)
                            break;
                    }
                    this.log(`📥 AI响应 (尝试 ${i + 1}): ${response.substring(0, 200)}...`);
                    // 检查响应是否包含执行引擎启动标志
                    const engineKeywords = this.config.get('engineResponseKeywords', [
                        'AI编程铁律自动执行引擎已启动',
                        '专家模式已激活',
                        '九重爆雷',
                        '编程前强制学习',
                        '质量门禁检查'
                    ]);
                    const hasEngineResponse = engineKeywords.some(keyword => response.includes(keyword));
                    if (hasEngineResponse) {
                        this.log('✅ AI响应包含执行引擎标志');
                        return true;
                    }
                    else if (i < maxRetries - 1) {
                        this.log(`⚠️ AI响应未包含标志，将在 ${i + 1} 秒后重试...`);
                        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
                    }
                    else {
                        this.log('⚠️ AI响应未包含执行引擎标志 (所有重试失败)');
                        return false;
                    }
                }
                catch (error) {
                    if (i < maxRetries - 1) {
                        this.log(`❌ Language Model API测试失败 (尝试 ${i + 1}): ${error}，将在 ${i + 1} 秒后重试...`);
                        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
                    }
                    else {
                        this.log(`❌ Language Model API测试失败 (所有重试失败): ${error}`);
                        return null;
                    }
                }
            }
            return null; // 循环结束后应该返回一个值
        }
        catch (error) {
            this.log(`❌ Language Model API测试失败: ${error}`);
            return null;
        }
    }
    async testEngineFiles() {
        try {
            // 备用方案：检查执行引擎相关文件和活动
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders)
                return false;
            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            // 检查关键文件
            const keyFiles = [
                path.join(workspaceRoot, '.cursor', 'rules', '00_执行引擎.mdc'),
                path.join(workspaceRoot, '.ai-engine', 'ai-state.json')
            ];
            let keyFilesExist = 0;
            for (const file of keyFiles) {
                try {
                    await vscode.workspace.fs.stat(vscode.Uri.file(file));
                    keyFilesExist++;
                }
                catch {
                    continue;
                }
            }
            // 检查执行引擎目录
            const engineDirs = [
                path.join(workspaceRoot, 'src', 'SmartAbp.Vue', 'packages', 'lowcode-tools', 'src', 'execution'),
                path.join(workspaceRoot, '.ai-engine')
            ];
            let engineDirsExist = 0;
            for (const dir of engineDirs) {
                try {
                    await vscode.workspace.fs.stat(vscode.Uri.file(dir));
                    engineDirsExist++;
                }
                catch {
                    continue;
                }
            }
            // 综合判断：至少有1个关键文件和1个执行引擎目录
            const hasBasicInfrastructure = keyFilesExist >= 1 && engineDirsExist >= 1;
            this.log(`📊 备用检测结果: 关键文件${keyFilesExist}/2, 引擎目录${engineDirsExist}/2`);
            return hasBasicInfrastructure;
        }
        catch (error) {
            this.log(`❌ 文件检测失败: ${error}`);
            return false;
        }
    }
    async promptLoadEngine() {
        const action = await vscode.window.showWarningMessage('⚠️ AI编程铁律执行引擎未加载！建议立即加载以确保代码质量。', '立即加载', '发送加载指令', '30分钟后再检查');
        if (action === '立即加载') {
            await this.loadExecutionEngine();
        }
        else if (action === '发送加载指令') {
            await this.sendLoadEngineCommand();
        }
        // "30分钟后再检查" 不需要额外操作，定时器会自动执行
    }
    async loadExecutionEngine() {
        try {
            // 方法1: 尝试打开执行引擎规则文件
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const engineRulesPath = path.join(workspaceFolders[0].uri.fsPath, '.cursor', 'rules', '00_执行引擎.mdc');
                try {
                    const document = await vscode.workspace.openTextDocument(engineRulesPath);
                    await vscode.window.showTextDocument(document);
                    vscode.window.showInformationMessage('📖 执行引擎规则文件已打开，请AI学习加载');
                }
                catch (error) {
                    this.log(`⚠️ 无法打开规则文件: ${error}`);
                    await this.sendLoadEngineCommand();
                }
            }
            else {
                await this.sendLoadEngineCommand();
            }
        }
        catch (error) {
            this.log(`❌ 加载执行引擎失败: ${error}`);
            await this.sendLoadEngineCommand();
        }
    }
    async sendLoadEngineCommand() {
        const loadCommand = `请立即加载AI编程铁律执行引擎：

读取文件: .cursor/rules/00_执行引擎.mdc

并严格按照以下九重爆雷执行链执行：
1. 独立技术判断
2. 触发检测与启动  
3. 编程前强制学习
4. 增量迭代编程
5. 质量门禁检查
6. Git版本管理
7. 自动推进机制

请确认已加载执行引擎并开始工作！`;
        // 复制到剪贴板
        await vscode.env.clipboard.writeText(loadCommand);
        // 尝试打开聊天框
        try {
            await vscode.commands.executeCommand('workbench.action.chat.open');
        }
        catch (error) {
            // 如果无法打开聊天框，显示文档
        }
        // 显示加载指令
        const document = await vscode.workspace.openTextDocument({
            content: loadCommand,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage('📋 执行引擎加载指令已复制到剪贴板并打开文档，请发送给AI');
    }
    checkAIStatus() {
        const threshold = this.config.get('offlineThreshold', 90) * 1000;
        const inactiveDuration = Date.now() - this.aiState.lastActivity;
        if (inactiveDuration > threshold) {
            if (this.aiState.isOnline) {
                this.aiState.isOnline = false;
                this.saveState(); // 保存状态
                this.onAIOffline();
            }
        }
        else {
            if (!this.aiState.isOnline) {
                this.aiState.isOnline = true;
                this.saveState(); // 保存状态
                this.onAIOnline();
            }
        }
        this.updateStatusBar();
    }
    onAIOffline() {
        // 避免在已经在恢复时重复触发
        if (this.recoveryInterval) {
            return;
        }
        this.log('🔴 AI connection lost.');
        if (this.config.get('autoRecover', true)) {
            this.log('🚀 Starting silent auto-recovery sequence...');
            // 核心逻辑变更：不再使用轮询，而是尝试直接调用内部命令
            this.attemptDirectReconnect();
        }
        else {
            this.log('ℹ️ Auto-recovery disabled. Manual intervention required.');
            this.updateStatusBar();
            vscode.window.showWarningMessage('AI大模型已断线，请手动处理。');
        }
    }
    async attemptDirectReconnect() {
        this.updateStatusBar(); // 更新为恢复中状态
        // ==================================================
        // Level 1: 查找真正的聊天命令 + 直接AI大模型通信恢复
        // ==================================================
        this.log('⚡️ [Level 1] Finding real chat commands and attempting recovery...');
        try {
            // 1.1 列出所有可用命令，找到聊天相关的
            const allCommands = await vscode.commands.getCommands();
            const chatCommands = allCommands.filter(cmd => cmd.includes('chat') || cmd.includes('ai') || cmd.includes('copilot') || cmd.includes('cursor'));
            this.log(`🔍 [Level 1] Found ${chatCommands.length} potential chat commands:`);
            chatCommands.forEach(cmd => this.log(`  - ${cmd}`));
            // 1.2 尝试最可能的聊天命令
            const possibleChatCommands = [
                'workbench.action.chat.open',
                'workbench.action.chat.newChat',
                'workbench.panel.chat.view.copilot.focus',
                'github.copilot.interactiveEditor.explain',
                'cursor.chat.new',
                'cursor.chat.open'
            ];
            let chatOpened = false;
            for (const cmd of possibleChatCommands) {
                if (allCommands.includes(cmd)) {
                    try {
                        await vscode.commands.executeCommand(cmd);
                        this.log(`✅ [Level 1] Successfully executed: ${cmd}`);
                        chatOpened = true;
                        break;
                    }
                    catch (error) {
                        this.log(`⚠️ [Level 1] Failed to execute ${cmd}: ${error}`);
                    }
                }
            }
            if (!chatOpened) {
                this.log('⚠️ [Level 1] No working chat command found, proceeding with direct AI communication...');
            }
            // 1.3 短暂等待
            await new Promise(resolve => setTimeout(resolve, 500));
            // 1.3 获取可用的语言模型
            const models = await vscode.lm.selectChatModels();
            if (models && models.length > 0) {
                const model = models[0];
                this.log(`✅ [Level 1] Found AI model: ${model.name || 'Unknown'}`);
                // 1.4 构建智能恢复上下文
                const contextMessage = this.buildRecoveryContext();
                // 1.5 直接发送消息给AI大模型
                const message = vscode.LanguageModelChatMessage.User(contextMessage);
                const cancellationSource = new vscode.CancellationTokenSource();
                this.log('📤 [Level 1] Sending recovery message to AI model...');
                await model.sendRequest([message], {}, cancellationSource.token);
                this.log('✅ [Level 1] Recovery message sent successfully to AI model.');
                // 1.6 记录活动，标记为在线
                this.recordActivity('AI恢复消息已发送');
                return; // Level 1 成功，结束流程
            }
            else {
                this.log('⚠️ [Level 1] No AI models available. Escalating to Level 2...');
                throw new Error('No AI models available');
            }
        }
        catch (errorLvl1) {
            this.log(`⚠️ [Level 1] Failed: ${errorLvl1}. Escalating to Level 2...`);
        }
        // ==================================================
        // Level 2: 强制重载窗口（强力手段）
        // ==================================================
        this.log('🚀 [Level 2] Attempting forced window reload...');
        try {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
            // 注意：此命令执行后，当前插件实例会被销毁，后续代码不会执行
            // 这正是我们想要的——一个全新的开始
        }
        catch (errorLvl2) {
            this.log(`❌ [Level 2] Failed: ${errorLvl2}. Escalating to Level 3...`);
        }
        // ==================================================
        // Level 3: 完全重启Cursor IDE（终极保险）
        // ==================================================
        this.log('🆘 [Level 3] Attempting complete Cursor restart...');
        try {
            await this.restartCursorIDE();
        }
        catch (errorLvl3) {
            this.log(`❌ [Level 3] Failed: ${errorLvl3}. All recovery methods exhausted.`);
            // 所有方法都失败了，但我们不弹窗，静默记录即可
            // 下一个检测周期会再次尝试
        }
    }
    /**
     * 构建智能恢复上下文
     */
    buildRecoveryContext() {
        const context = this.aiState.lastWorkContext || '继续之前的开发任务';
        const timestamp = new Date().toLocaleString('zh-CN');
        return `# AI恢复指令 (${timestamp})

${context}

**请继续执行上述任务。**`;
    }
    /**
     * 完全重启Cursor IDE
     */
    async restartCursorIDE() {
        const platform = process.platform;
        const restartMessage = '请继续';
        // 先将恢复指令保存到持久存储，以便重启后使用
        await vscode.env.clipboard.writeText(restartMessage);
        await this.saveState();
        this.log(`🔄 [Level 3] Initiating Cursor restart on platform: ${platform}`);
        if (platform === 'win32') {
            // Windows: 使用taskkill杀死进程，然后重新启动
            const cursorExePath = process.execPath; // Cursor的可执行文件路径
            try {
                // 异步执行重启脚本（不等待结果，因为当前进程即将终止）
                (0, child_process_1.exec)(`taskkill /F /IM Cursor.exe && timeout /t 2 && start "" "${cursorExePath}"`, (error) => {
                    if (error) {
                        this.log(`⚠️ [Level 3] Restart command error: ${error}`);
                    }
                });
                this.log('✅ [Level 3] Windows restart command issued.');
            }
            catch (error) {
                this.log(`❌ [Level 3] Windows restart failed: ${error}`);
                throw error;
            }
        }
        else if (platform === 'darwin') {
            // macOS: 使用osascript重启应用
            try {
                (0, child_process_1.exec)(`osascript -e 'quit app "Cursor"' && sleep 2 && open -a Cursor`, (error) => {
                    if (error) {
                        this.log(`⚠️ [Level 3] Restart command error: ${error}`);
                    }
                });
                this.log('✅ [Level 3] macOS restart command issued.');
            }
            catch (error) {
                this.log(`❌ [Level 3] macOS restart failed: ${error}`);
                throw error;
            }
        }
        else {
            // Linux: 使用killall和启动命令
            try {
                (0, child_process_1.exec)(`killall cursor && sleep 2 && cursor &`, (error) => {
                    if (error) {
                        this.log(`⚠️ [Level 3] Restart command error: ${error}`);
                    }
                });
                this.log('✅ [Level 3] Linux restart command issued.');
            }
            catch (error) {
                this.log(`❌ [Level 3] Linux restart failed: ${error}`);
                throw error;
            }
        }
    }
    stopRecoveryPolling() {
        if (this.recoveryInterval) {
            clearInterval(this.recoveryInterval);
            this.recoveryInterval = undefined;
            this.log('✅ [Recovery Polling] Stopped.');
        }
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
            this.recoveryTimeout = undefined;
        }
    }
    recoverAI() {
        this.log('⚙️ Executing AI recovery command...');
        vscode.commands.executeCommand('cursor.continue');
        // 立即将状态更新为“恢复中”，提供即时反馈
        this.aiState.isOnline = true; // 假设恢复会成功
        this.aiState.lastActivity = Date.now();
        this.updateStatusBar();
        this.log('🟡 AI recovery in progress...');
    }
    onAIOnline() {
        this.log('✅ AI已恢复在线');
        this.stopRecoveryPolling(); // 如果在线了，确保停止恢复轮询
        this.updateStatusBar();
    }
    async autoRecover() {
        try {
            this.log('🔄 开始自动恢复...');
            // 方法1: 尝试执行聊天命令
            await vscode.commands.executeCommand('workbench.action.chat.open');
            // 等待聊天框打开
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 方法2: 发送恢复消息
            await this.sendRecoveryMessage();
            this.log('✅ 自动恢复完成');
        }
        catch (error) {
            this.log(`❌ 自动恢复失败: ${error}`);
            await this.manualRecover();
        }
    }
    async sendRecoveryMessage() {
        // 尝试通过不同方式发送恢复消息
        const recoveryCommands = [
            'workbench.action.chat.open',
            'workbench.action.chat.newChat',
            'workbench.action.quickOpen'
        ];
        for (const command of recoveryCommands) {
            try {
                await vscode.commands.executeCommand(command);
                // 模拟输入"请继续"
                await vscode.env.clipboard.writeText('请继续执行上一个任务');
                // 显示提示
                vscode.window.showInformationMessage('恢复指令已复制到剪贴板，请在聊天框粘贴发送');
                break;
            }
            catch (error) {
                continue;
            }
        }
    }
    async manualRecover() {
        const recovery = this.generateRecoveryInstructions();
        // 复制到剪贴板
        await vscode.env.clipboard.writeText(recovery);
        // 显示恢复指令
        const document = await vscode.workspace.openTextDocument({
            content: recovery,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document);
        vscode.window.showInformationMessage('恢复指令已复制到剪贴板并打开文档');
    }
    generateRecoveryInstructions() {
        return `
# 🔄 AI断线恢复指令

## 当前状态
- 最后活动: ${new Date(this.aiState.lastActivity).toLocaleString()}
- 活动次数: ${this.aiState.activityCount}
- 离线时长: ${Math.floor((Date.now() - this.aiState.lastActivity) / 1000)}秒

## 恢复步骤
1. 复制以下文本到Cursor聊天框
2. 发送消息重新连接AI

## 恢复指令
请继续执行上一个任务

## 详细上下文
- 项目: SmartAbp企业级低代码引擎
- 最后工作: AI编程铁律执行引擎优化
- 当前阶段: AI Guardian断线守护系统
    `.trim();
    }
    updateStatusBar() {
        const inactiveDuration = Math.floor((Date.now() - this.aiState.lastActivity) / 1000);
        const engineStatus = this.aiState.engineLoaded ? '🔧' : '⚠️';
        if (this.recoveryInterval) {
            this.statusBarItem.text = `🟡 AI 恢复中 (等待时机...)`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.tooltip = `AI Guardian - 正在尝试自动恢复AI连接...`;
            return;
        }
        if (this.aiState.isOnline) {
            this.statusBarItem.text = `${engineStatus}$(pulse) AI 在线 (${inactiveDuration}s)`;
            this.statusBarItem.backgroundColor = undefined;
        }
        else {
            this.statusBarItem.text = `${engineStatus}$(warning) AI 离线 (${inactiveDuration}s)`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        const engineInfo = this.aiState.engineLoaded ? '执行引擎已加载' : '执行引擎未加载';
        const lastCheck = this.aiState.lastEngineCheck ?
            new Date(this.aiState.lastEngineCheck).toLocaleTimeString() : '未检查';
        this.statusBarItem.tooltip = `AI Guardian - 点击查看详情
活动次数: ${this.aiState.activityCount}
${engineInfo}
上次引擎检查: ${lastCheck}`;
    }
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        this.outputChannel.appendLine(logMessage);
        console.log(logMessage);
    }
    dispose() {
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
        }
        this.stopRecoveryPolling();
        if (this.engineCheckTimer) {
            clearInterval(this.engineCheckTimer);
        }
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
    resetState() {
        this.aiState = {
            lastActivity: Date.now(),
            isOnline: true,
            activityCount: 0,
            engineLoaded: false,
            lastEngineCheck: 0
        };
        this.saveState();
        this.log('🔄 AI Guardian 状态已重置');
        vscode.window.showInformationMessage('AI Guardian 状态已重置');
    }
}
exports.AIGuardianExtension = AIGuardianExtension;
AIGuardianExtension.STATE_KEY = 'aiGuardianState';
// 插件激活函数
function activate(context) {
    console.log('🛡️ AI Guardian 插件正在激活...');
    const guardian = new AIGuardianExtension(context);
    // 注册命令
    const commands = [
        vscode.commands.registerCommand('aiGuardian.start', () => {
            guardian.startMonitoring();
            vscode.window.showInformationMessage('AI Guardian 已启动');
        }),
        vscode.commands.registerCommand('aiGuardian.stop', () => {
            guardian.dispose();
            vscode.window.showInformationMessage('AI Guardian 已停止');
        }),
        vscode.commands.registerCommand('aiGuardian.resetState', () => {
            guardian.resetState();
            vscode.window.showInformationMessage('AI Guardian 状态已重置');
        }),
        vscode.commands.registerCommand('aiGuardian.status', () => {
            const state = guardian.aiState;
            const duration = Math.floor((Date.now() - state.lastActivity) / 1000);
            const engineStatus = state.engineLoaded ? '已加载' : '未加载';
            const lastCheck = state.lastEngineCheck ?
                new Date(state.lastEngineCheck).toLocaleString() : '未检查';
            vscode.window.showInformationMessage(`AI状态: ${state.isOnline ? '在线' : '离线'} | 最后活动: ${duration}秒前 | 活动次数: ${state.activityCount}\n执行引擎: ${engineStatus} | 上次检查: ${lastCheck}`);
        }),
        vscode.commands.registerCommand('aiGuardian.recover', async () => {
            await guardian.manualRecover();
        }),
        vscode.commands.registerCommand('aiGuardian.checkEngine', async () => {
            await guardian.checkExecutionEngine();
            vscode.window.showInformationMessage('执行引擎检查完成');
        }),
        vscode.commands.registerCommand('aiGuardian.loadEngine', async () => {
            await guardian.loadExecutionEngine();
        })
    ];
    // 添加到上下文
    context.subscriptions.push(guardian, ...commands);
    console.log('✅ AI Guardian 插件已激活');
}
exports.activate = activate;
// 插件停用函数
function deactivate() {
    console.log('👋 AI Guardian 插件已停用');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map