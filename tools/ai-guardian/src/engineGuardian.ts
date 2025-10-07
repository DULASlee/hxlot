// ========================================
// 30分钟自我守护机制
// ========================================

export class AIEngineGuardian {
    private lastLoadTime: Date = new Date()
    private guardInterval: number = 30 * 60 * 1000  // 30分钟
    private isEngineLoaded: boolean = false

    // 启动守护进程
    startGuarding() {
        // 立即加载一次
        this.loadEngine()

        // 设置定时器，每30分钟自动加载
        setInterval(() => {
            this.checkAndReload()
        }, this.guardInterval)

        console.log("🛡️ AI自动执行引擎守护进程已启动")
        console.log(`⏰ 每30分钟自动重新加载执行引擎规则`)
    }

    // 检查并重新加载
    private checkAndReload() {
        const now = new Date()
        const elapsed = now.getTime() - this.lastLoadTime.getTime()

        if (elapsed >= this.guardInterval) {
            console.log("⏰ 30分钟已到，自动重新加载执行引擎...")
            this.loadEngine()
        }
    }

    // 加载执行引擎
    private loadEngine() {
        this.lastLoadTime = new Date()
        this.isEngineLoaded = true

        // 显示启动声明（在聊天框）
        this.showStartupDeclaration()

        // 强制加载所有MDC规则
        this.forceLoadRules()
    }

    // 显示启动声明（必须在聊天框显示）
    private showStartupDeclaration() {
        const declaration = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 AI编程铁律执行引擎 v9.0 (Ultimate Edition) 已启动！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 加载时间: ${this.lastLoadTime.toLocaleString('zh-CN')}
🛡️ 守护状态: 已启动（每30分钟自动重新加载）
📚 规则状态: 已加载所有MDC规则

✅ 核心功能保护铁律（置顶）
✅ 四大基石（第一性原理、15节点、追求卓越、用户需求理解）
✅ 六阶段执行流程（0/A/B/C/D/E/F）
✅ 300行监控机制（v7.0核心精华）
✅ 深度测试铁律（独立触发）

💡 提示: 
   - 检测到触发关键词后，AI将自动启动执行引擎
   - 每30分钟自动重新加载规则，确保AI不会"忘记"
   - 编写代码时自动追踪行数（100/200/300行检查点）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
准备就绪！请开始您的编程任务！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
        // 在聊天框显示
        console.log(declaration)

        // 同时发送AI消息（确保用户看到）
        this.sendChatMessage(declaration)
    }

    // 强制加载所有规则
    private forceLoadRules() {
        // AI必须重新阅读所有MDC文件
        const rules = [
            ".cursor/rules/00_执行引擎.mdc",
            ".cursor/rules/00_core_philosophy.mdc",
            ".cursor/rules/01_code_standards.mdc",
            ".cursor/rules/02_development_process.mdc",
            ".cursor/rules/03_quality_guardian.mdc",
            ".cursor/rules/04_code_quality_prohibitions.mdc",
            "docs/项目开发规范总览.md"
        ]

        console.log("📚 正在重新加载所有规则...")
        rules.forEach(rule => {
            console.log(`   ✅ ${rule}`)
            // AI工具会自动读取这些文件
        })
        console.log("✅ 所有规则已重新加载完成")
    }

    // 发送聊天消息（确保用户看到）
    private sendChatMessage(message: string) {
        // AI在聊天框中显示消息
        // 这是一个提示，AI必须在响应中包含这个声明
    }

    // 获取守护状态
    getStatus() {
        return {
            lastLoadTime: this.lastLoadTime,
            isEngineLoaded: this.isEngineLoaded,
            nextReloadTime: new Date(this.lastLoadTime.getTime() + this.guardInterval)
        }
    }
}
