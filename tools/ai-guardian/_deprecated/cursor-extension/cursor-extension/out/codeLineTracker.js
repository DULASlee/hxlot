"use strict";
// ========================================
// v7.0真实机制 - 完整迁移到v10.0
// 增强版：支持VSCode事件回调
// ========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedCodeLineTracker = void 0;
class EnhancedCodeLineTracker {
    constructor(callbacks) {
        this.currentSessionLines = 0;
        this.checkpoints = [];
        this.filesCreated = [];
        this.callbacks = {};
        this.has100Triggered = false;
        this.has200Triggered = false;
        this.has280Triggered = false;
        this.callbacks = callbacks || {};
    }
    // 添加代码时自动计算行数
    addCode(fileName, code) {
        const lines = code.split('\n').length;
        this.currentSessionLines += lines;
        // 查找或更新文件记录
        const existingFileIndex = this.filesCreated.findIndex(f => f.fileName === fileName);
        if (existingFileIndex >= 0) {
            this.filesCreated[existingFileIndex].lines += lines;
            this.filesCreated[existingFileIndex].timestamp = new Date();
        }
        else {
            this.filesCreated.push({
                fileName,
                lines,
                timestamp: new Date()
            });
        }
        // 自动检查阈值
        this.checkSmartThresholds();
    }
    // 获取当前会话统计
    getSessionStats() {
        return {
            totalLines: this.currentSessionLines,
            filesCount: this.filesCreated.length,
            checkpointsCount: this.checkpoints.length,
            lastCheckpoint: this.checkpoints[this.checkpoints.length - 1],
            files: [...this.filesCreated]
        };
    }
    // 重置会话（质量门禁通过后）
    resetSession() {
        this.currentSessionLines = 0;
        this.filesCreated = [];
        this.checkpoints = [];
        this.has100Triggered = false;
        this.has200Triggered = false;
        this.has280Triggered = false;
    }
    // 智能阈值检查（核心机制）
    checkSmartThresholds() {
        const current = this.currentSessionLines;
        // 100行审查点
        if (current >= 100 && current < 120 && !this.has100Triggered) {
            this.has100Triggered = true;
            this.createCheckpoint('100lines', 'USER_REVIEW');
            if (this.callbacks.on100LinesReached) {
                this.callbacks.on100LinesReached();
            }
        }
        // 200行审查点
        if (current >= 200 && current < 220 && !this.has200Triggered) {
            this.has200Triggered = true;
            this.createCheckpoint('200lines', 'USER_REVIEW');
            if (this.callbacks.on200LinesReached) {
                this.callbacks.on200LinesReached();
            }
        }
        // 280行警告
        if (current >= 280 && current < 300 && !this.has280Triggered) {
            this.has280Triggered = true;
            if (this.callbacks.on280LinesWarning) {
                this.callbacks.on280LinesWarning();
            }
        }
        // 300行强制停止
        if (current >= 300) {
            this.createCheckpoint('300lines', 'FORCED_STOP');
            if (this.callbacks.on300LinesForceStop) {
                this.callbacks.on300LinesForceStop();
            }
            return false;
        }
        return true;
    }
    // 创建检查点
    createCheckpoint(id, type) {
        const checkpoint = {
            id,
            type,
            lines: this.currentSessionLines,
            files: [...this.filesCreated],
            timestamp: new Date(),
            canRestore: true
        };
        this.checkpoints.push(checkpoint);
        if (this.callbacks.onCheckpointCreated) {
            this.callbacks.onCheckpointCreated(checkpoint);
        }
    }
    // 从检查点恢复
    async restoreFromCheckpoint(checkpointId) {
        const checkpoint = this.checkpoints.find(cp => cp.id === checkpointId);
        if (!checkpoint) {
            throw new Error(`检查点不存在: ${checkpointId}`);
        }
        this.currentSessionLines = checkpoint.lines;
        this.filesCreated = [...checkpoint.files];
        return true;
    }
    // 获取所有检查点
    getCheckpoints() {
        return [...this.checkpoints];
    }
    // 获取最后一个检查点
    getLastCheckpoint() {
        return this.checkpoints[this.checkpoints.length - 1];
    }
    // 生成详细报告
    generateReport() {
        const stats = this.getSessionStats();
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 本次会话统计报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

总代码行数: ${stats.totalLines}行
创建文件数: ${stats.filesCount}个
检查点数: ${stats.checkpointsCount}个
距离限制: ${300 - stats.totalLines}行

📋 文件清单:
${stats.files.map((f, i) => `  ${i + 1}. ${f.fileName.split('/').pop()} (${f.lines}行)`).join('\n')}

✅ 检查点:
${this.checkpoints.map((cp, i) => `  ${i + 1}. ${cp.id} - ${cp.type} (${cp.lines}行)`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    }
}
exports.EnhancedCodeLineTracker = EnhancedCodeLineTracker;
//# sourceMappingURL=codeLineTracker.js.map