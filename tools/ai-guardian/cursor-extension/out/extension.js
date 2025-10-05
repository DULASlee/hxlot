"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.AIGuardianExtension = void 0;
const child_process_1 = require("child_process");
const path = require("path");
const util_1 = require("util");
const vscode = require("vscode");
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
            lastEngineCheck: 0,
            isRestarting: false,
            restartCount: 0,
            lastRestartTime: 0,
            guardianActive: true,
            autoRecoveryEnabled: true
        };
        try {
            const storedState = this.context.workspaceState.get(AIGuardianExtension.STATE_KEY);
            if (storedState) {
                // 合并状态，确保新字段有默认值
                const mergedState = { ...defaultState, ...storedState };
                this.log('✅ 成功加载持久化状态');
                // 检查是否是重启后的恢复
                if (storedState.isRestarting) {
                    this.log('🔄 检测到重启恢复，准备自动恢复AI连接...');
                    mergedState.isRestarting = false;
                    mergedState.restartCount++;
                    mergedState.lastRestartTime = Date.now();
                    // 延迟执行自动恢复
                    setTimeout(() => {
                        this.handleRestartRecovery();
                    }, 3000);
                }
                return mergedState;
            }
            else {
                this.log('📝 使用默认状态');
                return defaultState;
            }
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
        // 自我检查功能
        this.performSelfCheck();
        // 监听配置变更
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('aiGuardian')) {
                this.onConfigChange();
            }
        }));
        if (this.config.get('enabled', true) && this.aiState.guardianActive) {
            this.startMonitoring();
            this.startEngineCheck();
        }
        // 监听编辑器活动
        this.setupActivityListeners();
        // 启动自我监控
        this.startSelfMonitoring();
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
        // Level 1: 智能三级恢复策略（集成Python脚本功能）
        // ==================================================
        this.log('⚡️ [Level 1] Starting intelligent three-phase recovery strategy...');
        // 第一阶段：在当前会话中尝试3次
        for (let phase1Attempt = 1; phase1Attempt <= 3; phase1Attempt++) {
            this.log(`🔄 [Phase 1] Recovery attempt ${phase1Attempt}/3`);
            // 先尝试关闭可能的对话框
            await this.closeDialogsAndModals();
            if (await this.smartSendRecoveryMessage(1)) {
                // 等待15秒检测连接
                if (await this.waitForConnection(15)) {
                    this.log('✅ [Phase 1] AI connection recovered successfully');
                    return;
                }
            }
            if (phase1Attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒再重试
            }
        }
        // 第二阶段：开启新会话尝试3次
        for (let phase2Attempt = 1; phase2Attempt <= 3; phase2Attempt++) {
            this.log(`🔄 [Phase 2] Recovery attempt ${phase2Attempt}/3 - New session`);
            // 开启新会话
            if (await this.openNewChatSession()) {
                // 先尝试关闭可能的对话框
                await this.closeDialogsAndModals();
                if (await this.smartSendRecoveryMessage(2)) {
                    // 等待15秒检测连接
                    if (await this.waitForConnection(15)) {
                        this.log('✅ [Phase 2] AI connection recovered successfully (new session)');
                        return;
                    }
                }
            }
            if (phase2Attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒再重试
            }
        }
        this.log('⚠️ [Level 1] All recovery attempts failed, escalating to Level 2...');
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
     * 关闭对话框和模态框（集成Python脚本功能）
     */
    async closeDialogsAndModals() {
        try {
            this.log('🔧 [Dialog Control] Attempting to close dialogs and modals...');
            // 方法1: 尝试ESC键序列（模拟Python脚本的pyautogui.press('esc')）
            await this.sendEscapeKeySequence();
            // 方法2: 尝试关闭活动的编辑器
            try {
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            catch (error) {
                this.log(`⚠️ [Dialog Control] Close active editor failed: ${error}`);
            }
            // 方法3: 尝试取消当前操作
            try {
                await vscode.commands.executeCommand('workbench.action.cancelOperation');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            catch (error) {
                this.log(`⚠️ [Dialog Control] Cancel operation failed: ${error}`);
            }
            // 方法4: 尝试关闭通知
            try {
                await vscode.commands.executeCommand('notifications.clearAll');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            catch (error) {
                this.log(`⚠️ [Dialog Control] Clear notifications failed: ${error}`);
            }
            // 方法5: 尝试关闭快速选择
            try {
                await vscode.commands.executeCommand('workbench.action.closeQuickOpen');
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            catch (error) {
                this.log(`⚠️ [Dialog Control] Close quick open failed: ${error}`);
            }
            this.log('✅ [Dialog Control] Dialog close attempts completed');
        }
        catch (error) {
            this.log(`❌ [Dialog Control] Failed to close dialogs: ${error}`);
        }
    }
    /**
     * 发送ESC键序列（模拟Python脚本的pyautogui.press('esc')）
     */
    async sendEscapeKeySequence() {
        try {
            // 使用VSCode的键盘快捷键API
            await vscode.commands.executeCommand('workbench.action.acceptSelectedSuggestion');
            await new Promise(resolve => setTimeout(resolve, 500));
            // 尝试ESC键的替代命令
            await vscode.commands.executeCommand('workbench.action.closeQuickOpen');
            await new Promise(resolve => setTimeout(resolve, 500));
            // 再次尝试ESC键
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            await new Promise(resolve => setTimeout(resolve, 500));
            this.log('✅ [Escape Key] ESC key sequence sent');
        }
        catch (error) {
            this.log(`⚠️ [Escape Key] ESC key sequence failed: ${error}`);
        }
    }
    /**
     * 智能发送恢复消息（集成Python脚本的smart_send_continue功能）
     */
    async smartSendRecoveryMessage(phase) {
        try {
            this.log(`📤 [Smart Send] Phase ${phase} - Sending recovery message...`);
            // 阶段1: 使用当前聊天框
            if (phase === 1) {
                // 尝试打开聊天
                await vscode.commands.executeCommand('workbench.action.chat.open');
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            // 阶段2: 开启新会话
            if (phase === 2) {
                this.log('🔄 [Smart Send] Attempting new session recovery...');
                await vscode.commands.executeCommand('workbench.action.chat.newChat');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            // 获取可用的语言模型
            const models = await vscode.lm.selectChatModels();
            if (models && models.length > 0) {
                const model = models[0];
                this.log(`✅ [Smart Send] Found AI model: ${model.name || 'Unknown'}`);
                // 构建智能恢复上下文
                const contextMessage = this.buildRecoveryContext();
                // 直接发送消息给AI大模型
                const message = vscode.LanguageModelChatMessage.User(contextMessage);
                const cancellationSource = new vscode.CancellationTokenSource();
                this.log('📤 [Smart Send] Sending recovery message to AI model...');
                await model.sendRequest([message], {}, cancellationSource.token);
                this.log(`✅ [Smart Send] Recovery message sent successfully (Phase ${phase})`);
                // 记录活动，标记为在线
                this.recordActivity(`AI恢复消息已发送 (Phase ${phase})`);
                return true;
            }
            else {
                this.log('⚠️ [Smart Send] No AI models available');
                return false;
            }
        }
        catch (error) {
            this.log(`❌ [Smart Send] Failed to send recovery message: ${error}`);
            return false;
        }
    }
    /**
     * 开启新聊天会话（集成Python脚本的open_new_chat_session功能）
     */
    async openNewChatSession() {
        try {
            this.log('🔄 [New Session] Opening new chat session...');
            // 尝试多种新会话命令
            const newSessionCommands = [
                'workbench.action.chat.newChat',
                'cursor.chat.new',
                'workbench.action.chat.open'
            ];
            for (const cmd of newSessionCommands) {
                try {
                    await vscode.commands.executeCommand(cmd);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    this.log(`✅ [New Session] Successfully executed: ${cmd}`);
                    return true;
                }
                catch (error) {
                    this.log(`⚠️ [New Session] Failed to execute ${cmd}: ${error}`);
                }
            }
            this.log('❌ [New Session] All new session commands failed');
            return false;
        }
        catch (error) {
            this.log(`❌ [New Session] Failed to open new session: ${error}`);
            return false;
        }
    }
    /**
     * 等待连接检测（集成Python脚本的wait_for_connection功能）
     */
    async waitForConnection(timeoutSeconds) {
        this.log(`⏳ [Wait Connection] Waiting for AI connection (${timeoutSeconds}s)...`);
        for (let i = 0; i < timeoutSeconds; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 检测AI是否已连接
            if (this.isAIConnected()) {
                this.log('✅ [Wait Connection] AI connection detected!');
                return true;
            }
        }
        this.log('❌ [Wait Connection] AI connection timeout');
        return false;
    }
    /**
     * 检测AI是否已连接（集成Python脚本的is_ai_connected功能）
     */
    isAIConnected() {
        try {
            const lastActivity = this.aiState.lastActivity || 0;
            const inactiveSeconds = (Date.now() - lastActivity) / 1000;
            // 30秒内有活动认为已连接
            const isConnected = inactiveSeconds < 30;
            if (isConnected) {
                this.log(`✅ [AI Status] AI is connected (last activity: ${inactiveSeconds.toFixed(1)}s ago)`);
            }
            else {
                this.log(`⚠️ [AI Status] AI appears disconnected (last activity: ${inactiveSeconds.toFixed(1)}s ago)`);
            }
            return isConnected;
        }
        catch (error) {
            this.log(`❌ [AI Status] Error checking AI connection: ${error}`);
            return false;
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
     * 🔥 新增：列出所有可用的聊天相关命令
     */
    async listAvailableChatCommands() {
        try {
            this.log('🔍 [List Commands] 正在列出所有聊天相关命令...');
            const allCommands = await vscode.commands.getCommands();
            const chatRelatedCommands = allCommands.filter(cmd => cmd.includes('chat') ||
                cmd.includes('cursor') ||
                cmd.includes('ai') ||
                cmd.includes('copilot') ||
                cmd.includes('composer'));
            // 创建报告文档
            const report = `# Cursor/AI 相关命令列表
      
## 总计：${chatRelatedCommands.length} 个命令

${chatRelatedCommands.map((cmd, index) => `${index + 1}. \`${cmd}\``).join('\n')}

---

**建议测试这些命令以找到正确的打开聊天框命令**

使用方法：
1. 打开命令面板（Ctrl+Shift+P）
2. 输入命令名称
3. 观察是否打开聊天框
`;
            // 显示报告
            const document = await vscode.workspace.openTextDocument({
                content: report,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(document);
            this.log(`✅ [List Commands] 找到 ${chatRelatedCommands.length} 个相关命令`);
            vscode.window.showInformationMessage(`找到 ${chatRelatedCommands.length} 个聊天相关命令，已在新文档中显示`);
        }
        catch (error) {
            this.log(`❌ [List Commands] 列出命令失败: ${error}`);
            vscode.window.showErrorMessage('列出命令失败');
        }
    }
    /**
     * 🔥 新增：测试打开聊天框的各种方法
     */
    async testOpenChatbox() {
        try {
            this.log('🧪 [Test Chatbox] 开始测试打开聊天框...');
            await vscode.window.showInformationMessage('开始测试打开聊天框，请观察IDE行为');
            // 测试所有可能的命令
            const testCommands = [
                'aichat.newchat',
                'workbench.action.chat.open',
                'cursor.openChat',
                'cursor.newChat',
                'composer.open',
                'workbench.panel.chat.view.copilot.focus'
            ];
            let successCount = 0;
            const results = [];
            for (const cmd of testCommands) {
                try {
                    this.log(`🧪 [Test Chatbox] 测试命令: ${cmd}`);
                    await vscode.commands.executeCommand(cmd);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    successCount++;
                    results.push(`✅ ${cmd} - 成功执行`);
                    this.log(`✅ [Test Chatbox] ${cmd} 成功`);
                }
                catch (error) {
                    results.push(`❌ ${cmd} - 失败: ${error}`);
                    this.log(`❌ [Test Chatbox] ${cmd} 失败: ${error}`);
                }
            }
            // 显示测试结果
            const report = `# 聊天框打开测试报告

## 测试结果：${successCount}/${testCommands.length} 个命令成功

${results.join('\n')}

---

**建议**：使用成功的命令来打开聊天框
`;
            const document = await vscode.workspace.openTextDocument({
                content: report,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(document);
            vscode.window.showInformationMessage(`测试完成：${successCount}/${testCommands.length} 个命令成功`);
        }
        catch (error) {
            this.log(`❌ [Test Chatbox] 测试失败: ${error}`);
            vscode.window.showErrorMessage('测试失败');
        }
    }
    /**
     * 完全重启Cursor IDE（智能重试版本）
     */
    async restartCursorIDE() {
        const platform = process.platform;
        const restartMessage = '请继续推进';
        // 标记正在重启，保存状态
        this.aiState.isRestarting = true;
        this.aiState.lastWorkContext = 'AI Guardian重启恢复 - 请继续推进';
        await this.saveState();
        this.log(`🔄 [Level 3] Initiating Cursor restart on platform: ${platform}`);
        if (platform === 'win32') {
            // Windows: 使用智能重试策略
            await this.restartCursorIDEWithRetry();
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
    /**
     * Windows平台智能重试重启策略
     */
    async restartCursorIDEWithRetry() {
        const cursorExePath = process.execPath;
        const autoInputScript = path.join(__dirname, '..', '..', '..', 'tools', 'ai-guardian', 'restart-auto-input.ps1');
        try {
            // 步骤1: 重启IDE
            this.log('🔄 [Restart] 正在重启Cursor IDE...');
            const restartCommand = `taskkill /F /IM Cursor.exe && timeout /t 2 && start "" "${cursorExePath}"`;
            (0, child_process_1.exec)(restartCommand, (error) => {
                if (error) {
                    this.log(`⚠️ [Restart] Restart command error: ${error}`);
                }
                else {
                    this.log('✅ [Restart] IDE重启命令已执行');
                }
            });
            // 步骤2: 等待IDE启动后，开始智能重试
            setTimeout(async () => {
                await this.startIntelligentRetry(autoInputScript);
            }, 10000); // 等待10秒让IDE完全启动
        }
        catch (error) {
            this.log(`❌ [Restart] Windows restart failed: ${error}`);
            throw error;
        }
    }
    /**
     * 智能重试策略：交替向两个聊天框发送消息
     */
    async startIntelligentRetry(autoInputScript) {
        const maxRetries = 5; // 最多重试5次
        let retryCount = 0;
        let useNormalChatbox = true; // 交替使用：true=正常聊天框，false=新会话对话框
        this.log('🧠 [Smart Retry] 开始智能重试策略...');
        const retryLoop = async () => {
            if (retryCount >= maxRetries) {
                this.log('❌ [Smart Retry] 达到最大重试次数，停止重试');
                this.aiState.isRestarting = false;
                await this.saveState();
                return;
            }
            retryCount++;
            const mode = useNormalChatbox ? 'normal' : 'newSession';
            const modeName = useNormalChatbox ? '正常聊天框' : '新会话对话框';
            this.log(`🔄 [Smart Retry] 第${retryCount}次尝试 - 向${modeName}发送消息`);
            try {
                // 执行PowerShell脚本
                const command = `pwsh -NoProfile -ExecutionPolicy Bypass -File "${autoInputScript}" -Mode ${mode} -DelaySeconds 2`;
                (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                    if (error) {
                        this.log(`⚠️ [Smart Retry] PowerShell脚本执行错误: ${error}`);
                    }
                    else {
                        this.log(`✅ [Smart Retry] 消息已发送到${modeName}`);
                    }
                });
                // 等待30秒检测AI回复
                setTimeout(async () => {
                    const isConnected = this.isAIConnected();
                    if (isConnected) {
                        this.log('🎉 [Smart Retry] AI已回复！停止重试循环');
                        this.aiState.isRestarting = false;
                        await this.saveState();
                        return;
                    }
                    else {
                        this.log(`⏰ [Smart Retry] 30秒后AI未回复，准备下次重试`);
                        useNormalChatbox = !useNormalChatbox; // 切换聊天框
                        setTimeout(retryLoop, 1000); // 1秒后继续下次重试
                    }
                }, 30000); // 等待30秒
            }
            catch (error) {
                this.log(`❌ [Smart Retry] 重试失败: ${error}`);
                useNormalChatbox = !useNormalChatbox; // 切换聊天框
                setTimeout(retryLoop, 2000); // 2秒后重试
            }
        };
        // 开始重试循环
        await retryLoop();
    }
    /**
     * 自我检查功能
     */
    async performSelfCheck() {
        try {
            this.log('🔍 [Self Check] 开始自我检查...');
            // 检查1: 插件状态
            if (!this.aiState.guardianActive) {
                this.log('⚠️ [Self Check] 守护功能未激活，正在激活...');
                this.aiState.guardianActive = true;
                await this.saveState();
            }
            // 检查2: 监控定时器
            if (!this.monitorTimer) {
                this.log('⚠️ [Self Check] 监控定时器未启动，正在启动...');
                this.startMonitoring();
            }
            // 检查3: 引擎检查定时器
            if (!this.engineCheckTimer) {
                this.log('⚠️ [Self Check] 引擎检查定时器未启动，正在启动...');
                this.startEngineCheck();
            }
            // 检查4: 状态栏
            if (!this.statusBarItem) {
                this.log('⚠️ [Self Check] 状态栏未创建，正在创建...');
                this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
                this.statusBarItem.command = 'aiGuardian.status';
                this.statusBarItem.show();
            }
            // 检查5: 输出通道
            if (!this.outputChannel) {
                this.log('⚠️ [Self Check] 输出通道未创建，正在创建...');
                this.outputChannel = vscode.window.createOutputChannel('AI Guardian');
            }
            this.log('✅ [Self Check] 自我检查完成，所有组件正常');
            this.updateStatusBar();
        }
        catch (error) {
            this.log(`❌ [Self Check] 自我检查失败: ${error}`);
        }
    }
    /**
     * 启动自我监控
     */
    startSelfMonitoring() {
        // 每5分钟执行一次自我检查
        setInterval(() => {
            this.performSelfCheck();
        }, 5 * 60 * 1000);
        this.log('🔄 [Self Monitoring] 自我监控已启动 (间隔: 5分钟)');
    }
    /**
     * 处理重启后的恢复
     */
    async handleRestartRecovery() {
        try {
            this.log('🔄 [Restart Recovery] 开始处理重启恢复...');
            // 等待IDE完全启动
            await new Promise(resolve => setTimeout(resolve, 5000));
            // 恢复消息
            const recoveryMessage = this.aiState.lastWorkContext || '请继续推进';
            this.log(`📤 [Restart Recovery] 准备发送恢复消息: ${recoveryMessage}`);
            // 🔥 核心改进：使用多种方法尝试在聊天框中输入并发送消息
            const success = await this.sendMessageToChatbox(recoveryMessage);
            if (success) {
                this.log('✅ [Restart Recovery] 恢复消息已发送到聊天框');
                this.recordActivity('重启恢复成功');
                // 等待AI响应
                await new Promise(resolve => setTimeout(resolve, 3000));
                // 检测AI是否已连接
                if (this.isAIConnected()) {
                    vscode.window.showInformationMessage('✅ AI Guardian: 重启恢复成功，AI已重新连接');
                }
                else {
                    this.log('⚠️ [Restart Recovery] AI未检测到响应，可能需要手动干预');
                    vscode.window.showWarningMessage(`⚠️ AI可能未响应，请检查聊天框。恢复消息: "${recoveryMessage}"`);
                }
            }
            else {
                this.log('❌ [Restart Recovery] 所有发送方法失败，使用备用方案');
                // 备用方案：复制到剪贴板并提示用户
                await vscode.env.clipboard.writeText(recoveryMessage);
                vscode.window.showWarningMessage(`📋 自动发送失败，恢复消息已复制到剪贴板: "${recoveryMessage}"\n请在聊天框粘贴并发送`, '打开聊天框').then(selection => {
                    if (selection === '打开聊天框') {
                        vscode.commands.executeCommand('workbench.action.chat.open');
                    }
                });
            }
        }
        catch (error) {
            this.log(`❌ [Restart Recovery] 重启恢复失败: ${error}`);
            // 最终备用方案
            const recoveryMessage = this.aiState.lastWorkContext || '请继续推进';
            await vscode.env.clipboard.writeText(recoveryMessage);
            vscode.window.showWarningMessage(`⚠️ 自动恢复失败，恢复消息已复制到剪贴板: "${recoveryMessage}"\n请在聊天框粘贴并发送`, '打开聊天框').then(selection => {
                if (selection === '打开聊天框') {
                    vscode.commands.executeCommand('workbench.action.chat.open');
                }
            });
        }
    }
    /**
     * 发送消息到聊天框（尝试多种方法）
     */
    async sendMessageToChatbox(message) {
        this.log('📤 [Send to Chatbox] 尝试多种方法发送消息到聊天框...');
        // 🔥 关键改进：首先确保聊天框打开
        this.log('📤 [Pre-Step] 首先尝试打开聊天框...');
        await this.ensureChatboxOpen();
        // 方法1: 使用Cursor特定命令（优先）
        if (await this.tryCursorSpecificCommands(message)) {
            return true;
        }
        // 方法2: 使用Language Model API + 聊天框命令组合
        if (await this.tryLanguageModelAPI(message)) {
            return true;
        }
        // 方法3: 使用模拟键盘输入（如果可用）
        if (await this.trySimulatedKeyboardInput(message)) {
            return true;
        }
        // 方法4: 使用工作区命令发送
        if (await this.tryWorkbenchCommands(message)) {
            return true;
        }
        this.log('❌ [Send to Chatbox] 所有方法失败');
        return false;
    }
    /**
     * 🔥 新增：确保聊天框打开（使用Ctrl+L快捷键）
     */
    async ensureChatboxOpen() {
        try {
            this.log('🔄 [Ensure Chatbox] 尝试打开聊天框...');
            const platform = process.platform;
            const isMac = platform === 'darwin';
            // 策略1: 尝试所有可能的打开聊天框的命令
            const openCommands = [
                'aichat.newchat',
                'workbench.action.chat.open',
                'cursor.openChat',
                'cursor.newChat',
                'composer.open',
                'workbench.panel.chat.view.copilot.focus'
            ];
            this.log(`📝 [Ensure Chatbox] 当前平台: ${platform}, 快捷键: ${isMac ? 'Cmd+L' : 'Ctrl+L'}`);
            for (const cmd of openCommands) {
                try {
                    this.log(`🔄 [Ensure Chatbox] 尝试命令: ${cmd}`);
                    await vscode.commands.executeCommand(cmd);
                    await new Promise(resolve => setTimeout(resolve, 1500)); // 等待聊天框打开
                    // 验证是否成功
                    this.log(`✅ [Ensure Chatbox] 命令 ${cmd} 执行成功`);
                    return true; // 至少一个命令成功了
                }
                catch (error) {
                    this.log(`⚠️ [Ensure Chatbox] 命令 ${cmd} 失败: ${error}`);
                    // 继续尝试下一个命令
                }
            }
            // 策略2: 如果所有命令都失败，记录可用的命令
            try {
                const allCommands = await vscode.commands.getCommands();
                const chatRelatedCommands = allCommands.filter(cmd => cmd.includes('chat') ||
                    cmd.includes('cursor') ||
                    cmd.includes('ai') ||
                    cmd.includes('copilot') ||
                    cmd.includes('composer'));
                this.log(`📋 [Ensure Chatbox] 可用的聊天相关命令 (${chatRelatedCommands.length}个):`);
                chatRelatedCommands.slice(0, 20).forEach(cmd => {
                    this.log(`   - ${cmd}`);
                });
            }
            catch (error) {
                this.log(`⚠️ [Ensure Chatbox] 无法获取命令列表: ${error}`);
            }
            this.log('⚠️ [Ensure Chatbox] 所有命令失败，但继续尝试发送消息...');
            return false;
        }
        catch (error) {
            this.log(`❌ [Ensure Chatbox] 打开聊天框失败: ${error}`);
            return false;
        }
    }
    /**
     * 方法1: 尝试键盘快捷键（最可靠）
     */
    async tryCursorSpecificCommands(message) {
        try {
            this.log('🔄 [Method 1] 尝试键盘快捷键 Ctrl+L...');
            // 🔥 关键改进：使用键盘快捷键打开聊天框
            // Windows/Linux: Ctrl+L
            // macOS: Cmd+L
            const platform = process.platform;
            const isMac = platform === 'darwin';
            // 方法1A: 使用VSCode的命令模拟快捷键
            try {
                // 尝试直接使用Cursor的快捷键命令
                await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
                    text: isMac ? '\u001b[cmd+l]' : '\u001b[ctrl+l]'
                });
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.log('✅ [Method 1A] 快捷键命令已发送');
            }
            catch (error) {
                this.log(`⚠️ [Method 1A] 快捷键命令失败: ${error}`);
            }
            // 方法1B: 尝试Cursor的聊天命令
            const cursorCommands = [
                'aichat.newchat',
                'cursor.openChat',
                'cursor.chat.open',
                'cursor.chat.newChat',
                'cursor.chat.send',
                'workbench.action.chat.open',
                'workbench.action.chat.newChat',
                'workbench.panel.chat.view.copilot.focus' // GitHub Copilot
            ];
            for (const cmd of cursorCommands) {
                try {
                    await vscode.commands.executeCommand(cmd);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    this.log(`✅ [Method 1B] 成功执行命令: ${cmd}`);
                    // 验证聊天框是否真的打开了
                    // 尝试发送消息命令
                    if (cmd.includes('send')) {
                        await vscode.commands.executeCommand(cmd, message);
                        this.log(`✅ [Method 1B] 消息已通过命令发送`);
                        return true;
                    }
                    // 如果不是send命令，继续尝试其他方法
                    // 至少聊天框应该已经打开了
                    return false; // 返回false继续下一个方法
                }
                catch (error) {
                    this.log(`⚠️ [Method 1B] 命令 ${cmd} 失败: ${error}`);
                }
            }
            return false;
        }
        catch (error) {
            this.log(`❌ [Method 1] Cursor命令失败: ${error}`);
            return false;
        }
    }
    /**
     * 方法2: 使用Language Model API + 聊天框
     */
    async tryLanguageModelAPI(message) {
        try {
            this.log('🔄 [Method 2] 尝试Language Model API...');
            // 打开聊天框
            await vscode.commands.executeCommand('workbench.action.chat.open');
            await new Promise(resolve => setTimeout(resolve, 1500));
            // 使用Language Model API发送消息
            const models = await vscode.lm.selectChatModels();
            if (models && models.length > 0) {
                const model = models[0];
                const userMessage = vscode.LanguageModelChatMessage.User(message);
                const cancellationSource = new vscode.CancellationTokenSource();
                setTimeout(() => cancellationSource.cancel(), 10000);
                const request = await model.sendRequest([userMessage], {}, cancellationSource.token);
                // 等待一小段时间让响应开始
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.log('✅ [Method 2] Language Model API发送成功');
                return true;
            }
            return false;
        }
        catch (error) {
            this.log(`❌ [Method 2] Language Model API失败: ${error}`);
            return false;
        }
    }
    /**
     * 方法3: 尝试模拟键盘输入
     */
    async trySimulatedKeyboardInput(message) {
        try {
            this.log('🔄 [Method 3] 尝试模拟键盘输入...');
            // 打开聊天框
            await vscode.commands.executeCommand('workbench.action.chat.open');
            await new Promise(resolve => setTimeout(resolve, 1500));
            // 将消息复制到剪贴板
            await vscode.env.clipboard.writeText(message);
            await new Promise(resolve => setTimeout(resolve, 300));
            // 尝试执行粘贴命令
            await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            await new Promise(resolve => setTimeout(resolve, 500));
            // 尝试模拟回车（发送消息）
            // 注意：这可能在不同平台上行为不同
            const enterCommands = [
                'workbench.action.acceptSelectedSuggestion',
                'editor.action.submitComment',
                'chat.action.submit',
                'workbench.action.chat.submit'
            ];
            for (const cmd of enterCommands) {
                try {
                    await vscode.commands.executeCommand(cmd);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.log(`✅ [Method 3] 成功执行发送命令: ${cmd}`);
                    return true;
                }
                catch (error) {
                    this.log(`⚠️ [Method 3] 命令 ${cmd} 失败: ${error}`);
                }
            }
            return false;
        }
        catch (error) {
            this.log(`❌ [Method 3] 模拟键盘输入失败: ${error}`);
            return false;
        }
    }
    /**
     * 方法4: 使用工作区命令
     */
    async tryWorkbenchCommands(message) {
        try {
            this.log('🔄 [Method 4] 尝试工作区命令...');
            // 打开聊天框
            await vscode.commands.executeCommand('workbench.action.chat.open');
            await new Promise(resolve => setTimeout(resolve, 1500));
            // 将消息复制到剪贴板
            await vscode.env.clipboard.writeText(message);
            // 尝试使用快速输入
            const quickInput = vscode.window.createInputBox();
            quickInput.value = message;
            quickInput.prompt = 'AI恢复消息（按回车发送）';
            return new Promise((resolve) => {
                quickInput.onDidAccept(async () => {
                    quickInput.hide();
                    // 尝试将输入发送到聊天框
                    await vscode.env.clipboard.writeText(quickInput.value);
                    await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
                    await new Promise(r => setTimeout(r, 500));
                    // 尝试提交
                    try {
                        await vscode.commands.executeCommand('chat.action.submit');
                        this.log('✅ [Method 4] 工作区命令发送成功');
                        resolve(true);
                    }
                    catch {
                        resolve(false);
                    }
                });
                quickInput.onDidHide(() => {
                    quickInput.dispose();
                    resolve(false);
                });
                quickInput.show();
                // 3秒后自动关闭
                setTimeout(() => {
                    if (quickInput) {
                        quickInput.hide();
                    }
                }, 3000);
            });
        }
        catch (error) {
            this.log(`❌ [Method 4] 工作区命令失败: ${error}`);
            return false;
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
        this.log('🧹 [Dispose] 正在清理所有资源...');
        // 1. 清理所有定时器
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = undefined;
        }
        if (this.engineCheckTimer) {
            clearInterval(this.engineCheckTimer);
            this.engineCheckTimer = undefined;
        }
        if (this.recoveryInterval) {
            clearInterval(this.recoveryInterval);
            this.recoveryInterval = undefined;
        }
        if (this.recoveryTimeout) {
            clearTimeout(this.recoveryTimeout);
            this.recoveryTimeout = undefined;
        }
        // 2. 停止恢复轮询
        this.stopRecoveryPolling();
        // 3. 清理状态，确保不会继续重启
        this.aiState.isRestarting = false;
        this.aiState.guardianActive = false;
        this.aiState.autoRecoveryEnabled = false;
        // 4. 保存清理后的状态
        this.saveState();
        // 5. 清理UI元素
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
        if (this.outputChannel) {
            this.outputChannel.dispose();
        }
        this.log('✅ [Dispose] 所有资源已清理完成');
    }
    resetState() {
        this.aiState = {
            lastActivity: Date.now(),
            isOnline: true,
            activityCount: 0,
            engineLoaded: false,
            lastEngineCheck: 0,
            isRestarting: false,
            restartCount: 0,
            lastRestartTime: 0,
            guardianActive: true,
            autoRecoveryEnabled: true
        };
        this.saveState();
        this.log('🔄 AI Guardian 状态已重置');
        vscode.window.showInformationMessage('AI Guardian 状态已重置');
    }
    /**
     * 强制重启IDE并发送恢复消息
     */
    async forceRestartIDE() {
        try {
            this.log('🚀 [Force Restart] 开始强制重启IDE...');
            // 标记重启状态
            this.aiState.isRestarting = true;
            this.aiState.lastWorkContext = '请继续推进';
            await this.saveState();
            // 执行重启
            await this.restartCursorIDE();
        }
        catch (error) {
            this.log(`❌ [Force Restart] 强制重启失败: ${error}`);
            vscode.window.showErrorMessage('强制重启失败，请手动重启IDE');
        }
    }
}
exports.AIGuardianExtension = AIGuardianExtension;
AIGuardianExtension.STATE_KEY = 'aiGuardianState';
// 全局变量存储guardian实例，用于deactivate时清理
let globalGuardian;
// 插件激活函数
function activate(context) {
    console.log('🛡️ AI Guardian 插件正在激活...');
    const guardian = new AIGuardianExtension(context);
    globalGuardian = guardian; // 保存全局引用
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
        }),
        vscode.commands.registerCommand('aiGuardian.forceRestart', async () => {
            await guardian.forceRestartIDE();
        }),
        vscode.commands.registerCommand('aiGuardian.selfCheck', async () => {
            await guardian.performSelfCheck();
            vscode.window.showInformationMessage('AI Guardian 自我检查完成');
        }),
        vscode.commands.registerCommand('aiGuardian.listChatCommands', async () => {
            await guardian.listAvailableChatCommands();
        }),
        vscode.commands.registerCommand('aiGuardian.testChatboxOpen', async () => {
            await guardian.testOpenChatbox();
        })
    ];
    // 添加到上下文
    context.subscriptions.push(guardian, ...commands);
    console.log('✅ AI Guardian 插件已激活');
}
exports.activate = activate;
// 插件停用函数
function deactivate() {
    console.log('👋 AI Guardian 插件正在停用...');
    if (globalGuardian) {
        try {
            // 1. 停止所有监控和定时器
            globalGuardian.dispose();
            // 2. 清理状态，确保不会继续重启
            globalGuardian.aiState.isRestarting = false;
            globalGuardian.aiState.guardianActive = false;
            globalGuardian.aiState.autoRecoveryEnabled = false;
            // 3. 保存清理后的状态
            globalGuardian.saveState();
            console.log('✅ AI Guardian 插件已完全停用，所有资源已清理');
        }
        catch (error) {
            console.error('❌ AI Guardian 停用时发生错误:', error);
        }
        finally {
            globalGuardian = undefined;
        }
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map